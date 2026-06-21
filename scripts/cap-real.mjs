// Capture the REAL on-site object (real MINI shader), clipped to the object slot,
// so visual comparison matches what users actually see (not the /objpreview harness).
//   node scripts/cap-real.mjs <url> <out.png>
import { chromium } from 'playwright'

const url = process.argv[2] || 'http://localhost:5174/services/website-development'
const out = process.argv[3] || 'scripts/obj-shots/real.png'
const sel = process.argv[4] || '.sd-hero-visual'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' })
const p = await ctx.newPage()
const errs = []; p.on('pageerror', e => errs.push(e.message))
await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(3500)  // let the object dock + settle
// hide chrome that overlaps the capture
await p.addStyleTag({ content: '.cc-banner,.grw,.cursor-trail,.cursor-spotlight{display:none!important}' })
await p.mouse.move(5, 5)      // park the cursor off the object so no hover-glow artifact
await p.waitForTimeout(600)
const box = await p.locator(sel).first().boundingBox()
const pad = 50
await p.screenshot({ path: out, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 } })
console.log('errs', errs.length, 'box', JSON.stringify(box))
await ctx.close(); await b.close()
