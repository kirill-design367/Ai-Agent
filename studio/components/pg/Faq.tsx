import Reveal from "./Reveal";

/*
  FAQ — нативные <details>/<summary>: доступно, работает БЕЗ JS, весь текст
  в первичном HTML (важно для Яндекса и AI-цитирования, §7.3). Разметка FAQPage
  печатается отдельно на странице.
*/
export default function Faq({
  items,
  heading = "Частые вопросы",
}: {
  items: { q: string; a: string }[];
  heading?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="pg-faq" aria-labelledby="faq-h">
      <div className="pg-wrap">
        <h2 className="pg-h2" id="faq-h">
          {heading}
        </h2>
        <div className="pg-faq-list">
          {items.map((f, i) => (
            <Reveal key={i} delay={i * 40}>
              <details className="pg-faq-item">
                <summary>
                  <span>{f.q}</span>
                  <span className="pg-faq-mark" aria-hidden />
                </summary>
                <div className="pg-faq-a">
                  <p>{f.a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
