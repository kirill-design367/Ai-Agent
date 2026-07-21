import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1");localStorage.setItem("aurea-cookie-consent","declined")}catch{}});
const p=await ctx.newPage();
await p.goto("http://127.0.0.1:3100/",{waitUntil:"networkidle"});
await p.waitForTimeout(1000);
for(const [n,y] of [["hero",0],["services",900],["cases",1900],["niches",3000]]){
  await p.evaluate((y)=>{const l=window.__lenis;if(l)l.scrollTo(y,{immediate:true,force:true});else window.scrollTo(0,y);},y);
  await p.waitForTimeout(700);
  await p.screenshot({path:`/tmp/shots/bw-home-${n}.png`});
}
await b.close();console.log("ok");
