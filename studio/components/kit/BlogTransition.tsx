"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/*
  ПЕРЕХОД «ЧЁРНАЯ ДЫРА» (реф blackhole-blog). Фирменный момент — ТОЛЬКО блог,
  ТОЛЬКО десктоп. Контент статьи затягивается в диагональную точку: SVG
  feDisplacementMap даёт нелинейный варп (искривление, как на референсе, не
  линейный skew), а transform-коллапс — «засасывание». Это дисторшн на живом
  DOM через GPU-фильтр (не canvas-снимок) — дёшево по перфу, без библиотек.
  Мобайл / reduce-motion → обычный мягкий переход (глобальный PageTransition).
*/
const DUR = 640;
export default function BlogTransition() {
  const pathname = usePathname();
  const router = useRouter();

  // Вход новой статьи — снять варп, мягко проявить
  useEffect(() => {
    const stage = document.getElementById("bh-stage");
    if (!stage) return;
    stage.classList.remove("bh-warp");
    stage.classList.add("bh-enter");
    const t = setTimeout(() => stage.classList.remove("bh-enter"), 520);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 861px) and (hover: hover)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || reduce) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      const href = a?.getAttribute("href");
      if (!a || !href || a.target === "_blank" || !href.startsWith("/blog/")) return;
      if (new URL(href, location.href).pathname === location.pathname) return;
      const stage = document.getElementById("bh-stage");
      if (!stage) return;
      e.preventDefault();
      stage.classList.add("bh-warp");
      window.setTimeout(() => router.push(href), DUR);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return (
    <svg className="bh-filter" aria-hidden focusable="false" width="0" height="0">
      <filter id="bh" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="turbulence" baseFrequency="0.009 0.014" numOctaves="2" seed="7" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="70" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
