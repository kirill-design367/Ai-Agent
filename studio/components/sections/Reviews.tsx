"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ОТЗЫВЫ — социальное доказательство. Реальных отзывов пока нет — это ЧЕРНОВЫЕ
  плейсхолдеры со слотами под замену (имя/сфера/текст), без фальшивых «5 звёзд».
  Карточки разного размера разбросаны по золотому сечению, чуть повёрнуты и
  невесомо парят; на входе слетаются из разных сторон. Не «на весь экран».
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

// базовый наклон каждой карточки (хаос по золотому сечению)
const ROT = [-1.8, 1.3, 1.9, -1.2];
const FROM_X = [-160, 160, -130, 150];

export default function Reviews() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // заголовок проявляется
      gsap.fromTo(
        ".reviews-head",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".reviews", start: "top 78%" },
        }
      );

      gsap.utils.toArray<HTMLElement>(".rev-card").forEach((card, i) => {
        const rot = ROT[i % ROT.length];
        // слетаются из разных сторон и встают под своим углом
        gsap.fromTo(
          card,
          { x: FROM_X[i % FROM_X.length], y: 70, opacity: 0, rotation: rot * 4 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            rotation: rot,
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: ".rev-grid", start: "top 82%" },
            delay: i * 0.08,
            onComplete: () => {
              // невесомый дрейф вокруг своего угла (rotation сохраняется)
              gsap.to(card, {
                y: gsap.utils.random(-13, 13),
                x: gsap.utils.random(-7, 7),
                duration: gsap.utils.random(4, 6),
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
              });
            },
          }
        );
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
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
          <figure className="rev-card" data-i={i} key={i}>
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
