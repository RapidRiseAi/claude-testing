// Screenshot harness for the section-2 3D objects.
//
// Boots the Vite dev server (always-fresh source), opens the page with the
// ?shot flag, scrolls into the expertise section (so the object enters card
// mode), selects a card via the window.__wfSetCard hook, waits for the morph to
// settle, then captures the canvas.
//
// Usage:
//   node scripts/shoot.mjs [card] [outfile]
//   node scripts/shoot.mjs 3 shots/object04.png      # Object 04 (workflow path)
//
// Card indices: 0 browser frame, 1 command cube, 2 code block,
//               3 workflow path (Object 04), 4 intelligence orbit,
//               5 connected cubes, 6 funnel.

import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { chromium } from 'playwright'

const card    = parseInt(process.argv[2] ?? '3', 10)
const outfile = resolve(process.argv[3] ?? `shots/object${String(card + 1).padStart(2, '0')}.png`)
const PORT    = 4317

mkdirSync(dirname(outfile), { recursive: true })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { if ((await fetch(url)).ok) return } catch {}
    await wait(250)
  }
  throw new Error(`server at ${url} never came up`)
}

function run(cmd, args) {
  return new Promise((res, rej) => {
    const c = spawn(cmd, args, { stdio: 'inherit' })
    c.on('exit', (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited ${code}`))))
  })
}

// Build first so dist/ has the current source (incl. ?shot hooks), then preview.
// A production build runs far faster under swiftshader than the dev pipeline and
// avoids React StrictMode's double-invoked effects racing the render loop.
await run('npx', ['vite', 'build'])
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
})

let browser
try {
  await waitForServer(`http://localhost:${PORT}/`)

  browser = await chromium.launch({
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ],
  })
  // Use a wide 16:9 viewport so the card-mode group position (x ≈ -3.24 world
  // units) stays inside the frustum — the design targets ~1920 wide.
  const page = await browser.newPage({
    viewport: { width: 1440, height: 810 },
    deviceScaleFactor: 1,
  })
  page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()) })

  await page.goto(`http://localhost:${PORT}/?shot=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await wait(4000) // give React effects an uninterrupted stretch to attach hooks

  const hooks = await page.evaluate(
    () => `${typeof window.__wfSetCard}/${typeof window.__wfSetProgress}`,
  )
  if (hooks !== 'function/function') throw new Error(`hooks not ready: ${hooks}`)

  // Scroll into the expertise section (programmatic scroll isn't snap-jacked) so
  // the DOM framing is correct and onScroll drives progress → card mode. Then
  // pin progress via the hook as a belt-and-braces guard, and select the card.
  await page.evaluate((c) => {
    const sec = document.querySelector('section[data-carousel]')
    window.scrollTo(0, sec ? sec.offsetTop : window.innerHeight)
    window.dispatchEvent(new Event('scroll'))
    window.__wfSetProgress(0.99)
    window.__wfSetCard(c)
  }, card)
  await wait(3500) // collapse → card morph settle (slow under swiftshader)

  const active = await page.evaluate(
    () => document.querySelector('.expertise-card--active')?.textContent?.slice(0, 30),
  )
  console.log(`active card text: ${active}`)

  // Hide DOM overlay so the screenshot shows only the pure WebGL canvas.
  await page.evaluate(() => {
    const el = document.getElementById('scroll-content')
    if (el) el.style.visibility = 'hidden'
    const nav = document.querySelector('nav, .navbar, header')
    if (nav) nav.style.visibility = 'hidden'
  })
  await wait(200)

  const canvas = await page.$('canvas')
  await canvas.screenshot({ path: outfile })
  console.log(`\n✓ saved ${outfile} (card ${card})`)
} finally {
  if (browser) await browser.close()
  server.kill('SIGTERM')
}
