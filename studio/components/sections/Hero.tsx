"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, registerGsap } from "@/lib/gsap";

const SplashCursor = dynamic(() => import("@/components/kit/SplashCursor"), {
  ssr: false,
});

/*
  HERO — отвечает на вопрос клиента: «Вы делаете то, что мне нужно?»

  Композиция «хаос по золотому сечению»: заголовок не стоит ровным столбцом —
  строки разбиты и сдвинуты по разным зонам экрана (0.382 / 0.618), вокруг —
  геометрия бренда (контурный треугольник-A с точкой, hairline-сетка, kicker-
  метки). Буквы заголовка чуть разбросаны (хаос); когда уходит интро, они мягко
  встают на места — «из хаоса рождается система».
*/
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");
      // words+chars so words never break mid-line (chars animate, words stay whole)
      const split = new SplitText(headline.current!, { type: "words,chars" });

      if (reduce) {
        gsap.set([split.chars, fades], { clearProps: "all" });
        return;
      }

      // chaos: each letter nudged a few px, slightly rotated, dimmed
      gsap.set(split.chars, {
        x: () => gsap.utils.random(-14, 14),
        y: () => gsap.utils.random(-16, 16),
        rotation: () => gsap.utils.random(-9, 9),
        opacity: 0.4,
      });
      gsap.set(fades, { opacity: 0, y: 24 });

      const play = () => {
        const tl = gsap.timeline();
        // order: letters settle into place
        tl.to(split.chars, {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          duration: 1.4,
          ease: "expo.out",
          stagger: { each: 0.016, from: "random" },
        }).to(
          fades,
          { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 },
          "-=0.95"
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

      {/* геометрия бренда: контурный треугольник-A с точкой */}
      <svg className="hero-geo" viewBox="0 0 400 360" aria-hidden data-hero-fade>
        <polygon points="200,24 376,336 24,336" />
        <circle cx="200" cy="246" r="6" />
        <line x1="200" y1="24" x2="200" y2="336" />
      </svg>

      {/* верхняя строка-сетка: марка + индекс вопроса */}
      <header className="hero-top">
        <span className="hero-mark" data-hero-fade>
          AUREA<sup>®</sup>
        </span>
        <span className="hero-kicker" data-hero-fade>
          <i>(01)</i> Вы&nbsp;делаете то, что&nbsp;мне нужно?
        </span>
      </header>

      {/* заголовок — ломаные строки по золотому сечению */}
      <h1 className="hero-headline" ref={headline}>
        <span className="hl-line hl-a">Первое</span>
        <span className="hl-line hl-b">впечатление</span>
        <span className="hl-line hl-c">невозможно</span>
        <span className="hl-line hl-d">повторить</span>
      </h1>

      {/* подзаголовок — отдельная зона справа-внизу */}
      <p className="hero-sub" data-hero-fade>
        Поэтому мы&nbsp;создаём сайты, которые помогают бизнесу выделяться,
        вызывать доверие и&nbsp;получать больше&nbsp;заявок.
      </p>

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
