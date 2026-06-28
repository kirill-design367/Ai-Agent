"use client";

import { useEffect, useRef } from "react";

/*
  Custom cursor (Bible II.12.1 / V.50): the native cursor stays, a soft accent
  halo lerps after it (inertia) and expands over interactive elements. This is
  identity + tactility, not a hijack. Disabled on touch devices.
*/
export default function CustomCursor() {
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const halo = haloRef.current;
    if (!halo) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let hx = mx;
    let hy = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      halo.style.opacity = "1";
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest(
        '[data-cursor="hover"], a, button, [role="button"], [data-magnetic]'
      );
      halo.dataset.hover = String(!!interactive);
    };

    const onLeave = () => {
      halo.style.opacity = "0";
    };

    const tick = () => {
      // lerp 0.18 — soft chase, never glued to the pointer.
      hx += (mx - hx) * 0.18;
      hy += (my - hy) * 0.18;
      halo.style.transform = `translate3d(${hx}px, ${hy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <div ref={haloRef} className="cursor-halo" aria-hidden />;
}
