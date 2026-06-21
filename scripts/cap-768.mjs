import { chromium } from 'playwright'
const url = process.argv[2], out = process.argv[3]
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 })
const p = await ctx.newPage()
const errs = []; p.on('pageerror', e => errs.push(e.message))
await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(2500)
await p.addStyleTag({ content: '.cc-banner,.grw,.cursor-trail,.cursor-spotlight{display:none!important}' })
await p.mouse.move(5,5); await p.waitForTimeout(400)
// check for horizontal overflow
const ow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
await p.screenshot({ path: out })
console.log('errs', errs.length, 'horizontalOverflow', ow)
await ctx.close(); await b.close()
