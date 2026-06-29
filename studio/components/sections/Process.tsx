"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПРОЦЕСС — отвечает на возражение «Это долго и мучительно для меня?».

  Вверху — «Как мы работаем» в окружении хаотичных вопросов (страхи клиента),
  которые невесомо плавают и гаснут, когда появляется система. Ниже — 4 шага
  гигантскими глаголами (текст становится дизайном, референс TrucknRoll).
  Слева — единая линия с «кометой»: точка едет вниз, линия за ней остаётся.
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

// страхи-вопросы (хаотичный пиксельный рой над заголовком)
const QUESTIONS = [
  { t: "Сложно?", x: 8, y: 12, s: 1.5, o: 0.5 },
  { t: "Долго?", x: 74, y: 8, s: 2.1, o: 0.6 },
  { t: "Дорого?", x: 40, y: 70, s: 1.2, o: 0.4 },
  { t: "А если не понравится?", x: 60, y: 44, s: 0.85, o: 0.35 },
  { t: "С чего начать?", x: 14, y: 56, s: 1, o: 0.4 },
  { t: "Сколько правок?", x: 82, y: 64, s: 0.8, o: 0.3 },
  { t: "А поддержка?", x: 30, y: 26, s: 1.1, o: 0.45 },
  { t: "Кто владелец?", x: 88, y: 30, s: 0.75, o: 0.28 },
  { t: "?", x: 50, y: 18, s: 3.4, o: 0.16 },
  { t: "?", x: 22, y: 78, s: 2.6, o: 0.14 },
];

export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      // заголовок появляется, вопросы невесомо плавают и проявляются
      const title = root.current!.querySelector(".proc-bigtitle");
      if (title)
        gsap.fromTo(
          title,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: ".proc-intro", start: "top 70%" },
          }
        );

      gsap.utils.toArray<HTMLElement>(".proc-q").forEach((q) => {
        gsap.fromTo(
          q,
          { opacity: 0, scale: 0.6 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: ".proc-intro", start: "top 75%" },
          }
        );
        // невесомость
        gsap.to(q, {
          y: gsap.utils.random(-18, 18),
          x: gsap.utils.random(-12, 12),
          duration: gsap.utils.random(3, 5),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: gsap.utils.random(0, 1.5),
        });
      });

      // линия + комета: точка едет вниз вместе с заливкой линии
      const fill = root.current!.querySelector(".proc-fill");
      const comet = root.current!.querySelector(".proc-comet");
      const lineST = {
        trigger: ".proc-steps",
        start: "top 65%",
        end: "bottom 75%",
        scrub: 0.6,
      };
      if (fill) gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: lineST });
      if (comet)
        gsap.fromTo(comet, { top: "0%" }, { top: "100%", ease: "none", scrollTrigger: lineST });

      // глаголы «въезжают и выпрямляются»
      gsap.utils.toArray<HTMLElement>(".proc-step").forEach((step) => {
        const verb = step.querySelector(".proc-verb");
        const note = step.querySelector(".proc-note");
        gsap.fromTo(
          verb,
          { xPercent: -8, skewX: 7, opacity: 0.18 },
          {
            xPercent: 0,
            skewX: 0,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 82%", end: "top 42%", scrub: 0.7 },
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
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="process" className="process" ref={root}>
      <div className="proc-intro">
        <div className="proc-questions" aria-hidden>
          {QUESTIONS.map((q, i) => (
            <span
              className="proc-q"
              key={i}
              style={{
                left: `${q.x}%`,
                top: `${q.y}%`,
                fontSize: `${q.s}rem`,
                opacity: q.o,
              }}
            >
              {q.t}
            </span>
          ))}
        </div>
        <span className="proc-kicker">(03)</span>
        <h2 className="proc-bigtitle">Как&nbsp;мы работаем</h2>
      </div>

      <div className="proc-steps">
        <span className="proc-line" aria-hidden>
          <span className="proc-fill" />
          <span className="proc-comet" />
        </span>

        {STEPS.map((s, i) => (
          <div className="proc-step" data-i={i} key={s.verb}>
            <span className="proc-idx">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="proc-verb">{s.verb}</h3>
            <p className="proc-note">{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
