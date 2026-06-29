"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

// WebGL fluid cursor (signature) — client-only, desktop-only (CSS-gated).
const SplashCursor = dynamic(() => import("@/components/kit/SplashCursor"), {
  ssr: false,
});

/*
  HERO — the thesis (frontend-design): dark, a gold fluid cursor as the one
  signature, a kinetic display headline that states the promise, a spinning
  "обсудить" badge. Entrance is held until the intro curtain lifts (listens for
  the `aurea:revealed` event), so the reveal is actually seen.
*/
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const inners = gsap.utils.toArray<HTMLElement>(".hero-headline .inner");
      const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");

      if (reduce) {
        gsap.set([inners, fades], { clearProps: "all" });
        return;
      }

      gsap.set(inners, { yPercent: 115 });
      gsap.set(fades, { opacity: 0, y: 24 });

      const play = () => {
        const tl = gsap.timeline();
        tl.to(inners, {
          yPercent: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.12,
        })
          .to(
            fades,
            { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.1 },
            "-=0.7"
          );
      };

      if (document.documentElement.classList.contains("intro-done")) {
        play();
      } else {
        window.addEventListener("aurea:revealed", play, { once: true });
      }
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
        <span className="hero-avail" data-hero-fade>
          <span className="hero-ping">
            <span />
            <span />
          </span>
          Свободен для нового проекта
        </span>
      </div>

      <a href="#contact" className="hero-spin" aria-label="Обсудить проект" data-cursor="hover">
        <svg viewBox="0 0 120 120" className="ring">
          <defs>
            <path id="spinPath" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
          </defs>
          <text
            fill="rgba(244,242,238,0.85)"
            fontSize="9"
            fontWeight="600"
            letterSpacing="3.4"
            fontFamily="var(--font-body), sans-serif"
          >
            <textPath href="#spinPath">ОБСУДИТЬ ПРОЕКТ · ОБСУДИТЬ ПРОЕКТ ·&nbsp;</textPath>
          </text>
        </svg>
        <span className="dot" />
      </a>

      <div className="hero-main">
        <h1 className="hero-headline">
          <span className="line">
            <span className="inner">Сайт за</span>
          </span>
          <span className="line">
            <span className="inner">
              1–5&nbsp;<em>дней</em>
            </span>
          </span>
        </h1>

        <p className="hero-sub" data-hero-fade>
          Уникальный дизайн на чистом коде. Без шаблонов, без посредников,
          с&nbsp;пожизненной гарантией. <strong>От 30&nbsp;000&nbsp;₽.</strong>
        </p>

        <div className="hero-cta-row" data-hero-fade>
          <a href="#contact" className="btn btn--primary" data-magnetic>
            Обсудить проект
          </a>
          <a href="#work" className="btn btn--ghost" data-magnetic>
            Смотреть работы
          </a>
        </div>

        <p className="hero-meta" data-hero-fade>
          7 лет · 100+ проектов · от 1 дня · пожизненная гарантия
        </p>
      </div>
    </section>
  );
}
