"use client";

import { useGSAP } from "@gsap/react";
import { createElement, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { gsap, SplitText, registerGsap } from "@/lib/gsap";

type SplitRevealProps = {
  children: ReactNode;
  as?: ElementType;
  type?: "lines" | "words" | "chars" | "words,chars";
  stagger?: number;
  duration?: number;
  delay?: number;
  /** play on scroll into view instead of on mount */
  onScroll?: boolean;
  className?: string;
};

/*
  Line/word/char mask-reveal (Bible technique #1, the signature premium move):
  text slides up from behind an overflow-hidden mask with expo.out + stagger.
  This is the "proving from the depth of the paper" effect. Reserve for accent
  text — headings, leads — never every paragraph (II.10.4).
*/
export default function SplitReveal({
  children,
  as: Tag = "div",
  type = "lines",
  stagger = 0.1,
  duration = 0.9,
  delay = 0,
  onScroll = false,
  className = "",
}: SplitRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return; // text stays put, fully visible

      const split = new SplitText(el, {
        type,
        linesClass: "split-line",
        mask: "lines", // wraps lines in overflow-hidden masks
      });
      const targets =
        type === "lines" ? split.lines : type === "words" ? split.words : split.chars;

      gsap.from(targets, {
        yPercent: 110,
        duration,
        delay,
        ease: "expo.out",
        stagger,
        scrollTrigger: onScroll
          ? { trigger: el, start: "top 85%", once: true }
          : undefined,
      });

      return () => split.revert();
    },
    { scope: ref }
  );

  return createElement(Tag, { ref, className }, children);
}
