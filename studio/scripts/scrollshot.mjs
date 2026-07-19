import { chromium } from "playwright-core";
const bin = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browser = await chromium.launch({ executablePath: bin, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { sessionStorage.setItem("aurea_seen","1"); } catch {} });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:3100/uslugi/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
// dismiss cookie banner if present
await page.evaluate(() => { document.querySelectorAll("button").forEach(b=>{ if(/Принять/.test(b.textContent)) b.click(); }); });
await page.waitForTimeout(400);
await page.evaluate(() => window.scrollTo(0, 760));
await page.waitForTimeout(700);
await page.screenshot({ path: "/tmp/shots/scroll-uslugi-cards.png" });
// home lower (feats + hub)
await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.evaluate(() => window.scrollTo(0, 620));
await page.waitForTimeout(700);
await page.screenshot({ path: "/tmp/shots/scroll-home-mid.png" });
await browser.close();
console.log("ok");
