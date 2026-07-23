/*
  ЕДИНЫЙ ИСТОЧНИК ЦЕН (правило проекта №2). Любая коммерческая цифра — цена на
  странице, в meta description, в JSON-LD, в тексте .mdx — берётся ОТСЮДА.
  Хардкод суммы где-либо ещё — ошибка (ловит scripts/check-prices.mjs).

  Как это подключено:
   • lib/homeContent.ts (тарифы главной) импортирует BASE отсюда;
   • страницы услуг/ниш и JSON-LD резолвят цену по slug через SERVICE_PRICE;
   • текст в .mdx (проза, lead, metaDescription) пишет ТОКЕНЫ {from:landing},
     которые подставляет загрузчик content (lib/content/loader.ts);
   • сторож check-prices.mjs импортирует ALLOWED_AMOUNTS и валит сборку, если
     в content/ встретилась ₽-сумма, которой нет здесь и она не помечена
     редакционной.

  Файл самодостаточный (без импортов) — его грузит и Next (алиас @/content/pricing),
  и node --experimental-strip-types в сторожах.
*/

// Базовые тарифы (₽). Меняются ТОЛЬКО здесь.
const BASE = {
  landing: 30000,
  corporate: 60000,
  shop: 120000,
  support: 15000,
} as const;

// Модули-надбавки к базе (₽). Складываются с тарифом в производных вариантах.
const ADDON = {
  calculator: 30000, // квиз-калькулятор цены (мебель/авто): +к корпоративному
} as const;

/** Все показываемые суммы по id. Производные варианты — из BASE + ADDON. */
export const PRICE = {
  landing: BASE.landing,
  corporate: BASE.corporate,
  shop: BASE.shop,
  support: BASE.support,
  // «база + квиз-калькулятор» — вариант для ниш мебель/авто (60 000 + 30 000).
  corporateCalc: BASE.corporate + ADDON.calculator, // 90 000
} as const;

export type PriceId = keyof typeof PRICE;

/** Срок «от N дней» по тарифу (атрибут тарифа, живёт рядом с ценой). */
export const TERM = {
  landing: "от 3 дней",
  corporate: "от 7 дней",
  shop: "от 14 дней",
} as const;

/**
 * slug услуги → id цены. Услуга «podderzhka» намеренно НЕ здесь: она не
 * тарифицируется «от N» на странице (цена support живёт в BASE как данные).
 * Ниши используют этот же маппинг по своему полю `service`.
 */
export const SERVICE_PRICE: Record<string, PriceId> = {
  landing: "landing",
  "korporativnyi-sait": "corporate",
  "internet-magazin": "shop",
};

/** Цена «от» для услуги/ниши по slug тарифа. undefined — если тариф не показывает цену. */
export function servicePrice(slug: string): number | undefined {
  const id = SERVICE_PRICE[slug];
  return id ? PRICE[id] : undefined;
}

/** «30000» → «30 000 ₽» (неразрывные пробелы в разрядах). */
export function formatPrice(n: number): string {
  return `${n.toLocaleString("ru-RU").replace(/\s/g, " ")} ₽`;
}

/** «от 30 000 ₽» / «От 30 000 ₽» по id цены. */
export function fromPrice(id: PriceId, capital = false): string {
  return `${capital ? "От" : "от"} ${formatPrice(PRICE[id])}`;
}

/** Допустимые к показу суммы (для сторожа check-prices.mjs). */
export const ALLOWED_AMOUNTS: number[] = Array.from(
  new Set<number>([...Object.values(PRICE), ...Object.values(ADDON)])
);
