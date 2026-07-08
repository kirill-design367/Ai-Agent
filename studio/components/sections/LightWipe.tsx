"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПЕРЕХОД 3 — «Почему выбирают меня» (тёмный) → «Прозрачная стоимость» (светлый).
  Физическое ЗАПОЛНЕНИЕ СВЕТОМ: чистый белый флуд с мягкой светящейся кромкой
  СВЕРХУ ровно поднимается снизу вверх и заливает экран. Низ флуда всегда
  сплошь-белый (никакого серого «острова»/кольца — прежнее радиальное пятно его
  и давало), размытие смягчает только переднюю кромку. Только transform,
  полностью reversible.
*/
export default function LightWipe() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".lightwipe-glow", { yPercent: 0 });
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

          // белый флуд ровно поднимается снизу (сплошной низ, мягкая верхняя
          // кромка) и заливает экран — без серого следа
          tl.fromTo(
            ".lightwipe-glow",
            { yPercent: 100 },
            { yPercent: 0, ease: "none", duration: 1 },
            0
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
    </div>
  );
}
