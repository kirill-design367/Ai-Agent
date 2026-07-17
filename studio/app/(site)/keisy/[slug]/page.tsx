import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCase, getAllCases } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd, caseLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import Reveal from "@/components/pg/Reveal";
import Prose from "@/components/pg/Prose";
import RelatedLinks from "@/components/pg/RelatedLinks";
import Cta from "@/components/pg/Cta";
import UpdatedAt from "@/components/pg/UpdatedAt";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCases().map((c) => ({ slug: c.slug }));
}

const CASE_BADGE: Record<string, string> = {
  "own-product": "Собственный бренд студии",
  client: "Клиентский проект",
  concept: "Концепт-проект",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getCase(slug);
  if (!doc) return {};
  return buildMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: `/keisy/${doc.slug}`,
    type: "article",
    modifiedTime: doc.dateModified,
  });
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getCase(slug);
  if (!doc) notFound();

  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Кейсы", path: "/keisy/" },
    { name: doc.title, path: `/keisy/${doc.slug}/` },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), caseLd(doc)]} />
      <Breadcrumbs items={crumbs} />

      <section className="pg-hero">
        <div className="pg-wrap">
          <span className="pg-case-badge">{CASE_BADGE[doc.caseType]}</span>
          <h1 className="pg-hero-h1" style={{ marginTop: 20 }}>
            {doc.title}
          </h1>
          <div className="pg-hero-chips">
            <span className="pg-chip">
              <span className="pg-chip-l">Тип</span>
              <span className="pg-chip-v">{doc.siteType}</span>
            </span>
            <span className="pg-chip">
              <span className="pg-chip-l">Срок</span>
              <span className="pg-chip-v">{doc.term}</span>
            </span>
            {doc.url && (
              <a className="pg-chip" href={doc.url} target="_blank" rel="noopener">
                <span className="pg-chip-l">Сайт</span>
                <span className="pg-chip-v">{doc.url.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>
          <div style={{ marginTop: 20 }}>
            <UpdatedAt iso={doc.dateModified} />
          </div>
        </div>
      </section>

      <section className="pg-case-sec">
        <div className="pg-wrap pg-case-cols">
          <Reveal className="pg-case-col">
            <h3 className="pg-h3">Задача</h3>
            <ul>{doc.task.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </Reveal>
          <Reveal className="pg-case-col" delay={60}>
            <h3 className="pg-h3">Решение</h3>
            <ul>{doc.solution.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </Reveal>
          <Reveal className="pg-case-col" delay={120}>
            <h3 className="pg-h3">Результат</h3>
            <ul>{doc.result.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </Reveal>
        </div>
      </section>

      {/* Технические метрики (concept — только они). */}
      {doc.techMetrics.length > 0 && (
        <section className="pg-case-sec" style={{ paddingTop: 0 }}>
          <div className="pg-wrap">
            <h2 className="pg-h2">Технические показатели</h2>
            <div className="pg-case-metrics">
              {doc.techMetrics.map((m, i) => (
                <div className="pg-case-metric" key={i}>
                  <div className="pg-case-metric-v">{m.value}</div>
                  <div className="pg-case-metric-l">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Бизнес-цифры — ТОЛЬКО за флагом metricsConfirmed (Ф2). */}
      {doc.metricsConfirmed && doc.businessMetrics.length > 0 && (
        <section className="pg-case-sec" style={{ paddingTop: 0 }}>
          <div className="pg-wrap">
            <h2 className="pg-h2">Результаты в цифрах</h2>
            <div className="pg-case-metrics">
              {doc.businessMetrics.map((m, i) => (
                <div className="pg-case-metric" key={i}>
                  <div className="pg-case-metric-v">{m.value}</div>
                  <div className="pg-case-metric-l">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Prose body={doc.body} />
      <RelatedLinks items={doc.related} heading="Хотите похожий сайт?" />
      <Cta />
    </>
  );
}
