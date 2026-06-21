import { chromium } from 'playwright'
const BASE = 'http://localhost:5174'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } })
const p = await ctx.newPage()
const errs = []; p.on('pageerror', e => errs.push(e.message))
let pass = 0, fail = 0
const check = (n, ok, extra='') => { console.log((ok?'PASS  ':'FAIL  ')+n+(extra?'  — '+extra:'')); ok?pass++:fail++ }

for (const route of ['/about', '/proof']) {
  await p.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 })
  await p.waitForTimeout(1500)
  const href = await p.evaluate((r) => { const a = [...document.querySelectorAll('a[href]')].find(x => x.getAttribute('href') === r); return a ? r : null }, route)
  check(`home has a nav link to ${route}`, !!href, href || 'none')
  if (!href) continue
  await p.evaluate((r) => { const a = [...document.querySelectorAll('a[href]')].find(x => x.getAttribute('href') === r); a && a.click() }, route)
  let sawMorph = false
  const t0 = Date.now()
  while (Date.now() - t0 < 9000) {
    if (await p.evaluate(() => document.body.classList.contains('rr-transitioning'))) sawMorph = true
    if (sawMorph && !(await p.evaluate(() => document.body.classList.contains('rr-transitioning')))) break
    await p.waitForTimeout(60)
  }
  check(`${route}: cinematic morph fired (rr-transitioning seen)`, sawMorph)
  check(`${route}: landed on the page`, p.url().endsWith(route), p.url())
}
check('no runtime/console errors', errs.length === 0, errs.slice(0,3).join(' | '))
console.log(`\n${pass}/${pass+fail} checks passed`)
await ctx.close(); await b.close()
process.exit(fail ? 1 : 0)
