"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, registerGsap } from "@/lib/gsap";

const SplashCursor = dynamic(() => import("@/components/kit/SplashCursor"), {
  ssr: false,
});

/*
  HERO — отвечает на вопрос клиента «Вы делаете то, что мне нужно?».
  Заголовок собирается из хаоса в систему; подзаголовок встаёт следом, прямо
  под заголовком, тем же мягким движением. Композиция «золотое сечение»:
  геометрия бренда + hairline-сетка, без лишних надписей сверху.
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
        x: () => gsap.utils.random(-14, 14),
        y: () => gsap.utils.random(-16, 16),
        rotation: () => gsap.utils.random(-9, 9),
        opacity: 0.4,
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
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.04,
            },
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
      <div className="hero-fluid">
        <SplashCursor />
      </div>

      {/* геометрия бренда — контурный треугольник-A с точкой */}
      <svg className="hero-geo" viewBox="0 0 400 360" aria-hidden data-hero-fade>
        <polygon points="200,24 376,336 24,336" />
        <circle cx="200" cy="246" r="6" />
        <line x1="200" y1="24" x2="200" y2="336" />
      </svg>

      {/* верхняя hairline-строка: только марка */}
      <header className="hero-top">
        <span className="hero-mark" data-hero-fade>
          AUREA<sup>®</sup>
        </span>
      </header>

      {/* заголовок + подзаголовок под ним */}
      <div className="hero-mid">
        <h1 className="hero-headline" ref={headline}>
          <span className="hl-line hl-a">Первое</span>
          <span className="hl-line hl-b">впечатление</span>
          <span className="hl-line hl-c">невозможно</span>
          <span className="hl-line hl-d">повторить</span>
        </h1>

        <p className="hero-sub" ref={sub}>
          Поэтому мы&nbsp;создаём сайты, которые помогают бизнесу выделяться,
          вызывать доверие и&nbsp;получать больше&nbsp;заявок.
        </p>
      </div>

      {/* нижняя зона: действие + фишки на hairline-сетке */}
      <div className="hero-foot">
        <div className="hero-cta-row" data-hero-fade>
          <a href="#contact" className="btn btn--primary" data-magnetic>
            Обсудить проект
          </a>
          <a href="#work" className="btn btn--ghost" data-magnetic>
            Смотреть работы
          </a>
        </div>

        <ul className="hero-feats" data-hero-fade>
          <li>
            <i>01</i> Полностью под&nbsp;ключ
          </li>
          <li>
            <i>02</i> Индивидуальный дизайн
          </li>
          <li>
            <i>03</i> Пожизненная гарантия
          </li>
        </ul>
      </div>
    </section>
  );
}
