// dev-only: capture the scroll story at several progress points
import puppeteer from 'puppeteer-core'

const URL = process.env.URL ?? 'http://localhost:5174/'
const STOPS = [0, 0.2, 0.38, 0.5, 0.62, 0.8, 0.97]

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 810 })

const logs = []
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`)
})
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 })
await new Promise((r) => setTimeout(r, 2500))

for (const p of STOPS) {
  await page.evaluate((prog) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, max * prog)
  }, p)
  // let the smoothed camera catch up
  await new Promise((r) => setTimeout(r, 2600))
  await page.screenshot({ path: `scripts/shot-${String(p).replace('.', '_')}.png` })
  console.log(`captured p=${p}`)
}

console.log(logs.length ? `\nCONSOLE:\n${logs.join('\n')}` : '\nCONSOLE: clean')
await browser.close()
