// Side-by-side compare: reference tile (left) vs live object render (right).
//   node scripts/compare.mjs <key> [ry] [rx]
//   node scripts/compare.mjs all
// Outputs scripts/obj-shots/cmp-<key>.png  (Read it to judge the gap).
import { chromium } from 'playwright'
import { existsSync, readFileSync } from 'fs'
const dataUri = (rel) => existsSync(rel) ? 'data:image/png;base64,' + readFileSync(rel).toString('base64') : null

const BASE = 'http://localhost:5174'
const KEY_TO_INDEX = {
  globe: 0, gear: 1, code: 2, clock: 3, sparkle: 4, rings: 5, funnel: 6,
  portal: 7, dashboard: 8, chat: 9, webapp: 10, iot: 11,
  proof: 12, about: 13, process: 14, contact: 15, ourwork: 16,
}
const cwd = process.cwd().replace(/\\/g, '/')
const fileUrl = (rel) => 'file:///' + cwd + '/' + rel.split('/').map(encodeURIComponent).join('/')

const arg = process.argv[2] || 'globe'
const ry = process.argv[3] || '0'
const rx = process.argv[4] || '0'
const keys = arg === 'all' ? Object.keys(KEY_TO_INDEX) : [arg]

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
const errs = []; p.on('pageerror', e => errs.push(e.message))

for (const key of keys) {
  const i = KEY_TO_INDEX[key]
  // 1) capture the live object
  await p.goto(`${BASE}/objdev?i=${i}&ry=${ry}&rx=${rx}`, { waitUntil: 'networkidle', timeout: 60000 })
  await p.addStyleTag({ content: '.cc-banner,.grw,.cursor-trail,.cursor-spotlight{display:none!important}' })
  await p.mouse.move(2, 2)
  await p.waitForTimeout(2200)
  const liveOut = `scripts/obj-shots/live-${key}.png`
  const box = await p.locator('.objdev-slot').first().boundingBox()
  await p.screenshot({ path: liveOut, clip: box })

  // 2) compose ref | live (embed as data URIs so they always load)
  const refSrc = dataUri(`scripts/ref-tiles/${key}.png`)
  const liveSrc = dataUri(liveOut)
  const cmp = await ctx.newPage()
  await cmp.setViewportSize({ width: 1240, height: 640 })
  await cmp.setContent(`<!doctype html><html><body style="margin:0;background:#04060d;font-family:monospace">
    <div style="display:flex;gap:8px;padding:8px">
      <div style="flex:1;text-align:center">
        <div style="color:#7fd0ff;font-size:13px;padding:4px">REFERENCE — ${key}</div>
        ${refSrc ? `<img src="${refSrc}" style="width:100%;height:560px;object-fit:contain;background:#04060d">` : `<div style="height:560px;color:#888;display:grid;place-items:center">no ref tile</div>`}
      </div>
      <div style="flex:1;text-align:center">
        <div style="color:#ffd07f;font-size:13px;padding:4px">MINE — ${key} (i=${i})</div>
        <img src="${liveSrc}" style="width:100%;height:560px;object-fit:contain;background:#04060d">
      </div>
    </div></body></html>`, { waitUntil: 'networkidle' })
  await cmp.waitForTimeout(250)
  await cmp.screenshot({ path: `scripts/obj-shots/cmp-${key}.png` })
  await cmp.close()
  console.log('compared', key, 'i=' + i, 'errs', errs.length)
}
await ctx.close(); await b.close()
