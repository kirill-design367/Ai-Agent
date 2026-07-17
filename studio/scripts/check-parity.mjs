/*
  ПРОВЕРКА ПАРИТЕТА КОНТЕНТА (§4). Запускается на билде (prebuild). Падает, если
  тарифы в едином источнике lib/homeContent.ts (их читают клиентские секции Prices
  и лёгкая главная) расходятся с frontmatter услуг content/services/*.mdx (их читает
  контент-слой: страницы услуг, HomeLite-сетка). Так две версии главной и услуги
  не разъедутся по ценам/срокам.

  Hero-копия (заголовок/подзаголовок/фишки) — единый импорт HERO в Hero.tsx и
  HomeLite.tsx, поэтому дублирования строк там нет by construction.

  Запуск: node --experimental-strip-types scripts/check-parity.mjs
*/
import fs from "node:fs";
import matter from "gray-matter";
import { TIERS } from "../lib/homeContent.ts";

const errs = [];
for (const t of TIERS) {
  const f = `content/services/${t.slug}.mdx`;
  if (!fs.existsSync(f)) {
    errs.push(`нет файла услуги ${f} для тарифа «${t.name}»`);
    continue;
  }
  const { data } = matter(fs.readFileSync(f, "utf8"));
  if (data.priceFrom !== t.from) {
    errs.push(`${t.slug}: цена — homeContent ${t.from} ≠ MDX ${data.priceFrom}`);
  }
  if (data.termFrom !== t.term) {
    errs.push(`${t.slug}: срок — homeContent "${t.term}" ≠ MDX "${data.termFrom}"`);
  }
}

if (errs.length) {
  console.error(
    "\n✗ Паритет контента главной нарушен (lib/homeContent.ts ↔ content/services):\n" +
      errs.map((e) => "   • " + e).join("\n") +
      "\n"
  );
  process.exit(1);
}
console.log("✓ Паритет главной: тарифы homeContent совпадают с услугами");
