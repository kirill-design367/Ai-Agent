import type { Metadata } from "next";
import { getAllServices } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { formatPrice } from "@/lib/format";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import PageHero from "@/components/pg/PageHero";
import HubGrid, { type HubCard } from "@/components/pg/HubGrid";
import FounderBlock from "@/components/pg/FounderBlock";
import Cta from "@/components/pg/Cta";

export const metadata: Metadata = buildMetadata({
  title: "Услуги — разработка сайтов под ключ | AUREA",
  description:
    "Лендинги, корпоративные сайты, интернет-магазины и поддержка. Чистый код, " +
    "индивидуальный дизайн, пожизненная гарантия. Цены и сроки — по каждой услуге.",
  path: "/uslugi",
});

export default function UslugiHub() {
  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Услуги", path: "/uslugi/" },
  ];
  const cards: HubCard[] = getAllServices().map((s) => ({
    href: `/uslugi/${s.slug}/`,
    kicker: "Услуга",
    title: s.title,
    desc: s.metaDescription,
    meta: [
      s.priceFrom ? `от ${formatPrice(s.priceFrom)}` : "по договорённости",
      ...(s.termFrom ? [s.termFrom] : []),
    ],
  }));

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs)]} />
      <Breadcrumbs items={crumbs} />
      <PageHero
        kicker="Что я делаю"
        h1="Услуги"
        lead={[
          "Четыре формата сайтов — от одностраничного лендинга под рекламу до интернет-магазина. Всё на чистом коде, с индивидуальным дизайном и пожизненной гарантией.",
          "Каждая цена «от» сопровождается составом и списком того, что влияет на итог. Никаких голых цифр.",
        ]}
      />
      <div className="sec--light">
        <section className="pg-hub">
          <div className="pg-wrap">
            <HubGrid cards={cards} />
          </div>
        </section>
      </div>
      <FounderBlock />
      <Cta />
    </>
  );
}
