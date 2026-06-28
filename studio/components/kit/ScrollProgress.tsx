"use client";

import { useLenis } from "lenis/react";
import { useRef } from "react";

/*
  Thin scroll-progress line (Bible V.31). For long narrative sites: orientation
  without shouting. Tinted with the accent, fixed at the top, 2px.
*/
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useLenis(({ progress }: { progress: number }) => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${progress})`;
    }
  });

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9998,
        transformOrigin: "0 50%",
        background: "var(--accent)",
        transform: "scaleX(0)",
      }}
      ref={barRef}
    />
  );
}
