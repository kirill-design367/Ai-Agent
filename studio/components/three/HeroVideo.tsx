"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

/*
  Hero video scroll-scrub (Bible technique #74, mojito pattern). The MacBook→
  iPhone morph render is seeked by scroll: scroll position drives video
  currentTime, so the user "plays" the transformation by scrolling. Poster =
  the macbook still for instant paint + reduced-motion / slow-device fallback.
  Muted + playsInline = required for autoplay/seek on iOS.
*/
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useGSAP(() => {
    registerGsap();
    const v = videoRef.current;
    if (!v) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // poster stays, no scrub

    const setup = () => {
      gsap.to(v, {
        currentTime: v.duration || 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    };

    if (v.readyState >= 1) setup();
    else v.addEventListener("loadedmetadata", setup, { once: true });
  }, []);

  return (
    <video
      ref={videoRef}
      src="/hero/macbook-to-iphone.mp4"
      poster="/hero/macbook-still.jpg"
      muted
      playsInline
      preload="auto"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}
