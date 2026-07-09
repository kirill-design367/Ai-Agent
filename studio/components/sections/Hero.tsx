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
  // WebGL флюид-курсор — ТОЛЬКО десктоп (мышь). На мобиле НЕ грузим three/R3F
  // вовсе: это снимает тяжёлые задачи основного потока (TBT) и ускоряет загрузку
  // там, где перф важнее всего. Эффект — тонкий фон-курсор, на тач и так не нужен.
  const [fluid, setFluid] = useState(false);
  useEffect(() => {
    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      window.innerWidth > 900;
    if (!fine) return;
    // отложить тяжёлую WebGL-инициализацию на простой → не раздувает TBT при загрузке
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    const t = ric ? ric(() => setFluid(true)) : window.setTimeout(() => setFluid(true), 1200);
    return () => clearTimeout(t as number);
  }, []);
  const fluidProps = {};

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
      };

      if (document.documentElement.classList.contains("intro-done")) play();
      else window.addEventListener("aurea:revealed", play, { once: true });
    },
    { scope: root }
  );

  return (
    <section id="hero" className="theme-dark hero" ref={root}>
      <div className="hero-fluid">{fluid && <SplashCursor {...fluidProps} />}</div>

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
          <span className="hs-line hs-l1">Поэтому мы&nbsp;создаём сайты, которые</span>{" "}
          <span className="hs-line hs-l2">вызывают доверие с&nbsp;первых секунд</span>{" "}
          <span className="hs-line hs-l3">и&nbsp;помогают превращать</span>{" "}
          <span className="hs-line hs-l4">посетителей в&nbsp;клиентов.</span>
        </p>
      </div>

      {/* нижняя зона: фишки (по золотому сечению) + основной CTA-pill */}
      <div className="hero-foot">
        <ul className="hero-feats" data-hero-fade>
          <li>Индивидуальный дизайн</li>
          <li>Пожизненная гарантия</li>
          <li>Запуск от&nbsp;5&nbsp;дней</li>
        </ul>
        <a href="#prices" className="hero-cta" data-hero-fade data-magnetic>
          <span>Узнать стоимость</span>
        </a>
      </div>
    </section>
  );
}

