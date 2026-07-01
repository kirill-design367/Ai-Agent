"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  Inertial smooth-scroll (Lenis) — the "expensive" weighted feel (Bible II.6).
  Critically, Lenis is synced with GSAP ScrollTrigger so scroll-driven scenes
  flow in one smooth stream (II.6.2). Inertia is felt but never disorienting.
*/
function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    registerGsap();
    if (!lenis) return;
    // Expose for tooling (screenshot harness jumps to exact scroll positions).
    (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    // Keep ScrollTrigger in lockstep with Lenis on every frame.
    lenis.on("scroll", ScrollTrigger.update);

    // Якорные ссылки (#contact / #work …) должны плавно ехать через Lenis,
    // иначе браузер делает мгновенный «телепорт» на 26000px — экран дёргается.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      (lenis as unknown as { scrollTo: (t: Element, o?: object) => void }).scrollTo(
        target,
        { offset: 0, duration: 1.3 }
      );
    };
    document.addEventListener("click", onClick);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      document.removeEventListener("click", onClick);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        // Premium expo easing (matches reference portfolios).
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        // syncTouch: Lenis сам ведёт тач-скролл (preventDefault + программный
        // скролл). Тогда iOS НЕ видит нативный жест скролла и НЕ прячет свою
        // нижнюю панель — контент перестаёт «прыгать» при скролле на телефоне.
        syncTouch: true,
        syncTouchLerp: 0.1,
        touchMultiplier: 1.6,
      }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
