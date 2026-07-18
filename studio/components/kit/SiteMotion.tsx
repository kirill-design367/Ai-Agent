"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/*
  SITE-MOTION — единый слой движения поверх ОДНОЙ структуры (§арх). Ничего не
  меняет в разметке/контенте; добавляет «разворот» проявление по скроллу на
  [data-reveal] (авто-теги ниже). reduce-motion → всё видимо сразу.

  ВАЖНО (бюджет): заголовок-герой НЕ анимируем из скрытого состояния — он LCP-
  элемент, и gsap.from(opacity:0) держал бы его невидимым до загрузки GSAP
  (LCP ~3s, TBT ~420ms). Сигнатура «разворот из точки» живёт в прелоадере,
  переходах между страницами и проявлении секций — не ценой LCP. Reveal — на
  чистом IntersectionObserver + CSS (без GSAP на критическом пути).
*/
const REVEAL_SELECTOR = [
  "[data-reveal]",
  "main h2",
  ".pg-hero-lead > *",
  ".hub-card",
  ".pg-hub-card",
  ".pg-prose > *",
  "blockquote",
  ".faq-item, .pg-faq-item",
  ".related-item, .pg-related-card",
  ".price-row, .pg-price-card",
  ".pg-trust-card, .pg-tst-card",
  ".pg-step, .pg-pain-sol",
  ".hero-m-aside",
  ".pg-hero-chips",
].join(",");

export default function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const all = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
    ).filter((el) => !el.closest("[data-no-reveal]") && el.dataset.reveal !== "done");

    if (reduce) {
      all.forEach((el) => {
        el.dataset.reveal = "done";
        el.classList.add("is-in");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-in");
            io.unobserve(e.target);
          }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    const vh = window.innerHeight;
    all.forEach((el) => {
      el.dataset.reveal = "done";
      if (el.getBoundingClientRect().top < vh * 0.92) {
        el.classList.add("is-in"); // над/у сгиба — показать сразу (без мигания)
      } else {
        el.classList.add("rv");
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
