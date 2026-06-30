"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";

/*
  ЦЕНЫ — отвечает на «Сколько стоит и не разведут ли меня?».

  Переход-вход: поле из знаков ₽ мерцает как пиксельное табло, наезжает на
  зрителя (zoom) и растворяется — блок цены «рождается» изнутри. Тёмные
  карточки с бегущим огоньком по рамке; рекомендуемый тариф крупнее, живёт.
*/
const TIERS = [
  {
    name: "Лендинг",
    pre: "от",
    num: "30 000",
    cur: "₽",
    time: "1–3 дня",
    desc: "Одностраничный сайт-история с формой заявок.",
    feats: ["Уникальный дизайн", "Адаптив под телефон", "Анимации", "Аналитика"],
  },
  {
    name: "Сайт / портфолио",
    pre: "от",
    num: "60 000",
    cur: "₽",
    time: "3–5 дней",
    desc: "3–6 разделов: услуги, кейсы, блог или галерея.",
    feats: ["Всё из лендинга", "Многостраничность", "SEO-фундамент", "CMS по желанию"],
    rec: true,
  },
  {
    name: "Магазин / сложный",
    pre: "от",
    num: "120 000",
    cur: "₽",
    time: "от 6 дней",
    desc: "Каталог, корзина, оплата и интеграции.",
    feats: ["Всё из портфолио", "Каталог и корзина", "Онлайн-оплата", "Интеграции"],
  },
];

// поле ₽ для пиксельного табло-перехода
const RUB_COLS = 14;
const RUB_ROWS = 7;
const RUB_CELLS = Array.from({ length: RUB_COLS * RUB_ROWS });

export default function Prices() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(".rub-veil", { autoAlpha: 0 });
        return;
      }

      // ПОРТАЛ ₽: пиксельное поле наезжает и растворяется, блок рождается изнутри
      const portal = gsap.timeline({
        scrollTrigger: {
          trigger: ".prices-portal",
          start: "top top",
          end: "+=150%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });
      portal
        .fromTo(".rub-field", { scale: 1, opacity: 1 }, { scale: 3.6, opacity: 0, ease: "power2.in" }, 0)
        .to(".rub-veil", { autoAlpha: 0, ease: "power1.in" }, 0.4)
        .fromTo(".prices-reveal", { scale: 1.14, opacity: 0.4 }, { scale: 1, opacity: 1, ease: "power1.out" }, 0.05);

      // карточки появляются со stagger и слегка дышат
      gsap.utils.toArray<HTMLElement>(".price-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0, rotateX: 8 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1,
            ease: "expo.out",
            delay: i * 0.1,
            scrollTrigger: { trigger: ".price-grid", start: "top 82%" },
          }
        );
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="prices" className="prices" ref={root}>
      {/* переход-вход: пиксельное табло ₽ */}
      <div className="prices-portal">
        <div className="prices-reveal">
          <header className="prices-head">
            <span className="prices-kicker">(05) Цены</span>
            <h2 className="prices-title">
              Честно и&nbsp;по&nbsp;делу.
              <br />
              Без скрытых платежей.
            </h2>
          </header>
        </div>

        <div className="rub-veil" aria-hidden>
          <div className="rub-field">
            {RUB_CELLS.map((_, i) => (
              <span
                className="rub-cell"
                key={i}
                style={{ animationDelay: `${(i % 13) * 0.11 + Math.floor(i / RUB_COLS) * 0.07}s` }}
              >
                ₽
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="price-grid">
        {TIERS.map((t) => (
          <article
            className={`price-card star-border${t.rec ? " price-card--rec" : ""}`}
            key={t.name}
            data-magnetic
          >
            <span className="star-move star-move--b" aria-hidden />
            <span className="star-move star-move--t" aria-hidden />
            <div className="price-inner">
              {t.rec && <span className="price-badge">Чаще выбирают</span>}
              <span className="price-name">{t.name}</span>
              <span className="price-value">
                <i className="price-pre">{t.pre}</i>
                <b className="price-num">{t.num}</b>
                <i className="price-cur">{t.cur}</i>
              </span>
              <span className="price-time">срок · {t.time}</span>
              <p className="price-desc">{t.desc}</p>
              <ul className="price-feats">
                {t.feats.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a href="#contact" className="btn btn--primary price-cta" data-magnetic>
                Обсудить
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="prices-note">
        Точная цена — после короткого разговора. Без абонентской платы: платите
        один раз за&nbsp;сайт.
      </p>
    </section>
  );
}
