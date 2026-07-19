import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1");localStorage.setItem("aurea-cookie-consent","declined")}catch{}});
const p=await ctx.newPage();
for(const [name,path,y] of [["service","/uslugi/landing/",760],["nisha","/dlya-biznesa/salon-krasoty/",900],["ostudii","/o-studii/",620]]){
  await p.goto("http://127.0.0.1:3100"+path,{waitUntil:"networkidle"});
  await p.waitForTimeout(700);
  await p.evaluate((y)=>{const l=window.__lenis;if(l)l.scrollTo(y,{immediate:true,force:true});else window.scrollTo(0,y);},y);
  await p.waitForTimeout(700);
  await p.screenshot({path:`/tmp/shots/v5-${name}-light.png`});
  console.log(name);
}
await b.close();
