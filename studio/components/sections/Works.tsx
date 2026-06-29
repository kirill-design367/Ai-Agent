"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import SplitReveal from "@/components/kit/SplitReveal";

/*
  РАБОТЫ — sticky stacking cinema (the reference's ScrollStack effect, rebuilt
  on our Lenis + GSAP so there's no duplicate smooth-scroll). Each case pins,
  the next scrolls up over it, and the covered card scales down + dims — a deck
  of films. Real client cases.
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
        // transform + opacity only (no filter) → no flicker, fully smooth
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
      <div className="works-head">
        <SplitReveal as="p" type="lines" onScroll>
          <span
            style={{
              fontSize: "var(--text-sm)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            Избранные работы
          </span>
        </SplitReveal>
        <SplitReveal as="h2" type="lines" onScroll>
          <span
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontWeight: 500,
              fontSize: "var(--text-4xl)",
              letterSpacing: "-0.02em",
              color: "var(--text-on-dark)",
              display: "block",
              marginTop: "var(--space-sm)",
            }}
          >
            Доказательство — делом
          </span>
        </SplitReveal>
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
