import { chromium } from "playwright-core";
const bin="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const b=await chromium.launch({executablePath:bin,args:["--no-sandbox"]});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto("http://127.0.0.1:3100/keisy/",{waitUntil:"networkidle"});
const info=await p.evaluate(()=>{
  const m=document.querySelector('.idx-media');
  const img=m?.querySelector('img');
  return {
    mediaCount:document.querySelectorAll('.idx-media').length,
    hasImg:!!img,
    src:(img?.currentSrc||img?.src||'').slice(0,90),
    natW:img?.naturalWidth, natH:img?.naturalHeight,
    mediaRect:m?getComputedStyle(m).getPropertyValue('opacity'):null,
    mediaW:m?m.getBoundingClientRect().width:null,
  };
});
console.log(JSON.stringify(info,null,2));
await b.close();
