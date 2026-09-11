// dev-only: exercise the grow-room designer end to end and screenshot it
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
const check = (name, ok, detail = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const requests = []
page.on('request', (r) => requests.push(r.url()))
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`)
})
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))

const cdp = await page.createCDPSession()
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: TMP, eventsEnabled: true })

// ── fresh designer, straight from the URL ──
await page.goto(`${BASE}/disenador`, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await page.waitForSelector('.dz canvas', { timeout: 20000 })
await wait(800)
check(
  'designer does not load the landing particle engine',
  !requests.some((u) => /ParticleEngine|scene\/Scene|postprocessing/.test(u)),
)

const totals = () =>
  page.$$eval('.dz-total .metric-value', (els) => els.map((e) => Number(e.textContent)))
const tabCount = () => page.$$eval('.dz-tab', (els) => els.length)
const clickNth = async (sel, i) => {
  const els = await page.$$(sel)
  await els[i].click()
  await wait(120)
}

// structure: 2 racks + 1 table, equipment: light, light, fan, climate; sensors: air, co2, substrate
const libs = await page.$$('.dz-step .dz-lib')
const libBtn = async (lib, i) => {
  const b = await libs[lib].$$('.dz-lib-btn')
  await b[i].click()
  await wait(120)
}
await libBtn(0, 0)
await libBtn(0, 0)
await libBtn(0, 1)
await libBtn(1, 0)
await libBtn(1, 0)
await libBtn(1, 2)
await libBtn(1, 1)
await libBtn(2, 0)
await libBtn(2, 1)
await libBtn(2, 2)
let [sensors, outputs] = await totals()
check('sensor total after adding 3 sensors', sensors === 3, `got ${sensors}`)
check('output total = 4 placed controllables', outputs === 4, `got ${outputs}`)

// extra outputs: open step 05, add 2 pumps + 1 solenoid
const heads = await page.$$('.dz-step-head')
await heads[4].click()
await wait(150)
await clickNth('.dz-chip', 0)
await clickNth('.dz-chip', 0)
await clickNth('.dz-chip', 2)
;[sensors, outputs] = await totals()
check('extra outputs counted', outputs === 7, `got ${outputs}`)

// inspector: bump outputs of the selected (last-added climate? select a light from the list)
await page.evaluate(() => {
  const rows = [...document.querySelectorAll('.dz-row-main')]
  rows.find((r) => /Lumin|light/i.test(r.textContent))?.click()
})
await wait(150)
const plus = await page.$$('.dz-insp .dz-stepper button')
if (plus[1]) await plus[1].click()
await wait(150)
;[sensors, outputs] = await totals()
check('inspector output stepper edits totals', outputs === 8, `got ${outputs}`)

await page.keyboard.press('Escape')
await wait(100)

// drag the table in the plan by ~120 px (nothing hangs over it)
// sorted: the selected item is drawn last, so DOM order changes with selection
const allTransforms = () =>
  page.$$eval('.dz-pi', (gs) => gs.map((g) => g.getAttribute('transform')).sort().join('|'))
const rack = await page.$('.dz-pi-table .dz-pi-body')
const before = await page.$eval('.dz-pi-table', (g) => g.getAttribute('transform'))
const beforeAll = await allTransforms()
const box = await rack.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.mouse.down()
for (let i = 1; i <= 10; i++) {
  await page.mouse.move(box.x + box.width / 2 + i * 12, box.y + box.height / 2 + i * 4)
  await wait(16)
}
await page.mouse.up()
await wait(200)
const after = await page.$eval('.dz-pi-table', (g) => g.getAttribute('transform'))
check('plan drag moves the table', before !== after, `${before} → ${after}`)
const snapped = after.match(/translate\(([-\d.]+) ([-\d.]+)\)/)
check(
  'drag snaps to 0.1 m',
  snapped && [snapped[1], snapped[2]].every((v) => Math.abs(Number(v) * 10 - Math.round(Number(v) * 10)) < 1e-6),
  after,
)

// undo restores the position
await page.keyboard.down('Meta')
await page.keyboard.press('z')
await page.keyboard.up('Meta')
await wait(200)
const undone = await page.$eval('.dz-pi-table', (g) => g.getAttribute('transform'))
check('undo restores the drag', undone === before && (await allTransforms()) === beforeAll, undone)

await page.screenshot({ path: 'scripts/dz-desktop-split.png' })

// shrink the room: everything must stay inside
const roomInputs = await page.$$('.dz-step:first-child .dz-num input')
await roomInputs[0].click({ clickCount: 3 })
await page.keyboard.type('3')
await page.keyboard.press('Enter')
await wait(700)
const inside = await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem('gc_designer_v1'))
  const tab = raw.state.tabs.find((t) => t.id === raw.state.activeId)
  const { room, items } = tab.design
  return items.every((it) => {
    const odd = it.rotation % 2 === 1
    const w = odd ? it.depth : it.width
    const d = odd ? it.width : it.depth
    return Math.abs(it.x) + w / 2 <= room.width / 2 + 1e-6 && Math.abs(it.z) + d / 2 <= room.length / 2 + 1e-6
  })
})
check('room resize keeps every item inside the walls', inside)

// export → file on disk
const exportBtn = (await page.$$('.dz-actions > .dz-btn'))[1]
await exportBtn.click()
await wait(1200)
const exported = fs.readdirSync(TMP).find((f) => f.endsWith('.growcast.json'))
check('export downloads a .growcast.json', !!exported, exported ?? '')
const file = exported && JSON.parse(fs.readFileSync(path.join(TMP, exported), 'utf8'))
check(
  'export has format/version/summary',
  file?.format === 'growcast.room-design' && file?.version === 1 && file?.summary?.totalOutputs === 8,
  JSON.stringify(file?.summary ?? {}),
)

// import the exported file → new tab, same totals
const tabsBefore = await tabCount()
const [sBefore, oBefore] = await totals()
const input = await page.$('.dz-actions input[type=file]')
await input.uploadFile(path.join(TMP, exported))
await wait(600)
const [sAfter, oAfter] = await totals()
check('import opens a new tab', (await tabCount()) === tabsBefore + 1)
check('imported totals match', sAfter === sBefore && oAfter === oBefore, `${sAfter}/${oAfter}`)

// tampered files are rejected whole
const bad = {
  'wrong-format.json': { ...file, format: 'something.else' },
  'bad-outputs.json': { ...file, items: file.items.map((it, i) => (i === 3 ? { ...it, outputs: -1 } : it)) },
  'forged-summary.json': { ...file, summary: { totalOutputs: 999 } },
  'not-json.json': '{ nope',
}
for (const [name, body] of Object.entries(bad)) {
  fs.writeFileSync(path.join(TMP, name), typeof body === 'string' ? body : JSON.stringify(body))
}
for (const name of ['wrong-format.json', 'bad-outputs.json', 'not-json.json']) {
  const n = await tabCount()
  await input.uploadFile(path.join(TMP, name))
  await wait(500)
  const dialog = await page.$('.dz-modal .dialog')
  const text = dialog ? await dialog.evaluate((d) => d.textContent) : ''
  check(`reject ${name}`, !!dialog && (await tabCount()) === n, text.slice(0, 120))
  if (name === 'bad-outputs.json') await page.screenshot({ path: 'scripts/dz-import-error.png' })
  await page.keyboard.press('Escape')
  await wait(200)
}
await input.uploadFile(path.join(TMP, 'forged-summary.json'))
await wait(500)
const [, forgedOut] = await totals()
check('forged summary block is ignored (recomputed)', forgedOut === 8, `got ${forgedOut}`)

// reload → tabs + active restored
const activeName = await page.$eval('.dz-tab.is-active .dz-tab-name', (e) => e.textContent)
const nTabs = await tabCount()
await wait(600)
await page.reload({ waitUntil: 'networkidle0' })
await page.waitForSelector('.dz canvas')
await wait(500)
check('reload restores tabs', (await tabCount()) === nTabs, `${await tabCount()} / ${nTabs}`)
check(
  'reload restores the active tab',
  (await page.$eval('.dz-tab.is-active .dz-tab-name', (e) => e.textContent)) === activeName,
)

// 3D-only view screenshot
await page.evaluate(() => document.querySelector('.dz-viewbar .dz-seg button')?.click())
await wait(900)
await page.screenshot({ path: 'scripts/dz-desktop-3d.png' })
await page.evaluate(() => document.querySelectorAll('.dz-viewbar .dz-seg button')[2]?.click())
await wait(400)

// ── phone ──
const phone = await browser.newPage()
await phone.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
phone.on('pageerror', (e) => logs.push(`[mobile] pageerror: ${e.message}`))
await phone.goto(`${BASE}/disenador`, { waitUntil: 'networkidle0' })
await phone.waitForSelector('.dz canvas')
await wait(900)
await phone.screenshot({ path: 'scripts/dz-mobile.png' })
const mtabs = await phone.$$('.dz-mtabs button')
await mtabs[2].tap()
await wait(300)
await phone.screenshot({ path: 'scripts/dz-mobile-summary.png' })
const overflow = await phone.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
check('no horizontal overflow on phone', !overflow)

// ── landing → designer (in-app) → back ──
const land = await browser.newPage()
await land.setViewport({ width: 1440, height: 900 })
const landReq = []
land.on('request', (r) => landReq.push(r.url()))
land.on('pageerror', (e) => logs.push(`[landing] pageerror: ${e.message}`))
await land.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
await wait(3000)
check('landing does not load the designer up front', !landReq.some((u) => /designer\//.test(u)))
await land.evaluate(() => document.getElementById('cultivo').scrollIntoView({ behavior: 'instant' }))
await wait(1400)
await land.screenshot({ path: 'scripts/dz-landing-cta.png' })
const navs = landReq.length
await land.click('#cultivo a[href="/disenador"]')
await land.waitForSelector('.dz canvas', { timeout: 20000 })
check('CTA navigates in-app to /disenador', new URL(land.url()).pathname === '/disenador' && landReq.length > navs)
await land.goBack()
await wait(1500)
check('back returns to the landing', !!(await land.$('.scroll-track')) && !(await land.$('.dz')))

console.log(results.join('\n'))
console.log(logs.length ? `\nconsole:\n${logs.join('\n')}` : '\nconsole: clean')
await browser.close()
