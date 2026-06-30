import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope, Unbounded } from "next/font/google";
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
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
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
      <body>{children}</body>
    </html>
  );
}
