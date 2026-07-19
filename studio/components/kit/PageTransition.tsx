"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/*
  ПЕРЕХОД МЕЖДУ СТРАНИЦАМИ (§3) — тёплый занавес, а не «точка» (§правки). Один жест
  на весь сайт: при уходе панель накрывает снизу, после навигации уходит вверх,
  открывая новую страницу. Клиентская навигация Next. reduce-motion → без вмешательства.
*/
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function PageTransition() {
  const overlay = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const pathname = usePathname();
  const router = useRouter();

  // Вход: панель (лежит внизу) уходит вверх, открывая новую страницу
  useEffect(() => {
    const el = overlay.current;
    if (!el) return;
    if (first.current) {
      first.current = false; // на первой загрузке ничего не играем
      return;
    }
    if (reduceMotion()) return;
    el.style.transform = "translateY(0)";
    el.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }],
      { duration: 620, easing: EASE, fill: "forwards" }
    ).finished.then(() => {
      el.style.transform = "translateY(101%)"; // сброс вниз для следующего раза
    });
  }, [pathname]);

  // Уход: перехват внутренних ссылок → занавес снизу закрывает → навигация
  useEffect(() => {
    if (reduceMotion()) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      const href = a?.getAttribute("href");
      if (
        !a || !href || a.target === "_blank" || a.hasAttribute("download") ||
        href.startsWith("http") || href.startsWith("#") ||
        href.startsWith("mailto:") || href.startsWith("tel:")
      )
        return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      const el = overlay.current;
      if (!el) { router.push(href); return; }
      el.style.transform = "translateY(101%)";
      el.animate(
        [{ transform: "translateY(101%)" }, { transform: "translateY(0)" }],
        { duration: 560, easing: EASE, fill: "forwards" }
      ).finished.then(() => router.push(href)).catch(() => router.push(href));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return <div ref={overlay} className="pt" aria-hidden />;
}
