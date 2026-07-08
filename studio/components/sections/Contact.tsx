"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, registerGsap } from "@/lib/gsap";

/*
  КОНТАКТ — финал. Не сухая форма, а предвкушение. Гигантский заголовок и живая
  форма заявки: имя + любой удобный контакт + пара слов о проекте. Сайт —
  статика (GitHub Pages, без сервера), поэтому заявка уходит прямо в Telegram
  владельцу через Bot API. Ниже — прямые каналы («мои данные»).
*/
// Заявки летят в личный Telegram владельца через его бота.
const TG_TOKEN = "8601781365:AAHWzepLoHs4l9PIJz6_HyJq2Qk4P_wxh0o";
const TG_CHAT = "6303245443";

type SendState = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [about, setAbout] = useState("");
  const [state, setState] = useState<SendState>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    const now = new Date().toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const text = [
      "🔔 Новая заявка с сайта AUREA",
      "",
      `👤 Имя: ${name || "—"}`,
      `📞 Контакт: ${contact || "—"}`,
      about ? `📝 О проекте: ${about}` : "",
      `🕒 Время: ${now} (МСК)`,
    ]
      .filter(Boolean)
      .join("\n");
    setState("sending");
    try {
      const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TG_CHAT, text }),
      });
      if (!res.ok) throw new Error("tg");
      setState("sent");
      setName("");
      setContact("");
      setAbout("");
    } catch {
      setState("error");
    }
  };

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      const split = new SplitText(title.current!, { type: "words,chars" });
      gsap.from(split.chars, {
        yPercent: 120,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: { each: 0.02, from: "start" },
        scrollTrigger: { trigger: title.current!, start: "top 82%" },
      });
      gsap.fromTo(
        ".contact-row",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".contact-row", start: "top 88%" },
        }
      );
    },
    { scope: root }
  );

  return (
    <section id="contact" className="theme-dark contact" ref={root}>
      <div className="contact-inner">
        <h2 className="contact-title" ref={title}>
          Расскажите
          <br />о проекте
        </h2>

        <p className="contact-sub contact-row">
          Идея, сроки, бюджет — в&nbsp;двух словах. Дальше придумаю я. Отвечаю
          лично, обычно в&nbsp;течение пары часов.
        </p>

        {/* форма заявки — уходит прямо в Telegram владельцу */}
        <form className="contact-form contact-row" onSubmit={submit}>
          <div className="contact-field">
            <label htmlFor="cf-name">Как вас зовут</label>
            <input
              id="cf-name"
              className="field"
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="contact-field">
            <label htmlFor="cf-contact">Любой удобный контакт</label>
            <input
              id="cf-contact"
              className="field"
              type="text"
              placeholder="Телефон, WhatsApp, Telegram или e-mail"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <div className="contact-field contact-field--wide">
            <label htmlFor="cf-about">Пара слов о проекте (по желанию)</label>
            <textarea
              id="cf-about"
              className="field"
              rows={3}
              placeholder="Что за бизнес, какой нужен сайт, сроки…"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn--primary contact-submit"
            data-magnetic
            data-state={state}
            disabled={state === "sending"}
          >
            <span className="btn-cta-label">
              {state === "sending"
                ? "Отправляю…"
                : state === "sent"
                ? "Заявка отправлена ✓"
                : state === "error"
                ? "Ошибка — напишите напрямую"
                : "Отправить заявку"}
            </span>
            <span className="btn-cta-arrow" aria-hidden>
              →
            </span>
          </button>
          {state === "sent" && (
            <p className="contact-note" role="status">
              Спасибо! Отвечу лично, обычно в&nbsp;течение пары часов.
            </p>
          )}
        </form>

        <p className="contact-or contact-row">или напишите напрямую</p>

        <div className="contact-channels contact-row">
          <a className="contact-ch" href="https://t.me/Sk_Mac1" target="_blank" rel="noopener" data-magnetic>
            <span className="contact-ch-l">Telegram</span>
            <span className="contact-ch-v">@Sk_Mac1</span>
          </a>
          <a className="contact-ch" href="https://wa.me/79185367424" target="_blank" rel="noopener" data-magnetic>
            <span className="contact-ch-l">WhatsApp</span>
            <span className="contact-ch-v">+7 918 536-74-24</span>
          </a>
          <a className="contact-ch" href="mailto:kirill0061@mail.ru" data-magnetic>
            <span className="contact-ch-l">Почта</span>
            <span className="contact-ch-v">kirill0061@mail.ru</span>
          </a>
        </div>

        <div className="contact-foot contact-row">
          <svg className="contact-geo" viewBox="0 0 80 72" aria-hidden>
            <polygon points="40,6 75,66 5,66" />
            <circle cx="40" cy="49" r="3" />
          </svg>
          <span className="contact-sign">
            AUREA — от точки до шедевра.
          </span>
        </div>
      </div>
    </section>
  );
}
