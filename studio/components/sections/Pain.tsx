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

      // КИРПИЧИКИ: слова «А теперь — о наболевшем» сваливаются сверху и собираются
      // воедино, затем плавно МОРФ в «Вам сделали сайт. Но заявок больше не стало».
      const bricks = gsap.utils.toArray<HTMLElement>(".pain-brick");
      if (bricks.length) {
        gsap.set(".pain-morph", { autoAlpha: 0, y: 26 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".pain-portal",
            start: "top top",
            end: "+=150%",
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
          },
        });
        // падение кирпичиков с лёгким отскоком
        tl.from(
          bricks,
          {
            y: () => -gsap.utils.random(260, 460),
            opacity: 0,
            rotation: () => gsap.utils.random(-26, 26),
            stagger: 0.07,
            ease: "back.out(1.5)",
          },
          0
        )
          .to({}, { duration: 0.28 }) // держим собранную фразу
          // морф: первая фраза уходит вверх, вторая проявляется
          .to(".pain-fall", { autoAlpha: 0, y: -36, ease: "power2.in", duration: 0.28 })
          .to(".pain-morph", { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.4 }, "<0.08")
          .to({}, { duration: 0.22 });
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

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  const fallWords = ["А", "теперь —", "о", "наболевшем"];

  return (
    <section id="pain" className="theme-dark pain" ref={root}>
      {/* перетекание из кейсов: слова сваливаются кирпичиками и собираются, затем морф */}
      <div className="pain-portal">
        <h2 className="pain-fall" aria-label="А теперь — о наболевшем">
          {fallWords.map((w, i) => (
            <span className="pain-brick" key={i}>
              {w}
            </span>
          ))}
        </h2>
        <h2 className="pain-morph pain-big">
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
    </section>
  );
}
