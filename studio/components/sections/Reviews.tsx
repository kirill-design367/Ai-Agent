"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

/*
  ОТЗЫВЫ — большие цитаты-развороты (Bible III.9), NOT a card carousel. Dark,
  warm, cinematic: aurora glow drifts behind, quotes cross-fade by scroll, big
  serif "voice in the quiet". PLACEHOLDER copy — replace with real reviews
  (name, niche, concrete result) when available.
*/
const REVIEWS = [
  {
    quote: "Кирилл сделал лендинг за 2 дня. Запустили рекламу — первая заявка пришла через час.",
    author: "Алексей Н.",
    meta: "загородные дома · Краснодар",
  },
  {
    quote: "Сайт окупился за месяц в 8 раз. До сих пор не верю, что так быстро и так красиво.",
    author: "Марина В.",
    meta: "бьюти-студия · Москва",
  },
  {
    quote: "Думал, фрилансер — это риск. Получил уровень выше студии, за которую просили вдвое больше.",
    author: "Дмитрий К.",
    meta: "логистика · Санкт-Петербург",
  },
];

export default function Reviews() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const items = gsap.utils.toArray<HTMLElement>(".rev-item");
      gsap.set(items[0], { opacity: 1, y: 0 });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: "#reviews", start: "top top", end: "bottom bottom", scrub: 1 },
      });
      items.forEach((el, i) => {
        if (i === 0) return;
        tl.to(items[i - 1], { opacity: 0, y: -50, ease: "power2.in", duration: 0.4 }, i - 1)
          .fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: "expo.out", duration: 0.5 }, i - 0.6);
      });
    },
    { scope }
  );

  return (
    <section
      id="reviews"
      ref={scope}
      className="theme-dark"
      style={{ position: "relative", height: "320vh", background: "#0a0a0b" }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "grid", placeItems: "center" }}>
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>

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
          Что говорят клиенты
        </p>

        <div style={{ position: "relative", width: "min(60rem, 86vw)", padding: "0 1.5rem" }}>
          {REVIEWS.map((r) => (
            <figure
              key={r.author}
              className="rev-item"
              style={{ position: "absolute", inset: 0, margin: 0, opacity: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}
            >
              <blockquote
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display), Georgia, serif",
                  fontSize: "clamp(1.7rem, 4.5vw, 3.2rem)",
                  fontWeight: 500,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  color: "var(--text-on-dark)",
                }}
              >
                «{r.quote}»
              </blockquote>
              <figcaption style={{ marginTop: "var(--space-xl)" }}>
                <span style={{ display: "block", fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-on-dark)" }}>
                  {r.author}
                </span>
                <span style={{ fontSize: "var(--text-sm)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>
                  {r.meta}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
