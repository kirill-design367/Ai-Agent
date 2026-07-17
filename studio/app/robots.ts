import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/site";

/*
  robots.txt (§6.3) — публичное открыто, служебное закрыто. Ссылка на sitemap.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
