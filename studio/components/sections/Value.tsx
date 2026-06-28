"use client";

import Reveal from "@/components/kit/Reveal";

/*
  ЧТО ПОЛУЧАЕТЕ — "три созвездия ценности" in an editorial list, NOT cards
  (Bible III.5 / IV.15.1 forbids the 3×3 icon-grid). 9 items grouped into 3
  meaningful constellations; "Пожизненная гарантия" is pulled out as the climax
  (isolation = importance, I.6.1). Single-column editorial reads premium on BOTH
  phone and desktop (mobile-first, 50/50).
*/
const GROUPS = [
  {
    label: "Дизайн и скорость",
    items: [
      ["Уникальный дизайн", "не шаблон с биржи — собран под ваш бизнес"],
      ["Загрузка меньше секунды", "чистый код, PageSpeed 90+"],
    ],
  },
  {
    label: "Видимость",
    items: [
      ["Адаптив", "телефон, планшет, ПК — везде «вау»"],
      ["SEO-оптимизация", "базовая разметка, чтобы вас находили"],
      ["Яндекс.Метрика", "подключена и настроена"],
    ],
  },
  {
    label: "Спокойствие",
    items: [
      ["Размещение на хостинге", "запускаем под ключ"],
      ["Инструкция", "как пользоваться сайтом"],
      ["Правки 14 дней", "бесплатно после сдачи"],
    ],
  },
];

export default function Value() {
  return (
    <section
      id="value"
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
          Что вы получаете
        </span>
      </Reveal>

      <div style={{ maxWidth: "70rem" }}>
        {GROUPS.map((group, gi) => (
          <div
            key={group.label}
            style={{
              marginBottom: "clamp(3rem, 8vh, 6rem)",
              // gentle broken-grid offset on desktop, flush on mobile
              paddingLeft: `clamp(0rem, ${gi * 4}vw, ${gi * 3}rem)`,
            }}
          >
            <Reveal as="p" direction="up">
              <span
                style={{
                  display: "block",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: "var(--accent)",
                  marginBottom: "var(--space-md)",
                }}
              >
                {group.label}
              </span>
            </Reveal>

            {group.items.map(([title, note], i) => (
              <Reveal key={title} direction="up" delay={i * 80}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    gap: "0.4rem 1.2rem",
                    padding: "var(--space-md) 0",
                    borderTop:
                      i === 0 ? "none" : "1px solid var(--border-soft)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display), Georgia, serif",
                      fontSize: "clamp(1.6rem, 5.5vw, 2.75rem)",
                      fontWeight: 500,
                      lineHeight: 1.1,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {title}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-base)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {note}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        ))}
      </div>

      {/* climax — the guarantee, isolated in air, the master's serif "oath" */}
      <Reveal direction="up">
        <div
          style={{
            marginTop: "clamp(3rem, 10vh, 8rem)",
            paddingTop: "clamp(2.5rem, 6vh, 4rem)",
            borderTop: "1px solid var(--border-strong)",
            textAlign: "center",
          }}
        >
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
            и сверх всего
          </span>
          <span
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "clamp(2.6rem, 9vw, 6rem)",
              fontWeight: 500,
              fontStyle: "italic",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Пожизненная гарантия
          </span>
          <span
            style={{
              display: "block",
              marginTop: "var(--space-md)",
              fontSize: "var(--text-lg)",
              color: "var(--text-secondary)",
            }}
          >
            работоспособности вашего сайта
          </span>
        </div>
      </Reveal>
    </section>
  );
}
