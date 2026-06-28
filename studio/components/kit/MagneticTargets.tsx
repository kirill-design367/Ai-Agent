"use client";

import { useEffect } from "react";

/*
  Magnetic CTAs (Bible II.12.2 / IV.16.4 / V.49). Any element with
  `data-magnetic` is softly pulled toward the cursor (<=14px, spring return).
  Translation is applied via CSS vars (--mag-x/--mag-y) so it composes with
  the element's own hover transform instead of fighting it. Off on touch.
*/
export default function MagneticTargets() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const STRENGTH = 0.32; // fraction of cursor offset applied
    const MAX = 14; // px clamp — big buttons don't slide away

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-magnetic]")
    );
    const cleanups: Array<() => void> = [];

    for (const el of targets) {
      let raf = 0;
      let cx = 0;
      let cy = 0;
      let tx = 0;
      let ty = 0;

      const apply = () => {
        tx += (cx - tx) * 0.25;
        ty += (cy - ty) * 0.25;
        el.style.setProperty("--mag-x", `${tx.toFixed(2)}px`);
        el.style.setProperty("--mag-y", `${ty.toFixed(2)}px`);
        if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
          raf = requestAnimationFrame(apply);
        } else {
          raf = 0;
        }
      };

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        cx = Math.max(-MAX, Math.min(MAX, dx * STRENGTH));
        cy = Math.max(-MAX, Math.min(MAX, dy * STRENGTH));
        if (!raf) raf = requestAnimationFrame(apply);
      };

      const onLeave = () => {
        cx = 0;
        cy = 0;
        if (!raf) raf = requestAnimationFrame(apply);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        if (raf) cancelAnimationFrame(raf);
        el.style.removeProperty("--mag-x");
        el.style.removeProperty("--mag-y");
      });
    }

    return () => cleanups.forEach((c) => c());
  }, []);

  return null;
}
