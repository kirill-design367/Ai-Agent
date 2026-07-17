import type { Metadata } from "next";
import { getAllNiches } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import PageHero from "@/components/pg/PageHero";
import HubGrid, { type HubCard } from "@/components/pg/HubGrid";
import FounderBlock from "@/components/pg/FounderBlock";
import Cta from "@/components/pg/Cta";

export const metadata: Metadata = buildMetadata({
  title: "Сайты под нишу для бизнеса — примеры и цены | AUREA",
  description:
    "Сайты под конкретную сферу: мебель на заказ, пригон авто из Кореи, салоны " +
    "красоты и другие. Решаем боли ниши, а не делаем универсальный шаблон.",
  path: "/dlya-biznesa",
});

export default function NicheHub() {
  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Для бизнеса", path: "/dlya-biznesa/" },
  ];
  const cards: HubCard[] = getAllNiches().map((n) => ({
    href: `/dlya-biznesa/${n.slug}/`,
    kicker: "Ниша",
    title: n.title,
    desc: n.metaDescription,
  }));

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs)]} />
      <Breadcrumbs items={crumbs} />
      <PageHero
        kicker="Сайты под сферу"
        h1="Сайты для бизнеса"
        lead={[
          "У каждой сферы — свои возражения клиента и свой путь к заявке. Поэтому сайт под нишу решает конкретные боли, а не подставляет ваше название в универсальный шаблон.",
          "Ниже — направления, для которых уже собраны структуры решений. Не нашли своё? Расскажите про бизнес — разберёмся вместе.",
        ]}
      />
      <section className="pg-hub">
        <div className="pg-wrap">
          <HubGrid cards={cards} />
        </div>
      </section>
      <FounderBlock />
      <Cta />
    </>
  );
}
