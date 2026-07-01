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
  // На мобиле панель браузера прячется/появляется при скролле и меняет ТОЛЬКО
  // высоту вьюпорта. Без этого флага ScrollTrigger на каждый такой resize делает
  // refresh() — пересчитывает все пины/позиции и ДЁРГАЕТ контент (заголовок,
  // кнопки, фоновую «А») вверх. ignoreMobileResize отключает этот лишний refresh.
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export { gsap, ScrollTrigger, SplitText };
