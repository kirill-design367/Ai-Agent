import type { Metadata } from "next";
import { getAllArticles } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { formatDate } from "@/lib/format";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import PageHero from "@/components/pg/PageHero";
import HubGrid, { type HubCard } from "@/components/pg/HubGrid";
import Cta from "@/components/pg/Cta";

export const metadata: Metadata = buildMetadata({
  title: "Блог о сайтах для бизнеса — AUREA",
  description:
    "Разбираем, как сайт помогает бизнесу продавать: цены, доверие, структура. " +
    "Из практики студии AUREA, без воды.",
  path: "/blog",
});

export default function BlogHub() {
  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog/" },
  ];
  const cards: HubCard[] = getAllArticles().map((a) => ({
    href: `/blog/${a.slug}/`,
    kicker: "Статья",
    title: a.title,
    desc: a.excerpt,
    meta: [formatDate(a.dateModified), ...(a.readingTime ? [a.readingTime] : [])],
    cover: a.cover,
  }));

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs)]} />
      <Breadcrumbs items={crumbs} />
      <PageHero
        kicker="Записки студии"
        h1="Блог"
        lead={[
          "Пишу о том, что сайт реально меняет в бизнесе: как формируется цена, как продавать доверие, что должно быть на странице, чтобы оставляли заявки.",
          "Из практики, от первого лица. Без канцелярита и статей ради объёма.",
        ]}
      />
      <section className="pg-hub">
        <div className="pg-wrap">
          {cards.length > 0 ? (
            <HubGrid cards={cards} />
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>Первые статьи скоро появятся.</p>
          )}
        </div>
      </section>
      <Cta />
    </>
  );
}
