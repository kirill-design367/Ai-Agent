import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
const CH="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const chrome=await launch({chromePath:CH,chromeFlags:["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]});
for(const [n,p] of [["home","/"],["case","/keisy/nasledie/"]]){
  const r=await lighthouse("http://localhost:3000"+p,{port:chrome.port,output:"json",logLevel:"error",onlyCategories:["accessibility"],formFactor:"mobile",screenEmulation:{mobile:true,width:360,height:780,deviceScaleFactor:2,disabled:false}});
  const fails=Object.values(r.lhr.audits).filter(a=>a.score!==null&&a.score<1&&r.lhr.categories.accessibility.auditRefs.some(x=>x.id===a.id));
  console.log(`\n[${n}] a11y ${Math.round(r.lhr.categories.accessibility.score*100)} — fails:`);
  for(const f of fails){ console.log(" •", f.id, "—", (f.title||"").slice(0,70)); const items=f.details?.items||[]; for(const it of items.slice(0,3)) console.log("     ", (it.node?.snippet||it.node?.selector||"").slice(0,90)); }
}
await chrome.kill();
