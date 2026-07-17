/*
  АУДИТ ПОЛНОТЫ ФАЗЫ 1 (§3 ТЗ). По каждому URL: есть ли контент-файл, есть ли
  шаблон-роут, написан ли текст, статус, сколько маркеров TODO(владелец) осталось.
  Пишет PHASE1-STATUS.md и печатает таблицу.

  Запуск: node --experimental-strip-types scripts/audit-phase1.mjs
*/
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const todos = (s) => (s.match(/TODO\(владелец/g) || []).length;

function doc(dir, slug) {
  const f = path.join("content", dir, `${slug}.mdx`);
  if (!fs.existsSync(f)) return null;
  const raw = fs.readFileSync(f, "utf8");
  const { data, content } = matter(raw);
  return { data, todos: todos(raw), textLen: content.trim().length, exists: true };
}
function all(dir) {
  const p = path.join("content", dir);
  return fs.existsSync(p) ? fs.readdirSync(p).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, "")) : [];
}
const routeExists = (p) => fs.existsSync(path.join("app", p)) || fs.existsSync(path.join("app/(site)", p));

const rows = [];
const push = (url, tmpl, d, extra = "") =>
  rows.push({
    url,
    файл: d ? "✅" : d === undefined ? "—" : "❌",
    шаблон: tmpl ? "✅" : "❌",
    текст: d ? (d.data.status === "published" ? "готов" : "черновик") : "—",
    статус: d?.data?.status ?? extra,
    "P0/TODO": d ? String(d.todos) : "—",
  });

// Статические разделы
push("/", routeExists("page.tsx"), undefined, "published");
push("/uslugi/", routeExists("uslugi/page.tsx"), undefined, "published");
push("/dlya-biznesa/", routeExists("dlya-biznesa/page.tsx"), undefined, "published");
push("/keisy/", routeExists("keisy/page.tsx"), undefined, "published");
push("/blog/", routeExists("blog/page.tsx"), undefined, "published");
push("/o-studii/", routeExists("o-studii/page.tsx"), undefined, "published");
push("/kontakty/", routeExists("kontakty/page.tsx"), undefined, "published");

// Услуги
const svcTmpl = routeExists("uslugi/[slug]/page.tsx");
for (const s of all("services")) push(`/uslugi/${s}/`, svcTmpl, doc("services", s));
// Ниши
const nTmpl = routeExists("dlya-biznesa/[slug]/page.tsx");
for (const s of all("niches")) push(`/dlya-biznesa/${s}/`, nTmpl, doc("niches", s));
// Кейсы
const cTmpl = routeExists("keisy/[slug]/page.tsx");
for (const s of all("cases")) push(`/keisy/${s}/`, cTmpl, doc("cases", s));
// Статьи
const aTmpl = routeExists("blog/[slug]/page.tsx");
for (const s of all("articles")) push(`/blog/${s}/`, aTmpl, doc("articles", s));
// Юридические
for (const s of ["policy", "pd", "offer", "consent"]) push(`/${s}/`, routeExists(`${s}/page.tsx`), undefined, "published");

const header = "| URL | Файл | Шаблон | Текст | Статус | P0/TODO |\n|---|---|---|---|---|---|";
const body = rows.map((r) => `| ${r.url} | ${r.файл} | ${r.шаблон} | ${r.текст} | ${r.статус} | ${r["P0/TODO"]} |`).join("\n");

const pub = rows.filter((r) => r.статус === "published").length;
const draft = rows.filter((r) => r.статус === "draft").length;
const totalTodo = rows.reduce((s, r) => s + (r["P0/TODO"] === "—" ? 0 : +r["P0/TODO"]), 0);

const md = `# Аудит полноты Фазы 1 (§3 ТЗ)

Сгенерировано \`scripts/audit-phase1.mjs\`. Обновлять командой \`npm run audit\`.

${header}
${body}

**Итого:** ${pub} опубликовано, ${draft} черновик; маркеров TODO(владелец) в контенте: ${totalTodo}.

Легенда: Файл ✅ есть / — не требуется (статическая страница) / ❌ нет.
Шаблон — роут-компонент. Текст: готов (published) / черновик (draft).
`;
fs.writeFileSync("PHASE1-STATUS.md", md);
console.log(md);
