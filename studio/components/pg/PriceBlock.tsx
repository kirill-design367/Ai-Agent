import Reveal from "./Reveal";
import { formatPrice } from "@/lib/format";

/*
  ЦЕНА С РАСШИФРОВКОЙ (§2.7, §7.2). Никаких голых цен: «от N ₽» всегда рядом
  со списком «что входит» и таблицей «что влияет на цену». priceNote разводит
  варианты (база vs с модулем), чтобы цена не противоречила составу решения.
*/
export default function PriceBlock({
  priceFrom,
  term,
  note,
  includes,
  factors,
  heading = "Стоимость и что входит",
}: {
  priceFrom?: number;
  term?: string;
  note?: string;
  includes?: string[];
  factors: { label: string; detail?: string }[];
  heading?: string;
}) {
  return (
    <section className="pg-price" aria-labelledby="price-h">
      <div className="pg-wrap">
        <h2 className="pg-h2" id="price-h">
          {heading}
        </h2>

        {priceFrom ? (
          <div className="pg-price-head">
            <span className="pg-price-num">от {formatPrice(priceFrom)}</span>
            {term && <span className="pg-price-term">запуск {term}</span>}
          </div>
        ) : null}
        {note && <p className="pg-price-note">{note}</p>}

        <div className="pg-price-grid">
          {includes && includes.length > 0 && (
            <Reveal className="pg-price-card">
              <h3 className="pg-h3">Входит в базовую стоимость</h3>
              <ul className="pg-check">
                {includes.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </Reveal>
          )}

          <Reveal className="pg-price-card" delay={80}>
            <h3 className="pg-h3">Что влияет на итоговую цену</h3>
            <dl className="pg-factors">
              {factors.map((f, i) => (
                <div key={i}>
                  <dt>{f.label}</dt>
                  {f.detail && <dd>{f.detail}</dd>}
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
