"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// SplitText became free in GSAP 3.13 — used for premium line/word/char
// mask-reveals (Bible technique #1).
import { SplitText } from "gsap/SplitText";

let registered = false;

/** Register GSAP plugins once (guarded for React StrictMode / HMR). */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  // СКРОЛЛ ЖИВЁТ НА ДОКУМЕНТЕ (root-scroll). Раньше был внутренний фикс-контейнер
  // .app-scroll, но CSS position:sticky ВНУТРИ не-рутового overflow-контейнера
  // НЕ ускоряется композитором на мобиле → все пиннинг-сцены (Процесс, Цены…)
  // дрожали всем экраном. На руте sticky аппаратно-ускорен → плавно. Значит
  // scroller по умолчанию = window; ничего не переопределяем.
  registered = true;
}

export { gsap, ScrollTrigger, SplitText };
