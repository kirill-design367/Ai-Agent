import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
for(let i=0;i<3;i++){
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true});
  await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1");localStorage.setItem("aurea-cookie-consent","declined")}catch{}});
  const p=await ctx.newPage();
  const cdp=await ctx.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
  await p.addInitScript(()=>{window.__cls=0;window.__big=[];
    new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;window.__cls+=e.value;
      if(e.value>0.01){try{const n=(e.sources&&e.sources[0]&&e.sources[0].node);window.__big.push((n?(n.nodeName+"."+(typeof n.className==="string"?n.className:"")):"?")+":"+e.value.toFixed(3));}catch{}}}}).observe({type:"layout-shift",buffered:true});
  });
  await p.goto("http://127.0.0.1:3100/",{waitUntil:"load"});
  await p.waitForTimeout(4000);
  const m=await p.evaluate(()=>({cls:Math.round(window.__cls*1000)/1000,big:window.__big}));
  console.log(`run${i}: CLS ${m.cls}  |`, m.big.join("  ").slice(0,180));
  await ctx.close();
}
await b.close();
