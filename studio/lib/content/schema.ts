import { z } from "zod";

/*
  СХЕМА КОНТЕНТА (§4 ТЗ) — единый источник правды о форме каждого типа страницы.

  Принцип: «добавление страницы — данными, без изменения кода». Весь смысловой
  контент лежит в структурированном frontmatter (.mdx-файлы в /content), валидируется
  здесь через zod и типизируется автоматически. Тело MDX — опциональная свободная
  проза (доп. глубина для SEO/AI-цитируемости), рендерится в отдельном слоте.

  Типы контента заложены сразу (рендерятся только используемые). Добавление нового
  типа = новый объект-схема + шаблон, без переделки роутинга и SEO-слоя.
*/

// ── Примитивы, переиспользуемые между типами ───────────────────────────────

/** Дата в формате YYYY-MM-DD. Используется для datePublished/dateModified и lastmod. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "дата должна быть в формате YYYY-MM-DD");

/** Пункт FAQ — самодостаточный вопрос/ответ (§7.3): ответ понятен без остальной страницы. */
const faqItem = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

/** Ссылка перелинковки (§6.6). href — внутренний путь; label — видимый текст. */
const relatedLink = z.object({
  href: z.string().startsWith("/"),
  label: z.string().min(1),
  note: z.string().optional(),
});

/**
 * Базовый frontmatter — общий для всех типов (§4.1).
 * `status` управляет публикацией: draft вне sitemap и навигации (§ фазировка).
 */
const base = z.object({
  title: z.string().min(1),
  // Meta (§6.1): title ≤ ~55 с брендом, description ≤ 160.
  // Бренд в title ОБЯЗАТЕЛЕН (правка владельца): «… | AUREA» / «— AUREA».
  metaTitle: z
    .string()
    .min(1)
    .max(65)
    .refine((s) => /AUREA/.test(s), "metaTitle обязан содержать бренд «AUREA»"),
  metaDescription: z.string().min(1).max(170),
  datePublished: isoDate,
  dateModified: isoDate,
  author: z.string().default("Кирилл Горовой"),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
  related: z.array(relatedLink).default([]),
  status: z.enum(["published", "draft"]).default("draft"),
  // Порядок в хабах/сетках (меньше — раньше). Необязателен.
  order: z.number().optional(),
});

// ── УСЛУГА (service) ───────────────────────────────────────────────────────
// Тариф с обязательной расшифровкой цены (§2.7, Ф1): голых цен нет нигде.

const priceFactor = z.object({
  label: z.string().min(1),
  detail: z.string().optional(),
});

export const serviceSchema = base.extend({
  type: z.literal("service"),
  h1: z.string().min(1),
  // «от N ₽» + «от N дней» — цифры выполнимы в худшем реалистичном случае (§2.6).
  // Необязательны: услуга-поддержка не тарифицируется «от N».
  priceFrom: z.number().int().positive().optional(),
  termFrom: z.string().optional(), // «от 3 дней»
  lead: z.array(z.string().min(1)).min(1), // прямой ответ в первых абзацах (§7.1)
  includes: z.array(z.string().min(1)).default([]), // «что входит в базовую стоимость»
  priceFactors: z.array(priceFactor).default([]), // «что влияет на итоговую цену»
  insight: z.string().optional(), // уникальный вывод из практики (§7.6)
  faq: z.array(faqItem).default([]),
});

// ── НИША (niche) ───────────────────────────────────────────────────────────
// 100% уникальный контент на каждую нишу (§4.3), не клоны.

const painPoint = z.object({
  quote: z.string().min(1), // прямая боль клиента (Ф3) — в подзаголовок
  gloss: z.string().min(1), // расшифровка проблемы
  solution: z.string().min(1), // как AUREA это решает
});

const solutionStep = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

