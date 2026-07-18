import { chromium } from "playwright-core";
const bin = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browser = await chromium.launch({ executablePath: bin, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { sessionStorage.setItem("aurea_seen","1"); localStorage.setItem("aurea_consent","all"); } catch {} });
const page = await ctx.newPage();
for (const [name, path] of [["home","/"],["uslugi","/uslugi/"]]) {
  await page.goto("http://127.0.0.1:3100"+path, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `/tmp/shots/full-${name}-1440.png`, fullPage: true });
  console.log("full-"+name);
}
await browser.close();
