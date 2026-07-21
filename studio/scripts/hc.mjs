import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1");localStorage.setItem("aurea-cookie-consent","declined")}catch{}});
const p=await ctx.newPage();
await p.goto("http://127.0.0.1:3100/",{waitUntil:"networkidle"});
await p.waitForTimeout(800);
// scroll to works stage
await p.evaluate(()=>{const el=document.querySelector('.wk-stage');if(el){const y=el.getBoundingClientRect().top+window.scrollY-140;const l=window.__lenis;if(l)l.scrollTo(y,{immediate:true,force:true});else window.scrollTo(0,y);}});
await p.waitForTimeout(800);
await p.screenshot({path:"/tmp/shots/f-home-cases.png"});
await b.close();console.log("ok");