export const nicheSchema = base.extend({
  type: z.literal("niche"),
  h1: z.string().min(1), // «Создание сайтов для {ниша}»
  // Тариф-основа ниши — из него по умолчанию берём цену/срок/расшифровку.
  service: z.enum(["landing", "korporativnyi-sait", "internet-magazin"]),
  // Переопределение цены ниши. ПРАВИЛО: показанная цена не должна противоречить
  // составу решения на этой же странице (напр. если решение строится вокруг
  // калькулятора-модуля, «от» отражает вариант с ним, а priceNote разводит варианты).
  priceFrom: z.number().int().positive().optional(), // переопределяет priceFrom тарифа
  priceNote: z.string().optional(), // разведение вариантов цены (база vs с модулем)
  // Нишевая таблица «что влияет на цену». Если задана — используется вместо тарифной.
  // Первая строка = ключевой модуль ниши (напр. калькулятор).
  priceFactors: z.array(priceFactor).optional(),
  lead: z.array(z.string().min(1)).min(1), // прямой ответ: что получает бизнес, срок, цена (§7.1)
  painPoints: z.array(painPoint).min(3).max(4), // специфичные боли ниши (§4.3)
  solutionSteps: z.array(solutionStep).min(1), // структура решения
  insight: z.string().min(1), // уникальное наблюдение из практики (§7.6)
  caseSlug: z.string().optional(), // релевантный кейс
  faq: z.array(faqItem).min(4).max(6), // 4–6 уникальных вопросов ниши (§4.3)
});

// ── КЕЙС (case) ────────────────────────────────────────────────────────────
// Честный бейдж типа кейса (Ф2). Бизнес-цифры — только за флагом metricsConfirmed.

export const caseSchema = base
  .extend({
    type: z.literal("case"),
    caseType: z.enum(["own-product", "client", "concept"]),
    // Происхождение работы (честность): original — своя/клиентская работа;
    // replica — воссозданная чужая работа (техническая: вёрстка/анимации/перф).
    origin: z.enum(["original", "replica"]).default("original"),
    // Для replica — атрибуция автору оригинала (обязательна).
    originalName: z.string().optional(),
    originalAuthor: z.string().optional(),
    originalUrl: z.string().optional(),
    url: z.string().optional(), // ссылка на живой сайт (если разрешено)
  siteType: z.string().min(1), // «Интернет-витрина», «Лендинг»…
  term: z.string().min(1), // срок реализации
  task: z.array(z.string().min(1)).min(1), // задача
  solution: z.array(z.string().min(1)).min(1), // решение (от первого лица)
  result: z.array(z.string().min(1)).min(1), // результат — только подтверждаемое
  // Технические метрики (concept — только они): PageSpeed/LCP/вес/срок.
  techMetrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  // Бизнес-цифры заперты флагом (Ф2). default false → блок не рендерится.
  metricsConfirmed: z.boolean().default(false),
  businessMetrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  gallery: z.array(z.string()).default([]),
  serviceSlug: z.string().optional(), // «хотите похожий сайт» → услуга
  nicheSlug: z.string().optional(), // → ниша
});
// Примечание: для replica атрибуция желательна (originalName/Author/Url). Пока
// автор оригинала не уточнён — шаблон показывает общую атрибуцию без ссылки
// (см. CONTENT-TODO P1). Жёстко не требуем, чтобы не блокировать публикацию.

// ── СТАТЬЯ (article) ───────────────────────────────────────────────────────
// Контентная страница: видимый автор + Article/Person-разметка (§8.1).

export const articleSchema = base.extend({
  type: z.literal("article"),
  h1: z.string().min(1),
  excerpt: z.string().min(1), // анонс для хаба и og
  readingTime: z.string().optional(),
  faq: z.array(faqItem).default([]),
});

// ── FAQ-СТРАНИЦА (faq-page) ────────────────────────────────────────────────

export const faqPageSchema = base.extend({
  type: z.literal("faq-page"),
  h1: z.string().min(1),
  intro: z.string().optional(),
  faq: z.array(faqItem).min(1),
});

// ── Типы, заложенные на будущее (Фаза 2–3) — рендер-шаблоны появятся позже ──
// comparison, checklist, glossary, review, research, city (city — Фаза 3, вне sitemap).

export const contentSchemas = {
  service: serviceSchema,
  niche: nicheSchema,
  case: caseSchema,
  article: articleSchema,
  "faq-page": faqPageSchema,
} as const;

export type ContentType = keyof typeof contentSchemas;

export type ServiceDoc = z.infer<typeof serviceSchema>;
export type NicheDoc = z.infer<typeof nicheSchema>;
export type CaseDoc = z.infer<typeof caseSchema>;
export type ArticleDoc = z.infer<typeof articleSchema>;
export type FaqPageDoc = z.infer<typeof faqPageSchema>;

export type AnyDoc = ServiceDoc | NicheDoc | CaseDoc | ArticleDoc | FaqPageDoc;

/** Каталог контента → директория. Единая точка правды о размещении файлов. */
export const CONTENT_DIRS: Record<ContentType, string> = {
  service: "services",
  niche: "niches",
  case: "cases",
  article: "articles",
  "faq-page": "faq",
};
