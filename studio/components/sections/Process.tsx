"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПРОЦЕСС — отвечает на возражение «Это долго и мучительно для меня?».

  Светлый блок (выход из тьмы боли к системе) с занавес-перетеканием. Четыре
  шага — не карточки, а гигантские глаголы (Unbounded), которые «въезжают и
  выпрямляются» — текст становится дизайном (референс TrucknRoll). Слева —
  таймлайн-линия, рисующаяся по мере прохождения.
*/
const STEPS = [
  {
    verb: "Вы рассказываете",
    note: "О бизнесе, клиентах и цели. 20 минут голосом или текстом — без брифов на десять страниц.",
  },
  {
    verb: "Мы предлагаем",
    note: "Концепцию и структуру: что показать, где и почему. Ещё до первой строчки кода.",
  },
  {
    verb: "Вы утверждаете",
    note: "Смотрите готовый дизайн и правите до «идеально». Только потом — вёрстка.",
  },
  {
    verb: "Мы запускаем",
    note: "Чистый код, скорость, домен, аналитика. Сайт живёт — вы получаете заявки.",
  },
];

export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      // таймлайн-линия рисуется на протяжении всей секции
      const fill = root.current!.querySelector(".proc-fill");
      if (fill) {
        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".proc-steps",
              start: "top 70%",
              end: "bottom 70%",
              scrub: 0.6,
            },
          }
        );
      }

      // глаголы «въезжают и выпрямляются» — текст становится дизайном
      gsap.utils.toArray<HTMLElement>(".proc-step").forEach((step) => {
        const verb = step.querySelector(".proc-verb");
        const note = step.querySelector(".proc-note");
        const dot = step.querySelector(".proc-dot");

        gsap.fromTo(
          verb,
          { xPercent: -8, skewX: 7, opacity: 0.18 },
          {
            xPercent: 0,
            skewX: 0,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
              start: "top 82%",
              end: "top 42%",
              scrub: 0.7,
            },
          }
        );
        if (note)
          gsap.fromTo(
            note,
            { y: 26, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "expo.out",
              scrollTrigger: { trigger: step, start: "top 70%" },
            }
          );
        if (dot)
          gsap.to(dot, {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: step,
              start: "top 60%",
              end: "top 40%",
              scrub: true,
              onToggle: (self) => dot.classList.toggle("is-on", self.isActive || self.progress >= 1),
            },
          });
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="process" className="process" ref={root}>
      <header className="proc-head">
        <span className="proc-kicker">(03) Как мы работаем</span>
        <h2 className="proc-title">
          Четыре шага.
          <br />
          Ноль головной боли.
        </h2>
      </header>

      <div className="proc-steps">
        <span className="proc-line" aria-hidden>
          <span className="proc-fill" />
        </span>

        {STEPS.map((s, i) => (
          <div className="proc-step" data-i={i} key={s.verb}>
            <span className="proc-dot" aria-hidden />
            <span className="proc-idx">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="proc-verb">{s.verb}</h3>
            <p className="proc-note">{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
