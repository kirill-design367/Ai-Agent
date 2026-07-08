"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, registerGsap } from "@/lib/gsap";

/*
  ОТЗЫВЫ — социальное доказательство. Реальных отзывов пока нет — это ЧЕРНОВЫЕ
  плейсхолдеры со слотами под замену (имя/сфера/текст), без фальшивых «5 звёзд».

  ПЕРЕХОД 5 «из хаоса в единое» (scrub по позиции скролла, без пина): сначала
  буквы заголовка «Что говорят клиенты» возникают из ниоткуда, разбросанные по
  экрану, и по мере листания слетаются в надпись; затем ТОЧНО ТАК ЖЕ карточки-
  отзывы прилетают из хаоса и собираются в аккуратную сетку.
*/
const REVIEWS = [
  {
    text: "Сделал лендинг за три дня — заявки пошли в первую же неделю. Всё на связи лично, без менеджеров.",
    name: "Анна Ковалёва",
    role: "Бьюти-студия, Москва",
  },
  {
    text: "Дизайн вообще не похож на шаблон. Наконец-то не стыдно скинуть ссылку партнёрам.",
    name: "Дмитрий Орлов",
    role: "B2B-услуги",
  },
  {
    text: "Поправки вносит быстро и бесплатно. Сайт открывается мгновенно даже с телефона.",
    name: "Мария Соколова",
    role: "Интернет-магазин",
  },
  {
    text: "Объяснил всё по-человечески, без технических терминов. Получил ровно то, что хотел.",
    name: "Игорь Лебедев",
    role: "Частный эксперт",
  },
];

// базовый наклон каждой карточки (хаос по золотому сечению) — сохраняется после сборки
const ROT = [-1.8, 1.3, 1.9, -1.2];

export default function Reviews() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const isMobile = window.matchMedia("(max-width: 760px)").matches;

      // ПЕРЕХОД 5 — ИЗ ХАОСА В ЕДИНОЕ. Пуск через IntersectionObserver, а НЕ
      // ScrollTrigger: у отзывов триггер считался ДО того, как пиннящиеся секции
      // выше добавляли высоту → сборка «доигрывала» ещё на загрузке, и к приходу
      // всё стояло собранным («статично»). IO смотрит на РЕАЛЬНУЮ геометрию
      // вьюпорта (не зависит ни от пинов, ни от Lenis) и запускает СВОЙ таймлайн
      // ~1.8с ровно когда блок реально виден. SplitText делаем ПОСЛЕ загрузки
      // шрифта — иначе пере-разбиение «отвязывало» буквы и set() слетал.
      const observers: IntersectionObserver[] = [];
      let titleSplit: SplitText | null = null;

      const build = () => {
        if (!root.current) return;

        // 1) Заголовок «Что говорят клиенты»: буквы из ниоткуда слетаются в надпись.
        const titleEl = root.current.querySelector<HTMLElement>(".reviews-title");
        const headEl = root.current.querySelector<HTMLElement>(".reviews-head");
        if (titleEl && headEl) {
          const spread = isMobile ? 280 : 520;
          titleSplit = new SplitText(titleEl, { type: "words,chars" });
          const chars = titleSplit.chars;
          gsap.set(chars, {
            x: () => gsap.utils.random(-spread, spread),
            y: () => gsap.utils.random(-spread, spread),
            rotation: () => gsap.utils.random(-140, 140),
            scale: 0.4,
            autoAlpha: 0,
          });
          const io = new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (!e.isIntersecting) return;
                gsap.to(chars, {
                  x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1,
                  duration: 1.15, ease: "power3.out",
                  stagger: { from: "random", each: 0.045 },
                });
                io.disconnect();
              });
            },
            { threshold: 0.55 }
          );
          io.observe(headEl);
          observers.push(io);
        }

        // 2) Карточки-отзывы: ТОЧНО ТАК ЖЕ из хаоса собираются в сетку (базовый
        //    наклон ROT[i] сохраняется).
        const gridEl = root.current.querySelector<HTMLElement>(".rev-grid");
        const cards = gsap.utils.toArray<HTMLElement>(".rev-card");
        if (gridEl && cards.length) {
          cards.forEach((card, i) =>
            gsap.set(card, {
              x: gsap.utils.random(-260, 260),
              y: gsap.utils.random(90, 320),
              rotation: ROT[i % ROT.length] * 6,
              scale: 0.55,
              autoAlpha: 0,
            })
          );
          const io2 = new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (!e.isIntersecting) return;
                cards.forEach((card, i) =>
                  gsap.to(card, {
                    x: 0, y: 0, rotation: ROT[i % ROT.length], scale: 1, autoAlpha: 1,
                    duration: 1.1, ease: "power3.out", delay: i * 0.12,
                  })
                );
                io2.disconnect();
              });
            },
            { threshold: 0.12 }
          );
          io2.observe(gridEl);
          observers.push(io2);
        }
      };

      // Сплитим и раскидываем ПОСЛЕ загрузки шрифта (иначе пере-разбиение сбросит).
      if (document.fonts && document.fonts.status !== "loaded") {
        document.fonts.ready.then(build);
      } else {
        build();
      }

      return () => {
        observers.forEach((o) => o.disconnect());
        titleSplit?.revert();
      };
    },
    { scope: root }
  );

  return (
    <section id="reviews" className="theme-dark reviews" ref={root}>
      <header className="reviews-head">
        <h2 className="reviews-title">Что говорят клиенты</h2>
      </header>

      <div className="rev-grid">
        {REVIEWS.map((r, i) => (
          <figure className="rev-card" data-i={i} key={i}>
            <span className="rev-quote" aria-hidden>
              &ldquo;
            </span>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              <span className="rev-name">{r.name}</span>
              <span className="rev-role">{r.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
