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
  // WebGL флюид-курсор: на десктопе — полное качество (мышь), на тач-устройствах —
  // реагирует на касание, но в СНИЖЕННОМ разрешении (щадим GPU/батарею).
  const [fluid, setFluid] = useState(false);
  const [touchFluid, setTouchFluid] = useState(false);
  useEffect(() => {
    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      window.innerWidth > 900;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (!fine && !coarse) return;
    setTouchFluid(!fine && coarse);
    // отложить тяжёлую WebGL-инициализацию на простой → не раздувает TBT при загрузке
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback;
    const t = ric ? ric(() => setFluid(true)) : window.setTimeout(() => setFluid(true), 1200);
    return () => clearTimeout(t as number);
  }, []);
  // облегчённые параметры для мобилы: меньше разрешение симуляции/краски
  const fluidProps = touchFluid
    ? { SIM_RESOLUTION: 64, DYE_RESOLUTION: 512, CAPTURE_RESOLUTION: 256, PRESSURE_ITERATIONS: 12 }
    : {};

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

      {/* креативные кнопки-«бриллианты маркиз», торчат из левого и правого краёв,
          по золотому сечению (левый ниже, правый выше), с лёгким наклоном,
          объём (градиент+фасеты+блик) и тихое постоянное сияние */}
      <div className="hero-gems">
        <svg className="gem-defs" width="0" height="0" aria-hidden>
          <defs>
            {/* корпус камня — глубокий объём, свет сверху-слева → тень снизу,
                с ледяным намёком Tiffany вверху (почти незаметно) */}
            <linearGradient id="gem-grad" x1="0" y1="0" x2="0.32" y2="1">
              <stop offset="0" stopColor="#495863" />
              <stop offset="0.44" stopColor="#181a1e" />
              <stop offset="1" stopColor="#050608" />
            </linearGradient>
            {/* table-facet блик (верхняя площадка ловит свет), с мятным холодком */}
            <linearGradient id="gem-shine" x1="0" y1="0" x2="0.1" y2="1">
              <stop offset="0" stopColor="rgba(226,246,242,0.6)" />
              <stop offset="1" stopColor="rgba(226,246,242,0)" />
            </linearGradient>
            {/* внутреннее свечение — свет проходит сквозь грани (мягкий объёмный) */}
            <radialGradient id="gem-core" cx="0.44" cy="0.4" r="0.62">
              <stop offset="0" stopColor="rgba(206,238,232,0.6)" />
              <stop offset="0.6" stopColor="rgba(206,238,232,0.12)" />
              <stop offset="1" stopColor="rgba(206,238,232,0)" />
            </radialGradient>
            {/* дисперсия — очень бледный Tiffany (5–10% насыщенности), скорее чувствуется */}
            <linearGradient id="gem-iri" x1="0" y1="0.1" x2="1" y2="0.9">
              <stop offset="0" stopColor="#d8f3ee" />
              <stop offset="0.5" stopColor="#a9dcda" />
              <stop offset="1" stopColor="#e9f4f0" />
            </linearGradient>
            {/* бегущий блик по граням */}
            <linearGradient id="gem-glint" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgba(255,255,255,0)" />
              <stop offset="0.5" stopColor="rgba(233,249,245,0.9)" />
              <stop offset="1" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            {/* контур огранки — чтобы блик не вылезал за камень */}
            <clipPath id="gem-clip" clipPathUnits="userSpaceOnUse">
              <polygon points="0,50 60,18 120,10 180,18 240,50 180,82 120,90 60,82" />
            </clipPath>
          </defs>
        </svg>
        <a href="#prices" className="gem gem--left" data-magnetic aria-label="Узнать стоимость">
          <MarquiseGem />
          <span className="gem-label">
            Узнать
            <br />
            стоимость
          </span>
        </a>
        <a href="#contact" className="gem gem--right" data-magnetic aria-label="Бесплатно обсудить проект">
          <MarquiseGem />
          <span className="gem-label">
            Бесплатно
            <br />
            обсудить проект
          </span>
        </a>
      </div>

      {/* нижняя зона: ключевые фишки — вертикально, крупно, по золотому сечению */}
      <div className="hero-foot">
        <ul className="hero-feats" data-hero-fade>
          <li>Индивидуальный дизайн</li>
          <li>Пожизненная гарантия</li>
          <li>Запуск от&nbsp;5&nbsp;дней</li>
        </ul>
      </div>
    </section>
  );
}

/*
  Огранка «маркиз» (marquise brilliant): заострённый овал (girdle), в центре —
  ромбовидная площадка-table, от неё фасеты-лучи к рундисту и остриям + осевой
  «киль». Сверху — тихо переливающийся слой света (дисперсия). Всё в одном
  viewBox 240×100, растягивается под ссылку.
*/
function MarquiseGem() {
  return (
    <svg className="gem-cut" viewBox="0 0 240 100" preserveAspectRatio="none" aria-hidden>
      {/* рундист (контур камня) — базовый градиент-объём */}
      <polygon
        className="gem-body"
        points="0,50 60,18 120,10 180,18 240,50 180,82 120,90 60,82"
      />
      {/* РЕФРАКЦИЯ: грани разной яркости — стекло, где свет ломается.
          светлые (свет ловят) — сверху-слева; тёмные — снизу-справа */}
      <polygon className="gem-facet gem-facet--lt" points="0,50 60,18 44,50" />
      <polygon className="gem-facet gem-facet--lt" points="60,18 120,30 44,50" />
      <polygon className="gem-facet gem-facet--lt" points="60,18 120,10 120,30" />
      <polygon className="gem-facet gem-facet--md" points="120,10 180,18 120,30" />
      <polygon className="gem-facet gem-facet--dk" points="196,50 180,82 120,70" />
      <polygon className="gem-facet gem-facet--dk" points="120,70 120,90 60,82" />
      <polygon className="gem-facet gem-facet--dk" points="196,50 240,50 180,82" />
      <polygon className="gem-facet gem-facet--md" points="180,18 240,50 196,50" />
      {/* внутреннее свечение — свет сквозь грани */}
      <ellipse className="gem-core" cx="112" cy="48" rx="78" ry="26" />
      {/* площадка-table — самый яркий блик */}
      <polygon className="gem-table" points="44,50 120,30 196,50 120,70" />
      {/* фасетная сетка бриллиантовой огранки */}
      <path
        className="gem-facets"
        d="M0,50 H240
           M44,50 L120,30 L196,50 L120,70 Z
           M120,30 L120,10 M120,70 L120,90
           M120,30 L60,18 M120,30 L180,18
           M120,70 L60,82 M120,70 L180,82
           M44,50 L60,18 M44,50 L60,82
           M196,50 L180,18 M196,50 L180,82"
      />
      {/* дисперсия — бледный Tiffany, тихо дышит (opacity) */}
      <polygon
        className="gem-iri"
        points="0,50 60,18 120,10 180,18 240,50 180,82 120,90 60,82"
      />
      {/* редкий бегущий блик, обрезан контуром камня */}
      <g clipPath="url(#gem-clip)">
        <polygon className="gem-glint" points="-34,-24 2,-24 26,124 -10,124" />
      </g>
    </svg>
  );
}
