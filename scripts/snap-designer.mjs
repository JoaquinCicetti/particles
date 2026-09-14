// dev-only: exercise the three designers end to end and screenshot them
//   URL=http://localhost:5174 TMP=/some/dir node scripts/snap-designer.mjs
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const BASE = process.env.URL ?? 'http://localhost:5174'
const TMP = process.env.TMP ?? fs.mkdtempSync(path.join(os.tmpdir(), 'dz-'))
fs.mkdirSync(TMP, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb', '--use-angle=metal'],
})

const logs = []
const results = []
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)

// the checks read Spanish labels; headless Chrome reports English, so pin the
// site's saved language before any page script runs (it survives the clears below)
const spanish = (p) => p.evaluateOnNewDocument(() => localStorage.setItem('gc_lang', 'es'))

const page = await browser.newPage()
await spanish(page)
await page.setViewport({ width: 1440, height: 900 })
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`)
})
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))

const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('gc_designer_v1') ?? 'null'))
const activeSilo = async () => {
  const raw = await stored()
  return raw.state.tabs.find((t) => t.id === raw.state.activeIds.silo).design
}
const totals = () => page.$$eval('.dz-quotebar .dz-total b', (els) => els.map((e) => Number(e.textContent)))
const tabNames = () => page.$$eval('.dz-tab .dz-tab-name', (els) => els.map((e) => e.textContent))
const clickText = async (selector, label) => {
  const ok = await page.evaluate(
    (sel, l) => {
      const b = [...document.querySelectorAll(sel)].find((x) => x.textContent.trim() === l)
      b?.click()
      return !!b
    },
    selector,
    label,
  )
  await wait(150)
  return ok
}
const clickLib = (label) => clickText('.dz-lib-btn', label)
const openFresh = async (p) => {
  await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => localStorage.clear())
  await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('.dz canvas', { timeout: 20000 })
  await wait(700)
}
// the store flushes to localStorage ~350 ms after a change
const flushed = () => wait(600)

// ── every catalog, from its own route ──
// every designer also carries Growcast's four devices and one free-form peripheral (1 output)
const GROWCAST = ['Growcast+', 'Growcast Industria (tablero)', 'Módulo de control', 'Expansor', 'Otro periférico']
const CATALOGS = {
  '/disenador': {
    sensors: 6,
    outputs: 5,
    labels: ['Rack', 'Mesa de cultivo', 'TEROS 12', 'Temperatura y presión', 'Humedad de suelo', ...GROWCAST],
  },
  '/disenador/silos': {
    sensors: 3,
    outputs: 3,
    labels: ['Aireador', 'Extractor', 'Temperatura y humedad interior', 'CO₂', 'Temperatura y humedad exterior', ...GROWCAST],
  },
  '/disenador/maduracion': {
    sensors: 2,
    outputs: 7,
    labels: ['Estantería para quesos', 'Colgadero para chacinados', 'Pallet / estiba', 'Carro móvil', 'Equipo de frío', ...GROWCAST],
  },
}
for (const [route, want] of Object.entries(CATALOGS)) {
  await openFresh(route)
  const labels = await page.$$eval('.dz-lib-btn', (els) => els.map((e) => e.textContent.trim()))
  check(`${route}: catalog has its own objects`, want.labels.every((l) => labels.includes(l)), labels.join(', '))
  for (const l of labels) await clickLib(l)
  const [s, o] = await totals()
  check(`${route}: every catalog entry placed and counted`, s === want.sensors && o === want.outputs, `${s} sensors / ${o} outputs`)
  await wait(1800) // the sensor GLB
  const slug = route.split('/').pop()
  await page.screenshot({ path: path.join(TMP, `dz-${slug}-split.png`) })
  await page.evaluate(() => document.querySelector('.dz-viewbar button')?.click())
  await wait(1200)
  await page.screenshot({ path: path.join(TMP, `dz-${slug}-3d.png`) })
  await page.evaluate(() => document.querySelectorAll('.dz-viewbar button')[2]?.click())
  await wait(300)
}

// ── a silo IS the zone: equipment and sensors go inside it and on its roof ──
await openFresh('/disenador/silos')
for (const l of ['Extractor', 'Temperatura y humedad interior', 'CO₂', 'Temperatura y humedad exterior', 'Aireador']) {
  await clickLib(l)
}
await flushed()
{
  const { room, items } = await activeSilo()
  check('a new silo design is a round zone', room.shape === 'round' && room.width === room.length, JSON.stringify(room))
  const R = room.width / 2
  const rise = R * Math.tan((22 * Math.PI) / 180)
  const topAt = (x, z) => room.height + rise * (1 - Math.min(R, Math.hypot(x, z)) / R)
  const by = (type, kind) => items.find((i) => i.type === type && (!kind || i.sensorKind === kind))
  const ext = by('extractor')
  const inT = by('sensor', 'interior_temp_humidity')
  const co2 = by('sensor', 'co2')
  const out = by('sensor', 'outdoor_temp_humidity')
  const aer = by('aerator')
  const missing = Object.entries({ ext, inT, co2, out, aer })
    .filter(([, v]) => !v)
    .map(([k]) => k)
  check('silo fit-out: every added item was saved', !missing.length, missing.length ? `missing ${missing.join(', ')}` : '')
  if (!missing.length) {
    check('every item stays inside the silo', items.every((i) => Math.hypot(i.x, i.z) <= R + 1e-6))
    check('extractor sits on the roof', Math.abs(ext.y - topAt(ext.x, ext.z)) < 0.01, `y=${ext.y} roof=${topAt(ext.x, ext.z).toFixed(3)}`)
    check('outdoor sensor sits on the roof', Math.abs(out.y - topAt(out.x, out.z)) < 0.01, `x=${out.x} y=${out.y}`)
    check('interior sensor at mid-height', Math.abs(inT.y - room.height / 2) < 0.01, `y=${inT.y}`)
    check('CO₂ sensor inside, near the top', co2.y > room.height * 0.8 && co2.y < room.height, `y=${co2.y}`)
    check('aerator stands on the floor', aer.y === undefined)
  }
}
await wait(1500)
await page.screenshot({ path: path.join(TMP, 'dz-silo-zone.png') })

// the same designer also covers rectangular storage cells
await clickText('.dz-lib-panel button', 'Celda / galpón')
await flushed()
{
  const { room, items } = await activeSilo()
  const inside = items.every((i) => Math.abs(i.x) <= room.width / 2 + 1e-6 && Math.abs(i.z) <= room.length / 2 + 1e-6)
  check('switching the zone to a cell keeps everything inside', room.shape === 'box' && inside, JSON.stringify(room))
}
await wait(1200)
await page.screenshot({ path: path.join(TMP, 'dz-silo-cell.png') })
await clickText('.dz-lib-panel button', 'Silo')
await wait(300)

// ── switching designers keeps each one's tabs apart ──
await page.evaluate(() => [...document.querySelectorAll('.dz-kindnav a')].find((a) => a.getAttribute('href') === '/disenador/maduracion')?.click())
await page.waitForFunction(() => location.pathname === '/disenador/maduracion')
await wait(500)
check('switch goes to the curing designer', (await tabNames()).every((n) => /^Cámara/.test(n)), (await tabNames()).join(', '))
await page.goBack()
await wait(500)
check('back returns to the silo designer with its tab', (await tabNames()).every((n) => /^Silo/.test(n)), (await tabNames()).join(', '))

// ── import: a file of another kind opens in its own designer ──
const now = new Date().toISOString()
const base = { format: 'growcast.room-design', version: 1, createdAt: now, updatedAt: now, extraOutputs: [], contact: {} }
const siloFile = {
  ...base,
  roomKind: 'silo',
  name: 'Silo importado',
  room: { shape: 'round', width: 10, length: 10, height: 18 },
  items: [{ id: 'a', type: 'aerator', x: 0, z: 0, width: 0.9, depth: 1.1, rotation: 0, outputs: 1 }],
}
const badFile = {
  ...base,
  roomKind: 'grow',
  name: 'Mezclado',
  room: { width: 6, length: 4, height: 3 },
  items: [{ id: 'a', type: 'aerator', x: 0, z: 0, width: 0.9, depth: 1.1, rotation: 0, outputs: 1 }],
}
fs.writeFileSync(path.join(TMP, 'silo.growcast.json'), JSON.stringify(siloFile))
fs.writeFileSync(path.join(TMP, 'mixed.growcast.json'), JSON.stringify(badFile))
await page.goto(`${BASE}/disenador`, { waitUntil: 'networkidle0' })
await page.waitForSelector('.dz canvas')
let input = await page.$('.dz-actions input[type=file]')
await input.uploadFile(path.join(TMP, 'silo.growcast.json'))
await page.waitForFunction(() => location.pathname === '/disenador/silos', { timeout: 5000 }).catch(() => {})
await wait(500)
check(
  'a silo file imported on the grow page opens in the silo designer',
  new URL(page.url()).pathname === '/disenador/silos' &&
    (await page.$eval('.dz-tab.is-active .dz-tab-name', (e) => e.textContent)) === 'Silo importado',
  new URL(page.url()).pathname,
)
input = await page.$('.dz-actions input[type=file]')
await input.uploadFile(path.join(TMP, 'mixed.growcast.json'))
await wait(600)
const errText = await page.evaluate(() => document.querySelector('[role=dialog]')?.textContent ?? '')
check('a grow file holding an aerator is rejected', /no corresponde/.test(errText), errText.slice(0, 140))
await page.keyboard.press('Escape')
await wait(300)

// ── saves from before the split still open, as grow rooms ──
const legacy = {
  state: {
    tabs: [{ id: 'legacy', design: { ...base, name: 'Sala vieja', room: { width: 6, length: 4, height: 3 }, items: [] } }],
    activeId: 'legacy',
    viewMode: 'split',
  },
  version: 1,
}
await page.evaluate((v) => localStorage.setItem('gc_designer_v1', JSON.stringify(v)), legacy)
await page.goto(`${BASE}/disenador`, { waitUntil: 'networkidle0' })
await page.waitForSelector('.dz canvas')
await wait(500)
check(
  'legacy save loads as the active grow tab',
  (await page.$eval('.dz-tab.is-active .dz-tab-name', (e) => e.textContent)) === 'Sala vieja',
  (await tabNames()).join(', '),
)

// ── phone ──
const phone = await browser.newPage()
await spanish(phone)
await phone.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
phone.on('pageerror', (e) => logs.push(`[mobile] pageerror: ${e.message}`))
await phone.goto(`${BASE}/disenador/silos`, { waitUntil: 'networkidle0' })
await phone.waitForSelector('.dz canvas')
await wait(1500)
await phone.screenshot({ path: path.join(TMP, 'dz-silos-mobile.png') })
check('no horizontal overflow on phone', !(await phone.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)))

// ── landing links to all three ──
const land = await browser.newPage()
await spanish(land)
await land.setViewport({ width: 1440, height: 900 })
land.on('pageerror', (e) => logs.push(`[landing] pageerror: ${e.message}`))
await land.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
await wait(2500)
const hrefs = await land.$$eval('.sol-design a', (as) => as.map((a) => `${a.closest('section')?.id}:${a.getAttribute('href')}`))
check(
  'landing links each solution to its designer',
  ['cultivo:/disenador', 'silos:/disenador/silos', 'maduracion:/disenador/maduracion'].every((h) => hrefs.includes(h)),
  hrefs.join(' '),
)
await land.evaluate(() => document.getElementById('silos').scrollIntoView({ behavior: 'instant' }))
await wait(1400)
await land.screenshot({ path: path.join(TMP, 'dz-landing-silos-cta.png') })

console.log(results.join('\n'))
console.log(logs.length ? `\nconsole:\n${logs.join('\n')}` : '\nconsole: clean')
console.log(`\nscreenshots: ${TMP}`)
await browser.close()
