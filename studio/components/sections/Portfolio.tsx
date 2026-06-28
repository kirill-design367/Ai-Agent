"use client";

import Reveal from "@/components/kit/Reveal";

/*
  ПОРТФОЛИО — кульминация (Bible III.7). Full-bleed cinematic cases, NOT a card
  grid (forbidden, VI.80). Dark theatre; each case is a large media frame with
  an editorial caption, alternating alignment for variety (no repeated layout).
  Hover zoom = tactility. Real client screenshots. Mobile: stacks cleanly.
*/
const CASES = [
  { img: "/work/case-1.jpg", title: "Volume — After Dark", niche: "Лендинг", term: "3 дня" },
  { img: "/work/case-2.jpg", title: "Aristide", niche: "Портфолио", term: "4 дня" },
  { img: "/work/case-3.jpg", title: "Анна Рыковская", niche: "Визитка", term: "2 дня" },
  { img: "/work/case-4.png", title: "Garden Eight", niche: "Студия дизайна", term: "5 дней" },
  { img: "/work/case-5.png", title: "Dream.doll", niche: "Интернет-магазин", term: "6 дней" },
  { img: "/work/case-6.png", title: "Step into Web3", niche: "Лендинг", term: "3 дня" },
];

export default function Portfolio() {
  return (
    <section
      id="work"
      className="theme-dark"
      style={{
        position: "relative",
        background: "var(--bg-base)",
        padding: "clamp(5rem, 14vh, 12rem) 0",
      }}
    >
      <div style={{ padding: "0 clamp(1.5rem, 8vw, 10rem)" }}>
        <Reveal as="p" direction="up">
          <span
            style={{
              display: "block",
              fontSize: "var(--text-sm)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              marginBottom: "var(--space-md)",
            }}
          >
            Избранные работы
          </span>
        </Reveal>
        <Reveal as="h2" direction="up">
          <span
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "var(--text-4xl)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--text-on-dark)",
            }}
          >
            Доказательство — делом
          </span>
        </Reveal>
      </div>

      <div
        style={{
          marginTop: "clamp(3rem, 8vh, 6rem)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(4rem, 12vh, 10rem)",
        }}
      >
        {CASES.map((c, i) => (
          <Reveal key={c.title} direction="up">
            <figure
              className="case"
              style={{
                margin: 0,
                padding: "0 clamp(1.5rem, 8vw, 10rem)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-lg)",
                alignItems: i % 2 === 0 ? "flex-start" : "flex-end",
              }}
            >
              <div
                className="case-media"
                style={{
                  width: "100%",
                  maxWidth: "1100px",
                  overflow: "hidden",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-xl)",
                  border: "1px solid rgba(244,242,238,0.08)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.title}
                  loading="lazy"
                  className="case-img"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    transition: "transform 0.9s var(--ease-expo)",
                  }}
                />
              </div>
              <figcaption
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  gap: "0.6rem 1.5rem",
                  textAlign: i % 2 === 0 ? "left" : "right",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display), Georgia, serif",
                    fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
                    fontWeight: 500,
                    color: "var(--text-on-dark)",
                  }}
                >
                  {c.title}
                </span>
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {c.niche} · {c.term}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
