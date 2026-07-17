import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllArticles } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd, articleLd, faqLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import Prose from "@/components/pg/Prose";
import Faq from "@/components/pg/Faq";
import RelatedLinks from "@/components/pg/RelatedLinks";
import UpdatedAt from "@/components/pg/UpdatedAt";
import Cta from "@/components/pg/Cta";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getArticle(slug);
  if (!doc) return {};
  return buildMetadata({
    title: doc.metaTitle,
    description: doc.metaDescription,
    path: `/blog/${doc.slug}`,
    ogImage: `/og/article-${doc.slug}.png`,
    type: "article",
    publishedTime: doc.datePublished,
    modifiedTime: doc.dateModified,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getArticle(slug);
  if (!doc) notFound();

  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog/" },
    { name: doc.title, path: `/blog/${doc.slug}/` },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs), articleLd(doc), faqLd(doc.faq)]} />
      <Breadcrumbs items={crumbs} />

      <article className="pg-article">
        <section className="pg-hero">
          <div className="pg-wrap">
            <p className="pg-hero-kicker">Статья</p>
            <h1 className="pg-hero-h1">{doc.h1}</h1>
            <div style={{ marginTop: 24 }}>
              <UpdatedAt iso={doc.dateModified} author={`${doc.author}, основатель AUREA`} />
            </div>
          </div>
        </section>

        <Prose body={doc.body} />
      </article>

      <Faq items={doc.faq} heading="Коротко: частые вопросы" />
      <RelatedLinks items={doc.related} heading="Пригодится" />
      <Cta />
    </>
  );
}
