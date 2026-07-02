"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { asset } from "@/lib/asset";

/*
  РАБОТЫ — отвечает на «У вас действительно высокий уровень?».

  Заголовок — бегущая лента-баннер «Доказательство — делом» (живой вход в блок).
  Ниже — sticky stacking cinema: каждый кейс пиннится, следующий наезжает сверху,
  накрытый кейс уменьшается и притухает. Реальные клиентские кейсы.
*/
const CASES = [
  { img: "/work/case-1.webp", title: "Volume — After Dark", meta: "Лендинг · 3 дня" },
  { img: "/work/case-2.webp", title: "Aristide", meta: "Портфолио · 4 дня" },
  { img: "/work/case-3.webp", title: "Анна Рыковская", meta: "Визитка · 2 дня" },
  { img: "/work/case-4.webp", title: "Garden Eight", meta: "Студия дизайна · 5 дней" },
  { img: "/work/case-5.webp", title: "Dream.doll", meta: "Интернет-магазин · 6 дней" },
  { img: "/work/case-6.webp", title: "Step into Web3", meta: "Лендинг · 3 дня" },
];

export default function Works() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // ЛЕНТА — горизонтальный parallax, привязанный к scrollY (не к времени):
      // текст едет со скоростью прокрутки, назад — при скролле вверх. «Живой», а
      // не рекламный автомат. Два идентичных трека → сдвиг на -50% бесшовный.
      const ticker = root.current?.querySelector(".works-ticker");
      if (ticker) {
        gsap.fromTo(
          ticker,
          { xPercent: 4 },
          {
            xPercent: -34,
            ease: "none",
            scrollTrigger: {
              trigger: ".works-banner",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          }
        );
      }

      const cards = gsap.utils.toArray<HTMLElement>(".work-card");
      // КАЖДЫЙ кейс уходит ВДАЛЬ ПОСЛЕДОВАТЕЛЬНО: когда наезжает следующий, текущий
      // уменьшается (в глубину) и в конце растворяется. Никаких преждевременных
      // «массовых» исчезновений — предыдущие тают ровно тогда, когда их накрывает
      // следующий (то есть по мере прокрутки), плавно и по очереди.
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const shade = card.querySelector(".work-shade");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: 0.6,
          },
        });
        tl.to(card, { scale: 0.62, yPercent: -3, ease: "power1.in", duration: 1 }, 0)
          .to(shade, { opacity: 0.85, ease: "none", duration: 1 }, 0)
          // растворяется в самом конце — когда следующий уже почти накрыл
          .to(card, { autoAlpha: 0, ease: "power1.in", duration: 0.4 }, 0.6);
      });

      // ПОСЛЕДНИЙ кейс (за ним следующего нет) уходит вдаль в «хвосте» прокрутки:
      // уменьшается, темнеет и растворяется. Предыдущие уже ушли по очереди, так
      // что за ним — чистый люкс-чёрный фон, без выглядываний.
      const last = cards[cards.length - 1];
      if (last) {
        const shade = last.querySelector(".work-shade");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".works-tail",
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        tl.to(last, { scale: 0.42, yPercent: -3, ease: "power1.inOut", duration: 1 }, 0)
          .to(shade, { opacity: 0.9, ease: "none", duration: 1 }, 0)
          .to(last, { autoAlpha: 0, ease: "power2.in", duration: 0.5 }, 0.55);
      }

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="work" className="theme-dark works" ref={root}>
      {/* лента — одна горизонтальная строка, бесконечный цикл */}
      <div className="works-banner" aria-label="Портфолио — примеры работ">
        <div className="works-band">
          <div className="works-ticker">
            {Array.from({ length: 2 }).map((_, g) => (
              <div className="works-ticker-group" key={g} aria-hidden={g === 1}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <span className="wb-row" key={i}>
                    <span className="wb-big">Портфолио</span>
                    <span className="wb-big">Примеры&nbsp;работ</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="works-stack">
        {CASES.map((c, i) => (
          <article className="work-card" key={c.title}>
            <span className="work-num">
              {String(i + 1).padStart(2, "0")} / {String(CASES.length).padStart(2, "0")}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(c.img)} alt={c.title} loading="lazy" />
            <div className="work-shade" aria-hidden />
            <div className="work-cap">
              <h3>{c.title}</h3>
              <span className="meta">{c.meta}</span>
            </div>
          </article>
        ))}
        {/* прокрутка-«хвост»: последний кейс залипает и уходит вдаль, затем чёрный вдох */}
        <div className="works-tail" aria-hidden />
      </div>
    </section>
  );
}
