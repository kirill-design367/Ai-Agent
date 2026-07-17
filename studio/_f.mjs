import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
const CH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const chrome = await launch({ chromePath: CH, chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] });
const U = [["home", "/"], ["service", "/uslugi/korporativnyi-sait/"], ["niche", "/dlya-biznesa/avto-iz-korei/"], ["case", "/keisy/nasledie/"]];
const o = { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "seo", "accessibility", "best-practices"], formFactor: "mobile", screenEmulation: { mobile: true, width: 360, height: 780, deviceScaleFactor: 2, disabled: false }, throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 } };
const rows = [];
for (const [n, p] of U) {
  const r = await lighthouse("http://localhost:3003" + p, o);
  const a = r.lhr.audits, c = r.lhr.categories;
  rows.push({ page: n, perf: Math.round(c.performance.score * 100), seo: Math.round(c.seo.score * 100), a11y: Math.round(c.accessibility.score * 100), bp: Math.round(c["best-practices"].score * 100), LCP: a["largest-contentful-paint"].displayValue, CLS: a["cumulative-layout-shift"].displayValue, TBT: a["total-blocking-time"].displayValue });
}
await chrome.kill();
console.log(JSON.stringify(rows, null, 2));
