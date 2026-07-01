"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, registerGsap } from "@/lib/gsap";

const SplashCursor = dynamic(() => import("@/components/kit/SplashCursor"), {
  ssr: false,
});

/*
  HERO — отвечает на «Вы делаете то, что мне нужно?».
  Живой фон: флюид-курсор + ОГРОМНАЯ полупрозрачная «А» с точкой (знак бренда)
  вместо тонких линий. Сверху — логотип AUREA. Заголовок собирается из хаоса,
  смещён влево; подзаголовок встаёт следом. Кнопки «вырезаются из фона» на ховере.
*/
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);
  // WebGL флюид — только на десктопе с мышью: на мобиле непрерывный GPU-цикл
  // бьёт по производительности и батарее.
  const [fluid, setFluid] = useState(false);
  useEffect(() => {
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      window.innerWidth > 900;
    if (!ok) return;
    // отложить тяжёлую WebGL-инициализацию на простой → не раздувает TBT при загрузке
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    const t = ric ? ric(() => setFluid(true)) : window.setTimeout(() => setFluid(true), 1200);
    return () => clearTimeout(t as number);
  }, []);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");
      const split = new SplitText(headline.current!, { type: "words,chars" });
      const subSplit = new SplitText(sub.current!, { type: "words" });

      if (reduce) {
        gsap.set([split.chars, subSplit.words, fades], { clearProps: "all" });
        return;
      }

      // умеренный «стильный хаос» — как было раньше (не слишком разлетается)
      gsap.set(split.chars, {
        x: () => gsap.utils.random(-22, 22),
        y: () => gsap.utils.random(-24, 24),
        rotation: () => gsap.utils.random(-12, 12),
        opacity: 0,
      });
      // подзаголовок — похожая лёгкая сборка из хаоса по словам
      gsap.set(subSplit.words, {
        x: () => gsap.utils.random(-16, 16),
        y: () => gsap.utils.random(-14, 18),
        opacity: 0,
      });
      gsap.set(fades, { opacity: 0, y: 24 });

      const play = () => {
        const tl = gsap.timeline();
        tl.to(split.chars, {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          duration: 1.4,
          ease: "expo.out",
          stagger: { each: 0.016, from: "random" },
        })
          .to(
            subSplit.words,
            { x: 0, y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.035 },
            "-=0.85"
          )
          .to(
            fades,
            { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 },
            "-=0.7"
          );
        // мягкое «дыхание» фоновой А
        gsap.to(".hero-bigA", {
          scale: 1.04,
          duration: 6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: "50% 50%",
        });
      };

      if (document.documentElement.classList.contains("intro-done")) play();
      else window.addEventListener("aurea:revealed", play, { once: true });
    },
    { scope: root }
  );

  return (
    <section id="hero" className="theme-dark hero" ref={root}>
      <div className="hero-fluid">{fluid && <SplashCursor />}</div>

      {/* огромная полупрозрачная «А» с точкой — знак бренда на фоне */}
      <svg className="hero-bigA" viewBox="0 0 200 200" aria-hidden data-hero-fade>
        <path d="M100 16 L178 184 L150 184 L100 70 L50 184 L22 184 Z" />
        <circle cx="100" cy="150" r="15" />
      </svg>

      {/* логотип AUREA — стилизованные «A» (треугольник + точка), как в знаке бренда */}
      <header className="hero-top">
        <span className="hero-logo" data-hero-fade aria-label="AUREA">
          <svg className="logo-a" viewBox="0 0 22 26" aria-hidden>
            <path d="M11 2 L20 24 L16.3 24 L11 10 L5.7 24 L2 24 Z" fill="currentColor" />
            <circle cx="11" cy="19.2" r="2" fill="currentColor" />
          </svg>
          <span className="logo-letters">URE</span>
          <svg className="logo-a" viewBox="0 0 22 26" aria-hidden>
            <path d="M11 2 L20 24 L16.3 24 L11 10 L5.7 24 L2 24 Z" fill="currentColor" />
            <circle cx="11" cy="19.2" r="2" fill="currentColor" />
          </svg>
        </span>
      </header>

      {/* заголовок + подзаголовок */}
      <div className="hero-mid">
        <h1 className="hero-headline" ref={headline}>
          <span className="hl-line hl-a">Первое</span>
          <span className="hl-line hl-b">впечатление</span>
          <span className="hl-line hl-c">невозможно</span>
          <span className="hl-line hl-d">повторить</span>
        </h1>

        <p className="hero-sub" ref={sub}>
          Мы&nbsp;проектируем каждый пиксель так, чтобы он&nbsp;усиливал{" "}
          <span className="hs-key">доверие</span> к&nbsp;вашему бизнесу, помогал
          получать <span className="hs-key">больше&nbsp;обращений</span>{" "}
          и&nbsp;делал компанию <span className="hs-key">сильнее</span>{" "}
          в&nbsp;глазах клиентов.
        </p>
      </div>

      {/* нижняя зона: действие + микрокопия одной строкой */}
      <div className="hero-foot">
        <div className="hero-cta-row" data-hero-fade>
          <a href="#contact" className="btn btn--dissolve" data-magnetic>
            <span>Обсудить проект</span>
          </a>
          <a href="#work" className="btn btn--dissolve btn--dissolve-2" data-magnetic>
            <span>Смотреть работы</span>
          </a>
        </div>

        <p className="hero-microcopy" data-hero-fade>
          Индивидуальный дизайн <i>•</i> Пожизненная гарантия <i>•</i> Запуск
          от&nbsp;5&nbsp;дней
        </p>
      </div>
    </section>
  );
}
