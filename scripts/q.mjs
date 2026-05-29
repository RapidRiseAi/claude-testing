import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
const PORT=4319, wait=ms=>new Promise(r=>setTimeout(r,ms))
async function up(u,t=80){for(let i=0;i<t;i++){try{if((await fetch(u)).ok)return}catch{}await wait(250)}throw new Error('no server')}
const s=spawn('npx',['vite','--port',String(PORT),'--strictPort'],{stdio:'ignore'})
let b
try{
 await up(`http://localhost:${PORT}/`)
 b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
 const p=await b.newPage({viewport:{width:1100,height:1100}})
 p.on('pageerror',e=>console.log('PAGEERROR:',e.message))
 p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE.ERR:',m.text().slice(0,200))})
 await p.goto(`http://localhost:${PORT}/?shot=1`,{waitUntil:'domcontentloaded'})
 await p.waitForSelector('canvas'); await wait(3000)
 console.log(JSON.stringify(await p.evaluate(()=>({card:typeof window.__wfSetCard,prog:typeof window.__wfSetProgress})),null,2))
}finally{if(b)await b.close();s.kill('SIGTERM')}
