import Reveal from "./Reveal";

/*
  БОЛИ НИШИ — прямые цитаты клиента в подзаголовки (Ф3, §4.3). Каждая: цитата →
  расшифровка проблемы → как студия решает. Цитата — крупная, «человеческим» голосом.
*/
export default function PainPoints({
  items,
  heading = "Что мешает продавать — и что с этим делает сайт",
}: {
  items: { quote: string; gloss: string; solution: string }[];
  heading?: string;
}) {
  return (
    <section className="pg-pains" aria-labelledby="pains-h">
      <div className="pg-wrap">
        <h2 className="pg-h2" id="pains-h">
          {heading}
        </h2>
        <div className="pg-pains-list">
          {items.map((p, i) => (
            <Reveal className="pg-pain" key={i} delay={i * 50}>
              <p className="pg-pain-quote">{p.quote}</p>
              <p className="pg-pain-gloss">{p.gloss}</p>
              <p className="pg-pain-sol">
                <span className="pg-pain-sol-l">Решение</span>
                {p.solution}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
