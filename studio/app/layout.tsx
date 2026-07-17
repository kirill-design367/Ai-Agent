import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope, Unbounded } from "next/font/google";
import CookieConsent from "@/components/kit/CookieConsent";
import JsonLd from "@/components/seo/JsonLd";
import { organizationLd } from "@/lib/seo/jsonld";
import "./globals.css";

/*
  Type pair (Bible I.9.1 / IV.2.2). Cyrillic is the FIRST filter (IV.2.1):
  both faces ship real, drawn cyrillic — no latin-premium-with-fallback.
  - Display: Playfair Display (expressive antiqua, has cyrillic) — the "voice".
  - Body/UI: Manrope (clean grotesk, excellent cyrillic) — clarity.
  Swap these for licensed type.today / CSTM faces when budget allows.
*/
// Веса подрезаны под реальное использование — меньше блокирующих ресурсов.
const display = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  // 600 не использовался — убран (меньше блокирующих шрифт-файлов)
  weight: ["400", "500"],
  variable: "--font-display",
  display: "swap",
  // Playfair — декоративный (цитаты/insight), не LCP-элемент. Не преload'им,
  // чтобы не конкурировать за канал с Unbounded (заголовки = LCP).
  preload: false,
});

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
  // Manrope — тело/подзаголовки, не LCP-элемент. Не преload'им, чтобы освободить
  // канал под Unbounded (крупный заголовок = LCP). adjustFontFallback держит CLS 0.
  preload: false,
});

/*
  Headline face — Unbounded (Gogol's geometric display, ships full cyrillic).
  Circular, characterful, distinctly "designed". Used для крупных заголовков.
*/
const headline = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  variable: "--font-headline",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Сайт за 1–5 дней — красивый, быстрый, продающий",
  description:
    "Уникальный дизайн на чистом коде. Без шаблонов, без посредников, с пожизненной гарантией. От 30 000 ₽.",
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
    <html
      lang="ru"
      className={`${display.variable} ${body.variable} ${headline.variable}`}
    >
      <body>
        {/* Класс .js навешивается синхронно → CSS может прятать [data-reveal]
            только при включённом JS. Без JS весь контент виден сразу (§5.4). */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        {/* Organization — глобально на всех страницах (§6.2) */}
        <JsonLd data={[organizationLd()]} />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
