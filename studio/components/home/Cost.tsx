"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { PRICE, formatPrice } from "@/content/pricing";

/*
  БЛОК «СТОИМОСТЬ» — сразу после «Работы». Отвечает ОДНОЙ цифрой, не таблицей:
  таблица ставит потолок и превращает авторскую студию в меню. Прайса по форматам
  тут нет — блок ведёт на /uslugi/*.

  Приёмы:
   • слово «Стоимость» сидит верхом на шве чёрного (Работы) и белого (Стоимость):
     mix-blend-difference переворачивает цвет сам на границе (моб. — blend off);
   • список форматов — не ровный столбик: интервалы нарастают, последняя строка
     уходит под правую колонку (сознательный слом сетки ровно один раз);
   • порог — цифра из отдельных разрядов-столбцов, выезжает снизу одним движением
     (не счётчик от нуля). Все числа — из content/pricing.ts, не хардкод.
*/

const FORMATS = [
  { label: "Лендинг", href: "/uslugi/landing/" },
  { label: "Корпоративный сайт", href: "/uslugi/korporativnyi-sait/" },
  { label: "Интернет-магазин", href: "/uslugi/internet-magazin/" },
  { label: "Поддержка и развитие", href: "/uslugi/podderzhka/" },
];

const DRIVERS = [
  "Объём задачи и количество экранов",
  "Сложность движения — от аккуратных появлений до 3D и WebGL",
  "Интеграции: CRM, онлайн-оплата, запись, 1С",
  "Тексты и изображения — ваши или мои",
  "Языковые и региональные версии",
];

export default function Cost() {
  const root = useRef<HTMLElement>(null);

  // Числа — из единого источника (правило проекта №2), не хардкод в разметке.
  const numStr = formatPrice(PRICE.landing).replace(/\s*₽\s*$/, ""); // «50 000»
  const numChars = Array.from(numStr);
  const rangeLo = formatPrice(PRICE.corporate).replace(/\s*₽\s*$/, "");
  const range = `${rangeLo}–${formatPrice(PRICE.shop)}`; // «120 000–250 000 ₽» (среднее тире)
  const thresholdA11y = `от ${formatPrice(PRICE.landing)}`;

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // при reduce CSS показывает всё сразу (см. globals)

    const triggers: ScrollTrigger[] = [];
    // Появления: ScrollTrigger включает CSS-класс, а хореографию (маска снизу
    // вверх, stagger, easing) ведут transition'ы — надёжная под Lenis идиома
    // этого сайта (Работы/Манифест). once — играем один раз.
    const reveal = (sel: string, cls: string, start: string) => {
      const t = el.querySelector(sel);
      if (t) triggers.push(ScrollTrigger.create({ trigger: t, start, once: true, onEnter: () => el.classList.add(cls) }));
    };
    reveal(".st-formats", "st-in-fmt", "top 84%");   // 1. форматы — маска снизу
    reveal(".st-price", "st-in-num", "top 80%");     // 3. «от» → разряды L→R → ₽
    reveal(".st-drivers", "st-in-drv", "top 86%");   // 4. «что двигает цену»

    // 5. Лёгкий разнос колонок: правая идёт на ~7% медленнее. Только десктоп.
    const mm = gsap.matchMedia();
    mm.add("(min-width: 861px)", () => {
      const priceEl = el.querySelector<HTMLElement>(".st-price");
      if (!priceEl) return;
      gsap.fromTo(priceEl, { y: -30 }, {
        y: 30, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    return () => { triggers.forEach((t) => t.kill()); mm.revert(); };
  }, []);

  return (
    <section id="stoimost" ref={root} className="st" aria-labelledby="st-title">
      {/* шапка: «Стоимость» верхом на шве + утверждение справа */}
      <h2 className="st-head" id="st-title">
        <span className="st-word">Стоимость</span>
        <span className="st-claim">
          Мы не самые дешёвые.<br />Зато заказывать<br />придётся один раз.
        </span>
      </h2>

      <div className="st-body">
        {/* форматы — крупные ссылки, нарастающие интервалы */}
        <ul className="st-formats">
          {FORMATS.map((f, i) => (
            <li key={f.href} style={{ ["--i" as string]: i }}
              className={`st-fmt st-fmt--${i}${i === FORMATS.length - 1 ? " st-fmt--wide" : ""}`}>
              <Link href={f.href} className="st-fmt-a">
                <h3 className="st-fmt-h">
                  <span className="st-fmt-in">{f.label}</span>
                </h3>
              </Link>
            </li>
          ))}
        </ul>

        {/* порог — самый крупный элемент блока */}
        <div className="st-price">
          <p className="st-num" aria-label={thresholdA11y}>
            <span className="st-num-pre" aria-hidden>от</span>
            <span className="st-num-val" aria-hidden>
              {(() => {
                let d = -1;
                return numChars.map((c, i) =>
                  /\d/.test(c) ? (
                    <span key={i} className="st-num-col" style={{ ["--i" as string]: ++d }}>
                      <span className="st-num-d">{c}</span>
                    </span>
                  ) : (
                    <span key={i} className="st-num-sp" aria-hidden />
                  )
                );
              })()}
            </span>
            <span className="st-num-cur" aria-hidden>₽</span>
          </p>
          <p className="st-sub">Проекты с серьёзной задачей — {range}</p>

          <ul className="st-drivers">
            {DRIVERS.map((d, i) => (
              <li key={i} className="st-drv" style={{ ["--i" as string]: i }}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* замыкающая строка во всю ширину */}
      <div className="st-foot">
        <p className="st-foot-t">
          Точную цифру называю после короткого разговора о задаче — пятнадцать минут,
          без брифа на сорок вопросов.
        </p>
        <Link href="/kontakty/" className="st-foot-link">
          Обсудить проект <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
