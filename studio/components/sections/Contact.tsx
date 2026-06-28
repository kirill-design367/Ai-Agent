"use client";

import { useState } from "react";
import SplitReveal from "@/components/kit/SplitReveal";

/*
  ФИНАЛ — "кольцевой манифест с формой-разговором" (Bible III.11). Rings back to
  the Hero (same serif voice, dark, air). The form is a human conversation, not
  a cold box: few fields, soft validation, dignified success state. Telegram /
  WhatsApp alongside (РФ, L.156). No "ЖМИ СЕЙЧАС", no pressure.
*/
export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section
      id="contact"
      className="theme-dark"
      style={{
        position: "relative",
        background: "#0a0a0b",
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "clamp(5rem, 14vh, 12rem) clamp(1.5rem, 8vw, 10rem)",
        textAlign: "center",
      }}
    >
      <div className="aurora" aria-hidden style={{ opacity: 0.35 }}>
        <span />
        <span />
        <span />
      </div>

      <div style={{ position: "relative", width: "min(40rem, 92vw)" }}>
        {!sent ? (
          <>
            <p style={{ fontSize: "var(--text-sm)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "var(--space-md)" }}>
              Расскажите о проекте — отвечу в течение 2 часов
            </p>
            <SplitReveal as="h2" type="words,chars" stagger={0.03} onScroll className="hero-title" >
              Сделаем ваш сайт
            </SplitReveal>

            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              style={{ marginTop: "clamp(2rem, 6vh, 4rem)", display: "flex", flexDirection: "column", gap: "var(--space-md)", textAlign: "left" }}
            >
              <input className="field" name="name" placeholder="Как вас зовут?" required autoComplete="name" />
              <input className="field" name="contact" placeholder="Телефон или Telegram для связи" required />
              <textarea className="field" name="message" placeholder="Что нужно сделать? (пара слов о бизнесе)" rows={3} />
              <button type="submit" className="btn btn--primary" data-magnetic style={{ alignSelf: "flex-start" }}>
                Обсудить проект
              </button>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                🔒 Никакого спама. Нажимая кнопку, вы соглашаетесь на обработку данных.
              </p>
            </form>

            <div style={{ marginTop: "var(--space-xl)", display: "flex", gap: "var(--space-md)", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://t.me/" target="_blank" rel="noopener" className="btn btn--ghost" data-magnetic>Telegram</a>
              <a href="https://wa.me/" target="_blank" rel="noopener" className="btn btn--ghost" data-magnetic>WhatsApp</a>
            </div>
          </>
        ) : (
          <div>
            <SplitReveal as="h2" type="words" stagger={0.06} className="hero-title">
              Заявка принята
            </SplitReveal>
            <p style={{ marginTop: "var(--space-lg)", fontSize: "var(--text-lg)", color: "rgba(244,242,238,0.78)" }}>
              Спасибо за доверие. Я свяжусь с вами в течение 2 часов.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
