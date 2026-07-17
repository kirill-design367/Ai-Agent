import Link from "next/link";
import Reveal from "./Reveal";

/*
  ПЕРЕЛИНКОВКА (§6.6) — из frontmatter related. Ниша ↔ услуга ↔ кейс,
  статья → коммерческая страница кластера.
*/
export default function RelatedLinks({
  items,
  heading = "Дальше",
}: {
  items: { href: string; label: string; note?: string }[];
  heading?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="pg-related" aria-labelledby="related-h">
      <div className="pg-wrap">
        <h2 className="pg-h2" id="related-h">
          {heading}
        </h2>
        <div className="pg-related-grid">
          {items.map((r, i) => (
            <Reveal key={r.href} delay={i * 40}>
              <Link href={r.href} className="pg-related-card" data-magnetic>
                <span className="pg-related-label">{r.label}</span>
                {r.note && <span className="pg-related-note">{r.note}</span>}
                <span className="pg-related-arrow" aria-hidden>→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
