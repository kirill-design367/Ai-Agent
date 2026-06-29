"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

/*
  INTRO — "From Origin to Excellence. Every masterpiece follows the same path."
  A 3–4s film that births the AUREA mark from a single golden point:
    point (breathing) → line → triangle → A (triangle + golden dot) → AUREA.
  Then the curtain lifts into the Hero. Calm, not flashy — beautiful.
  (Aurea = "golden" — hence the warm origin point.)
*/
const TRI = "45,8 86,92 4,92"; // leading "A" = triangle
const PERIM = 258; // ~triangle perimeter for the draw-on

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [lift, setLift] = useState(false);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      registerGsap();
      const letters = gsap.utils.toArray<HTMLElement>(".intro-letter");

      const finish = () => {
        setLift(true);
        window.setTimeout(() => setGone(true), 1100);
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([".intro-fill", ".intro-dot"], { opacity: 1, scale: 1 });
        gsap.set(letters, { opacity: 1, y: 0 });
        window.setTimeout(finish, 900);
        return;
      }

      // initial states — only the golden point exists; everything else hidden.
      // The mark + word build in place (centred as the whole word) — no measuring.
      gsap.set(".intro-point", { scale: 0, transformOrigin: "center" });
      gsap.set(".intro-line", { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(".intro-stroke", { strokeDasharray: PERIM, strokeDashoffset: PERIM });
      gsap.set(".intro-fill", { opacity: 0, scale: 0.92, transformOrigin: "50% 75%" });
      gsap.set(".intro-dot", { scale: 0, transformOrigin: "center" });
      gsap.set(letters, { opacity: 0, y: 26 });

      const tl = gsap.timeline({ onComplete: finish });

      // 1 — a single golden point appears and breathes once
      tl.to(".intro-point", { scale: 1, duration: 0.5, ease: "power2.out" })
        .to(".intro-point", {
          scale: 1.3,
          duration: 0.42,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        })
        // 2 — the point grows into a line
        .to(".intro-line", { scaleY: 1, duration: 0.6, ease: "expo.out" }, "+=0.05")
        .to(".intro-point", { opacity: 0, duration: 0.35 }, "<")
        // 3 — the line spreads into a triangle (drawn)
        .to(".intro-stroke", { strokeDashoffset: 0, duration: 0.9, ease: "expo.out" }, "-=0.15")
        .to(".intro-line", { opacity: 0, duration: 0.35 }, "<")
        // 4 — the structure solidifies; a golden point appears inside → the "A"
        .to(".intro-fill", { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }, "+=0.05")
        .to(".intro-stroke", { opacity: 0, duration: 0.45 }, "<")
        .to(".intro-dot", { scale: 1, duration: 0.55, ease: "back.out(2)" }, "<0.1")
        // 5 — AUREA assembles: the rest of the word rises in beside the mark
        .to(letters, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.06 }, "+=0.2")
        .to(".intro-tagline", { opacity: 1, duration: 0.6 }, "<0.2")
        .to({}, { duration: 0.5 }); // hold before the lift
    },
    { scope: root }
  );

  if (gone) return null;

  return (
    <div className="intro" data-lift={lift} ref={root}>
      <div className="intro-stage">
        <svg className="intro-mark" viewBox="0 0 90 100" aria-hidden>
          {/* solid A (revealed last) */}
          <polygon className="intro-fill" points={TRI} fill="#f4f2ee" />
          {/* triangle outline (drawn during origin) */}
          <polygon
            className="intro-stroke"
            points={TRI}
            fill="none"
            stroke="#f4f2ee"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* the growing line */}
          <line
            className="intro-line"
            x1="45"
            y1="8"
            x2="45"
            y2="92"
            stroke="var(--gold)"
            strokeWidth="3.5"
          />
          {/* the inner golden dot — the soul of the A */}
          <circle className="intro-dot" cx="45" cy="74" r="8" fill="var(--gold)" />
          {/* the origin point */}
          <circle className="intro-point" cx="45" cy="55" r="5.5" fill="var(--gold)" />
        </svg>

        <div className="intro-word" aria-label="AUREA">
          {"UREA".split("").map((c, i) => (
            <span key={i} className="intro-letter">
              {c}
            </span>
          ))}
        </div>
      </div>
      <p className="intro-tagline">From Origin to Excellence</p>
    </div>
  );
}
