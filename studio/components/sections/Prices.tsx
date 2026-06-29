"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "@/lib/gsap";

/*
  ЦЕНЫ — отвечает на «Сколько стоит и не разведут ли меня?».
  Светлый блок (разрыв чёрной серии). Тёмные карточки-тарифа с бегущим огоньком
  по рамке (StarBorder). Рекомендуемый тариф крупнее и подсвечен.
*/
const TIERS = [
  {
    name: "Лендинг",
    price: "от 30 000 ₽",
    time: "1–3 дня",
    desc: "Одностраничный сайт-история с формой заявок.",
    feats: ["Уникальный дизайн", "Адаптив под телефон", "Анимации", "Аналитика"],
  },
  {
    name: "Сайт / портфолио",
    price: "от 60 000 ₽",
    time: "3–5 дней",
    desc: "3–6 разделов: услуги, кейсы, блог или галерея.",
    feats: ["Всё из лендинга", "Многостраничность", "SEO-фундамент", "CMS по желанию"],
    rec: true,
  },
  {
    name: "Магазин / сложный",
    price: "от 120 000 ₽",
    time: "от 6 дней",
    desc: "Каталог, корзина, оплата и интеграции.",
    feats: ["Всё из портфолио", "Каталог и корзина", "Онлайн-оплата", "Интеграции"],
  },
];

export default function Prices() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ".price-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".price-grid", start: "top 80%" },
        }
      );
    },
    { scope: root }
  );

  return (
    <section id="prices" className="prices" ref={root}>
      <header className="prices-head">
        <span className="prices-kicker">(05) Цены</span>
        <h2 className="prices-title">
          Честно и&nbsp;по&nbsp;делу.
          <br />
          Без скрытых платежей.
        </h2>
      </header>

      <div className="price-grid">
        {TIERS.map((t) => (
          <article
            className={`price-card star-border${t.rec ? " price-card--rec" : ""}`}
            key={t.name}
          >
            <span className="star-move star-move--b" aria-hidden />
            <span className="star-move star-move--t" aria-hidden />
            <div className="price-inner">
              {t.rec && <span className="price-badge">Чаще выбирают</span>}
              <span className="price-name">{t.name}</span>
              <span className="price-value">{t.price}</span>
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
