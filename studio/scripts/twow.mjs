import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const url="file://"+process.argv[2];
for(const [w,h,tag] of [[1440,2200,"1440"],[390,1500,"390"]]){
  const p=await b.newPage({viewport:{width:w,height:h}});
  await p.goto(url,{waitUntil:"networkidle"});await p.waitForTimeout(400);
  await p.screenshot({path:`/tmp/shots/font-${tag}.png`,fullPage:true});
  await p.close();
}
await b.close();console.log("ok");
