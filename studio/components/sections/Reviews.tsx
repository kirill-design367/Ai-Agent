"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, registerGsap } from "@/lib/gsap";

/*
  ОТЗЫВЫ — социальное доказательство. Реальных отзывов пока нет — это ЧЕРНОВЫЕ
  плейсхолдеры со слотами под замену (имя/сфера/текст), без фальшивых «5 звёзд».
  Карточки разного размера разбросаны по золотому сечению, чуть повёрнуты и
  невесомо парят; на входе слетаются из разных сторон. Не «на весь экран».
*/
const REVIEWS = [
  {
    text: "Сделал лендинг за три дня — заявки пошли в первую же неделю. Всё на связи лично, без менеджеров.",
    name: "Анна Ковалёва",
    role: "Бьюти-студия, Москва",
  },
  {
    text: "Дизайн вообще не похож на шаблон. Наконец-то не стыдно скинуть ссылку партнёрам.",
    name: "Дмитрий Орлов",
    role: "B2B-услуги",
  },
  {
    text: "Поправки вносит быстро и бесплатно. Сайт открывается мгновенно даже с телефона.",
    name: "Мария Соколова",
    role: "Интернет-магазин",
  },
  {
    text: "Объяснил всё по-человечески, без технических терминов. Получил ровно то, что хотел.",
    name: "Игорь Лебедев",
    role: "Частный эксперт",
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

      const driftTweens: gsap.core.Tween[] = [];

      // ПЕРЕХОД 5 (часть 2): БЛОК «Отзывы» РОЖДАЕТСЯ ИЗ БУКВ. Реальный заголовок
      // «Что говорят клиенты» собирается из разлетевшихся букв (продолжение
      // рассыпавшегося последнего вопроса FAQ), следом слетаются карточки —
      // весь блок «появляется из букв», без дублей-подписей поверх.
      const titleEl = root.current!.querySelector<HTMLElement>(".reviews-title");
      if (titleEl) {
        const split = new SplitText(titleEl, { type: "chars" });
        const isMobile = window.matchMedia("(max-width: 760px)").matches;
        const spread = isMobile ? 200 : 380;
        // СКРАБ (а не разовый play): буквы СЛЕТАЮТСЯ по мере входа в секцию —
        // это и есть видимый переход между двумя тёмными блоками (иначе граница
        // невидима и «перехода нет»). Reversible вверх/вниз.
        gsap.fromTo(
          split.chars,
          {
            x: () => gsap.utils.random(-spread, spread),
            y: () => gsap.utils.random(-spread, spread),
            rotation: () => gsap.utils.random(-80, 80),
            autoAlpha: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            autoAlpha: 1,
            ease: "power2.out",
            stagger: { from: "random", each: 0.02 },
            scrollTrigger: {
              trigger: ".reviews",
              start: "top 88%",
              end: "top 42%",
              scrub: 0.8,
            },
          }
        );
      }

      gsap.utils.toArray<HTMLElement>(".rev-card").forEach((card, i) => {
        const rot = ROT[i % ROT.length];
        // слетаются из разных сторон и встают под своим углом
        gsap.fromTo(
          card,
          {
            x: FROM_X[i % FROM_X.length],
            y: 70,
            opacity: 0,
            scale: 0.62,
            filter: "blur(6px)",
            rotation: rot * 4,
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            rotation: rot,
            duration: 1.25,
            ease: "expo.out",
            scrollTrigger: { trigger: ".rev-grid", start: "top 84%" },
            delay: i * 0.1,
            onComplete: () => {
              // невесомый дрейф вокруг своего угла (rotation сохраняется)
              driftTweens.push(
                gsap.to(card, {
                  y: gsap.utils.random(-13, 13),
                  x: gsap.utils.random(-7, 7),
                  duration: gsap.utils.random(4, 6),
                  ease: "sine.inOut",
                  repeat: -1,
                  yoyo: true,
                })
              );
            },
          }
        );
      });

      // дрейф карточек не тратит кадры, пока секция вне экрана
      ScrollTrigger.create({
        trigger: ".rev-grid",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) =>
          driftTweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="reviews" className="theme-dark reviews" ref={root}>
      <header className="reviews-head">
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
