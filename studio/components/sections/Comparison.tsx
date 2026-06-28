"use client";

import Reveal from "@/components/kit/Reveal";

/*
  СРАВНЕНИЕ — "раздвоенный мир" (Bible III.8), NOT a checkmark table (forbidden,
  VI.121). Two atmospheres: "Со мной" is bold, full, primary; "Студия" is muted,
  faint, set back — the asymmetry itself is the argument (the "Я" side carries
  more weight). No aggression — calm superiority. Self-labelling cells collapse
  cleanly to one column on mobile.
*/
const ROWS = [
  ["Срок", "1–5 дней", "1–3 месяца"],
  ["Общение", "Напрямую со мной", "Менеджер → дизайнер → разработчик"],
  ["Код", "Чистый, уникальный", "Часто шаблон или конструктор"],
  ["Правки", "Быстро, без бюрократии", "Очередь и согласования"],
  ["Цена", "Честная, без накруток за офис", "+30–50% за офис и штат"],
  ["Гарантия", "Пожизненная", "1–12 месяцев"],
];

export default function Comparison() {
  return (
    <section
      id="compare"
      style={{
        position: "relative",
        background: "var(--bg-base)",
        padding:
          "clamp(5rem, 14vh, 12rem) clamp(1.5rem, 8vw, 10rem) clamp(4rem, 10vh, 9rem)",
      }}
    >
      <Reveal as="p" direction="up">
        <span
          style={{
            display: "block",
            fontSize: "var(--text-sm)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
            marginBottom: "clamp(2.5rem, 8vh, 6rem)",
          }}
        >
          Со мной или студия — разница видна сразу
        </span>
      </Reveal>

      <div style={{ maxWidth: "72rem" }}>
        {ROWS.map(([crit, me, studio], i) => (
          <Reveal key={crit} direction="up" delay={i * 70}>
            <div
              style={{
                padding: "clamp(1.4rem, 4vh, 2.4rem) 0",
                borderTop: "1px solid var(--border-soft)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                {crit}
              </span>

              <div className="cmp-pair">
                {/* Со мной — dominant */}
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    Со мной
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display), Georgia, serif",
                      fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
                      fontWeight: 500,
                      lineHeight: 1.15,
                      color: "var(--text-primary)",
                    }}
                  >
                    {me}
                  </span>
                </div>

                {/* Студия — muted, set back */}
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    Веб-студия
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-lg)",
                      lineHeight: 1.3,
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {studio}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
