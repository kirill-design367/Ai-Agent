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
  Буквы заголовка чуть разбросаны (хаос); когда уходит интро, они мягко встают
  на места — «из хаоса рождается система». Фишки вместо бейджа доступности.
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
        x: () => gsap.utils.random(-9, 9),
        y: () => gsap.utils.random(-11, 11),
        rotation: () => gsap.utils.random(-7, 7),
        opacity: 0.55,
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
          duration: 1.3,
          ease: "expo.out",
          stagger: { each: 0.018, from: "random" },
        }).to(
          fades,
          { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.1 },
          "-=0.8"
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

      <div className="hero-top">
        <span className="hero-mark" data-hero-fade>
          AUREA
        </span>
      </div>

      <div className="hero-main">
        <h1 className="hero-headline" ref={headline}>
          Первое впечатление невозможно повторить
        </h1>

        <p className="hero-sub" data-hero-fade>
          Поэтому мы создаём сайты, которые помогают бизнесу выделяться, вызывать
          доверие и&nbsp;получать больше заявок.
        </p>

        <div className="hero-cta-row" data-hero-fade>
          <a href="#contact" className="btn btn--primary" data-magnetic>
            Обсудить проект
          </a>
          <a href="#work" className="btn btn--ghost" data-magnetic>
            Смотреть работы
          </a>
        </div>

        <ul className="hero-feats" data-hero-fade>
          <li>Полностью под ключ</li>
          <li>Индивидуальный дизайн</li>
          <li>Пожизненная гарантия</li>
        </ul>
      </div>
    </section>
  );
}
