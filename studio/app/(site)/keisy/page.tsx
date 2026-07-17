import type { Metadata } from "next";
import { getAllCases } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import PageHero from "@/components/pg/PageHero";
import HubGrid, { type HubCard } from "@/components/pg/HubGrid";
import Cta from "@/components/pg/Cta";

export const metadata: Metadata = buildMetadata({
  title: "Кейсы — примеры сайтов студии AUREA | AUREA",
  description:
    "Работы студии AUREA: собственный бренд «Наследие» и концепт-проекты. " +
    "Честные бейджи типа проекта, технические показатели без выдуманных цифр.",
  path: "/keisy",
});

const BADGE: Record<string, string> = {
  "own-product": "Свой бренд",
  client: "Клиентский",
  concept: "Концепт",
};

export default function KeisyHub() {
  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Кейсы", path: "/keisy/" },
  ];
  const cards: HubCard[] = getAllCases().map((c) => ({
    href: `/keisy/${c.slug}/`,
    kicker: BADGE[c.caseType],
    title: c.title,
    desc: c.metaDescription,
    meta: [c.siteType, c.term],
    cover: c.cover,
  }));

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs)]} />
      <Breadcrumbs items={crumbs} />
      <PageHero
        kicker="Работы"
        h1="Кейсы"
        lead={[
          "Каждый проект помечен честным бейджем: собственный бренд студии, клиентская работа или концепт. Никаких выдуманных клиентов и неподтверждённых цифр.",
          "Для концептов показываем технические показатели и дизайн-решения — то, что можно проверить.",
        ]}
      />
      <section className="pg-hub">
        <div className="pg-wrap">
          <HubGrid cards={cards} />
        </div>
      </section>
      <Cta />
    </>
  );
}
