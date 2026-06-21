// Crop individual object reference tiles out of the reference grid images.
//   node scripts/cropref.mjs
// Edit TILES below (natural px [x,y,w,h]) and re-run to recalibrate crops.
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('scripts/ref-tiles', { recursive: true })
const cwd = process.cwd().replace(/\\/g, '/')
const refUrl = (f) => 'file:///' + cwd + '/' + `website objects reference images/ChatGPT Image Jun 18, 2026, 02_15_00 PM ${f}.png`.split('/').map(encodeURIComponent).join('/')

// [key, refFile, x, y, w, h]  (natural px in the 1448x1086 grid)
const TILES = [
  // (1) existing objects — row1: globe, code, gear ; row2: clock, sparkle, rings, funnel
  ['globe',   '(1)',  40, 150, 430, 430],
  ['code',    '(1)', 510, 150, 430, 430],
  ['gear',    '(1)', 980, 150, 430, 430],
  ['clock',   '(1)',  40, 600, 330, 430],
  ['sparkle', '(1)', 375, 600, 330, 430],
  ['rings',   '(1)', 710, 600, 330, 430],
  ['funnel',  '(1)',1045, 600, 360, 430],
  // (2) service objects — row1: portal, dashboard, chat ; row2: webapp, iot
  ['portal',    '(2)',  60, 150, 430, 430],
  ['dashboard', '(2)', 510, 150, 430, 430],
  ['chat',      '(2)', 960, 150, 430, 430],
  ['webapp',    '(2)', 280, 610, 430, 430],
  ['iot',       '(2)', 740, 610, 430, 430],
  // (3) brand objects — row1: proof, about, process ; row2: contact, ourwork
  ['proof',   '(3)',  60, 150, 430, 430],
  ['about',   '(3)', 510, 150, 430, 430],
  ['process', '(3)', 960, 150, 430, 430],
  ['contact', '(3)', 280, 610, 430, 430],
  ['ourwork', '(3)', 740, 610, 430, 430],
]

const b = await chromium.launch()
const p = await (await b.newContext()).newPage()
let curF = null
for (const [key, f, x, y, w, h] of TILES) {
  if (f !== curF) { await p.goto(refUrl(f)); curF = f }
  const dataUrl = await p.evaluate(({ x, y, w, h }) => {
    const img = document.querySelector('img')
    const c = document.createElement('canvas'); c.width = w; c.height = h
    c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h)
    return c.toDataURL('image/png')
  }, { x, y, w, h })
  writeFileSync(`scripts/ref-tiles/${key}.png`, Buffer.from(dataUrl.split(',')[1], 'base64'))
}
console.log('cropped', TILES.length, 'tiles to scripts/ref-tiles/')
await b.close()
