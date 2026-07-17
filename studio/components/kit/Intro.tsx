"use client";

import { useCallback, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { registerGsap } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import { isHeavyCapable } from "@/lib/deviceTier";

/*
  INTRO — короткий видео-прелоадер (макс ~1.5с) с растворением.
  Показывается ТОЛЬКО при первом визите за сессию и НЕ показывается рекламному
  трафику (есть utm_source) — там оффер виден мгновенно. Есть кнопка «Пропустить».
*/

/** Пропускать интро: рекламный трафик (utm_source), повторный визит за сессию,
 *  либо системная просьба уменьшить движение. SSR-безопасно. */
export function shouldSkipIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).has("utm_source")) return true;
    if (sessionStorage.getItem("aurea-intro-seen")) return true;
  } catch {
    /* приватный режим — просто покажем интро */
  }
  // Лёгкий тир (мобильные, слабое железо, save-data, reduced-motion) — без интро:
  // герой виден мгновенно, LCP не ждёт видео-прелоадер (§1а/§1б, бюджет главной).
  return !isHeavyCapable();
}

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const [lift, setLift] = useState(false);
  const [gone, setGone] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.documentElement.classList.add("intro-done");
    try {
      sessionStorage.setItem("aurea-intro-seen", "1");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("aurea:revealed"));
    setLift(true);
    window.setTimeout(() => setGone(true), 520);
  }, []);

  useGSAP(
    () => {
      registerGsap();
      // рекламный трафик / повтор / reduced-motion — сразу контент (без вспышки,
      // т.к. layout-effect отрабатывает до пейнта)
      if (shouldSkipIntro()) {
        doneRef.current = true;
        document.documentElement.classList.add("intro-done");
        try {
          sessionStorage.setItem("aurea-intro-seen", "1");
        } catch {
          /* ignore */
        }
        window.dispatchEvent(new Event("aurea:revealed"));
        setGone(true);
        return;
      }

      // короткое интро: жёсткий потолок 1.5с (что раньше — конец видео / потолок)
      const cap = window.setTimeout(finish, 1500);
      const vid = vidRef.current;
      if (vid) {
        vid.playbackRate = 2.6; // ускоряем сборку логотипа
        vid.addEventListener("ended", finish, { once: true });
        vid.play().catch(finish);
      } else {
        finish();
      }
      return () => clearTimeout(cap);
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
      <button type="button" className="intro-skip" onClick={finish}>
        Пропустить
      </button>
    </div>
  );
}
