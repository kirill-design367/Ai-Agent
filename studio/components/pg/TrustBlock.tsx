import Reveal from "./Reveal";

/*
  TRUST BLOCK (§8.2) — доверие на коммерческих страницах: гарантия, процесс
  по шагам, реквизиты. Без плашки «Автор страницы» (её на тарифы не ставим).
*/
const DEFAULT_POINTS = [
  {
    t: "Пожизненная гарантия",
    d: "Что-то сломалось или нужно поправить — чиню бесплатно, пока сайт живёт.",
  },
  {
    t: "Один мастер — от идеи до запуска",
    d: "Общаетесь с тем, кто реально делает сайт. Без испорченного телефона.",
  },
  {
    t: "Сайт ваш на 100%",
    d: "Код, домен и все доступы у вас. Никакой привязки и абонентской платы.",
  },
  {
    t: "Договор и реквизиты",
    d: "Работаю официально как ИП. Прозрачные условия и понятные этапы оплаты.",
  },
];

export default function TrustBlock({
  points = DEFAULT_POINTS,
  heading = "Почему это безопасно",
}: {
  points?: { t: string; d: string }[];
  heading?: string;
}) {
  return (
    <section className="pg-trust" aria-labelledby="trust-h">
      <div className="pg-wrap">
        <h2 className="pg-h2" id="trust-h">
          {heading}
        </h2>
        <div className="pg-trust-grid">
          {points.map((p, i) => (
            <Reveal className="pg-trust-card" key={i} delay={i * 40}>
              <h3 className="pg-h3">{p.t}</h3>
              <p>{p.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
