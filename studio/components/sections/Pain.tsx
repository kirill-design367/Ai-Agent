"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  БОЛЬ — отвечает на возражение «У меня уже есть сайт, зачем новый?».

  Перетекание из Кейсов: круговая вращающаяся надпись «А ТЕПЕРЬ — О НАБОЛЕВШЕМ»
  (референс maheshppai) зумится тоннелем внутрь. Дальше — тоннель-параллакс:
  боли не по центру, а по золотому сечению. Огромная фраза с одной стороны,
  поясняющий текст — с противоположной, следующая боль — зеркально. Асимметрия,
  гигантская типографика, которая собирается в чёткий образ.
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

      // круговой портал → тоннельный зум на выходе
      const ring = root.current!.querySelector(".portal-ring");
      if (ring) {
        gsap.to(ring, {
          scale: 4.6,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".pain-portal",
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }

      // тоннель-параллакс по каждой боли
      gsap.utils.toArray<HTMLElement>(".pain-item").forEach((item) => {
        const big = item.querySelector(".pain-big");
        const note = item.querySelector(".pain-note");
        const idx = item.querySelector(".pain-idx");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
        if (big)
          tl.fromTo(
            big,
            { yPercent: 24, scale: 0.92 },
            { yPercent: -24, scale: 1.07, ease: "none" },
            0
          );
        if (idx)
          tl.fromTo(idx, { yPercent: 60 }, { yPercent: -60, ease: "none" }, 0);
        if (note)
          tl.fromTo(
            note,
            { yPercent: -55 },
            { yPercent: 55, ease: "none" },
            0
          );
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  const phrase = "А ТЕПЕРЬ — О НАБОЛЕВШЕМ — ";

  return (
    <section id="pain" className="theme-dark pain" ref={root}>
      {/* перетекание из кейсов — круговая надпись + тоннельный зум */}
      <div className="pain-portal">
        <div className="portal-ring">
          <svg viewBox="0 0 240 240" aria-hidden>
            <defs>
              <path
                id="painCircle"
                d="M120,32 a88,88 0 1,1 -0.1,0"
                fill="none"
              />
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
        <p className="portal-cap">А теперь — о наболевшем</p>
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

      {/* поворот → ведёт в Процесс */}
      <div className="pain-item pain-item--turn" data-side="c">
        <h2 className="pain-big pain-turn">
          <span className="l">Мы строим</span>
          <span className="l">работу иначе.</span>
        </h2>
      </div>
    </section>
  );
}
