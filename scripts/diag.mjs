import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
const PORT = 4318
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
async function up(u, t = 60) { for (let i=0;i<t;i++){ try{ if((await fetch(u)).ok) return }catch{} await wait(250) } throw new Error('no server') }
const server = spawn('npx', ['vite','--port',String(PORT),'--strictPort'], { stdio:'ignore' })
let b
try {
  await up(`http://localhost:${PORT}/`)
  b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
  const p = await b.newPage({ viewport:{ width:1100, height:1100 } })
  await p.goto(`http://localhost:${PORT}/?shot=1`, { waitUntil:'networkidle' })
  await p.waitForSelector('canvas'); await wait(1000)
  const before = await p.evaluate(() => ({
    scrollY: window.scrollY, innerH: window.innerHeight,
    bodyH: document.body.scrollHeight, docH: document.documentElement.scrollHeight,
    sec: (() => { const s=document.querySelector('section[data-carousel]'); return s? s.offsetTop : null })(),
    hasHook: typeof window.__wfSetCard,
    sectionsCount: document.querySelectorAll('#scroll-content section').length,
  }))
  await p.evaluate(() => { const s=document.querySelector('section[data-carousel]'); window.scrollTo(0, s? s.offsetTop+5 : window.innerHeight); window.dispatchEvent(new Event('scroll')) })
  await wait(800)
  const after = await p.evaluate(() => ({ scrollY: window.scrollY }))
  const hookAfterScroll = await p.evaluate(() => typeof window.__wfSetCard)
  await p.evaluate((c)=> window.__wfSetCard && window.__wfSetCard(c), 3)
  await wait(1800)
  const card = await p.evaluate(() => document.querySelector('.expertise-card--active')?.textContent?.slice(0,40))
  const scrollYNow = await p.evaluate(() => window.scrollY)
  console.log(JSON.stringify({ before, after, hookAfterScroll, scrollYNow, activeCardText: card }, null, 2))
} finally { if (b) await b.close(); server.kill('SIGTERM') }
