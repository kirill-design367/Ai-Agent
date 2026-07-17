import Reveal from "./Reveal";
import { formatPrice } from "@/lib/format";

/*
  ШАПКА КОНТЕНТНОЙ СТРАНИЦЫ — единственный H1 (§6.9). Kicker (надзаголовок),
  H1, прямой ответ первыми абзацами (§7.1), чипы цены/срока. Крупная типографика
  фирменного стиля. LCP-элемент — H1 как серверный текст (без ожидания JS).
*/
export default function PageHero({
  kicker,
  h1,
  lead,
  priceFrom,
  term,
}: {
  kicker?: string;
  h1: string;
  lead: string[];
  priceFrom?: number;
  term?: string;
}) {
  return (
    <section className="pg-hero">
      <div className="pg-wrap">
        {kicker && <p className="pg-hero-kicker">{kicker}</p>}
        <h1 className="pg-hero-h1">{h1}</h1>

        <div className="pg-hero-lead">
          {lead.map((p, i) => (
            <Reveal as="p" key={i} delay={i * 60}>
              {p}
            </Reveal>
          ))}
        </div>

        {(priceFrom || term) && (
          <div className="pg-hero-chips">
            {priceFrom != null && (
              <span className="pg-chip">
                <span className="pg-chip-l">Стоимость</span>
                <span className="pg-chip-v">от {formatPrice(priceFrom)}</span>
              </span>
            )}
            {term && (
              <span className="pg-chip">
                <span className="pg-chip-l">Срок</span>
                <span className="pg-chip-v">{term}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
