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
  { img: "/work/case-1.jpg", title: "Volume — After Dark", meta: "Лендинг · 3 дня" },
  { img: "/work/case-2.jpg", title: "Aristide", meta: "Портфолио · 4 дня" },
  { img: "/work/case-3.jpg", title: "Анна Рыковская", meta: "Визитка · 2 дня" },
  { img: "/work/case-4.png", title: "Garden Eight", meta: "Студия дизайна · 5 дней" },
  { img: "/work/case-5.png", title: "Dream.doll", meta: "Интернет-магазин · 6 дней" },
  { img: "/work/case-6.png", title: "Step into Web3", meta: "Лендинг · 3 дня" },
];

export default function Works() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>(".work-card");
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
        tl.to(card, { scale: 0.94, ease: "none" }, 0).to(
          shade,
          { opacity: 0.55, ease: "none" },
          0
        );
      });
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="work" className="theme-dark works" ref={root}>
      {/* бесконечная лента-баннер «Портфолио» — два идентичных трека для бесшовности */}
      <div className="works-banner" aria-label="Портфолио">
        <div className="works-ticker">
          {Array.from({ length: 2 }).map((_, g) => (
            <div className="works-ticker-group" key={g} aria-hidden={g === 1}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i}>
                  Портфолио<i>✦</i>
                </span>
              ))}
            </div>
          ))}
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
      </div>
    </section>
  );
}
