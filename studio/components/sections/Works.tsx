"use client";

import { asset } from "@/lib/asset";

/*
  РАБОТЫ — отвечает на «У вас действительно высокий уровень?».

  Бесконечная лента-баннер (как у главного референса сразу после Hero): две
  встречные строки кейсов всё время в движении — переход из Hero выходит
  плавным и живым, без статичного стыка. Реальные клиентские кейсы.
*/
const CASES = [
  { img: "/work/case-1.jpg", title: "Volume — After Dark", meta: "Лендинг · 3 дня" },
  { img: "/work/case-2.jpg", title: "Aristide", meta: "Портфолио · 4 дня" },
  { img: "/work/case-3.jpg", title: "Анна Рыковская", meta: "Визитка · 2 дня" },
  { img: "/work/case-4.png", title: "Garden Eight", meta: "Студия · 5 дней" },
  { img: "/work/case-5.png", title: "Dream.doll", meta: "Магазин · 6 дней" },
  { img: "/work/case-6.png", title: "Step into Web3", meta: "Лендинг · 3 дня" },
];

function Card({ c }: { c: (typeof CASES)[number] }) {
  return (
    <article className="mq-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(c.img)} alt={c.title} loading="lazy" />
      <div className="mq-cap">
        <h3>{c.title}</h3>
        <span className="meta">{c.meta}</span>
      </div>
    </article>
  );
}

export default function Works() {
  // дублируем для бесшовной петли
  const rowA = [...CASES, ...CASES];
  const rowB = [...CASES.slice().reverse(), ...CASES.slice().reverse()];

  return (
    <section id="work" className="theme-dark worksm">
      <div className="worksm-head">
        <span className="worksm-kicker">Избранные работы</span>
        <span className="worksm-kicker worksm-kicker--r">Доказательство — делом</span>
      </div>

      <div className="mq" aria-label="Лента работ">
        <div className="mq-row mq-row--left">
          {rowA.map((c, i) => (
            <Card c={c} key={`a-${i}`} />
          ))}
        </div>
        <div className="mq-row mq-row--right">
          {rowB.map((c, i) => (
            <Card c={c} key={`b-${i}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
