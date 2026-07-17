/*
  ГЕНЕРАЦИЯ OG-ИЗОБРАЖЕНИЙ НА БИЛДЕ (§6.7). satori (JSX→SVG, текст векторизуется)
  + sharp (SVG→PNG). Никакого vendor-lock, никакого рантайма: статические файлы
  public/og/{key}.png, которые nginx отдаёт напрямую. Ключ файла = ogKey(path),
  тот же, что в buildMetadata → мета и файл не разъедутся.

  Запуск: node --experimental-strip-types scripts/gen-og.mjs (в prebuild).
*/
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import satori from "satori";
import sharp from "sharp";
import React from "react";
import { ogKey } from "../lib/seo/ogKey.ts";

const h = React.createElement;
// Один шрифт со ВСЕМИ нужными глифами (кириллица + латиница + пунктуация) —
// satori не приходится делать межшрифтовый fallback (он его не делает надёжно
// между сабсетами). DejaVu Sans Bold лежит в репозитории (в Alpine его нет).
const OG_FONT = "OGSans";
const fonts = [
  { name: OG_FONT, data: fs.readFileSync("assets/fonts/og-sans-bold.ttf"), weight: 700, style: "normal" },
];

/** Опубликованные документы типа: [{slug, data}]. */
function pub(dir) {
  const p = path.join("content", dir);
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({ slug: f.replace(/\.mdx$/, ""), data: matter(fs.readFileSync(path.join(p, f), "utf8")).data }))
    .filter((d) => d.data.status === "published");
}

const AMark = h(
  "svg",
  { width: 64, height: 76, viewBox: "0 0 22 26", fill: "#f4f2ee" },
  h("path", { d: "M11 2 L20 24 L16.3 24 L11 10 L5.7 24 L2 24 Z" }),
  h("circle", { cx: 11, cy: 19.2, r: 2 })
);

function template({ kicker, title }) {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: "#0a0a0b",
        backgroundImage: "radial-gradient(1000px 700px at 82% 6%, rgba(201,165,91,0.18), rgba(10,10,11,0))",
        color: "#f4f2ee",
        fontFamily: OG_FONT,
      },
    },
    h("div", { style: { display: "flex", alignItems: "center" } }, AMark,
      h("span", { style: { fontSize: 34, letterSpacing: 8, marginLeft: 16 } }, "AUREA")),
    h("div", { style: { display: "flex", flexDirection: "column" } },
      h("span", { style: { fontSize: 26, color: "#c9a55b", marginBottom: 20 } }, kicker),
      h("span", { style: { fontSize: 62, lineHeight: 1.08, display: "flex", maxWidth: 980 } }, title)),
    h("span", { style: { fontSize: 25, color: "rgba(244,242,238,0.7)" } },
      "Сайты, которые вызывают доверие с первых секунд")
  );
}

async function render(key, page) {
  const svg = await satori(template(page), { width: 1200, height: 630, fonts });
  await sharp(Buffer.from(svg)).png().toFile(path.join("public/og", `${key}.png`));
}

const pages = [
  { path: "/", kicker: "AUREA — авторская студия разработки сайтов", title: "Современные сайты для бизнеса под ключ" },
  { path: "/uslugi/", kicker: "AUREA", title: "Услуги — разработка сайтов под ключ" },
  { path: "/dlya-biznesa/", kicker: "AUREA", title: "Сайты под нишу для бизнеса" },
  { path: "/keisy/", kicker: "AUREA", title: "Кейсы — работы студии" },
  { path: "/blog/", kicker: "AUREA", title: "Блог о сайтах для бизнеса" },
  { path: "/o-studii/", kicker: "AUREA", title: "Авторская студия AUREA" },
  { path: "/kontakty/", kicker: "AUREA", title: "Контакты — обсудить проект" },
  ...pub("services").map((s) => ({ path: `/uslugi/${s.slug}/`, kicker: "Услуга — AUREA", title: s.data.h1 })),
  ...pub("niches").map((n) => ({ path: `/dlya-biznesa/${n.slug}/`, kicker: "Сайт под нишу — AUREA", title: n.data.h1 })),
  ...pub("cases").map((c) => ({ path: `/keisy/${c.slug}/`, kicker: "Кейс — AUREA", title: c.data.title })),
  ...pub("articles").map((a) => ({ path: `/blog/${a.slug}/`, kicker: "Блог — AUREA", title: a.data.h1 })),
];

fs.mkdirSync("public/og", { recursive: true });
let n = 0;
for (const p of pages) {
  await render(ogKey(p.path), p);
  n++;
}
// дефолт-фолбэк
await render("default", { kicker: "AUREA — авторская студия разработки сайтов", title: "Современные сайты для бизнеса под ключ" });
console.log(`✓ OG: сгенерировано ${n + 1} изображений в public/og/`);
