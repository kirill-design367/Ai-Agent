import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const pages=[["home","/"],["keisy","/keisy/"],["ostudii","/o-studii/"],["service","/uslugi/landing/"],["nisha","/dlya-biznesa/salon-krasoty/"],["kontakty","/kontakty/"],["blog","/blog/"],["blogpost","/blog/skolko-stoit-sait-dlya-mebeli/"],["404","/nope/"]];
for(const [vp,w,h] of [["1440",1440,900],["390",390,844]]){
  const ctx=await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1");localStorage.setItem("aurea-cookie-consent","declined")}catch{}});
  const p=await ctx.newPage();
  for(const [n,path] of pages){
    await p.goto("http://127.0.0.1:3100"+path,{waitUntil:"networkidle"}).catch(()=>{});
    await p.waitForTimeout(600);
    await p.screenshot({path:`/tmp/shots/f-${n}-${vp}.png`});
  }
  await ctx.close();
}
await b.close();console.log("ok");
