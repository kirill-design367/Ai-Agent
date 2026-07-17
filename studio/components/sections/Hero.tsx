"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, registerGsap } from "@/lib/gsap";
import { shouldSkipIntro } from "@/components/kit/Intro";
import { isHeavyCapable } from "@/lib/deviceTier";
import { HERO } from "@/lib/homeContent";

const HL_CLASS = ["hl-a", "hl-b", "hl-c", "hl-d"];

const SplashCursor = dynamic(() => import("@/components/kit/SplashCursor"), {
  ssr: false,
});

/*
  HERO — отвечает на «Вы делаете то, что мне нужно?».

  Расслоение (§1): LCP-элемент — текстовый заголовок из HTML/CSS, виден без JS.
  Three.js-сцена (флюид) НЕ участвует в LCP: монтируется после idle (уже после
  LCP), проявляется плавно; контейнер сцены заранее full-bleed → CLS = 0.
  Тиринг по способности устройства (isHeavyCapable):
    - способный (desktop, 4g, ядра, не save-data/reduced) — полная WebGL-сцена;
    - иначе — статичный CSS-постер той же сцены (аврора-градиент), без JS.
  Голос §2: подзаголовок «Современные сайты для бизнеса…», без сроков в hero (§2.5).
*/
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);
  // Полная three.js-сцена — только «способный» тир. Монтируется ПОСЛЕ LCP/idle.
  const [fluid, setFluid] = useState(false);
  useEffect(() => {
    if (!isHeavyCapable()) return; // лёгкий тир — остаётся CSS-постер, без WebGL
    let cancelled = false;
    const mount = () => !cancelled && setFluid(true);
    // idle гарантированно наступает после LCP (заголовок красится сразу из HTML)
    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    }).requestIdleCallback;
    const id = ric ? ric(mount, { timeout: 2500 }) : window.setTimeout(mount, 1500);
    return () => {
      cancelled = true;
      if (!ric) clearTimeout(id as number);
    };
  }, []);

  useGSAP(
    () => {
      registerGsap();
      const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");

      // МГНОВЕННЫЙ ОФФЕР: на лёгком тире / повторном визите / рекламном трафике
      // заголовок НЕ сплитим и НЕ прячем — остаётся серверным текстом (LCP без JS).
      if (shouldSkipIntro()) {
        gsap.set(fades, { opacity: 1, y: 0 });
        return;
      }

      // Способный тир, первый визит — «стильный хаос» заголовка (десктоп-впечатление).
      const split = new SplitText(headline.current!, { type: "words,chars" });
      const subSplit = new SplitText(sub.current!, { type: "words" });

      gsap.set(split.chars, {
        x: () => gsap.utils.random(-22, 22),
        y: () => gsap.utils.random(-24, 24),
        rotation: () => gsap.utils.random(-12, 12),
        opacity: 0,
      });
      gsap.set(subSplit.words, {
        x: () => gsap.utils.random(-16, 16),
        y: () => gsap.utils.random(-14, 18),
        opacity: 0,
      });
      gsap.set(fades, { opacity: 0, y: 24 });

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
    },
    { scope: root }
  );

  return (
    <section id="hero" className="theme-dark hero" ref={root}>
      {/* Фон-сцена: CSS-постер (аврора) всегда; WebGL-флюид проявляется поверх
          на способном тире после LCP. Контейнер full-bleed заранее → CLS 0. */}
      <div className={`hero-fluid${fluid ? " is-live" : ""}`} aria-hidden>
        <div className="hero-poster" />
        {fluid && <SplashCursor />}
      </div>

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
          {HERO.headline.map((w, i) => (
            <span className={`hl-line ${HL_CLASS[i] ?? ""}`} key={w}>
              {w}
            </span>
          ))}
        </h1>

        <p className="hero-sub" ref={sub}>
          {HERO.subtitle}
        </p>
      </div>

      {/* нижняя зона: фишки (без сроков в hero — §2.5) + основной CTA-pill */}
      <div className="hero-foot">
        <ul className="hero-feats" data-hero-fade>
          {HERO.feats.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <a href="#prices" className="hero-cta" data-hero-fade data-magnetic>
          <span>Узнать стоимость</span>
        </a>
      </div>
    </section>
  );
}
