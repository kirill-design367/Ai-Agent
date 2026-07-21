// POSTBUILD-GUARD: заголовок H1 главной ОБЯЗАН содержать пробелы между словами.
// Баг возвращался трижды: «лесенка» из display:block-спанов без текстовых узлов-
// пробелов давала textContent «Первоевпечатлениеневозможноповторить» одним словом
// — бессмысленно для SEO и скринридеров. Здесь мы имитируем textContent (срезаем
// теги В ПУСТО, не в пробел — иначе баг замаскируется) и падаем, если слова слиплись.
import { readFileSync, existsSync } from "node:fs";

const HOME = ".next/server/app/index.html";
if (!existsSync(HOME)) {
  console.error(`[check:h1] не найден пререндер главной: ${HOME}`);
  process.exit(1);
}
const html = readFileSync(HOME, "utf8");
const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
if (!m) {
  console.error("[check:h1] на главной нет <h1>");
  process.exit(1);
}
// textContent: теги → ПУСТО (как в браузере), сущности-пробелы → пробел.
const text = m[1]
  .replace(/<[^>]*>/g, "")
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&[a-z0-9#]+;/gi, "")
  .replace(/\s+/g, " ")
  .trim();

if (text.length === 0) {
  console.error("[check:h1] H1 пустой");
  process.exit(1);
}
if (text.length > 12 && !/\s/.test(text)) {
  console.error(`[check:h1] ПРОБЕЛЫ В H1 СЛИПЛИСЬ → "${text}"`);
  console.error("           Верни текстовые узлы-пробелы между словами (не удаляй их для лесенки).");
  process.exit(1);
}
console.log(`[check:h1] OK — H1 главной: "${text}"`);
