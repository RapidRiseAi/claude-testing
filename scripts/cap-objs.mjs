import { chromium } from 'playwright'
const BASE='http://localhost:5174', SHOT=process.argv[2]||'scripts/obj-shots'
const ry=process.argv[3]||'0.35'
const only=process.argv[4]  // optional single index
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:820,height:820}})
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message))
const idxs = only!=null ? [parseInt(only,10)] : [0,1,2,3,4,5,6]
for (const i of idxs){
  await p.goto(`${BASE}/objpreview?i=${i}&ry=${ry}`,{waitUntil:'networkidle',timeout:60000})
  await p.addStyleTag({content:'.cc-banner,.grw,.cursor-trail,.cursor-spotlight{display:none!important}'})
  await p.waitForTimeout(1400)
  await p.screenshot({path:`${SHOT}/obj-${i}.png`})
}
console.log('captured', idxs.join(','), 'errs', errs.length)
await ctx.close(); await b.close()
