import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNiche, getAllNiches, getService, getCase } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd, nicheServiceLd, faqLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import PageHero from "@/components/pg/PageHero";
import PainPoints from "@/components/pg/PainPoints";
import SolutionSteps from "@/components/pg/SolutionSteps";
import PriceBlock from "@/components/pg/PriceBlock";
import Insight from "@/components/pg/Insight";
import Prose from "@/components/pg/Prose";
import Faq from "@/components/pg/Faq";
import RelatedLinks from "@/components/pg/RelatedLinks";
import FounderBlock from "@/components/pg/FounderBlock";
import Cta from "@/components/pg/Cta";
import UpdatedAt from "@/components/pg/UpdatedAt";

export const dynamicParams = false;

// Только опубликованные ниши попадают в сборку (draft — вне sitemap и навигации).
export function generateStaticParams() {
  return getAllNiches().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getNiche(slug);
  if (!doc) return {};
  return buildMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: `/dlya-biznesa/${doc.slug}`,
    ogImage: `/og/niche-${doc.slug}.png`,
    modifiedTime: doc.dateModified,
  });
}

export default async function NichePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getNiche(slug);
  if (!doc) notFound();

  // Тариф-основа: срок и (при отсутствии переопределения) цена/состав/факторы.
  const service = getService(doc.service);
  const priceFrom = doc.priceFrom ?? service?.priceFrom ?? 0;
  const term = service?.termFrom;
  const includes = service?.includes;
  const factors = doc.priceFactors ?? service?.priceFactors ?? [];

  const relatedCase = doc.caseSlug ? getCase(doc.caseSlug) : null;

  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Для бизнеса", path: "/dlya-biznesa/" },
    { name: doc.title, path: `/dlya-biznesa/${doc.slug}/` },
  ];

  return (
    <>
      <JsonLd
        data={[breadcrumbLd(crumbs), nicheServiceLd(doc, priceFrom), faqLd(doc.faq)]}
      />
      <Breadcrumbs items={crumbs} />

      <PageHero
        kicker="Сайт под нишу"
        h1={doc.h1}
        lead={doc.lead}
        priceFrom={priceFrom}
        term={term}
      />
      <div className="pg-wrap" style={{ marginTop: "-16px" }}>
        <UpdatedAt iso={doc.dateModified} />
      </div>

      <PainPoints items={doc.painPoints} />
      <SolutionSteps items={doc.solutionSteps} />
      <Insight text={doc.insight} />

      <PriceBlock
        priceFrom={priceFrom}
        term={term}
        note={doc.priceNote}
        includes={includes}
        factors={factors}
      />

      <Prose body={doc.body} heading="Подробнее" />

      {relatedCase && (
        <RelatedLinks
          heading="Похожий подход в деле"
          items={[
            {
              href: `/keisy/${relatedCase.slug}/`,
              label: relatedCase.title,
              note: `${relatedCase.siteType} · ${relatedCase.term}`,
            },
          ]}
        />
      )}

      <Faq items={doc.faq} heading="Вопросы по нише" />
      <FounderBlock />
      <RelatedLinks items={doc.related} />
      <Cta />
    </>
  );
}
