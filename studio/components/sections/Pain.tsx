"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  БОЛЬ — отвечает на возражение «У меня уже есть сайт, зачем новый?».

  Перетекание из Кейсов: круговая надпись «А ТЕПЕРЬ — О НАБОЛЕВШЕМ» появляется
  из ниоткуда справа, делает дугу вверх и на скролле уходит влево. Дальше —
  тоннель-параллакс: боли по золотому сечению (огромная фраза с одной стороны,
  пояснение — с противоположной). Финальная строка «Мы строим работу иначе»
  при скролле приближается и пролетает сквозь зрителя — переход в Процесс.
*/
const PAINS = [
  {
    big: ["Красиво —", "но не продаёт"],
    note: "Дизайн ради дизайна. Посетитель любуется — и уходит к тому, у кого понятнее.",
  },
  {
    big: ["Шаблон,", "как у всех"],
    note: "Тот же конструктор, что у конкурентов. Вы сливаетесь с фоном вместо того, чтобы выделяться.",
  },
  {
    big: ["Грузится", "вечность"],
    note: "Три секунды ожидания — и половина людей закрыла вкладку. Вы заплатили за их уход.",
  },
  {
    big: ["На телефоне", "разваливается"],
    note: "А это 70% ваших клиентов. Они даже не увидят, какой вы на самом деле хороший.",
  },
  {
    big: ["Сделали", "и бросили"],
    note: "Поддержки нет. Поправить одну строчку — снова искать подрядчика и снова платить.",
  },
];

export default function Pain() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      // круговая надпись: из ниоткуда справа → дуга вверх → уходит влево
      const ring = root.current!.querySelector(".portal-ring");
      if (ring) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".pain-portal",
            start: "top top",
            end: "+=130%",
            scrub: 0.6,
            pin: true,
          },
        });
        tl.fromTo(
          ring,
          { x: "74vw", y: "16vh", autoAlpha: 0, rotate: -28 },
          { x: "0vw", y: "-9vh", autoAlpha: 1, rotate: 0, ease: "sine.out", duration: 0.5 }
        ).to(ring, {
          x: "-74vw",
          y: "16vh",
          autoAlpha: 0,
          rotate: 28,
          ease: "sine.in",
          duration: 0.5,
        });
      }

      // тоннель-параллакс по болям (lead/turn исключены — у них своя режиссура)
      gsap.utils
        .toArray<HTMLElement>(".pain-item:not(.pain-item--lead):not(.pain-item--turn)")
        .forEach((item) => {
          const big = item.querySelector(".pain-big");
          const note = item.querySelector(".pain-note");
          const idx = item.querySelector(".pain-idx");
          const t = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          });
          if (big)
            t.fromTo(
              big,
              { yPercent: 24, scale: 0.92 },
              { yPercent: -24, scale: 1.07, ease: "none" },
              0
            );
          if (idx) t.fromTo(idx, { yPercent: 60 }, { yPercent: -60, ease: "none" }, 0);
          if (note) t.fromTo(note, { yPercent: -55 }, { yPercent: 55, ease: "none" }, 0);
        });

      // «Мы строим работу иначе»: задержка для чтения → налёт сквозь зрителя
      const turn = root.current!.querySelector(".pain-turn");
      if (turn) {
        const tt = gsap.timeline({
          scrollTrigger: {
            trigger: ".pain-item--turn",
            start: "top top",
            end: "+=170%",
            scrub: 0.7,
            pin: true,
          },
        });
        tt.fromTo(turn, { scale: 0.9, opacity: 0.5 }, { scale: 1, opacity: 1, ease: "power2.out", duration: 0.35 })
          .to(turn, { duration: 0.3 }) // удержание — пользователь читает
          .to(turn, { scale: 11, opacity: 0, ease: "power2.in", duration: 0.55 });
      }

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  const phrase = "А ТЕПЕРЬ — О НАБОЛЕВШЕМ — ";

  return (
    <section id="pain" className="theme-dark pain" ref={root}>
      {/* перетекание из кейсов — круговая надпись, дуга справа налево */}
      <div className="pain-portal">
        <div className="portal-ring">
          <svg viewBox="0 0 240 240" aria-hidden>
            <defs>
              <path id="painCircle" d="M120,32 a88,88 0 1,1 -0.1,0" fill="none" />
            </defs>
            <text>
              <textPath href="#painCircle" startOffset="0">
                {phrase + phrase}
              </textPath>
            </text>
          </svg>
          <span className="portal-core" aria-hidden>
            ↓
          </span>
        </div>
      </div>

      {/* интро-фраза */}
      <div className="pain-item pain-item--lead" data-side="c">
        <h2 className="pain-big">
          <span className="l">Вам сделали сайт.</span>
          <span className="l pain-dim">Но заявок больше не стало.</span>
        </h2>
      </div>

      {/* боли по золотому сечению */}
      {PAINS.map((p, i) => (
        <div
          className="pain-item"
          data-side={i % 2 === 0 ? "l" : "r"}
          key={p.big.join(" ")}
        >
          <span className="pain-idx" aria-hidden>
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="pain-big">
            {p.big.map((l) => (
              <span className="l" key={l}>
                {l}
              </span>
            ))}
          </h3>
          <p className="pain-note">{p.note}</p>
        </div>
      ))}

      {/* поворот → налёт сквозь зрителя → Процесс */}
      <div className="pain-item pain-item--turn" data-side="c">
        <h2 className="pain-big pain-turn">
          <span className="l">Мы строим</span>
          <span className="l">работу иначе.</span>
        </h2>
      </div>
    </section>
  );
}
