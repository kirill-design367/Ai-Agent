/*
  ВЫВОД ИЗ ПРАКТИКИ (§7.6) — уникальное наблюдение, которого нет у конкурентов.
  Важно для цитируемости в AI-поиске. Подаётся как крупная выносная мысль.
*/
export default function Insight({ text }: { text: string }) {
  return (
    <section className="pg-insight">
      <div className="pg-wrap">
        <blockquote className="pg-insight-q">{text}</blockquote>
      </div>
    </section>
  );
}
