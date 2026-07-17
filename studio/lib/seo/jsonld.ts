import { SITE, canonical } from "./site";
import type { NicheDoc, ServiceDoc, CaseDoc, ArticleDoc } from "@/lib/content/schema";
import type { Loaded } from "@/lib/content/loader";

/*
  ПОСТРОИТЕЛИ JSON-LD (§6.2). Каждая функция отдаёт объект(ы) schema.org, которые
  страница печатает в <script type="application/ld+json">. Валидны без ошибок,
  БЕЗ address/geo (§2.4). Person ↔ Organization связаны через @id.
*/

type Json = Record<string, unknown>;

/** Организация — печатается глобально (в layout). founder → Person по @id. */
export function organizationLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SITE.org.id,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: SITE.org.logo,
    description: SITE.description,
    areaServed: "RU",
    founder: { "@type": "Person", "@id": SITE.founder.id, name: SITE.founder.name },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: SITE.contacts.email,
      url: SITE.contacts.telegram,
      availableLanguage: ["ru"],
    },
  };
}

/** Person основателя — для /o-studii/. Связан с Organization через worksFor @id. */
export function founderPersonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": SITE.founder.id,
    name: SITE.founder.name,
    jobTitle: SITE.founder.role,
    worksFor: { "@id": SITE.org.id },
    url: canonical("/o-studii"),
  };
}

/** Хлебные крошки (§6.5) — совпадают с видимыми на странице. */
export function breadcrumbLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: canonical(it.path),
    })),
  };
}

/** FAQPage — из массива faq. Пустой массив → null (не печатаем пустую разметку). */
export function faqLd(faq: { q: string; a: string }[]): Json | null {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Service + Offer для страницы услуги (§6.2). Цена в RUB. Offer — если есть цена. */
export function serviceLd(doc: Loaded<ServiceDoc>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: doc.h1,
    description: doc.metaDescription,
    serviceType: doc.title,
    provider: { "@id": SITE.org.id },
    areaServed: "RU",
    url: canonical(`/uslugi/${doc.slug}`),
    ...(doc.priceFrom
      ? {
          offers: {
            "@type": "Offer",
            price: doc.priceFrom,
            priceCurrency: "RUB",
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: doc.priceFrom,
              priceCurrency: "RUB",
            },
          },
        }
      : {}),
  };
}

/** Service для нишевой страницы — цена/валюта берутся у привязанного тарифа. */
export function nicheServiceLd(doc: Loaded<NicheDoc>, priceFrom: number): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: doc.h1,
    description: doc.metaDescription,
    provider: { "@id": SITE.org.id },
    areaServed: "RU",
    url: canonical(`/dlya-biznesa/${doc.slug}`),
    offers: {
      "@type": "Offer",
      price: priceFrom,
      priceCurrency: "RUB",
    },
  };
}

/** CreativeWork для кейса (§6.2). */
export function caseLd(doc: Loaded<CaseDoc>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: doc.title,
    headline: doc.title,
    about: doc.siteType,
    dateCreated: doc.datePublished,
    dateModified: doc.dateModified,
    creator: { "@id": SITE.org.id },
    url: doc.url,
    image: doc.cover ? `${SITE.url}${doc.cover}` : undefined,
  };
}

/** Article + Person(author @id) + Organization(publisher) для статьи (§6.2). */
export function articleLd(doc: Loaded<ArticleDoc>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: doc.h1,
    description: doc.excerpt,
    datePublished: doc.datePublished,
    dateModified: doc.dateModified,
    author: { "@type": "Person", "@id": SITE.founder.id, name: doc.author },
    publisher: { "@id": SITE.org.id },
    mainEntityOfPage: canonical(`/blog/${doc.slug}`),
    image: doc.cover ? `${SITE.url}${doc.cover}` : undefined,
  };
}

/** Утилита: сериализация для <script>. Экранирует '<' (защита от инъекции разметки). */
export function ldJson(...blocks: (Json | null)[]): string {
  return JSON.stringify(blocks.filter(Boolean)).replace(/</g, "\\u003c");
}
