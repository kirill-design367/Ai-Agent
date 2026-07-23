/*
  СТОРОЖ ЦЕН (правило проекта №2). Запускается на билде (prebuild) и в CI.
  Проходит по content/ и падает, если:
   • встретилась ₽-сумма, которой НЕТ в едином источнике content/pricing.ts
     (ALLOWED_AMOUNTS) и она не помечена редакционной;
   • токен цены {price|from|From:id} ссылается на неизвестный id.

  Разделение цифр по роли:
   • КОММЕРЧЕСКАЯ цифра (наша цена, цена в meta, в разметке) — пишется токеном
     {from:landing} и т.п. (подставляет loader из pricing.ts). Литералов «N ₽»
     для наших цен в content/ быть не должно.
   • РЕДАКЦИОННАЯ цифра (рыночные вилки в аналитической статье, «на рынке столько-
     то») — остаётся литералом, но помечается:
        – на весь файл: frontmatter `pricingEditorial: true`;
        – на строку: коммент `<!--ed-->` в той же строке.
  Суммы вида «5 млн ₽» (выручка кейса) под regex не попадают — они не «N ₽».

  Запуск: node --experimental-strip-types scripts/check-prices.mjs
*/
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ALLOWED_AMOUNTS, PRICE } from "../content/pricing.ts";

const ROOT = "content";
const allowed = new Set(ALLOWED_AMOUNTS);
const priceIds = new Set(Object.keys(PRICE));

// «30 000 ₽», «120 000 ₽» — число (с обычными/неразрывными пробелами) вплотную к ₽.
const MONEY = /(\d[\d   ]*)\s*₽/g;
const TOKEN = /\{(price|from|From):([A-Za-z]+)\}/g;
const ED_LINE = /<!--\s*ed(itorial)?\s*-->/i;

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".mdx")) out.push(p);
  }
  return out;
}

const errs = [];
for (const file of walk(ROOT)) {
  const raw = fs.readFileSync(file, "utf8");
  const { data } = matter(raw);
  const fileEditorial = data.pricingEditorial === true;
  const lines = raw.split("\n");

  lines.forEach((line, i) => {
    // токены цен — id должен существовать
    for (const m of line.matchAll(TOKEN)) {
      if (!priceIds.has(m[2])) {
        errs.push(`${file}:${i + 1}: неизвестный id цены «${m[2]}» в токене {${m[1]}:${m[2]}}`);
      }
    }
    // литеральные ₽-суммы
    if (fileEditorial || ED_LINE.test(line)) return;
    for (const m of line.matchAll(MONEY)) {
      const n = parseInt(m[1].replace(/\D/g, ""), 10);
      if (!allowed.has(n)) {
        errs.push(
          `${file}:${i + 1}: сумма ${n} ₽ не из content/pricing.ts и не помечена редакционной ` +
            `→ используйте токен {from:<id>} для нашей цены, либо пометьте строку <!--ed--> / файл pricingEditorial: true`
        );
      }
    }
  });
}

if (errs.length) {
  console.error(
    "\n✗ Сторож цен (правило №2) нашёл проблемы:\n" +
      errs.map((e) => "   • " + e).join("\n") +
      `\n\nДопустимые суммы из pricing.ts: ${[...allowed].sort((a, b) => a - b).join(", ")}\n`
  );
  process.exit(1);
}
console.log("✓ Сторож цен: все ₽-суммы в content/ — из pricing.ts или помечены редакционными");
