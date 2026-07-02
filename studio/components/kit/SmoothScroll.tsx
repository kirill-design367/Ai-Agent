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

    // ГЛАДКОСТЬ: держим ПРОСТУЮ связку — Lenis крутит свой RAF (autoRaf по умолч.),
    // а ScrollTrigger обновляется на каждом событии скролла Lenis (выше). Драйв
    // Lenis из gsap.ticker + lagSmoothing(0) убрали: под тяжёлой сценой «Процесса»
    // (рой вопросов + комета) он снимал защиту от просадок кадров и добавлял лаги.
    // Дрожание пиннингов уже устранено переводом порталов на CSS position:sticky.

    // Всегда стартуем с Hero. history.scrollRestoration управляет ТОЛЬКО скроллом
    // документа, а у нас app-shell — скроллится div .app-scroll, чью позицию
    // браузер восстанавливает отдельно и ПОЗЖЕ (после layout/load, из bfcache).
    // Поэтому сбрасываем и window, и .app-scroll, и Lenis — многократно, пока идёт
    // прелоадер, перекрывая момент восстановления браузером.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const toTop = () => {
      const sc = document.querySelector<HTMLElement>(".app-scroll");
      if (sc) sc.scrollTop = 0;
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true, force: true });
    };
    toTop();
    // серия сбросов на первых кадрах + после load/pageshow — перекрываем позднее
    // восстановление позиции браузером (иначе сайт открывался из середины).
    // Останавливаемся при первом действии пользователя, чтобы не мешать скроллу.
    let frames = 0;
    let resetRaf = 0;
    const tick = () => {
      toTop();
      if (++frames < 90) resetRaf = requestAnimationFrame(tick); // ~1.5с
    };
    resetRaf = requestAnimationFrame(tick);
    const timers = [120, 400, 900, 1600].map((d) => window.setTimeout(toTop, d));
    window.addEventListener("load", toTop);
    window.addEventListener("pageshow", toTop);

    const userTook = ["wheel", "touchstart", "keydown", "pointerdown"];
    const stopForcing = () => {
      cancelAnimationFrame(resetRaf);
      timers.forEach(clearTimeout);
      window.removeEventListener("load", toTop);
      window.removeEventListener("pageshow", toTop);
      userTook.forEach((e) => window.removeEventListener(e, stopForcing));
    };
    userTook.forEach((e) =>
      window.addEventListener(e, stopForcing, { passive: true, once: true })
    );

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      stopForcing();
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      className="app-scroll"
      options={{
        duration: 1.2,
        // Premium expo easing (matches reference portfolios).
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
      }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
