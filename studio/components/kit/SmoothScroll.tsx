"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { ScrollTrigger, registerGsap } from "@/lib/gsap";

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
    return () => {
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        // Premium expo easing (matches reference portfolios).
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
