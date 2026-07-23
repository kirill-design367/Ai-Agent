import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  contentSchemas,
  CONTENT_DIRS,
  type ContentType,
  type NicheDoc,
  type ServiceDoc,
  type CaseDoc,
  type ArticleDoc,
} from "./schema";
import { PRICE, formatPrice, type PriceId } from "@/content/pricing";

/*
  ПОДСТАНОВКА ЦЕН (правило проекта №2). В .mdx коммерческая цифра пишется токеном,
  а не литералом — единый источник цен content/pricing.ts. Токены:
    {price:landing} → «30 000 ₽»   {from:landing} → «от 30 000 ₽»   {From:landing} → «От 30 000 ₽»
  Резолвятся во ВСЕХ строковых полях (metaDescription, lead, includes, faq…) и в
  теле MDX — здесь, в загрузчике, до рендера. Неизвестный id — падение на билде.
*/
const PRICE_TOKEN = /\{(price|from|From):([A-Za-z]+)\}/g;
function resolvePriceTokens(s: string, where: string): string {
  return s.replace(PRICE_TOKEN, (_m, kind: string, id: string) => {
    if (!(id in PRICE)) {
      throw new Error(`Неизвестный id цены «${id}» в токене {${kind}:${id}} (${where}). Допустимые: ${Object.keys(PRICE).join(", ")}.`);
    }
    const money = formatPrice(PRICE[id as PriceId]);
    return kind === "from" ? `от ${money}` : kind === "From" ? `От ${money}` : money;
  });
}
/** Глубоко проходит строки в объекте/массиве и резолвит токены цен. */
function deepResolve<T>(value: T, where: string): T {
  if (typeof value === "string") return resolvePriceTokens(value, where) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => deepResolve(v, where)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepResolve(v, where);
    return out as T;
  }
  return value;
}

/*
  ЗАГРУЗЧИК КОНТЕНТА — читает .mdx-файлы из /content, валидирует frontmatter по
  схеме соответствующего типа (zod), отдаёт типизированные документы + тело MDX.

  Никакого codegen и билд-магии: обычный синхронный чтец файлов, полностью
  инспектируемый. Работает в RSC на билде (SSG) и на сервере (ISR). Слой SEO
  (sitemap, JSON-LD, перелинковка) читает данные только отсюда.
*/

const CONTENT_ROOT = path.join(process.cwd(), "content");

/** Документ + производные поля (slug из имени файла, сырое тело MDX). */
export type Loaded<T> = T & { slug: string; body: string };

function dirFor(type: ContentType): string {
  return path.join(CONTENT_ROOT, CONTENT_DIRS[type]);
}

/** Список slug'ов типа (по именам .mdx-файлов). Пусто, если директории нет. */
export function listSlugs(type: ContentType): string[] {
  const dir = dirFor(type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** Прочитать и провалидировать один документ. null — если файла нет. */
export function getDoc<T extends ContentType>(
  type: T,
  slug: string
): Loaded<import("zod").infer<(typeof contentSchemas)[T]>> | null {
  const file = path.join(dirFor(type), `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const parsed = contentSchemas[type].safeParse({ ...data, type });
  if (!parsed.success) {
    // Падаем на билде с внятным адресом ошибки — контент не уедет в прод битым.
    throw new Error(
      `Контент ${CONTENT_DIRS[type]}/${slug}.mdx не прошёл валидацию:\n` +
        parsed.error.issues
          .map((i) => `  • ${i.path.join(".") || "(корень)"}: ${i.message}`)
          .join("\n")
    );
  }
  const where = `${CONTENT_DIRS[type]}/${slug}.mdx`;
  const resolved = deepResolve(parsed.data as object, where);
  const body = resolvePriceTokens(content.trim(), where);
  return { ...resolved, slug, body } as Loaded<
    import("zod").infer<(typeof contentSchemas)[T]>
  >;
}

/** Все документы типа. По умолчанию — только опубликованные, отсортированы. */
export function getAll<T extends ContentType>(
  type: T,
  opts: { includeDrafts?: boolean } = {}
): Loaded<import("zod").infer<(typeof contentSchemas)[T]>>[] {
  const docs = listSlugs(type)
    .map((slug) => getDoc(type, slug))
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .filter((d) => opts.includeDrafts || d.status === "published");
  docs.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    // свежее «Обновлено» — выше
    return b.dateModified.localeCompare(a.dateModified);
  });
  return docs;
}

// Узкие типизированные хелперы для страниц/шаблонов.
export const getNiche = (slug: string) => getDoc("niche", slug) as Loaded<NicheDoc> | null;
export const getAllNiches = (o?: { includeDrafts?: boolean }) =>
  getAll("niche", o) as Loaded<NicheDoc>[];
export const getService = (slug: string) => getDoc("service", slug) as Loaded<ServiceDoc> | null;
export const getAllServices = (o?: { includeDrafts?: boolean }) =>
  getAll("service", o) as Loaded<ServiceDoc>[];
export const getCase = (slug: string) => getDoc("case", slug) as Loaded<CaseDoc> | null;
export const getAllCases = (o?: { includeDrafts?: boolean }) =>
  getAll("case", o) as Loaded<CaseDoc>[];
export const getArticle = (slug: string) => getDoc("article", slug) as Loaded<ArticleDoc> | null;
export const getAllArticles = (o?: { includeDrafts?: boolean }) =>
  getAll("article", o) as Loaded<ArticleDoc>[];

/** Все опубликованные URL для sitemap. Draft и city (Фаза 3) сюда не попадают. */
export function getSitemapEntries(): { path: string; lastmod: string }[] {
  const entries: { path: string; lastmod: string }[] = [];
  const push = (p: string, lastmod: string) => entries.push({ path: p, lastmod });

  for (const s of getAllServices()) push(`/uslugi/${s.slug}/`, s.dateModified);
  for (const n of getAllNiches()) push(`/dlya-biznesa/${n.slug}/`, n.dateModified);
  for (const c of getAllCases()) push(`/keisy/${c.slug}/`, c.dateModified);
  for (const a of getAllArticles()) push(`/blog/${a.slug}/`, a.dateModified);
  return entries;
}
