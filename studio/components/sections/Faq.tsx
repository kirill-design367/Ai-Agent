"use client";

import { useRef, useState } from "react";
import Reveal from "@/components/kit/Reveal";

/*
  FAQ — editorial accordion with a human voice (Bible III.10). Deliberately the
  quiet scene before the finale (minimum motion) — gentle height expand, no "+"
  noise beyond a rotating mark. Calm = control = trust.
*/
const FAQ = [
  ["Что если мне не понравится результат?", "Согласуем концепцию до старта вёрстки — вы видите направление заранее. Правки в течение 14 дней после сдачи бесплатны."],
  ["Вы работаете по договору?", "Да. Договор, чёткие сроки, этапы и предоплата по согласованию — всё прозрачно."],
  ["Что значит «пожизненная гарантия»?", "Если на сайте что-то перестало работать по моей части — чиню бесплатно, сколько бы времени ни прошло."],
  ["Могу ли я сам редактировать сайт?", "Да. Передаю инструкцию, а при необходимости — простую панель для правок текста и картинок."],
  ["Что если у меня нет текстов и фото?", "Помогу со структурой и текстами, подскажу по фото. Пустой лист — не проблема."],
  ["Как происходит оплата?", "Обычно предоплата и остаток по готовности. Удобный способ обсудим — работаю с физлицами и компаниями."],
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const inner = useRef<HTMLDivElement>(null);

  return (
    <div className="faq-item" data-open={open}>
      <button className="faq-q" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <span className="faq-mark" aria-hidden>＋</span>
      </button>
      <div
        className="faq-a"
        style={{ height: open ? inner.current?.scrollHeight ?? "auto" : 0 }}
      >
        <div className="faq-a-inner" ref={inner}>{a}</div>
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <section
      id="faq"
      style={{
        position: "relative",
        background: "var(--bg-base)",
        padding: "clamp(5rem, 14vh, 12rem) clamp(1.5rem, 8vw, 10rem)",
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
            marginBottom: "clamp(2rem, 6vh, 4rem)",
          }}
        >
          Вопросы, которые обычно задают
        </span>
      </Reveal>
      <div style={{ maxWidth: "60rem" }}>
        {FAQ.map(([q, a]) => (
          <Item key={q} q={q} a={a} />
        ))}
      </div>
    </section>
  );
}
