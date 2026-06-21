import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await (await b.newContext()).newPage()
const cwd = process.cwd().replace(/\\/g, '/')
for (const f of ['(1)', '(2)', '(3)', '(4)']) {
  const path = `website objects reference images/ChatGPT Image Jun 18, 2026, 02_15_00 PM ${f}.png`
  const url = 'file:///' + cwd + '/' + path.split('/').map(encodeURIComponent).join('/')
  await p.goto(url)
  const d = await p.evaluate(() => { const i = document.querySelector('img'); return i ? [i.naturalWidth, i.naturalHeight] : null })
  console.log(f, JSON.stringify(d))
}
await b.close()
