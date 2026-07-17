import { launch } from "chrome-launcher"; import lighthouse from "lighthouse";
const CH="/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const chrome=await launch({chromePath:CH,chromeFlags:["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage"]});
const U=[["Главная","/"],["Услуга","/uslugi/korporativnyi-sait/"],["Ниша","/dlya-biznesa/avto-iz-korei/"],["Кейс","/keisy/nasledie/"]];
const o={port:chrome.port,output:"json",logLevel:"error",onlyCategories:["performance","seo","accessibility","best-practices"],formFactor:"mobile",screenEmulation:{mobile:true,width:360,height:780,deviceScaleFactor:2,disabled:false},throttling:{rttMs:150,throughputKbps:1638.4,cpuSlowdownMultiplier:4}};
const rows=[];for(const[n,p]of U){const r=await lighthouse("http://localhost:3008"+p,o);const a=r.lhr.audits,c=r.lhr.categories;const cc=a["color-contrast"];rows.push({page:n,Perf:Math.round(c.performance.score*100),SEO:Math.round(c.seo.score*100),A11y:Math.round(c.accessibility.score*100),BP:Math.round(c["best-practices"].score*100),LCP:a["largest-contentful-paint"].displayValue,CLS:a["cumulative-layout-shift"].displayValue,contrast:cc?.score===1?"pass":(cc?.score==null?"n/a":"FAIL")});}
await chrome.kill();console.table(rows);
