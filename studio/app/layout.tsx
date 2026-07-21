import type { Metadata, Viewport } from "next";
import CookieConsent from "@/components/kit/CookieConsent";
import Atmosphere from "@/components/kit/Atmosphere";
import SiteMotion from "@/components/kit/SiteMotion";
import Interactions from "@/components/kit/Interactions";
import SmoothScroll from "@/components/kit/SmoothScroll";
import PageTransition from "@/components/kit/PageTransition";
import JsonLd from "@/components/seo/JsonLd";
import { organizationLd } from "@/lib/seo/jsonld";
import { SITE } from "@/lib/seo/site";
import "./globals.css";

/*
  Типосистема: Druk Cyr (дисплей) + Dexa Round (текст/UI). Self-host @font-face
  в globals.css, woff2 в /public/fonts. Два цвета — чёрный и белый.
  Preload — дисплей Druk Super (LCP-заголовок героя) + Dexa Regular (тело).
*/

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Разработка сайтов под ключ для бизнеса — студия AUREA",
  description: SITE.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // запрет горизонтального «уезжания» и единый тёмный chrome браузера на мобиле
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Preload LCP-дисплея (Druk Super — заголовок героя) + Dexa для тела */}
        <link rel="preload" href="/fonts/druk-super.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/dexa-regular.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        {/* Класс .js навешивается синхронно → CSS может прятать [data-reveal]
            только при включённом JS. Без JS весь контент виден сразу (§5.4). */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        {/* Organization — глобально на всех страницах (§6.2) */}
        <JsonLd data={[organizationLd()]} />
        {/* Инерционный скролл-полотно (Lenis, синхрон с ScrollTrigger) — физика Locomotive */}
        <SmoothScroll>
          <Atmosphere />
          {children}
          {/* Слой движения — тихая надстройка */}
          <SiteMotion />
          <Interactions />
          <PageTransition />
          <CookieConsent />
        </SmoothScroll>
      </body>
    </html>
  );
}
