"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

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

    // КАНОНИЧЕСКАЯ связка Lenis+GSAP: единый RAF-источник — gsap.ticker (Lenis
    // запущен с autoRaf:false, см. ниже). Это ОБЯЗАТЕЛЬНО для гладкого
    // ScrollTrigger pin+scrub (сцена «Стоимость»): pin и scrub привязаны к тому
    // же тикеру, что и Lenis, поэтому не дрожат. lagSmoothing(0) — без «догоняния»
    // после лага, иначе scrub рвётся. HomeUpgrade с тяжёлым «Процессом» больше не
    // рендерится (главная = HomeLite), поэтому прежней просадки нет.
    const rafDrive = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafDrive);
    gsap.ticker.lagSmoothing(0);

    // Всегда стартуем с Hero. Скролл теперь на документе (root) — сбрасываем
    // window/documentElement/body и Lenis многократно, пока идёт прелоадер,
    // перекрывая момент восстановления позиции браузером (в т.ч. из bfcache).
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const toTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
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
      gsap.ticker.remove(rafDrive);
      stopForcing();
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        duration: 1.2,
        // Premium expo easing (matches reference portfolios).
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // ГЛАДКОСТЬ ТОЛЬКО КОЛЕСОМ (десктоп). На тач-устройствах Lenis НЕ
        // перехватывает скролл (syncTouch:false по умолчанию) → нативный
        // скролл документа, а значит sticky-пины аппаратно-ускорены и не дрожат.
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
