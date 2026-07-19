import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{try{sessionStorage.setItem("aurea_seen","1")}catch{}});
const p=await ctx.newPage();
await p.goto("http://127.0.0.1:3100/keisy/",{waitUntil:"networkidle"});
await p.evaluate(()=>{document.querySelectorAll("button").forEach(b=>{if(/Принять/.test(b.textContent))b.click()})});
await p.waitForTimeout(400);
await p.evaluate(()=>{const r=document.querySelector('.idx-row');if(r)r.scrollIntoView({block:'center'})});
await p.waitForTimeout(500);
const row=await p.$(".idx-row");
if(row){await row.hover();await p.waitForTimeout(700);}
await p.screenshot({path:"/tmp/shots/v4-keisy-hover.png"});
await b.close();console.log("ok");
