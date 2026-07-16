/** @type {import('next').NextConfig} */

/*
  ЦЕЛЕВАЯ ПЛОЩАДКА — российский VPS, Next.js в Node-режиме (output: standalone)
  за nginx. Полноценный next/image, редиректы, ISR — доступны.

  GH Pages остаётся АВАРИЙНЫМ fallback: сборка в статический экспорт включается
  одним флагом окружения NEXT_OUTPUT=export (тогда images.unoptimized, без
  редиректов). Под fallback ничего не подстраиваем — это просто escape-hatch.
*/
const isExport = process.env.NEXT_OUTPUT === "export";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: isExport ? "export" : "standalone",

  // Единая политика trailing slash (§6.4) — одинакова на VPS и в fallback.
  trailingSlash: true,

  // three.js / R3F ship ESM; transpile so Next bundles them cleanly.
  transpilePackages: ["three"],

  images: isExport
    ? { unoptimized: true } // статический экспорт не умеет оптимизацию на лету
    : {
        // VPS: полноценная оптимизация (§10). Отдаём современные форматы.
        formats: ["image/avif", "image/webp"],
        // все изображения — локальные из /public, внешних доменов нет
      },

  // basePath нужен только для GH Pages (проект в подпапке /Ai-Agent).
  ...(isExport && basePath
    ? { basePath, assetPrefix: basePath }
    : {}),

  // Редиректы (§6.4) — работают в Node-режиме; в export Next их игнорирует.
  async redirects() {
    if (isExport) return [];
    return [
      // Старый хаб детейлинга исключён из проекта — гасим возможные входящие ссылки.
      { source: "/dlya-biznesa/detailing", destination: "/dlya-biznesa/", permanent: true },
    ];
  },
};

export default nextConfig;
