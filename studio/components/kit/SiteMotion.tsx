"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, SplitText, registerGsap } from "@/lib/gsap";
import { registerAureaEases } from "@/theme/motion";

/*
  SITE-MOTION — единый слой движения поверх ОДНОЙ структуры (§арх). Ничего не
  меняет в разметке/контенте; добавляет:
   • «разворот» проявление по скроллу на [data-reveal] (авто-теги ниже);
   • сигнатурный жест на заголовках-героях: строки разворачиваются из низа
     (SplitText + aurea-unfold);
   • reduce-motion → всё видимо сразу, без движения.
  Перезапускается на смене маршрута (usePathname) — на каждой странице заново.
*/
const REVEAL_SELECTOR = [
  "[data-reveal]",
  "main h2",
  ".pg-hero-lead > *",
  ".hub-card",
  ".pg-prose > *",
  ".pg-section > * ",
  "blockquote",
  ".faq-item",
  ".related-item",
  ".price-row",
  ".hero-m-aside",
].join(",");

export default function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // reduce-motion: показать всё сразу, без наблюдателей
    if (reduce) {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.classList.add("is-in"));
      return;
    }

    registerGsap();
    registerAureaEases(gsap);
    const easeUnfold = "aurea-unfold"; // зарегистрирована выше; GSAP игнорирует, если нет

    const cleanups: Array<() => void> = [];

    // ── 1. Проявление по скроллу. Без мигания: прячем ТОЛЬКО то, что ниже
    //    первого экрана; видимое на загрузке не трогаем (иначе мелькнёт). ──
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
    document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
      if (el.closest("[data-no-reveal]") || el.dataset.reveal === "done") return;
      el.dataset.reveal = "done";
      if (el.getBoundingClientRect().top < vh * 0.92) {
        el.classList.add("is-in"); // над/у сгиба — показать сразу
      } else {
        el.classList.add("rv"); // ниже сгиба — спрятать и проявить по скроллу
        io.observe(el);
      }
    });
    cleanups.push(() => io.disconnect());

    // ── 2. Сигнатурный жест: заголовок-герой разворачивается по строкам ──
    const heroH1 = document.querySelector<HTMLElement>(
      ".hero-m-h1, .pg-hero-h1"
    );
    if (heroH1 && !heroH1.dataset.split) {
      heroH1.dataset.split = "1";
      try {
        const split = new SplitText(heroH1, { type: "lines", linesClass: "hm-line" });
        gsap.set(heroH1, { opacity: 1 });
        gsap.from(split.lines, {
          yPercent: 118,
          opacity: 0,
          duration: 0.9,
          ease: easeUnfold,
          stagger: 0.08,
        });
        cleanups.push(() => split.revert());
      } catch {
        /* SplitText недоступен — заголовок и так виден */
      }
    }

    ScrollTrigger.refresh();
    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
