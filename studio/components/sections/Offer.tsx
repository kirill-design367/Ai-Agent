"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ЧТО ПОЛУЧАЕТЕ — отвечает на «Что конкретно я получу за деньги?».
  Bento-сетка (референс MagicBento): люкс-чёрный, белое пятно света следует за
  курсором, рамка подсвечивается на ховере, карточки появляются со stagger.
*/
const ITEMS = [
  {
    t: "Сайт на чистом коде",
    n: "Никаких конструкторов и шаблонов. Next.js + React: скорость 90+, мгновенная загрузка, любые анимации.",
    cls: "bento-a",
  },
  { t: "Уникальный дизайн", n: "Под вас и вашу аудиторию, а не из набора.", cls: "bento-b" },
  { t: "Адаптив 50/50", n: "Идеально на телефоне и десктопе.", cls: "bento-c" },
  { t: "Анимации и 3D", n: "Вау-эффекты, как на этом сайте.", cls: "bento-d" },
  { t: "SEO-фундамент", n: "Структура, мета и скорость под поиск.", cls: "bento-e" },
  { t: "Аналитика", n: "Видно, откуда приходят заявки.", cls: "bento-f" },
  { t: "Домен и хостинг", n: "Настрою под ключ — вам не разбираться.", cls: "bento-g" },
  { t: "Исходники — ваши", n: "Код и все доступы остаются у вас.", cls: "bento-h" },
];

export default function Offer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      const rnd = gsap.utils.random;
      const driftTweens: gsap.core.Tween[] = [];

      // заголовок всплывает невесомо
      gsap.fromTo(
        ".offer-head",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: ".offer", start: "top 75%" },
        }
      );

      // НЕВЕСОМОСТЬ: карточки прилетают из разбросанной 3D-глубины и оседают,
      // затем бесконечно дрейфуют как в открытом космосе.
      gsap.utils.toArray<HTMLElement>(".bento-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          {
            x: rnd(-140, 140),
            y: rnd(70, 200),
            z: rnd(-260, -60),
            rotateX: rnd(-32, 32),
            rotateY: rnd(-32, 32),
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            z: 0,
            rotateX: 0,
            rotateY: 0,
            opacity: 1,
            duration: 1.5,
            ease: "power2.out",
            delay: i * 0.05,
            scrollTrigger: { trigger: ".bento", start: "top 80%" },
            onComplete: () => {
              // вечный невесомый дрейф — ставится на паузу вне экрана (см. ниже)
              driftTweens.push(
                gsap.to(card, {
                  y: rnd(-14, 14),
                  x: rnd(-9, 9),
                  rotateZ: rnd(-1.6, 1.6),
                  duration: rnd(5, 8),
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
        trigger: ".bento",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) =>
          driftTweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });

      // пятно света следует за курсором по сетке
      const grid = root.current!.querySelector<HTMLElement>(".bento");
      if (grid) {
        const move = (e: PointerEvent) => {
          grid.querySelectorAll<HTMLElement>(".bento-card").forEach((c) => {
            const r = c.getBoundingClientRect();
            c.style.setProperty("--mx", `${e.clientX - r.left}px`);
            c.style.setProperty("--my", `${e.clientY - r.top}px`);
          });
        };
        grid.addEventListener("pointermove", move);
        return () => grid.removeEventListener("pointermove", move);
      }
    },
    { scope: root }
  );

  return (
    <section id="offer" className="theme-dark offer" ref={root}>
      {/* космический фон — невесомость */}
      <div className="offer-space" aria-hidden>
        <span className="offer-stars" />
        <span className="offer-orb offer-orb-1" />
        <span className="offer-orb offer-orb-2" />
      </div>

      <header className="offer-head">
        <span className="offer-kicker">(06) Что получаете</span>
        <h2 className="offer-title">Не просто «сайт». Рабочий инструмент.</h2>
      </header>

      <div className="bento">
        {ITEMS.map((it) => (
          <article className={`bento-card ${it.cls}`} key={it.t} data-magnetic>
            <h3>{it.t}</h3>
            <p>{it.n}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
