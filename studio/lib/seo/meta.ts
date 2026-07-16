import type { Metadata } from "next";
import { SITE, canonical } from "./site";

/*
  Единый построитель Metadata (§6.1, §6.4, §6.7). Self-referencing canonical,
  OG + Twitter, og:image из генерируемого на билде шаблона (/og/{key}.png).
*/
export function buildMetadata(opts: {
  title: string; // metaTitle — с брендом (обязательно)
  description: string;
  path: string; // внутренний путь без домена
  ogImage?: string; // абсолютный или /путь; по умолчанию — дефолтный шаблон
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}): Metadata {
  const url = canonical(opts.path);
  const img = opts.ogImage
    ? opts.ogImage.startsWith("http")
      ? opts.ogImage
      : `${SITE.url}${opts.ogImage}`
    : `${SITE.url}/og/default.png`;

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: opts.type ?? "website",
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: img, width: 1200, height: 630 }],
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [img],
    },
  };
}
