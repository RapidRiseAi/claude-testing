// Screenshot harness for Section 3 (the orb wave) + the pricing cards.
//
// Boots the production build, drives the page into Section 3 via the ?shot hooks
// (card 6 = funnel, then scroll past 2vh so sec3→1 and the funnel's orbs form the
// wave), and captures:
//   shots/wave.png   — the scene canvas only (the wave on black) via canvas.screenshot()
//   shots/cards.png  — the DOM cards only (canvas hidden) via page.screenshot()
//
//   node scripts/shoot-wave.mjs

import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const PORT = 4319
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
mkdirSync('shots', { recursive: true })

async function waitForServer(url, tries = 80) {
  for (let i = 0; i < tries; i++) {
    try { if ((await fetch(url)).ok) return } catch {}
    await wait(250)
  }
  throw new Error(`server ${url} never came up`)
}
function run(cmd, args) {
  return new Promise((res, rej) => {
    const c = spawn(cmd, args, { stdio: 'inherit' })
    c.on('exit', (code) => (code === 0 ? res() : rej(new Error(`${cmd} ${code}`))))
  })
}

if (!process.env.SKIP_BUILD) await run('npx', ['vite', 'build'])
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })

let browser
try {
  await waitForServer(`http://localhost:${PORT}/`)
  browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
  page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()) })

  await page.goto(`http://localhost:${PORT}/?shot=1`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await wait(3500) // let React effects attach the hooks

  // Drive into Section 3: funnel card, then scroll so the pricing section is
  // top-aligned (its offsetTop is ≥2vh, so sec3 clamps to 1 and the wave forms).
  await page.evaluate(() => {
    window.__wfSetCard && window.__wfSetCard(6)
    const sec = document.querySelector('.fp-section')
    window.scrollTo(0, sec ? sec.offsetTop : Math.round(window.innerHeight * 2))
    window.dispatchEvent(new Event('scroll'))
  })
  await wait(4500) // funnel → wave morph settle

  // 1) Wave only — read the canvas directly (this is the path that works headless).
  const canvas = await page.$('canvas')
  await canvas.screenshot({ path: 'shots/wave.png' })
  console.log('✓ saved shots/wave.png')
  // High-res crop of the bottom band (wave detail) via the canvas element.
  await canvas.screenshot({ path: 'shots/wave_crop.png', clip: { x: 120, y: 470, width: 1360, height: 420 } })
  console.log('✓ saved shots/wave_crop.png')

  // 2) Cards only — hide the WebGL canvas, then a normal page screenshot of the DOM.
  await page.evaluate(() => {
    const c = document.getElementById('canvas-container')
    if (c) c.style.display = 'none'
  })
  await wait(400)
  try {
    await page.screenshot({ path: 'shots/cards.png', timeout: 20000, animations: 'disabled' })
    console.log('✓ saved shots/cards.png')
    // High-res crop of the first two card tops (icons + rim detail).
    await page.screenshot({ path: 'shots/card_crop.png', clip: { x: 350, y: 250, width: 720, height: 320 }, timeout: 20000, animations: 'disabled' })
    console.log('✓ saved shots/card_crop.png')
  } catch (e) {
    console.log('cards.png FAILED:', e.message.split('\n')[0])
  }
} finally {
  if (browser) await browser.close()
  server.kill('SIGTERM')
}
