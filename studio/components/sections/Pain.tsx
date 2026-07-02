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

      // ФОКУСИРОВКА: после чёрного «вдоха» фраза «Мы знаем, через что вы прошли»
      // выходит из тумана — сначала размытая и крупнее, затем на скролле резко
      // наводится в резкость (глаз навёл фокус). После — уплывает вверх, растворяясь,
      // и снизу выезжает первый аргумент «Вам сделали сайт. Но заявок больше не стало».
      const focus = document.querySelector(".pain-focus");
      if (focus) {
        // ПРОИЗВОДИТЕЛЬНОСТЬ: не анимируем filter:blur (дорогой repaint каждый кадр —
        // отсюда и был лаг). Вместо этого — две копии фразы: заранее размытая
        // (статичный blur, растеризуется 1 раз) и резкая. Кроссфейд их opacity +
        // масштаб = только композитор, идеально гладко.
        // обе копии сперва скрыты → чёрный «вдох»; затем фраза проявляется из тумана
        gsap.set(".pf--blur", { autoAlpha: 0, scale: 1.24 });
        gsap.set(".pf--sharp", { autoAlpha: 0, scale: 1.24 });
        gsap.set(".pain-focus", { autoAlpha: 1, y: 0 });
        gsap.set(".pain-morph", { autoAlpha: 0, y: 95 });
        // ПИН через CSS position:sticky (а не pin ScrollTrigger). Sticky держит
        // портал на месте нативно и на GPU — без пересчёта transform каждый кадр,
        // поэтому текст НЕ дрожит. Скролл трека просто скрабит анимацию.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".pain-portal-track",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
          },
        });
        tl.to({}, { duration: 0.04 }) // совсем короткий чёрный «вдох» (быстрее к фразе)
          // выходит из тумана — размытая копия проявляется ДОЛГО и мягко
          .to(".pf--blur", { autoAlpha: 1, ease: "power1.inOut", duration: 0.5 })
          // наводка резкости МЕДЛЕННЕЕ и плавнее: резкая копия проявляется и сжимается
          // к норме, размытая — плавно гаснет (кроссфейд по opacity/scale, без блюра)
          .to(".pf--sharp", { autoAlpha: 1, scale: 1, ease: "power1.inOut", duration: 0.72 })
          .to(".pf--blur", { autoAlpha: 0, scale: 1.05, ease: "power1.inOut", duration: 0.6 }, "<")
          .to({}, { duration: 0.2 }) // держим в фокусе
          // фраза уплывает вверх и растворяется (transform+opacity, без блюра)
          .to(".pain-focus", { autoAlpha: 0, y: -180, ease: "power2.in", duration: 0.34 })
          // первый аргумент выезжает снизу ПОСЛЕ ухода фразы (лёгкое касание)
          .to(".pain-morph", { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.44 }, ">-0.05")
          .to({}, { duration: 0.16 });
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

  return (
    <section id="pain" className="theme-dark pain" ref={root}>
      {/* перетекание из кейсов: фраза выходит из тумана и наводится в резкость,
          затем уплывает вверх, открывая первый аргумент.
          Трек задаёт длину прокрутки, портал внутри липнет (sticky) — плавно. */}
      <div className="pain-portal-track">
        <div className="pain-portal">
          <h2 className="pain-focus" aria-label="Мы знаем, через что вы прошли">
            <span className="pf pf--blur" aria-hidden>
              <span className="l">Мы&nbsp;знаем,</span>
              <span className="l">через что вы&nbsp;прошли</span>
            </span>
            <span className="pf pf--sharp" aria-hidden>
              <span className="l">Мы&nbsp;знаем,</span>
              <span className="l">через что вы&nbsp;прошли</span>
            </span>
          </h2>
          <h2 className="pain-morph pain-big">
            <span className="l">Вам сделали сайт.</span>
            <span className="l pain-dim">Но заявок больше не стало.</span>
          </h2>
        </div>
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
