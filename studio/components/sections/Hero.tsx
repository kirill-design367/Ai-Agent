"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, registerGsap } from "@/lib/gsap";
import { asset } from "@/lib/asset";

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

      gsap.set(split.chars, {
        x: () => gsap.utils.random(-48, 48),
        y: () => gsap.utils.random(-54, 54),
        rotation: () => gsap.utils.random(-28, 28),
        opacity: 0,
      });
      gsap.set(subSplit.words, { y: 22, opacity: 0 });
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
            { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.04 },
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
      <div className="hero-fluid">
        <SplashCursor />
      </div>

      {/* огромная полупрозрачная «А» с точкой — знак бренда на фоне */}
      <svg className="hero-bigA" viewBox="0 0 200 200" aria-hidden data-hero-fade>
        <path d="M100 16 L178 184 L150 184 L100 70 L50 184 L22 184 Z" />
        <circle cx="100" cy="150" r="15" />
      </svg>

      {/* верхняя строка: логотип AUREA */}
      <header className="hero-top">
        <img
          className="hero-logo"
          src={asset("/brand/logo-wordmark.jpg")}
          alt="AUREA"
          width={150}
          height={36}
          data-hero-fade
        />
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
          Мы&nbsp;проектируем каждый пиксель так, чтобы он&nbsp;усиливал доверие
          к&nbsp;вашему бизнесу, помогал получать больше обращений и&nbsp;делал
          компанию сильнее в&nbsp;глазах клиентов.
        </p>
      </div>

      {/* нижняя зона: действие + микрокопия одной строкой */}
      <div className="hero-foot">
        <div className="hero-cta-row" data-hero-fade>
          <a href="#contact" className="btn btn--cut" data-magnetic>
            <span>Обсудить проект</span>
          </a>
          <a href="#work" className="btn btn--cut btn--cut-ghost" data-magnetic>
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
