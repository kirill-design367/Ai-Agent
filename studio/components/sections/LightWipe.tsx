"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПЕРЕХОД 3 — «Почему выбирают меня» (тёмный) → «Прозрачная стоимость» (светлый).
  Физическое ЗАПОЛНЕНИЕ СВЕТОМ: размытое белое пятно стартует снизу за краем
  экрана, по скрабу растёт в масштабе и поднимается вверх, вытесняя чёрный фон
  снизу вверх. Когда свет полностью залил экран — подставляется сплошной белый
  фон-заглушка (без размытой границы). Только transform/opacity/filter.
*/
export default function LightWipe() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".lightwipe-solid", { opacity: 1 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 761px)", isMobile: "(max-width: 760px)" },
        (self) => {
          const isMobile = self.conditions?.isMobile;
          const dist = isMobile ? 800 : 1150;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current!,
              start: "top top",
              end: () => "+=" + dist,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // размытое пятно света поднимается снизу и разрастается, съедая чёрное
          tl.fromTo(
            ".lightwipe-glow",
            { yPercent: 60, scale: 0.45, autoAlpha: 0.85 },
            { yPercent: -55, scale: 3.4, autoAlpha: 1, ease: "power1.inOut", duration: 1 },
            0
          );
          // когда свет почти залил экран — сплошной белый без размытой кромки
          tl.fromTo(
            ".lightwipe-solid",
            { autoAlpha: 0 },
            { autoAlpha: 1, ease: "none", duration: 0.26 },
            0.72
          );
        }
      );

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <div className="lightwipe" ref={root} aria-hidden>
      <div className="lightwipe-glow" />
      <div className="lightwipe-solid" />
    </div>
  );
}
