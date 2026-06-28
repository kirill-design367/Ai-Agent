"use client";

import dynamic from "next/dynamic";
import SplitReveal from "@/components/kit/SplitReveal";

// R3F/WebGL is client-only — never SSR the canvas.
const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), {
  ssr: false,
});

/*
  HERO — wow-first (user's directive), cinematic 3D device + bold MIXED
  typography (serif × grotesk, scale contrast). The #hero block is tall so the
  R3F rig has scroll room to open + spin the device. Offer + price stay legible
  over the canvas (premium clarity, Bible L.152-153).
*/
export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        height: "200vh", // scroll room for the device open/spin rig
        background: "var(--bg-dark)",
        color: "var(--text-on-dark)",
      }}
    >
      {/* Pinned cinematic frame */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <HeroCanvas />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 clamp(1.5rem, 6vw, 8rem)",
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-sm)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "var(--space-md)",
            }}
          >
            Веб-студия · один мастер · чистый код
          </p>

          {/* Mixed typography: serif display + accent grotesk word */}
          <SplitReveal
            as="h1"
            type="words,chars"
            stagger={0.04}
            className="hero-title"
          >
            Сайт за 1–5 дней
          </SplitReveal>

          <p
            style={{
              maxWidth: "34ch",
              marginTop: "var(--space-lg)",
              fontSize: "var(--text-lg)",
              color: "rgba(244,242,238,0.78)",
            }}
          >
            Уникальный дизайн на чистом коде. Без шаблонов, без посредников,
            с&nbsp;пожизненной гарантией. <strong>От 30&nbsp;000&nbsp;₽.</strong>
          </p>

          <div
            style={{
              display: "flex",
              gap: "var(--space-md)",
              marginTop: "var(--space-xl)",
              pointerEvents: "auto",
            }}
          >
            <a href="#contact" className="btn btn--primary" data-magnetic>
              Обсудить проект
            </a>
            <a href="#work" className="btn btn--ghost" data-magnetic>
              Смотреть работы
            </a>
          </div>

          <p
            style={{
              marginTop: "var(--space-3xl)",
              fontSize: "var(--text-xs)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            7 лет опыта · 100+ проектов · от 1 дня · пожизненная гарантия
          </p>
        </div>
      </div>
    </section>
  );
}
