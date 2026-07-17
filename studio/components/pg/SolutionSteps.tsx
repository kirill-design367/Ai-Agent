import Reveal from "./Reveal";

/*
  СТРУКТУРА РЕШЕНИЯ — из чего собираем сайт. Нумерованные шаги/модули.
  Первый шаг у ниши — ключевой модуль (напр. калькулятор).
*/
export default function SolutionSteps({
  items,
  heading = "Как устроено решение",
}: {
  items: { title: string; text: string }[];
  heading?: string;
}) {
  return (
    <section className="pg-steps" aria-labelledby="steps-h">
      <div className="pg-wrap">
        <h2 className="pg-h2" id="steps-h">
          {heading}
        </h2>
        <ol className="pg-steps-list">
          {items.map((s, i) => (
            <Reveal as="li" className="pg-step" key={i} delay={i * 50}>
              <span className="pg-step-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              <div className="pg-step-body">
                <h3 className="pg-h3">{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
