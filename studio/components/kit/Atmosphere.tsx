"use client";

import { useEffect, useRef } from "react";

/*
  ATMOSPHERE — глубина #0a0a0b как ПРОСТРАНСТВА, не плоской заливки (§6):
  тонкий film-grain + тёплые световые поля, которые едва дрейфуют по скроллу
  (параллакс, композитный transform, дёшево). Свет = температура, не золото.
  reduce-motion / тач → без дрейфа. Фиксированный слой позади контента.
*/
export default function Atmosphere() {
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = light.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let cur = 0;
    const tick = () => {
      const target = window.scrollY || 0;
      cur += (target - cur) * 0.08;
      // медленный параллакс двух световых полей в разные стороны
      el.style.setProperty("--sy", String(cur));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // display:contents на обёртке → слои не создают общий стекинг-контекст,
  // свет уходит ЗА контент (z0), grain — НАД контентом (z90).
  return (
    <div className="atmos" aria-hidden>
      <div ref={light} className="atmos-light" />
      <div className="atmos-grain" />
    </div>
  );
}
