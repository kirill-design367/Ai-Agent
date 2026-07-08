"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, registerGsap } from "@/lib/gsap";

/*
  ЦЕНЫ — отвечает на «Сколько стоит и не разведут ли меня?».

  Вход без пиннинга: заголовок мягко всплывает и проявляется, следом карточки
  выезжают снизу (ощущение, что цены «лежали под» предыдущим блоком). На фоне —
  невесомо парящие знаки ₽. Тёмные карточки с бегущим огоньком по рамке;
  рекомендуемый тариф крупнее. Никаких резких смен — нативный скролл, не дрожит.
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
      if (reduce) return;

      // ВХОД-РЕВИЛ (awwwards-подача, без пиннинга → не дрожит): заголовок
      // «раскрывается» — буквы всплывают из-под маски со stagger; фон из знаков ₽
      // мягко проявляется; следом карточки выезжают снизу с лёгкой 3D-глубиной.
      const titleEl = root.current!.querySelector<HTMLElement>(".prices-title");
      if (titleEl) {
        const split = new SplitText(titleEl, { type: "lines,chars", linesClass: "prices-line" });
        gsap.set(".prices-line", { overflow: "hidden" });
        gsap.from(split.chars, {
          yPercent: 118,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          stagger: { each: 0.018, from: "start" },
          // reversible: играет и вниз, и вверх (при возврате в свет-переход)
          scrollTrigger: {
            trigger: ".prices-head",
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // фон из парящих ₽ проявляется на входе
      gsap.fromTo(
        ".prices-rub-float",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: ".prices-head", start: "top 84%" },
        }
      );

      // карточки появляются со stagger и слегка дышат
      gsap.utils.toArray<HTMLElement>(".price-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 70, opacity: 0, rotateX: 10 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.05,
            ease: "expo.out",
            delay: i * 0.1,
            scrollTrigger: { trigger: ".price-grid", start: "top 84%" },
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
      {/* заголовок — рождается плавно (без резких смен, без пиннинга) */}
      <header className="prices-head">
        <h2 className="prices-title">Прозрачная стоимость без неожиданных доплат</h2>
      </header>

      <div className="price-grid">
        {TIERS.map((t) => (
          <article className="price-card" key={t.name} data-magnetic>
            <div className="price-inner">
              <h3 className="price-name">{t.name}</h3>
              <p className="price-desc">{t.desc}</p>
              <ul className="price-feats">
                {t.feats.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a
                href="#contact"
                className="price-buy"
                data-magnetic
                aria-label={`Обсудить тариф «${t.name}»`}
              >
                <span className="price-buy-info">
                  <span className="price-buy-label">цена вопроса</span>
                  <span className="price-buy-sum">
                    <b className="price-num" data-val={t.num.replace(/\s/g, "")}>
                      {t.num}
                    </b>
                    <i className="price-cur">{t.cur}</i>
                  </span>
                </span>
                <span className="price-buy-arrow" aria-hidden>
                  →
                </span>
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="prices-note">Нужен другой формат? Соберём решение под&nbsp;вас.</p>
    </section>
  );
}
