import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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
  Типосистема: Druk (дисплей/мощь) + Antiqva (капитель-акцент) + Rooftop (текст/UI).
  Self-host @font-face в globals.css, woff2 в /public/fonts. Два цвета — ч/б.
  Отдельно: RF Dewi (self-host через next/font/local, subset кириллица, swap) —
  ТОЛЬКО для абзаца манифеста в блоке 02 (переменная --font-manifest). */
const manifestFont = localFont({
  src: "./fonts/rfdewi-regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-manifest",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Разработка сайтов под ключ для бизнеса — студия AUREA",
  description: SITE.description,
  // Подтверждение прав в Яндекс.Вебмастере (Next сам вставит <meta> в <head>).
  verification: { yandex: "e4128ef6693a033e" },
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
    <html lang="ru" className={manifestFont.variable}>
      <head>
        {/* Preload шрифтов: Antiqva (заголовки/LCP-манифест) + Rooftop (тело) */}
        <link rel="preload" href="/fonts/antiqva-regular.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/rooftop-regular.woff2" as="font" type="font/woff2" crossOrigin="" />
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
