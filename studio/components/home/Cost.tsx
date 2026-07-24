"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { PRICE, formatPrice } from "@/content/pricing";

/*
  БЛОК «СТОИМОСТЬ» — скролл-сцена (реф noth.in). Отвечает ОДНОЙ цифрой, не таблицей.
  Сцена 1 — шапка («Стоимость» на шве ч/б + утверждение).
  Сцена 2 — ПИН (ScrollTrigger pin + scrub, ~300vh): разряды выезжают снизу →
    удержание (только цифра + спутники + линия + строка) → парковка (цифра
    уменьшается и уезжает влево-вверх как заголовок).
  Сцена 3 — контент после парковки: «что двигает цену» + навигация форматов +
    замыкающая строка.
  Весь текст ВСЕГДА в DOM (скрыт opacity/transform, не условным рендером) — робот
  видит блок целиком. Мобильная/reduced-motion — без пина, обычный поток.
  Числа — из content/pricing.ts (не хардкод).
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

const TOP_PAD = 104; // отступ припаркованной цифры от верха (ниже фикс-панели)

export default function Cost() {
  const root = useRef<HTMLElement>(null);

  // числа — из единого источника
  const numStr = formatPrice(PRICE.landing).replace(/\s*₽\s*$/, ""); // «50 000»
  const numChars = Array.from(numStr);
  const rangeLo = formatPrice(PRICE.corporate).replace(/\s*₽\s*$/, "");
  const range = `${rangeLo}–${formatPrice(PRICE.shop)}`; // «120 000–250 000 ₽»
  const a11y = `от ${formatPrice(PRICE.landing)}`;

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 860px)").matches;

    // Мобильная / reduced: без пина. reduced — всё статикой (CSS). Мобильная —
    // одно появление крупной цифры при входе в вьюпорт.
    if (reduce || mobile) {
      if (reduce) return;
      const st = ScrollTrigger.create({
        trigger: el, start: "top 62%", once: true,
        onEnter: () => el.classList.add("st-in"),
      });
      return () => st.kill();
    }

    // ДЕСКТОП — пин-сцена
    el.classList.add("st-js"); // переключает CSS в раскладку сцены
    const q = <T extends Element>(s: string) => el.querySelector(s) as T | null;
    const stage = q<HTMLElement>(".st-stage");
    const num = q<HTMLElement>(".st-num");
    const sub = q<HTMLElement>(".st-sub");
    const line = q<HTMLElement>(".st-line");
    const after = q<HTMLElement>(".st-after");
    const digits = el.querySelectorAll(".st-num-d");
    const pre = q(".st-num-pre");
    const cur = q(".st-num-cur");
    if (!stage || !num || !sub || !line || !after) return;

    const PARK = 0.16; // масштаб припаркованной цифры (~1/6)
    const gutter = () => parseFloat(getComputedStyle(el).getPropertyValue("--gutter")) || 48;

    const ctx = gsap.context(() => {
      // Геометрия целиком на pixel x/y, transform-origin — центр (по умолчанию).
      // Центрирование: ставим ЛЕВЫЙ-ВЕРХНИЙ угол так, чтобы центр попал куда нужно.
      const sw = () => stage.clientWidth, sh = () => stage.clientHeight;
      // База: число центрировано по X, чуть НИЖЕ центра по Y (воздуха сверху больше)
      const setBase = () => {
        gsap.set(num, { x: sw() / 2 - num.offsetWidth / 2, y: sh() * 0.54 - num.offsetHeight / 2, scale: 1 });
        gsap.set(sub, { x: sw() / 2 - sub.offsetWidth / 2, y: sh() * 0.72 });
        gsap.set(line, { x: sw() / 2 - line.offsetWidth / 2, y: sh() * 0.685, scaleX: 0, transformOrigin: "left center" });
      };
      setBase();
      gsap.set(digits, { yPercent: 115 });
      gsap.set([pre, cur], { autoAlpha: 0 });
      gsap.set(sub, { autoAlpha: 0 });
      gsap.set(after, { autoAlpha: 0, y: 28 });

      // Парковка: центр уменьшенной цифры так, чтобы её левый-верхний угол = (gutter, TOP_PAD)
      const numParkX = () => gutter() + (num.offsetWidth * PARK) / 2 - num.offsetWidth / 2;
      const numParkY = () => TOP_PAD + (num.offsetHeight * PARK) / 2 - num.offsetHeight / 2;
      const subParkX = () => gutter();
      const subParkY = () => TOP_PAD + num.offsetHeight * PARK + 18;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage, start: "top top", end: "+=300%",
          scrub: 0.5, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onRefresh: setBase, // пересчёт базы при resize/refresh
        },
      });

      // ФАЗА 1 (0–0.24) — приход разрядов, слева направо, каждый одним движением
      tl.to(pre, { autoAlpha: 1, duration: 0.05 }, 0.0)
        .to(digits, { yPercent: 0, ease: "power3.out", duration: 0.16, stagger: 0.03 }, 0.01)
        .to(cur, { autoAlpha: 1, duration: 0.05 }, 0.2)
        // ФАЗА 2 (0.25–0.5) — удержание: линия, затем строка про серьёзные проекты
        .to(line, { scaleX: 1, ease: "power2.inOut", duration: 0.1 }, 0.31)
        .to(sub, { autoAlpha: 1, duration: 0.1 }, 0.4)
        // ФАЗА 3 (0.5–1) — парковка цифры влево-вверх + проявление контента сцены 3
        .to(num, { scale: PARK, x: numParkX, y: numParkY, ease: "power2.inOut", duration: 0.42 }, 0.52)
        .to(sub, { x: subParkX, y: subParkY, ease: "power2.inOut", duration: 0.42 }, 0.52)
        .to(line, { autoAlpha: 0, duration: 0.16 }, 0.52)
        .to(after, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.34 }, 0.62);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="stoimost" ref={root} className="st" aria-labelledby="st-title">
      {/* СЦЕНА 1 — шапка на шве */}
      <h2 className="st-head" id="st-title">
        <span className="st-word">Стоимость</span>
        <span className="st-claim">
          Мы не самые дешёвые.<br />Зато заказывать<br />придётся один раз.
        </span>
      </h2>

      {/* СЦЕНА 2+3 — пин-сцена */}
      <div className="st-stage">
        {/* число + линия + строка про серьёзные проекты */}
        <p className="st-num" aria-label={a11y}>
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
        <span className="st-line" aria-hidden />
        <p className="st-sub">Проекты с серьёзной задачей — {range}</p>

        {/* СЦЕНА 3 — контент после парковки (всегда в DOM) */}
        <div className="st-after">
          <ul className="st-drivers">
            {DRIVERS.map((d, i) => (
              <li key={i} className="st-drv">{d}</li>
            ))}
          </ul>

          <nav className="st-nav" aria-label="Форматы сайтов">
            {FORMATS.map((f) => (
              <Link key={f.href} href={f.href} className="st-nav-a">
                <h3 className="st-nav-h">{f.label}</h3>
              </Link>
            ))}
          </nav>

          <div className="st-foot">
            <p className="st-foot-t">
              Точную цифру называю после короткого разговора о задаче — пятнадцать минут,
              без брифа на сорок вопросов.
            </p>
            <Link href="/kontakty/" className="st-foot-link">
              Обсудить проект <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
