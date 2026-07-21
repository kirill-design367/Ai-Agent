import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1");localStorage.setItem("aurea-cookie-consent","declined")}catch{}});
const p=await ctx.newPage();
for(const v of ["1","2","3"]){
  await p.goto("http://127.0.0.1:3100/?v="+v,{waitUntil:"networkidle"});
  await p.waitForTimeout(900);
  await p.screenshot({path:`/tmp/shots/hero-v${v}.png`});
}
await b.close();console.log("ok");
