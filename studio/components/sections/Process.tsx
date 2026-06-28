"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

// 4 steps from the brief (Bible III.4). Placeholder copy, easy to edit.
const STEPS = [
  {
    n: "01",
    title: "Вы пишете мне",
    text: "Рассказываете о бизнесе в свободной форме. 15 минут — и я всё понял.",
  },
  {
    n: "02",
    title: "Я предлагаю концепцию",
    text: "Структура, стиль и тексты — за 24 часа. Без брифов на 40 страниц.",
  },
  {
    n: "03",
    title: "Согласовываем",
    text: "Правки напрямую со мной, без менеджеров и очередей. Быстро.",
  },
  {
    n: "04",
    title: "Сайт готов",
    text: "Через 1–5 дней, размещён на хостинге, с инструкцией. Можно запускать.",
  },
];

/*
  КАК Я РАБОТАЮ — sticky-путешествие с прорисовкой линии-пути (Bible III.4).
  Light & airy — deliberate contrast after the dark tunnel (light↔dark, VI.135).
  A vertical line draws as you scroll; steps cross-fade one at a time; the big
  editorial number switches. Scroll-scrubbed, DOM+GSAP (no WebGL — variety).
*/
export default function Process() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const steps = gsap.utils.toArray<HTMLElement>(".proc-step");
      // first step visible by default
      gsap.set(steps[0], { opacity: 1, y: 0 });

      if (reduce) {
        gsap.set(steps, { opacity: 1, y: 0 });
        gsap.set(".proc-line-draw", { scaleY: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#process",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      // line draws across the whole scene
      tl.fromTo(".proc-line-draw", { scaleY: 0 }, { scaleY: 1, ease: "none" }, 0);

      // cross-fade steps: out current, in next
      steps.forEach((el, i) => {
        if (i === 0) return;
        const at = i - 1;
        tl.to(steps[i - 1], { opacity: 0, y: -40, ease: "power2.in", duration: 0.4 }, at)
          .fromTo(
            el,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, ease: "expo.out", duration: 0.5 },
            at + 0.4
          );
      });
    },
    { scope }
  );

  return (
    <section
      id="process"
      ref={scope}
      style={{ position: "relative", height: "400vh", background: "var(--bg-base)" }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(1.5rem, 8vw, 10rem)",
        }}
      >
        <p
          style={{
            position: "absolute",
            top: "clamp(3rem, 10vh, 7rem)",
            left: "clamp(1.5rem, 8vw, 10rem)",
            fontSize: "var(--text-sm)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}
        >
          Как я работаю — просто, быстро, с вами
        </p>

        {/* line-path (the "прямой путь без посредников" metaphor) */}
        <div
          aria-hidden
          style={{
            position: "relative",
            width: 2,
            height: "46vh",
            background: "var(--border-soft)",
            marginRight: "clamp(2rem, 6vw, 6rem)",
            flex: "none",
          }}
        >
          <div
            className="proc-line-draw"
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--accent)",
              transformOrigin: "top",
              transform: "scaleY(0)",
            }}
          />
        </div>

        {/* steps (stacked, cross-faded) */}
        <div style={{ position: "relative", flex: 1, minHeight: "40vh" }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="proc-step"
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display), Georgia, serif",
                  fontSize: "clamp(4rem, 12vw, 9rem)",
                  fontWeight: 500,
                  lineHeight: 1,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.03em",
                }}
              >
                {s.n}
              </span>
              <h3
                style={{
                  margin: "var(--space-md) 0 var(--space-sm)",
                  fontSize: "var(--text-2xl)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  maxWidth: "32ch",
                  fontSize: "var(--text-lg)",
                  color: "var(--text-secondary)",
                }}
              >
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
