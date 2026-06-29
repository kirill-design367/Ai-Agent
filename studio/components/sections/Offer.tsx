"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

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

      gsap.fromTo(
        ".bento-card",
        { y: 44, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: { each: 0.07, from: "start" },
          scrollTrigger: { trigger: ".bento", start: "top 78%" },
        }
      );

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
