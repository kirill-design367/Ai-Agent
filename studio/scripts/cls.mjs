import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true});
await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1");localStorage.setItem("aurea-cookie-consent","declined")}catch{}});
const p=await ctx.newPage();
const cdp=await ctx.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
await p.addInitScript(()=>{
  window.__src=[];
  new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;
    for(const s of e.sources||[]){const n=s.node; if(n&&e.value>0.005)window.__src.push({v:Math.round(e.value*1000)/1000,tag:n.nodeName,cls:(n.className&&n.className.baseVal!==undefined?n.className.baseVal:n.className)||"",id:n.id||""});}}}).observe({type:"layout-shift",buffered:true});
});
await p.goto("http://127.0.0.1:3100/",{waitUntil:"load"});
await p.waitForTimeout(3500);
const s=await p.evaluate(()=>window.__src.sort((a,b)=>b.v-a.v).slice(0,8));
console.log(JSON.stringify(s,null,1));
await b.close();
