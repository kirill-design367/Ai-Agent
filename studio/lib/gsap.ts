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
  registered = true;
}

export { gsap, ScrollTrigger, SplitText };
