import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getService, getAllServices } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd, serviceLd, faqLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import PageHero from "@/components/pg/PageHero";
import PriceBlock from "@/components/pg/PriceBlock";
import Insight from "@/components/pg/Insight";
import Prose from "@/components/pg/Prose";
import Faq from "@/components/pg/Faq";
import RelatedLinks from "@/components/pg/RelatedLinks";
import FounderBlock from "@/components/pg/FounderBlock";
import TrustBlock from "@/components/pg/TrustBlock";
import Cta from "@/components/pg/Cta";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getService(slug);
  if (!doc) return {};
  return buildMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: `/uslugi/${doc.slug}`,
    ogImage: `/og/service-${doc.slug}.png`,
    modifiedTime: doc.dateModified,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getService(slug);
  if (!doc) notFound();

  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Услуги", path: "/uslugi/" },
    { name: doc.title, path: `/uslugi/${doc.slug}/` },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), serviceLd(doc), faqLd(doc.faq)]} />
      <Breadcrumbs items={crumbs} />

      <PageHero
        kicker="Услуга"
        h1={doc.h1}
        lead={doc.lead}
        priceFrom={doc.priceFrom}
        term={doc.termFrom}
      />

      {(doc.priceFrom != null || doc.includes.length > 0) && (
        <PriceBlock
          priceFrom={doc.priceFrom}
          term={doc.termFrom}
          heading={doc.priceFrom != null ? "Стоимость и что входит" : "Что входит"}
          includes={doc.includes}
          factors={doc.priceFactors}
        />
      )}

      {doc.insight && <Insight text={doc.insight} />}
      <TrustBlock />
      <Prose body={doc.body} heading="Подробнее" />
      <Faq items={doc.faq} heading="Вопросы по услуге" />
      <FounderBlock />
      <RelatedLinks items={doc.related} />
      <Cta />
    </>
  );
}
