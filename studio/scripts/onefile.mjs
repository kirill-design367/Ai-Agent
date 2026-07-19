import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const p=await b.newPage({viewport:{width:1100,height:600}});
await p.goto("file://"+process.argv[2],{waitUntil:"networkidle"});
await p.waitForTimeout(400);
await p.screenshot({path:process.argv[3]});
await b.close();
