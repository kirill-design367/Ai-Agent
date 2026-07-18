import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1");localStorage.setItem("aurea-cookie-consent","declined")}catch{}});
const p=await ctx.newPage();
await p.goto("http://127.0.0.1:3100/",{waitUntil:"networkidle"});
await p.waitForTimeout(1200); // GSAP/ScrollTrigger setup
const H=await p.evaluate(()=>document.body.scrollHeight);
console.log("scrollHeight",H);
const positions=[0,700,1500,2600,3800,5200];
for(let i=0;i<positions.length;i++){
  const y=positions[i];
  await p.evaluate((y)=>{const l=window.__lenis; if(l){l.scrollTo(y,{immediate:true,force:true});} else window.scrollTo(0,y);},y);
  await p.waitForTimeout(900);
  await p.screenshot({path:`/tmp/shots/cv-seq-${i}-y${y}.png`});
  console.log("shot",i,"y",y);
}
await b.close();
