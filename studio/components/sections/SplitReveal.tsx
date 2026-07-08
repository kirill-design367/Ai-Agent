"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ПЕРЕХОД 4 — Прайсинг → «Что обычно спрашивают».
  Экран РАСПАХИВАЕТСЯ: full-bleed оверлей поделён рваной (не прямой) вертикальной
  линией на две панели. По скрабу левая уезжает в -100%, правая в +100% с лёгким
  разворотом (-2°/+2°) — «разрыв». Из-под панелей открывается тёмная сцена
  вопросов. Только transform, reversible, matchMedia под mobile/desktop.
*/
export default function SplitReveal() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([".sr-panel--l", ".sr-panel--r"], { autoAlpha: 0 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 761px)", isMobile: "(max-width: 760px)" },
        (self) => {
          const dist = self.conditions?.isMobile ? 750 : 1050;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".splitreveal",
              start: "top top",
              end: () => "+=" + dist,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          tl.to(".sr-panel--l", { xPercent: -100, rotate: -2, ease: "power2.in", duration: 1 }, 0)
            .to(".sr-panel--r", { xPercent: 100, rotate: 2, ease: "power2.in", duration: 1 }, 0)
            // подпись «распахивается» из глубины по мере разъезда
            .fromTo(
              ".sr-hint",
              { autoAlpha: 0, scale: 0.9 },
              { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.5 },
              0.4
            );
        }
      );

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <div className="splitreveal" ref={root} aria-hidden>
      <span className="sr-hint">Что обычно спрашивают</span>
      <div className="sr-panel sr-panel--l" />
      <div className="sr-panel sr-panel--r" />
    </div>
  );
}
