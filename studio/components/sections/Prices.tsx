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

/* невесомо парящие ₽ на фоне блока цен (как рой вопросов в «Как мы работаем»,
   только знаки рубля). x/y — %, s — размер, o — прозрачность. */
const RUB_FLOAT = [
  { x: 8, y: 12, s: 3.6, o: 0.06 },
  { x: 88, y: 9, s: 2.6, o: 0.07 },
  { x: 22, y: 26, s: 1.6, o: 0.08 },
  { x: 70, y: 20, s: 2.0, o: 0.06 },
  { x: 50, y: 8, s: 1.3, o: 0.07 },
  { x: 6, y: 44, s: 2.2, o: 0.06 },
  { x: 94, y: 40, s: 1.8, o: 0.06 },
  { x: 34, y: 54, s: 1.4, o: 0.05 },
  { x: 82, y: 60, s: 3.0, o: 0.05 },
  { x: 14, y: 68, s: 1.7, o: 0.07 },
  { x: 58, y: 72, s: 2.0, o: 0.05 },
  { x: 90, y: 82, s: 1.5, o: 0.06 },
  { x: 26, y: 88, s: 2.4, o: 0.05 },
  { x: 66, y: 92, s: 1.4, o: 0.06 },
  { x: 44, y: 34, s: 1.2, o: 0.05 },
  { x: 76, y: 46, s: 1.3, o: 0.05 },
];

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

      // ПОРТАЛ ₽ → СВЕТ-ТУННЕЛЬ: поле ₽ по экрану, премиальное свечение приближается
      // и эстетично «пробивает» светом (конец туннеля), из света рождается блок цены.
      // В конце — краткая ПАУЗА, чтобы прочитать заголовок.
      const portal = gsap.timeline({
        scrollTrigger: {
          trigger: ".prices-portal",
          start: "top top",
          end: "+=210%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });
      portal
        .fromTo(".rub-field", { scale: 1, opacity: 1 }, { scale: 3.8, opacity: 0.12, ease: "power2.in", duration: 0.6 }, 0)
        // свет приближается из глубины
        .fromTo(".rub-light", { scale: 0.15, opacity: 0 }, { scale: 1.1, opacity: 0.95, ease: "power2.in", duration: 0.5 }, 0.12)
        // ПРОБИТИЕ светом — вспышка расширяется
        .to(".rub-light", { scale: 7, opacity: 0, ease: "power2.in", duration: 0.4 }, 0.52)
        .to(".rub-veil", { autoAlpha: 0, ease: "power1.in", duration: 0.3 }, 0.5)
        .fromTo(".prices-reveal", { scale: 1.16, opacity: 0.3 }, { scale: 1, opacity: 1, ease: "power1.out", duration: 0.4 }, 0.5)
        // краткая пауза на заголовке
        .to({}, { duration: 0.45 });

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

      // ЖИВЫЕ ЦИФРЫ — счётчик «накручивает» цену при появлении (одометр, как живой счёт)
      gsap.utils.toArray<HTMLElement>(".price-num").forEach((el) => {
        const target = parseInt(el.dataset.val || "0", 10);
        const obj = { v: 0 };
        el.textContent = "0";
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString("ru-RU");
          },
        });
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: root }
  );

  return (
    <section id="prices" className="prices" ref={root}>
      {/* невесомо парящие знаки рубля на фоне */}
      <div className="prices-rub-float" aria-hidden>
        {RUB_FLOAT.map((r, i) => (
          <span
            key={i}
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              fontSize: `${r.s}rem`,
              opacity: r.o,
              animationDelay: `${(i % 7) * 0.9}s`,
              animationDuration: `${7 + (i % 5)}s`,
            }}
          >
            ₽
          </span>
        ))}
      </div>
      {/* переход-вход: пиксельное табло ₽ */}
      <div className="prices-portal">
        <div className="prices-reveal">
          <header className="prices-head">
            <h2 className="prices-title">
              Прозрачная стоимость без&nbsp;неожиданных доплат
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
          {/* свет в конце туннеля — приближается и пробивает */}
          <span className="rub-light" />
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
                <b className="price-num" data-val={t.num.replace(/\s/g, "")}>
                  {t.num}
                </b>
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
