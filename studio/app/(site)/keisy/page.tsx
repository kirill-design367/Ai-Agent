import type { Metadata } from "next";
import Link from "next/link";
import { getAllCases } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/meta";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/pg/Breadcrumbs";
import Cta from "@/components/pg/Cta";

export const metadata: Metadata = buildMetadata({
  title: "Кейсы — примеры сайтов студии AUREA | AUREA",
  description:
    "Работы студии AUREA: собственный бренд «Наследие» и концепт-проекты. " +
    "Честные бейджи типа проекта, технические показатели без выдуманных цифр.",
  path: "/keisy",
});

// тип проекта → буква-пометка (реф Artworld: (Л)(М)(В))
function tagFor(siteType: string): string {
  const s = siteType.toLowerCase();
  if (s.includes("магазин")) return "М";
  if (s.includes("лендинг")) return "Л";
  if (s.includes("витрин") || s.includes("визит")) return "В";
  if (s.includes("портфол")) return "П";
  if (s.includes("корпоратив") || s.includes("многостран")) return "К";
  return siteType.charAt(0).toUpperCase();
}

export default function KeisyHub() {
  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Кейсы", path: "/keisy/" },
  ];
  const cases = getAllCases();

  return (
    <>
      <JsonLd data={[breadcrumbLd(crumbs)]} />
      <Breadcrumbs items={crumbs} />

      {/* ХАБ КЕЙСОВ (реф Artworld): облако имён + гигант «РАБОТЫ» */}
      <section className="ah">
        <div className="pg-wrap">
          <p className="ah-cloud">
            {cases.map((c) => (
              <Link key={c.slug} href={`/keisy/${c.slug}/`} className="ah-name">
                {c.title}
                <span className="ah-tag">({tagFor(c.siteType)})</span>
              </Link>
            ))}
          </p>
          <p className="ah-legend">(Л) Лендинг · (М) Магазин · (К) Корпоративный · (В) Витрина · (П) Портфолио</p>
        </div>
        <h1 className="ah-giant" aria-label="Работы">РАБОТЫ</h1>
      </section>

      <Cta />
    </>
  );
}
