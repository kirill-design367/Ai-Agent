import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const pages=[["Главная","/"],["Услуга","/uslugi/landing/"],["Кейсы-хаб","/keisy/"],["О студии","/o-studii/"]];
for(const [name,path] of pages){
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true});
  await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1");localStorage.setItem("aurea-cookie-consent","declined")}catch{}});
  const p=await ctx.newPage();
  const cdp=await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});
  await p.addInitScript(()=>{
    window.__lcp=0;window.__cls=0;
    new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime;}).observe({type:"largest-contentful-paint",buffered:true});
    new PerformanceObserver(l=>{for(const e of l.getEntries()){if(!e.hadRecentInput)window.__cls+=e.value;}}).observe({type:"layout-shift",buffered:true});
  });
  await p.goto("http://127.0.0.1:3100"+path,{waitUntil:"load"});
  await p.waitForTimeout(3500);
  const m=await p.evaluate(()=>({lcp:Math.round(window.__lcp),cls:Math.round(window.__cls*1000)/1000}));
  console.log(`${name.padEnd(12)} LCP ${(m.lcp/1000).toFixed(2)}s  CLS ${m.cls}`);
  await ctx.close();
}
await b.close();
