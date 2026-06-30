"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  TELEPORT — переход Отзывы → Контакт. Последняя мысль клиента растворяется в
  тысячи маленьких точек, точки собираются в большую кнопку «Рассказать о
  проекте». Мысль буквально превращается в действие.
*/
// детерминированный разброс (phyllotaxis) — одинаков на сервере и клиенте,
// чтобы не было рассинхрона гидрации
const DOTS = Array.from({ length: 72 }, (_, i) => {
  const a = i * 2.39996; // золотой угол
  const r = 6 + (i % 14) * 3.2;
  return {
    x: Math.round(Math.cos(a) * r * 10) / 10,
    y: Math.round(Math.sin(a) * r * 0.82 * 10) / 10,
    d: (i % 10) / 28,
  };
});

export default function Teleport() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".teleport",
          start: "top top",
          end: "+=160%",
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
        },
      });

      // строка растворяется
      tl.fromTo(".tp-line", { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(10px)", ease: "power2.in" }, 0);

      // точки слетаются из разброса к центру (собираются в кнопку)
      gsap.utils.toArray<HTMLElement>(".tp-dot").forEach((dot) => {
        const dx = parseFloat(dot.dataset.x || "0");
        const dy = parseFloat(dot.dataset.y || "0");
        const delay = parseFloat(dot.dataset.d || "0");
        tl.fromTo(
          dot,
          { xPercent: 0, yPercent: 0, opacity: 0 },
          { xPercent: -dx * 14, yPercent: -dy * 14, opacity: 1, ease: "power1.inOut" },
          delay * 0.3
        ).to(dot, { opacity: 0, scale: 0.4, ease: "power2.in" }, 0.62);
      });

      // кнопка материализуется из собравшихся точек
      tl.fromTo(
        ".tp-cta",
        { scale: 0.4, opacity: 0, filter: "blur(8px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", ease: "back.out(1.6)" },
        0.6
      );

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <div className="teleport" ref={root}>
      <div className="tp-stage">
        <p className="tp-line" aria-hidden>
          «Хочу так&nbsp;же.»
        </p>

        <div className="tp-dots" aria-hidden>
          {DOTS.map((p, i) => (
            <span
              className="tp-dot"
              key={i}
              data-x={p.x}
              data-y={p.y}
              data-d={p.d}
              style={{ left: `calc(50% + ${p.x}vw)`, top: `calc(50% + ${p.y}vh)` }}
            />
          ))}
        </div>

        <a href="#contact" className="btn btn--cut tp-cta" data-magnetic>
          <span>Рассказать о&nbsp;проекте&nbsp;&nbsp;→</span>
        </a>
      </div>
    </div>
  );
}
