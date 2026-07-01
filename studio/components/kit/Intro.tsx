"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { registerGsap } from "@/lib/gsap";
import { asset } from "@/lib/asset";

/*
  INTRO — видео-прелоадер (4 с, H264, ~152KB).
  Видео играет один раз по центру; по окончании шторка уходит вверх.
  На десктопе видео уменьшено (не во весь экран), на мобиле — крупнее.
*/
export default function Intro() {
  const root   = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
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

      const vid = vidRef.current;
      if (!vid) { finish(); return; }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }

      // видео закончилось → уводим шторку
      vid.addEventListener("ended", finish, { once: true });

      // fallback: если видео не воспроизвелось за 5 с — всё равно показываем сайт
      const fallback = window.setTimeout(finish, 5000);
      vid.addEventListener("ended", () => clearTimeout(fallback), { once: true });

      vid.play().catch(() => finish());
    },
    { scope: root }
  );

  if (gone) return null;

  return (
    <div className="intro" data-lift={lift} ref={root}>
      <video
        ref={vidRef}
        className="intro-video"
        src={asset("/preloader.mp4")}
        muted
        playsInline
        autoPlay
        preload="auto"
        aria-hidden
      />
    </div>
  );
}
