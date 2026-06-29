"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/*
  FAQ — снимает последние возражения перед заявкой.
  При открытии ответ СОБИРАЕТСЯ ИЗ РАЗЛЕТЕВШИХСЯ БУКВ (каждая буква прилетает из
  хаоса на место), активный вопрос подсвечивается. Буквы — React-овны спаны,
  GSAP двигает только transform (без мутаций DOM — никаких конфликтов).
*/
const QA = [
  {
    q: "Почему так быстро — 1–5 дней?",
    a: "Один мастер на чистом коде, без согласований между отделами и бюрократии. Вы общаетесь напрямую с тем, кто делает.",
  },
  {
    q: "А если не понравится?",
    a: "Сначала дизайн, правим до «идеально», и только потом вёрстка. Вы платите за результат, который сами одобрили.",
  },
  {
    q: "Можно в рассрочку?",
    a: "Да: 50% на старте и 50% после запуска. По крупным проектам — обсудим гибко.",
  },
  {
    q: "Кто владелец сайта?",
    a: "Вы. Код, домен и все доступы оформляются на вас. Никакой привязки ко мне.",
  },
  {
    q: "Будет ли поддержка?",
    a: "Да. Пожизненная гарантия на правки и помощь — что-то сломалось или нужно поправить, чиню бесплатно.",
  },
  {
    q: "Можно ли потом развивать?",
    a: "Конечно. Чистый код растёт вместе с бизнесом: добавим страницы и функции, когда понадобится.",
  },
  {
    q: "Что нужно от меня?",
    a: "Рассказать о бизнесе и дать материалы. Остальное — моя забота.",
  },
];

function Chars({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, wi) => (
        <span key={wi}>
          <span className="faq-word">
            {word.split("").map((ch, ci) => (
              <span className="faq-ch" key={ci}>
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const ansRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (i: number) => {
    const next = open === i ? null : i;
    setOpen(next);
    if (next === i) {
      // буквы прилетают из хаоса
      requestAnimationFrame(() => {
        const el = ansRefs.current[i];
        if (!el) return;
        const chars = el.querySelectorAll<HTMLElement>(".faq-ch");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.set(chars, { clearProps: "all" });
          return;
        }
        gsap.fromTo(
          chars,
          {
            x: () => gsap.utils.random(-60, 60),
            y: () => gsap.utils.random(-40, 40),
            rotation: () => gsap.utils.random(-40, 40),
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.7,
            ease: "expo.out",
            stagger: { each: 0.006, from: "random" },
          }
        );
      });
    }
  };

  return (
    <section id="faq" className="theme-dark faq">
      <header className="faq-head">
        <span className="faq-kicker">(08) Вопросы</span>
        <h2 className="faq-title">Что обычно спрашивают</h2>
      </header>

      <div className="faq-list">
        {QA.map((item, i) => (
          <div className={`faq-item${open === i ? " is-open" : ""}`} key={item.q}>
            <button className="faq-q" onClick={() => toggle(i)} aria-expanded={open === i}>
              <span>{item.q}</span>
              <span className="faq-sign" aria-hidden />
            </button>
            <div className="faq-a-wrap">
              <div
                className="faq-a"
                ref={(el) => {
                  ansRefs.current[i] = el;
                }}
              >
                <p>
                  <Chars text={item.a} />
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
