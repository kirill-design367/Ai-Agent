import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1")}catch{}});
const p=await ctx.newPage();
// uslugi index list
await p.goto("http://127.0.0.1:3100/uslugi/",{waitUntil:"networkidle"});
await p.evaluate(()=>{document.querySelectorAll("button").forEach(b=>{if(/Принять/.test(b.textContent))b.click()})});
await p.waitForTimeout(400);
await p.evaluate(()=>window.scrollTo(0,720)); await p.waitForTimeout(700);
await p.screenshot({path:"/tmp/shots/v4-uslugi-index.png"});
// hover a row to show preview (home cases have covers)
await p.goto("http://127.0.0.1:3100/",{waitUntil:"networkidle"});
await p.waitForTimeout(300);
// scroll to light zone (cases index ~ far down). find idx in cases
await p.evaluate(()=>{const els=[...document.querySelectorAll('.pg-hub h2')];const c=els.find(h=>/кейс/i.test(h.textContent));if(c)c.scrollIntoView();});
await p.waitForTimeout(500);
const row=await p.$(".sec--light .idx-row");
if(row){ await row.hover(); await p.waitForTimeout(600); }
await p.screenshot({path:"/tmp/shots/v4-home-cases-hover.png"});
await b.close();console.log("ok");
