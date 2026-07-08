"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, registerGsap } from "@/lib/gsap";

/*
  ПЕРЕХОД 5 — «Что обычно спрашивают» → «Что говорят клиенты».
  Экран пинится, последняя фраза РАССЫПАЕТСЯ по буквам (случайные x/y/rotation,
  opacity→0), и В ТОМ ЖЕ непрерывном таймлайне буквы «Что говорят клиенты»
  СЛЕТАЮТСЯ из разлётного состояния в позицию — читается как ОДИН морф.
*/
export default function TextMorph() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const fromEl = root.current!.querySelector<HTMLElement>(".tm-from");
      const toEl = root.current!.querySelector<HTMLElement>(".tm-to");
      if (!fromEl || !toEl) return;

      const fromSplit = new SplitText(fromEl, { type: "chars" });
      const toSplit = new SplitText(toEl, { type: "chars" });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(fromSplit.chars, { autoAlpha: 0 });
        gsap.set(toSplit.chars, { autoAlpha: 1 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 761px)", isMobile: "(max-width: 760px)" },
        (self) => {
          const isMobile = self.conditions?.isMobile;
          const dist = isMobile ? 850 : 1250;
          const spread = isMobile ? 260 : 520;

          // «прилетающие» буквы стартуют разлетевшимися
          toSplit.chars.forEach((c) => {
            gsap.set(c, {
              x: gsap.utils.random(-spread, spread),
              y: gsap.utils.random(-spread, spread),
              rotation: gsap.utils.random(-90, 90),
              autoAlpha: 0,
            });
          });
          gsap.set(fromSplit.chars, { autoAlpha: 1 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".textmorph",
              start: "top top",
              end: () => "+=" + dist,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // текущая фраза РАССЫПАЕТСЯ
          tl.to(
            fromSplit.chars,
            {
              x: () => gsap.utils.random(-spread, spread),
              y: () => gsap.utils.random(-spread, spread),
              rotation: () => gsap.utils.random(-90, 90),
              autoAlpha: 0,
              ease: "power1.in",
              stagger: { from: "random", each: 0.006 },
              duration: 0.5,
            },
            0
          );
          // «Что говорят клиенты» СЛЕТАЕТСЯ (тот же паттерн в обратную сторону)
          tl.to(
            toSplit.chars,
            {
              x: 0,
              y: 0,
              rotation: 0,
              autoAlpha: 1,
              ease: "power2.out",
              stagger: { from: "random", each: 0.006 },
              duration: 0.55,
            },
            0.38
          );
        }
      );

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <div className="textmorph" ref={root}>
      <h2 className="tm-from">Что нужно от&nbsp;меня?</h2>
      <h2 className="tm-to">Что говорят клиенты</h2>
    </div>
  );
}
