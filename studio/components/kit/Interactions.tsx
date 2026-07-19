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
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e: PointerEvent) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const pill = t.closest<HTMLElement>(".pill");
      if (pill) {
        const r = pill.getBoundingClientRect();
        pill.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        pill.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
