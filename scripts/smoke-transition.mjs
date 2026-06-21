/* Smoke test for the upgraded page transition + cursor glow + no-loading-screen.
   Exercises the new per-frame handoff code in both directions and fails on any
   runtime console error. Usage: node scripts/smoke-transition.mjs [baseUrl] */
import { chromium } from 'playwright'

const BASE = process.argv[2] || 'http://localhost:5174'
const SHOT = 'scripts/transition-shots'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'no-preference',
})
const page = await ctx.newPage()

const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()) })

// ── Home loads with NO loading screen and visible hero ──────────────────────
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(1500)

check('no loading screen element', (await page.locator('.ls-root').count()) === 0)
check('cursor-spotlight element present', (await page.locator('.cursor-spotlight').count()) === 1)

const heroOpacity = await page.evaluate(() => {
  const el = document.querySelector('.hero-eyebrow') || document.querySelector('h1')
  if (!el) return -1
  return parseFloat(getComputedStyle(el).opacity)
})
check('hero content animated in (loaded=true)', heroOpacity > 0.5, `opacity ${heroOpacity}`)

// Cursor glow appears + follows on pointer move
await page.mouse.move(400, 400)
await page.waitForTimeout(120)
await page.mouse.move(900, 600, { steps: 10 })
await page.waitForTimeout(200)
const spot = await page.evaluate(() => {
  const el = document.querySelector('.cursor-spotlight')
  return { opacity: parseFloat(getComputedStyle(el).opacity), transform: el.style.transform }
})
check('cursor glow visible after move', spot.opacity > 0.5, `opacity ${spot.opacity}`)
check('cursor glow has a translate transform', /translate3d/.test(spot.transform), spot.transform)

await page.screenshot({ path: `${SHOT}/01-home.png` })

// ── Trigger a HOME → SERVICE morph by clicking a service link ───────────────
const svcHref = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a[href^="/services/"]')]
    .find((x) => /\/services\/[^/?#]+/.test(x.getAttribute('href')))
  return a ? a.getAttribute('href') : null
})
check('found a service link to click', !!svcHref, svcHref || 'none')

let morphSawActive = false
let morphMs = 0
if (svcHref) {
  await page.evaluate((href) => {
    const a = [...document.querySelectorAll('a[href]')].find((x) => x.getAttribute('href') === href)
    a && a.click()
  }, svcHref)

  // Watch the body.rr-transitioning class appear then clear (morph runs/ends).
  const t0 = Date.now()
  for (let i = 0; i < 160; i++) {
    const on = await page.evaluate(() => document.body.classList.contains('rr-transitioning'))
    if (on) morphSawActive = true
    if (morphSawActive && !on) break
    if (i === 18) await page.screenshot({ path: `${SHOT}/02-mid-transition.png` })
    await page.waitForTimeout(80)
  }
  morphMs = Date.now() - t0
}
check('morph activated (rr-transitioning seen)', morphSawActive)
check('morph completed + cleared', morphSawActive && !(await page.evaluate(() => document.body.classList.contains('rr-transitioning'))), `~${morphMs}ms`)

await page.waitForTimeout(600)
check('landed on a service page', /\/services\//.test(page.url()), page.url())
const svcObj = await page.evaluate(() => {
  const slot = document.querySelector('.sd-hero-visual')
  const cc = document.getElementById('canvas-container')
  return { slot: !!slot, ccVisible: !!cc && !cc.classList.contains('world-hidden') }
})
check('service object slot + docked persistent canvas present', svcObj.slot && svcObj.ccVisible, JSON.stringify(svcObj))
await page.screenshot({ path: `${SHOT}/03-service.png` })

// ── Trigger SERVICE → HOME morph (logo/home link) ───────────────────────────
const homeHref = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a[href]')].find((x) => {
    const h = x.getAttribute('href')
    return h === '/' || h === ''
  })
  return a ? a.getAttribute('href') : null
})
let backOk = false
if (homeHref != null) {
  await page.evaluate((href) => {
    const a = [...document.querySelectorAll('a[href]')].find((x) => x.getAttribute('href') === href)
    a && a.click()
  }, homeHref)
  let sawActive = false
  for (let i = 0; i < 160; i++) {
    const on = await page.evaluate(() => document.body.classList.contains('rr-transitioning'))
    if (on) sawActive = true
    if (sawActive && !on) break
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(400)
  backOk = sawActive && page.url().replace(BASE, '').replace(/\/$/, '') === ''
}
check('service → home morph ran and landed home', backOk, page.url())
await page.screenshot({ path: `${SHOT}/04-back-home.png` })

// ── No runtime errors anywhere ──────────────────────────────────────────────
check('no runtime/console errors', errors.length === 0, errors.slice(0, 5).join(' | '))

await ctx.close()
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (errors.length) { console.log('\nERRORS:\n' + errors.join('\n')) }
process.exit(failed.length ? 1 : 0)
