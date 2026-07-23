/*
  ПРОВЕРКА ПАРИТЕТА ТАРИФОВ (§4). Запускается на билде (prebuild).

  Цена больше НЕ дублируется: единый источник — content/pricing.ts (правило
  проекта №2). И тарифы главной (lib/homeContent.ts), и страницы услуг/ниш, и
  JSON-LD берут цену оттуда. Поэтому цену сверять не с чем.

  Остаётся сверить СРОК: во frontmatter услуг `termFrom` не должен разойтись со
  сроком тарифа в pricing.ts (TERM). И убеждаемся, что цена случайно не вернулась
  во frontmatter услуги (priceFrom запрещён — цена только в pricing.ts).

  Запуск: node --experimental-strip-types scripts/check-parity.mjs
*/
import fs from "node:fs";
import matter from "gray-matter";
import { TERM, SERVICE_PRICE } from "../content/pricing.ts";

const errs = [];
for (const [slug, priceId] of Object.entries(SERVICE_PRICE)) {
  const f = `content/services/${slug}.mdx`;
  if (!fs.existsSync(f)) {
    errs.push(`нет файла услуги ${f} для тарифа «${slug}»`);
    continue;
  }
  const { data } = matter(fs.readFileSync(f, "utf8"));
  if (data.priceFrom !== undefined) {
    errs.push(`${slug}: priceFrom вернулся во frontmatter (${data.priceFrom}) — цена только в content/pricing.ts`);
  }
  const expectedTerm = TERM[priceId];
  if (expectedTerm && data.termFrom !== expectedTerm) {
    errs.push(`${slug}: срок — pricing.ts "${expectedTerm}" ≠ MDX "${data.termFrom}"`);
  }
}

if (errs.length) {
  console.error(
    "\n✗ Паритет тарифов нарушен (content/pricing.ts ↔ content/services):\n" +
      errs.map((e) => "   • " + e).join("\n") +
      "\n"
  );
  process.exit(1);
}
console.log("✓ Паритет тарифов: сроки услуг совпадают с pricing.ts, цен во frontmatter нет");
