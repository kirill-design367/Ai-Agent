// PREBUILD-GUARD: ни одна ОПУБЛИКОВАННАЯ страница не должна содержать служебных
// маркеров-инструкций (TODO/FIXME/владелец:...) — ни во фронтматтере (значения
// полей рендерятся: заголовки, шаги, FAQ, insight), ни в теле MDX.
//
// Причина появления: инструкции для владельца жили прямо в .mdx. Строковая
// фильтрация на рендере ловила только первую строку многострочного TODO —
// хвост «протекал» на прод (баг с висящей скобкой на /dlya-biznesa/avto-iz-korei/).
// Теперь сборка падает, если такой маркер есть в published-контенте.
//
// YAML-комментарии (# ...) безопасны: gray-matter их отбрасывает при парсинге,
// поэтому проверяем именно РАСПАРСЕННЫЕ значения + тело.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const ROOT = "content";
const MARKERS = /\b(TODO|FIXME|XXX)\b|\(владелец\s*:|владельц[ау]\s*:/i;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".mdx")) out.push(p);
  }
  return out;
}

// собираем все строковые значения фронтматтера (рекурсивно) с путём до них
function collectStrings(value, path, acc) {
  if (typeof value === "string") acc.push({ path, text: value });
  else if (Array.isArray(value)) value.forEach((v, i) => collectStrings(v, `${path}[${i}]`, acc));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) collectStrings(v, path ? `${path}.${k}` : k, acc);
}

const problems = [];
for (const file of walk(ROOT)) {
  const raw = readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  // проверяем только опубликованные (по умолчанию status: draft — черновики пропускаем)
  if (data.status !== "published") continue;

  const fields = [];
  collectStrings(data, "", fields);
  fields.push({ path: "(body)", text: content });

  for (const { path, text } of fields) {
    if (MARKERS.test(text)) {
      const snippet = text.replace(/\s+/g, " ").trim().slice(0, 90);
      problems.push(`  ${file} → ${path}: «${snippet}…»`);
    }
  }
}

if (problems.length) {
  console.error(
    `\n✗ Утечка служебного текста в published-контент (${problems.length}):\n` +
      problems.join("\n") +
      `\n\nУберите инструкции/TODO из опубликованных .mdx (или верните status: draft).\n`
  );
  process.exit(1);
}
console.log("✓ check:content — в опубликованном контенте нет TODO/инструкций.");
