"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, registerGsap } from "@/lib/gsap";

/*
  FAQ — снимает последние возражения перед заявкой.

  ПЕРЕХОД 4 (вход): поверх начала FAQ лежит «занавес» цвета прайса, поделённый
  рваной вертикальной линией на две панели. Экран пинится, панели РАСПАХИВАЮТСЯ
  в стороны — и из-под них открывается НАСТОЯЩИЙ заголовок «Что обычно
  спрашивают» + верхние вопросы (никаких дублей-подписей).

  ПЕРЕХОД 5 (выход, часть 1): последний вопрос списка при уходе секции наверх
  РАССЫПАЕТСЯ по буквам (реальный блок, а не дубль) — и пересобирается уже в
  заголовок «Отзывов» (см. Reviews.tsx).

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
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([".faq-panel--l", ".faq-panel--r"], { autoAlpha: 0 });
        return;
      }

      // заголовок проявляется (reversible — вниз и вверх)
      gsap.from(".faq-title", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".faq",
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
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

      // ── ПЕРЕХОД 4: ЗАНАВЕС ПРАЙСА РВЁТСЯ, открывая настоящий FAQ.
      // Отдельная калибровка дистанции под mobile/desktop.
      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 761px)", isMobile: "(max-width: 760px)" },
        (self) => {
          const dist = self.conditions?.isMobile ? 720 : 950;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current!,
              start: "top top",
              end: () => "+=" + dist,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          tl.to(".faq-panel--l", { xPercent: -100, rotate: -2, ease: "power2.in", duration: 1 }, 0)
            .to(".faq-panel--r", { xPercent: 100, rotate: 2, ease: "power2.in", duration: 1 }, 0);
        }
      );

      // ── ПЕРЕХОД 5 (часть 1): последний вопрос РАССЫПАЕТСЯ при уходе секции.
      const lastQ = root.current!.querySelector<HTMLElement>(
        ".faq-item:last-child .faq-q-txt"
      );
      if (lastQ) {
        const split = new SplitText(lastQ, { type: "chars" });
        gsap.to(split.chars, {
          x: () => gsap.utils.random(-150, 150),
          y: () => gsap.utils.random(-90, 90),
          rotation: () => gsap.utils.random(-80, 80),
          autoAlpha: 0,
          ease: "power1.in",
          stagger: { from: "random", each: 0.01 },
          scrollTrigger: {
            trigger: ".faq-item:last-child",
            start: "top 55%",
            end: "top 8%",
            scrub: 0.8,
          },
        });
      }

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="faq" className="theme-dark faq" ref={root}>
      {/* ПЕРЕХОД 4 — занавес цвета прайса: две рваные панели разъезжаются,
          открывая настоящий заголовок и верхние вопросы */}
      <div className="faq-curtain" aria-hidden>
        <div className="faq-panel faq-panel--l" />
        <div className="faq-panel faq-panel--r" />
      </div>

      <header className="faq-head">
        <h2 className="faq-title">Что обычно спрашивают</h2>
      </header>

      <div className="faq-list">
        {QA.map((item, i) => (
          <div className={`faq-item${open === i ? " is-open" : ""}`} key={item.q}>
            <button className="faq-q" onClick={() => toggle(i)} aria-expanded={open === i}>
              <span className="faq-q-txt">{item.q}</span>
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
