"use client";

import { useEffect, useRef, useState } from "react";

/*
  ПРЕЛОАДЕР — бренд-момент «разворот из точки» (§1.4). Точка тёплого света в центре
  чёрного разворачивается и открывает страницу. ТОЛЬКО главная, ТОЛЬКО первый визит
  за сессию (sessionStorage). Клиентский — в SSR-HTML его нет, поэтому боты и
  Lighthouse-lab получают страницу без него, а LCP-текст под оверлеем уже отрисован
  (цена для LCP ≈ 0). reduce-motion → не показываем вовсе.
*/
export default function Preloader() {
  const [show, setShow] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (sessionStorage.getItem("aurea_seen")) return;
    sessionStorage.setItem("aurea_seen", "1");
    setShow(true);
    document.documentElement.dataset.preloading = "1";

    const el = root.current;
    let raf = 0;
    const t0 = performance.now();
    const DUR = 1200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / DUR);
      // ease-out «разворот»: точка → круг света → уходит
      const e = 1 - Math.pow(1 - p, 3);
      if (el) {
        const dot = el.querySelector<HTMLElement>(".pl-dot");
        if (dot) {
          const scale = 0.06 + e * 26; // из точки в свет
          dot.style.transform = `translate(-50%,-50%) scale(${scale})`;
          dot.style.opacity = String(p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3);
        }
        el.style.opacity = String(p < 0.82 ? 1 : 1 - (p - 0.82) / 0.18);
      }
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        delete document.documentElement.dataset.preloading;
        setShow(false);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!show) return null;
  return (
    <div ref={root} className="preloader" aria-hidden>
      <span className="pl-dot" />
    </div>
  );
}
