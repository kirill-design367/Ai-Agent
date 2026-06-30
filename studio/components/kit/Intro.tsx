"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";
import { asset } from "@/lib/asset";

/*
  INTRO — бренд рождается из точки:
  точка → линия → треугольник → знак → логотип → шторка вверх.
  Кадры — реальные изображения логотипа, GSAP кроссфейдит их одно за другим.
*/
const FRAMES = [
  { src: asset("/brand/intro/01-dot.webp"),      key: "dot"      },
  { src: asset("/brand/intro/02-line.webp"),     key: "line"     },
  { src: asset("/brand/intro/03-triangle.webp"), key: "triangle" },
  { src: asset("/brand/intro/04-mark.webp"),     key: "mark"     },
  { src: asset("/brand/intro/05-logo.webp"),     key: "logo"     },
];

// timings per frame: [fadeIn, hold, fadeOut] in seconds.
// Сжато ~вдвое — прелоадер был ~5.2с и держал LCP; теперь ~2.4с (быстрее, но кино).
const TIMING = [
  [0.16, 0.14, 0.12],  // dot
  [0.14, 0.10, 0.12],  // line
  [0.16, 0.14, 0.12],  // triangle
  [0.18, 0.24, 0.14],  // mark — кульминация
  [0.24, 0.45,    0],  // logo — без затухания, уходит со шторкой
];

export default function Intro() {
  const root  = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [lift, setLift] = useState(false);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      registerGsap();

      const finish = () => {
        setLift(true);
        document.documentElement.classList.add("intro-done");
        window.dispatchEvent(new Event("aurea:revealed"));
        window.setTimeout(() => setGone(true), 1200);
      };

      const frames = gsap.utils.toArray<HTMLElement>(".intro-frame");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(frames[frames.length - 1], { opacity: 1 });
        window.setTimeout(finish, 600);
        return;
      }

      gsap.set(frames, { opacity: 0 });

      const tl = gsap.timeline({ onComplete: finish });

      FRAMES.forEach((_, i) => {
        const [fadeIn, hold, fadeOut] = TIMING[i];
        const isLast = i === FRAMES.length - 1;

        // Before the logo fades in — expand to wide format (px, GSAP can't handle min())
        if (isLast && stage.current) {
          const vw = window.innerWidth;
          const targetW = Math.min(520, vw * 0.88);
          const targetH = Math.min(148, vw * 0.27);
          tl.to(stage.current, {
            width: targetW,
            height: targetH,
            duration: 0.3,
            ease: "power2.inOut",
          });
        }

        tl.to(frames[i], { opacity: 1, duration: fadeIn, ease: "power2.inOut" });
        if (hold > 0) tl.to({}, { duration: hold });
        if (fadeOut > 0) {
          tl.to(frames[i], { opacity: 0, duration: fadeOut, ease: "power2.in" });
        }
      });
    },
    { scope: root }
  );

  if (gone) return null;

  return (
    <div className="intro" data-lift={lift} ref={root}>
      <div className="intro-frames" ref={stage}>
        {FRAMES.map((f) => (
          <img
            key={f.key}
            src={f.src}
            alt=""
            className="intro-frame"
            aria-hidden
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}
