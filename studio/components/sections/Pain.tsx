"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

const PainCanvas = dynamic(() => import("@/components/three/PainCanvas"), {
  ssr: false,
});

// The objections (user's brief, phrased as hits — Bible III.3.8). Placeholder
// copy, easy to edit. Resolve line switches to the serif "voice" of the master.
const OBJECTIONS = [
  "2 месяца ожидания",
  "Шаблон с чужими фото",
  "Три менеджера — и ни одного ответа",
  "Правки неделями",
];

/*
  БОЛЬ — "удушающая теснота с ударным ритмом" (Bible III.3). The tunnel pulls
  the user through a void while objections rush at them out of the dark, one by
  one, with heavy pauses. Then light returns and "Я работаю иначе" breaks the
  tension (the single legitimate air-after-tightness moment). Scroll-scrubbed.
*/
export default function Pain() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#pain",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      const phrases = gsap.utils.toArray<HTMLElement>(".pain-phrase");
      phrases.forEach((el, i) => {
        // come at the viewer: far+blurred → sharp+centred → past+oversized
        tl.fromTo(
          el,
          { opacity: 0, scale: 0.55, filter: "blur(14px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", ease: "power2.out", duration: 0.55 },
          i
        ).to(
          el,
          { opacity: 0, scale: 1.8, filter: "blur(8px)", ease: "power2.in", duration: 0.55 },
          i + 0.5
        );
      });

      // light returns + resolve line rises
      tl.fromTo(".pain-flash", { opacity: 0 }, { opacity: 1, duration: 0.4 }, phrases.length - 0.2)
        .fromTo(
          ".pain-resolve",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, ease: "expo.out", duration: 1 },
          phrases.length
        );
    },
    { scope }
  );

  return (
    <section
      id="pain"
      ref={scope}
      className="theme-dark"
      style={{ position: "relative", height: "420vh", background: "#0a0a0b" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        <PainCanvas />

        {/* soft light that returns on resolve */}
        <div
          className="pain-flash"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            background:
              "radial-gradient(60% 50% at 50% 50%, rgba(244,242,238,0.16), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* objection phrases (stacked, choreographed by scroll) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
            padding: "0 1.5rem",
          }}
        >
          {OBJECTIONS.map((t) => (
            <p
              key={t}
              className="pain-phrase"
              style={{
                gridArea: "1 / 1",
                margin: 0,
                opacity: 0,
                textAlign: "center",
                fontFamily: "var(--font-body), system-ui, sans-serif",
                fontWeight: 600,
                fontSize: "clamp(1.8rem, 5vw, 3.4rem)",
                letterSpacing: "-0.01em",
                color: "var(--text-on-dark)",
              }}
            >
              {t}
            </p>
          ))}

          {/* resolve — the master's serif voice, air after tightness */}
          <p
            className="pain-resolve"
            style={{
              gridArea: "1 / 1",
              margin: 0,
              opacity: 0,
              textAlign: "center",
              fontFamily: "var(--font-display), Georgia, serif",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: "clamp(2.4rem, 7vw, 5rem)",
              letterSpacing: "-0.02em",
              color: "#f4f2ee",
            }}
          >
            Я работаю иначе
          </p>
        </div>
      </div>
    </section>
  );
}
