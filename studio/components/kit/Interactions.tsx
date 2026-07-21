"use client";

import { useEffect } from "react";

/*
  ИНТЕРАКТИВ (эталон Cuberto). Одна делегированная подписка на документ →
  работает на всех страницах и на динамическом контенте (SPA-навигация, меню).
  На .pill записывает точку курсора в --mx/--my (в %), из неё CSS расширяет
  радиальную заливку чернил (см. globals .pill::before). Курсор системный —
  выразительность в самих элементах (§2.3). На тач — не подписываемся.
*/
export default function Interactions() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(hover: none)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onMove = (e: PointerEvent) => {
      if (coarse) return;
      const t = e.target;
      if (!(t instanceof Element)) return;
      const pill = t.closest<HTMLElement>(".pill");
      if (pill) {
        const r = pill.getBoundingClientRect();
        pill.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        pill.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }
    };
    if (!coarse) document.addEventListener("pointermove", onMove, { passive: true });

    // Контролируемое парение кейсов (реф Akoya): [data-drift] дрейфует по скроллу.
    // На мобиле — упрощённо (амплитуда ×0.4), reduce-motion — выкл.
    const drifters = Array.from(document.querySelectorAll<HTMLElement>("[data-drift]"));
    let raf = 0;
    const amp = coarse ? 0.4 : 1;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of drifters) {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const rel = (center - vh / 2) / vh; // -0.5..0.5 от центра экрана
        const speed = parseFloat(el.dataset.drift || "0") * amp;
        el.style.setProperty("--mag-y", `${rel * speed * vh * -1}px`);
      }
    };
    const onScroll = () => { if (!raf && !reduce) raf = requestAnimationFrame(tick); };
    if (drifters.length && !reduce) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      tick();
    }

    return () => {
      if (!coarse) document.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
