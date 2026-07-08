"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  FAQ — снимает последние возражения перед заявкой.
  Вход-переход (из блока цен): вопросы «валяются» в хаосе (разлетелись, повёрнуты)
  и ПО МЕРЕ СКРОЛЛА встают на свои места — собираются в аккуратный список.
  Аккордеон на grid-template-rows (0fr→1fr): открытие/закрытие плавное и дешёвое.
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

export default function Faq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  const toggle = (i: number) => setOpen((cur) => (cur === i ? null : i));

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // заголовок проявляется
      gsap.from(".faq-title", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".faq", start: "top 82%" },
      });

      // ХАОС → ПОРЯДОК: каждый вопрос прилетает из своей стороны, повёрнутый, и
      // по мере скролла встаёт ровно на своё место (scrub привязывает к прокрутке)
      gsap.utils.toArray<HTMLElement>(".faq-item").forEach((item, i) => {
        const dir = i % 2 ? 1 : -1;
        gsap.fromTo(
          item,
          {
            x: dir * gsap.utils.random(46, 92),
            y: gsap.utils.random(24, 64),
            rotation: dir * gsap.utils.random(3.5, 9),
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 94%", end: "top 58%", scrub: 0.8 },
          }
        );
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="faq" className="theme-dark faq cine-in" ref={root}>
      <header className="faq-head">
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
              <div className="faq-a">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
