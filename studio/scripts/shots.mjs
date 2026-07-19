import { chromium } from "playwright-core";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const BASE = process.env.SHOT_BASE || "http://127.0.0.1:3100";
const OUT = process.env.SHOT_OUT || "/tmp/shots";
const TAG = process.env.SHOT_TAG || "after";
mkdirSync(OUT, { recursive: true });

const bin = process.env.PW_BIN || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const PAGES = [
  ["home", "/"],
  ["uslugi", "/uslugi/"],
  ["service", "/uslugi/landing/"],
  ["keisy", "/keisy/"],
  ["case", "/keisy/aristide/"],
  ["nisha", "/dlya-biznesa/salon-krasoty/"],
  ["o-studii", "/o-studii/"],
  ["kontakty", "/kontakty/"],
  ["404", "/nope-404/"],
];
const VIEWPORTS = [["1440", 1440, 900], ["390", 390, 844]];

const browser = await chromium.launch({ executablePath: bin, args: ["--no-sandbox"] });
for (const [vpName, w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  // пропускаем прелоадер (первый визит) — помечаем сессию виденной
  await ctx.addInitScript(() => { try { sessionStorage.setItem("aurea_seen", "1"); } catch {} });
  const page = await ctx.newPage();
  for (const [name, path] of PAGES) {
    const url = BASE + path;
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }).catch((e) => ({ err: e.message }));
    await page.waitForTimeout(700);
    const file = `${OUT}/${TAG}-${name}-${vpName}.png`;
    await page.screenshot({ path: file, fullPage: false });
    console.log(`${file}  <- ${path}  ${resp && resp.status ? resp.status() : ""}`);
  }
  await ctx.close();
}
await browser.close();
console.log("done");
