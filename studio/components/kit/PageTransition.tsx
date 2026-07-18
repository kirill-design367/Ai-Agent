"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/*
  ПЕРЕХОД МЕЖДУ СТРАНИЦАМИ (§3) — часть композиции, не перезагрузка. Концепция
  «разворот из точки»: при уходе оверлей сворачивается ИЗ точки в полноэкранный
  свет (fold), после навигации — обратно В точку (unfold), открывая новую страницу.
  Клиентская навигация Next (router.push) — shell не перезагружается.
  reduce-motion → не вмешиваемся, обычная мгновенная навигация.
*/
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)"; // aurea-move
const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function PageTransition() {
  const overlay = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Вход: оверлей сворачивается в точку, открывая новую страницу
  useEffect(() => {
    const el = overlay.current;
    if (!el) return;
    if (reduceMotion()) {
      el.style.clipPath = "circle(0% at 50% 50%)";
      return;
    }
    el.style.pointerEvents = "none";
    el.animate(
      [
        { clipPath: "circle(150% at 50% 50%)" },
        { clipPath: "circle(0% at 50% 50%)" },
      ],
      { duration: 660, easing: EASE, fill: "forwards" }
    );
  }, [pathname]);

  // Уход: перехват внутренних ссылок → fold → навигация
  useEffect(() => {
    if (reduceMotion()) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (
        !href ||
        a.target === "_blank" ||
        a.hasAttribute("download") ||
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // та же страница

      e.preventDefault();
      const el = overlay.current;
      if (!el) {
        router.push(href);
        return;
      }
      el.style.pointerEvents = "auto";
      const anim = el.animate(
        [
          { clipPath: "circle(0% at 50% 50%)" },
          { clipPath: "circle(150% at 50% 50%)" },
        ],
        { duration: 560, easing: EASE, fill: "forwards" }
      );
      anim.finished.then(() => router.push(href)).catch(() => router.push(href));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return <div ref={overlay} className="pt" aria-hidden />;
}
