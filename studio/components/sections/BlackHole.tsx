"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  BLACK HOLE — переход FAQ → Отзывы. Появляется чёрная точка и притягивает к себе
  всю типографику (вопросы, слова, линии слегка изгибаются и засасываются).
  Затем — чёрный экран. Из этой же точки рождается следующий блок.
*/
const WORDS = [
  { t: "Вопросы", x: -34, y: -26, s: 1.6, r: -12 },
  { t: "Гарантия", x: 32, y: -30, s: 1.3, r: 10 },
  { t: "Сроки", x: -40, y: 14, s: 1.5, r: 8 },
  { t: "Цена", x: 38, y: 20, s: 1.7, r: -8 },
  { t: "Поддержка", x: -22, y: 34, s: 1.1, r: 14 },
  { t: "Код", x: 24, y: 38, s: 1.4, r: -16 },
  { t: "Дизайн", x: -44, y: -4, s: 1.2, r: 6 },
  { t: "Домен", x: 46, y: -6, s: 1.0, r: -6 },
  { t: "?", x: -14, y: -38, s: 2.2, r: 0 },
  { t: "?", x: 14, y: 40, s: 2.0, r: 0 },
  { t: "Правки", x: 6, y: -20, s: 1.0, r: 12 },
  { t: "Запуск", x: -6, y: 26, s: 1.1, r: -10 },
];

export default function BlackHole() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".blackhole",
          start: "top top",
          end: "+=170%",
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
        },
      });

      // типографику затягивает к центру — спираль, сжатие, исчезновение
      gsap.utils.toArray<HTMLElement>(".bh-word").forEach((w) => {
        tl.fromTo(
          w,
          { xPercent: 0, yPercent: 0, scale: 1, opacity: 0.7, rotation: 0 },
          {
            xPercent: () => -parseFloat(w.dataset.x || "0") * 1.6,
            yPercent: () => -parseFloat(w.dataset.y || "0") * 1.6,
            scale: 0,
            opacity: 0,
            rotation: () => parseFloat(w.dataset.r || "0") * 6,
            ease: "power2.in",
          },
          0
        );
      });

      // горизонт событий вращается и сжимается; ядро растёт и затапливает экран
      tl.to(".bh-ring", { rotation: 220, scale: 0.2, opacity: 0, ease: "power2.in" }, 0)
        .fromTo(".bh-core", { scale: 0.04 }, { scale: 1, ease: "power2.in" }, 0.1)
        // чёрный экран → из точки рождается следующий блок (вспышка-точка)
        .to(".bh-core", { scale: 26, ease: "power2.in", duration: 0.4 }, 0.6)
        .fromTo(".bh-birth", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, ease: "power2.out", duration: 0.3 }, 0.82)
        .to(".bh-birth", { scale: 18, opacity: 0, ease: "power1.in", duration: 0.2 }, 0.92);

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <div className="blackhole" ref={root} aria-hidden>
      <div className="bh-stage">
        <div className="bh-ring" />
        {WORDS.map((w, i) => (
          <span
            className="bh-word"
            key={i}
            data-x={w.x}
            data-y={w.y}
            data-r={w.r}
            style={{
              left: `calc(50% + ${w.x}vw)`,
              top: `calc(50% + ${w.y}vh)`,
              fontSize: `${w.s}rem`,
            }}
          >
            {w.t}
          </span>
        ))}
        <div className="bh-core" />
        <div className="bh-birth" />
      </div>
    </div>
  );
}
