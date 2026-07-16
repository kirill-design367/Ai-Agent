/*
  ЕДИНАЯ КОНФИГУРАЦИЯ САЙТА для SEO-слоя (canonical, JSON-LD, sitemap, OG).
  Меняется в одном месте. Города здесь НЕ фигурируют (§2.4) — areaServed: RU.
*/
export const SITE = {
  name: "AUREA",
  legalName: "AUREA — авторская студия разработки сайтов",
  // Абсолютный origin для canonical/OG/JSON-LD. Прод — кастомный домен.
  url: "https://aureadesign.ru",
  locale: "ru_RU",
  description:
    "Современные сайты для бизнеса. Личная ответственность за каждый проект, " +
    "внимание к деталям и решения, которые помогают привлекать клиентов.",
  founder: {
    name: "Кирилл Горовой",
    role: "Основатель студии AUREA",
    // @id для связывания Person ↔ Organization (§6.2)
    id: "https://aureadesign.ru/o-studii/#founder",
  },
  org: {
    id: "https://aureadesign.ru/#organization",
    logo: "https://aureadesign.ru/icon.svg",
  },
  contacts: {
    telegram: "https://t.me/Sk_Mac1",
    whatsapp: "https://wa.me/79185367424",
    email: "kirill0061@mail.ru",
  },
  // Реквизиты ИП — без города сверх юридически обязательного (§2.4).
  legal: {
    ip: "ИП Горовой Кирилл Николаевич",
    inn: "613805463472",
    ogrnip: "325619600032361",
  },
} as const;

/** Абсолютный canonical из внутреннего пути. Единая политика trailing slash (§6.4). */
export function canonical(pathname: string): string {
  const clean = pathname === "/" ? "/" : `/${pathname.replace(/^\/+|\/+$/g, "")}/`;
  return `${SITE.url}${clean}`;
}
