import type { Metadata, Viewport } from "next";
import CookieConsent from "@/components/kit/CookieConsent";
import Atmosphere from "@/components/kit/Atmosphere";
import SiteMotion from "@/components/kit/SiteMotion";
import Interactions from "@/components/kit/Interactions";
import Canvas from "@/components/kit/Canvas";
import SmoothScroll from "@/components/kit/SmoothScroll";
import PageTransition from "@/components/kit/PageTransition";
import JsonLd from "@/components/seo/JsonLd";
import { organizationLd } from "@/lib/seo/jsonld";
import { SITE } from "@/lib/seo/site";
import "./globals.css";

/*
  Типосистема (§5): Onest (дисплей+текст) + Martian Mono (микро-лейблы).
  Self-host: @font-face + unicode-range subset'ы в globals.css, файлы в
  /public/fonts. Не next/font/google — тот тянет шрифт с gstatic на билде
  (хрупко за прокси/в CI); next/font/local не умеет unicode-range для одного
  переменного семейства из нескольких subset-файлов. Onest — переменный
  (wght 100–900) одним файлом на subset. Preload — только кириллический subset
  Onest (LCP-заголовок русский) + латиница (слово AUREA, цифры цен).
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
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Preload LCP-дисплея (Unbounded — заголовок героя) + Onest для тела */}
        <link rel="preload" href="/fonts/unbounded-cyrillic.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/onest-cyrillic.woff2" as="font" type="font/woff2" crossOrigin="" />
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
          {/* Слой движения — надстройка поверх одной структуры (§арх) */}
          <SiteMotion />
          <Interactions />
          <Canvas />
          <PageTransition />
          <CookieConsent />
        </SmoothScroll>
      </body>
    </html>
  );
}
