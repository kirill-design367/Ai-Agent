"use client";

import Reveal from "@/components/kit/Reveal";

/*
  ЦЕНЫ — "сдержанный прайс-манифест с осью восхождения" (Bible III.6). NOT a
  column/card price table (forbidden, III.6.3 / VI.121). Tariffs ascend simple →
  complex; price is shown openly and with dignity (РФ: видимая цена = доверие,
  L.154). No timers, no "осталось мест", no pressure. Tonal bg (bg-sunken) shifts
  the atmosphere after two light scenes. Mobile-first: rows stack cleanly.
*/
const TARIFFS = [
  ["Сайт-визитка", "1 день", "от 20 000 ₽", "одностраничный — первое присутствие"],
  ["Лендинг", "1–3 дня", "от 30 000 ₽", "продающая страница под одну цель"],
  ["Корпоративный сайт", "3–5 дней", "от 60 000 ₽", "разделы, структура, доверие"],
  ["Интернет-магазин", "5–7 дней", "от 90 000 ₽", "каталог, корзина, оплата"],
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        position: "relative",
        background: "var(--bg-sunken)",
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
          Цены — прозрачно, без сюрпризов
        </span>
      </Reveal>

      <div style={{ maxWidth: "72rem" }}>
        {TARIFFS.map(([name, term, price, note], i) => (
          <Reveal key={name} direction="up" delay={i * 90}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "0.6rem 2rem",
                padding: "clamp(1.5rem, 4vh, 2.6rem) 0",
                borderTop: "1px solid var(--border-soft)",
                // ascending indent — the "восхождение" axis (collapses on mobile)
                paddingLeft: `clamp(0rem, ${i * 3}vw, ${i * 2.4}rem)`,
              }}
            >
              <div style={{ flex: "1 1 16rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display), Georgia, serif",
                    fontSize: "clamp(1.7rem, 5.5vw, 3rem)",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    color: "var(--text-primary)",
                    display: "block",
                    lineHeight: 1.1,
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    fontSize: "var(--text-base)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {note} · <span style={{ color: "var(--text-tertiary)" }}>{term}</span>
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body), system-ui, sans-serif",
                  fontSize: "clamp(1.4rem, 4.5vw, 2.2rem)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {price}
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Редизайн — different nature, set apart as a side offer (III.6.5) */}
      <Reveal direction="up">
        <div
          style={{
            marginTop: "clamp(2.5rem, 7vh, 5rem)",
            padding: "var(--space-lg)",
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-base)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "0.6rem 2rem",
            maxWidth: "72rem",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-display), Georgia, serif",
                fontSize: "clamp(1.4rem, 4.5vw, 2rem)",
                fontWeight: 500,
                color: "var(--text-primary)",
                display: "block",
              }}
            >
              Редизайн
            </span>
            <span style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)" }}>
              вдохнуть жизнь в существующий сайт · 2–3 дня
            </span>
          </div>
          <span
            style={{
              fontSize: "clamp(1.3rem, 4vw, 1.9rem)",
              fontWeight: 600,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
            }}
          >
            от 25 000 ₽
          </span>
        </div>
      </Reveal>

      <Reveal direction="up">
        <div
          style={{
            marginTop: "clamp(2.5rem, 7vh, 5rem)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--space-lg)",
          }}
        >
          <p
            style={{
              margin: 0,
              maxWidth: "34ch",
              fontSize: "var(--text-lg)",
              color: "var(--text-secondary)",
            }}
          >
            Финальная стоимость зависит от объёма — обсудим за 15 минут.
          </p>
          <a href="#contact" className="btn btn--primary" data-magnetic>
            Обсудить проект
          </a>
        </div>
      </Reveal>
    </section>
  );
}
