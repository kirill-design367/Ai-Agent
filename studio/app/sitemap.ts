import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/content/loader";
import { canonical } from "@/lib/seo/site";

/*
  sitemap.xml (§6.3) — автогенерация. lastmod из dateModified. Draft и будущие
  city-страницы (Фаза 3) сюда НЕ попадают (getSitemapEntries отдаёт только
  опубликованное). Статические разделы добавлены явно.
*/
export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().slice(0, 10);

  // Хабы и «одиночные» страницы.
  const staticPaths: { path: string; lastmod: string; priority: number }[] = [
    { path: "/", lastmod: today, priority: 1 },
    { path: "/uslugi/", lastmod: today, priority: 0.9 },
    { path: "/dlya-biznesa/", lastmod: today, priority: 0.9 },
    { path: "/keisy/", lastmod: today, priority: 0.8 },
    { path: "/blog/", lastmod: today, priority: 0.7 },
    { path: "/o-studii/", lastmod: today, priority: 0.7 },
    { path: "/kontakty/", lastmod: today, priority: 0.8 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((s) => ({
    url: canonical(s.path),
    lastModified: s.lastmod,
    priority: s.priority,
  }));

  const contentEntries: MetadataRoute.Sitemap = getSitemapEntries().map((e) => ({
    url: canonical(e.path),
    lastModified: e.lastmod,
    priority: 0.8,
  }));

  return [...staticEntries, ...contentEntries];
}
