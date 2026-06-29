"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

/*
  ОТЗЫВЫ — социальное доказательство. Реальных отзывов пока нет — это ЧЕРНОВЫЕ
  плейсхолдеры со слотами под замену (имя/сфера/текст), без фальшивых «5 звёзд».
  Карточки появляются и невесомо парят.
*/
const REVIEWS = [
  {
    text: "Сделал лендинг за три дня — заявки пошли в первую же неделю. Всё на связи лично, без менеджеров.",
    name: "[Имя клиента]",
    role: "[Сфера — напр. бьюти-студия]",
  },
  {
    text: "Дизайн вообще не похож на шаблон. Наконец-то не стыдно скинуть ссылку партнёрам.",
    name: "[Имя клиента]",
    role: "[Сфера — напр. b2b-услуги]",
  },
  {
    text: "Поправки вносит быстро и бесплатно. Сайт открывается мгновенно даже с телефона.",
    name: "[Имя клиента]",
    role: "[Сфера — напр. магазин]",
  },
  {
    text: "Объяснил всё по-человечески, без технических терминов. Получил ровно то, что хотел.",
    name: "[Имя клиента]",
    role: "[Сфера — напр. эксперт]",
  },
];

export default function Reviews() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>(".rev-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );
        gsap.to(card, {
          y: gsap.utils.random(-12, 12),
          duration: gsap.utils.random(3.5, 5.5),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.25,
        });
      });
    },
    { scope: root }
  );

  return (
    <section id="reviews" className="theme-dark reviews" ref={root}>
      <header className="reviews-head">
        <span className="reviews-kicker">(09) Отзывы</span>
        <h2 className="reviews-title">Что говорят клиенты</h2>
      </header>

      <div className="rev-grid">
        {REVIEWS.map((r, i) => (
          <figure className="rev-card" key={i}>
            <span className="rev-quote" aria-hidden>
              &ldquo;
            </span>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              <span className="rev-name">{r.name}</span>
              <span className="rev-role">{r.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
