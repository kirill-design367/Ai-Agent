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

      // волновая строка: выезжает справа → проходит по центру → уходит влево,
      // при этом буквы непрерывно «огибаются» бегущей волной (traveling wave).
      const waveChars = gsap.utils.toArray<HTMLElement>(".pain-wave-ch");
      if (waveChars.length) {
        // непрерывная бегущая волна по буквам
        gsap.to(waveChars, {
          y: -26,
          ease: "sine.inOut",
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.05, from: "start" },
        });
        // проезд справа налево, привязан к скроллу (пин — чтобы зритель задержался)
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
          ".pain-wave",
          { x: "64vw", autoAlpha: 0 },
          { x: "0vw", autoAlpha: 1, ease: "sine.out", duration: 0.5 }
        ).to(".pain-wave", {
          x: "-64vw",
          autoAlpha: 0,
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

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  const phrase = "А теперь — о наболевшем";

  return (
    <section id="pain" className="theme-dark pain" ref={root}>
      {/* перетекание из кейсов — волновая строка, проезд справа налево */}
      <div className="pain-portal">
        <div className="pain-wave" aria-label={phrase}>
          {phrase.split("").map((ch, i) => (
            <span className="pain-wave-ch" key={i} aria-hidden>
              {ch === " " ? " " : ch}
            </span>
          ))}
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
    </section>
  );
}
