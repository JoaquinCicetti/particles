// dev-only: capture the scroll story at several progress points, then each
// in-flow solution section, on desktop and on a phone viewport
import puppeteer from 'puppeteer-core'

const URL = process.env.URL ?? 'http://localhost:5174/'
// act boundaries + each act's midpoint (see src/lib/acts.ts — five acts at
// 0 / 0.2 / 0.4 / 0.6 / 0.8), so every stop lands on a settle or a transition
const STORY_STOPS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
const MOBILE_STOPS = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
const SECTIONS = ['cultivo', 'silos', 'maduracion', 'contacto']
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 810 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
]

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
})

const logs = []
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

for (const vp of VIEWPORTS) {
  const page = await browser.newPage()
  await page.setViewport(vp)
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) logs.push(`[${vp.name}] ${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => logs.push(`[${vp.name}] pageerror: ${e.message}`))

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 })
  await wait(2500)

  const stops = vp.name === 'desktop' ? STORY_STOPS : MOBILE_STOPS
  for (const p of stops) {
    await page.evaluate((prog) => {
      const track = document.querySelector('.scroll-track')
      const max = track.offsetHeight - window.innerHeight
      window.scrollTo({ top: max * prog, behavior: 'instant' })
    }, p)
    await wait(2600) // let the smoothed camera catch up
    await page.screenshot({ path: `scripts/shot-${vp.name}-${String(p).replace('.', '_')}.png` })
    console.log(`[${vp.name}] captured p=${p}`)
  }

  for (const id of SECTIONS) {
    await page.evaluate((sid) => {
      document.getElementById(sid).scrollIntoView({ behavior: 'instant', block: 'start' })
    }, id)
    await wait(1400)
    await page.screenshot({ path: `scripts/shot-${vp.name}-${id}.png` })
    console.log(`[${vp.name}] captured #${id}`)
  }

  if (vp.name === 'mobile') {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await wait(800)
    await page.click('.nav-menu')
    await wait(500)
    await page.screenshot({ path: 'scripts/shot-mobile-menu.png' })
    console.log('[mobile] captured menu sheet')
  }
  await page.close()
}

console.log(logs.length ? `\nCONSOLE:\n${logs.join('\n')}` : '\nCONSOLE: clean')
await browser.close()
