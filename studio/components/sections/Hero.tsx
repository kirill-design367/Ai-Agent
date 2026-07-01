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
      };

      if (document.documentElement.classList.contains("intro-done")) play();
      else window.addEventListener("aurea:revealed", play, { once: true });
    },
    { scope: root }
  );

  return (
    <section id="hero" className="theme-dark hero" ref={root}>
      <div className="hero-fluid">{fluid && <SplashCursor />}</div>

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
          <span className="hs-line hs-l1">Мы&nbsp;проектируем каждый пиксель так,</span>{" "}
          <span className="hs-line hs-l2">чтобы он&nbsp;усиливал доверие</span>{" "}
          <span className="hs-line hs-l3">к&nbsp;вашему бизнесу, помогал получать</span>{" "}
          <span className="hs-line hs-l4">больше обращений и&nbsp;делал компанию</span>{" "}
          <span className="hs-line hs-l5">сильнее в&nbsp;глазах клиентов.</span>
        </p>
      </div>

      {/* креативные кнопки-«бриллианты маркиз», торчат из левого и правого краёв,
          по золотому сечению (левый ниже, правый выше), с лёгким наклоном,
          объём (градиент+фасеты+блик) и тихое постоянное сияние */}
      <div className="hero-gems">
        <svg className="gem-defs" width="0" height="0" aria-hidden>
          <defs>
            {/* корпус камня — глубокий объём, свет сверху-слева → тень снизу */}
            <linearGradient id="gem-grad" x1="0" y1="0" x2="0.32" y2="1">
              <stop offset="0" stopColor="#4d4d5c" />
              <stop offset="0.44" stopColor="#191921" />
              <stop offset="1" stopColor="#050509" />
            </linearGradient>
            {/* table-facet блик (верхняя площадка ловит свет) */}
            <linearGradient id="gem-shine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="1" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            {/* переливающийся свет (дисперсия): холодный→сиреневый→тёплый */}
            <linearGradient id="gem-iri" x1="0" y1="0.1" x2="1" y2="0.9">
              <stop offset="0" stopColor="#8fdcff" />
              <stop offset="0.5" stopColor="#c9b6ff" />
              <stop offset="1" stopColor="#ffd7a6" />
            </linearGradient>
          </defs>
        </svg>
        <a href="#work" className="gem gem--left" data-magnetic aria-label="Смотреть работы">
          <MarquiseGem />
          <span className="gem-label">
            Смотреть
            <br />
            работы
          </span>
        </a>
        <a href="#contact" className="gem gem--right" data-magnetic aria-label="Обсудить проект">
          <MarquiseGem />
          <span className="gem-label">
            Обсудить
            <br />
            проект
          </span>
        </a>
      </div>

      {/* нижняя зона: микрокопия одной строкой (кнопки убраны) */}
      <div className="hero-foot">
        <p className="hero-microcopy" data-hero-fade>
          Индивидуальный дизайн <i>•</i> Пожизненная гарантия <i>•</i> Запуск
          от&nbsp;5&nbsp;дней
        </p>
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
      {/* рундист (контур камня) */}
      <polygon
        className="gem-body"
        points="0,50 60,18 120,10 180,18 240,50 180,82 120,90 60,82"
      />
      {/* площадка-table — ловит свет */}
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
      {/* переливающийся свет поверх — тихо дышит (opacity, без repaint) */}
      <polygon
        className="gem-iri"
        points="0,50 60,18 120,10 180,18 240,50 180,82 120,90 60,82"
      />
    </svg>
  );
}
