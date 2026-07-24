"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { PRICE, formatPrice } from "@/content/pricing";

/*
  БЛОК «СТОИМОСТЬ» — STICKY-скролл-сцена (НЕ pin). Внешний контейнер ~340vh,
  внутри sticky-wrapper 100vh; ScrollTrigger(scrub:1) двигает ТОЛЬКО трансформы.
  Родной скролл не замирает.

  Фазы (прогресс 0..1):
    0  (.00–.08) бесшовный чёрный вход — рамка проявляется белым на чёрном.
    1  (.08–.30) разряды выезжают снизу по одному, L→R, белые на чёрном.
    2  (.30–.45) ИНВЕРСИЯ: фон ч→б, число б→ч, скрабом. Число неподвижно. Тишина.
    3  (.45–.62) парковка: число ~1/6 уезжает влево-вверх под «СТОИМОСТЬ»;
                 затем «от», затем «₽», затем строка ROOFTOP.
    4  (.62–1.0) поле услуг: строка форматов + панель (5 наборов, смена по
                 наведению) + замыкающая строка.

  Шрифты: DRUK = «СТОИМОСТЬ» + мини-манифест. ANTIQVA = число/«от»/«₽».
  ROOFTOP = всё читаемое. «₽» собран из антиквенной «Р» + перекладина (.rub).
  Весь текст ВСЕГДА в DOM (opacity/transform, не условный рендер) — SEO.
  Голос: только «мы»/«наши». Числа — из content/pricing.ts.
  Мобильная/reduced — без sticky, поток; инверсия сохранена, панель-аккордеон.
*/

// Форматы: первые 4 — ссылки; 5-й «Ещё мы делаем» — h3 без ссылки.
const FORMATS = [
  { label: "Лендинг", href: "/uslugi/landing/" },
  { label: "Корпоративный сайт", href: "/uslugi/korporativnyi-sait/" },
  { label: "Интернет-магазин", href: "/uslugi/internet-magazin/" },
  { label: "Поддержка и развитие", href: "/uslugi/podderzhka/" },
  { label: "Ещё мы делаем", href: null },
] as const;

// Панель: индекс 0 — состояние по умолчанию, 1..5 — по форматам. Все в DOM.
const PANEL: string[][] = [
  [
    "Объём задачи и количество экранов",
    "Сложность движения — от аккуратных появлений до 3D и WebGL",
    "Интеграции: CRM, онлайн-оплата, запись, 1С",
    "Тексты и изображения — ваши или наши",
    "Языковые и региональные версии",
  ],
  [
    "Одна страница, один сценарий, одна заявка",
    "Индивидуальный дизайн без конструкторов и шаблонов",
    "Движение по скроллу, 3D и частицы — по задаче",
    "Форма в Telegram или CRM, аналитика с настроенными целями",
    "Квиз-калькулятор и расчёт стоимости прямо на странице",
  ],
  [
    "Структура собрана под поисковые запросы, а не под красоту",
    "Каталог услуг, кейсы, блог с рубриками",
    "Админка: правки текста и картинок без программиста",
    "Внутренняя перелинковка, работающая на позиции",
    "Интеграции с CRM, 1С и телефонией",
  ],
  [
    "Каталог с фильтрами, поиском и вариациями товара",
    "Корзина и оформление заказа на одном экране",
    "Онлайн-оплата: ЮKassa, Т-Банк, СБП",
    "Доставка, трек-номера, промокоды, остатки",
    "Выгрузка фидов и электронная коммерция в аналитике",
  ],
  [
    "Мониторинг доступности, резервные копии, обновления",
    "Домен, SSL и сервер под нашим контролем",
    "Правки контента и новые разделы по мере роста",
    "Ежемесячный отчёт: скорость, ошибки, трафик, заявки",
    "Ошибки нашей работы правим бесплатно и всегда",
  ],
  [
    "SaaS-платформы и личные кабинеты",
    "Telegram-боты и чат-боты с искусственным интеллектом",
    "Автоматизация заявок и связка сервисов между собой",
    "Дизайн-система и брендинг для цифровых продуктов",
    "Аудит и переделка существующего сайта",
  ],
];

// Волосяные линии панели — разной длины (не прямоугольник): верхняя дальше вправо.
const RULE_W = ["96%", "82%", "70%", "61%", "52%"];

export default function Cost() {
  const root = useRef<HTMLElement>(null);

  // числа — из единого источника
  const numStr = formatPrice(PRICE.landing).replace(/\s*₽\s*$/, ""); // «50 000»
  const numChars = Array.from(numStr);
  const range = `${formatPrice(PRICE.corporate).replace(/\s*₽\s*$/, "")}–${formatPrice(PRICE.shop)}`;
  const a11y = `от ${formatPrice(PRICE.landing)}`;

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const q = <T extends Element>(s: string) => el.querySelector(s) as T | null;
    const qa = (s: string) => Array.from(el.querySelectorAll(s));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 860px)").matches;

    // ── ПАНЕЛЬ: смена набора по наведению (десктоп) / тапу (мобильная) ──
    const sets = qa(".st-set") as HTMLElement[];
    const formats = qa(".st-fmt") as HTMLElement[];
    let active = 0;
    let leaveTimer = 0;
    const showSet = (idx: number) => {
      if (idx === active) return;
      const prev = sets[active];
      const next = sets[idx];
      active = idx;
      // .is-active — семантика + мобильный display-аккордеон; десктоп меняет opacity
      prev.classList.remove("is-active");
      next.classList.add("is-active");
      gsap.to(prev.querySelectorAll("li"), {
        autoAlpha: 0, y: -12, duration: 0.28, ease: "power2.in", overwrite: true,
      });
      gsap.fromTo(next.querySelectorAll("li"),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.04, overwrite: true },
      );
    };
    const setFormatFocus = (idx: number | null) => {
      formats.forEach((f, i) => {
        const on = idx === null ? true : i === idx;
        gsap.to(f, {
          opacity: on ? 1 : 0.35,
          letterSpacing: i === idx ? "0.28em" : "0.26em", // раскрытие трекинга ~0.02em
          duration: 0.5, ease: "power2.out", overwrite: true,
        });
      });
    };

    // reduced-motion: панель статично на состоянии по умолчанию, без интерактива.
    if (!reduce) {
      formats.forEach((f, i) => {
        const idx = i + 1;
        f.addEventListener("mouseenter", () => {
          if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = 0; }
          showSet(idx);
          setFormatFocus(i);
        });
        // мобильная — тап переключает (аккордеон: открыт один)
        f.addEventListener("click", (e) => {
          if (window.matchMedia("(max-width: 860px)").matches) {
            e.preventDefault();
            el.querySelectorAll(".st-fmt").forEach((x) => x.classList.remove("is-open"));
            if (active === idx) { showSet(0); }
            else { f.classList.add("is-open"); showSet(idx); }
          }
        });
      });
      const nav = q<HTMLElement>(".st-panelwrap");
      nav?.addEventListener("mouseleave", () => {
        leaveTimer = window.setTimeout(() => {
          showSet(0);
          setFormatFocus(null);
          leaveTimer = 0;
        }, 250);
      });
      nav?.addEventListener("mouseenter", () => {
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = 0; }
      });
    }

    // ── МОБИЛЬНАЯ / REDUCED: без sticky-сцены ──
    if (reduce || mobile) {
      el.classList.add("st-flow");
      if (reduce) return;
      // инверсия при входе числа в вьюпорт (без скраба)
      const st = ScrollTrigger.create({
        trigger: q(".st-num"), start: "top 72%", once: true,
        onEnter: () => el.classList.add("st-inv"),
      });
      return () => st.kill();
    }

    // ══ ДЕСКТОП — STICKY-СЦЕНА ══
    el.classList.add("st-scene");
    const sticky = q<HTMLElement>(".st-sticky");
    const bg = q<HTMLElement>(".st-bg");
    const num = q<HTMLElement>(".st-num");
    const val = q<HTMLElement>(".st-val");
    const pre = q<HTMLElement>(".st-pre");
    const cur = q<HTMLElement>(".st-cur");
    const digits = qa(".st-d") as HTMLElement[];
    const word = q<HTMLElement>(".st-word");
    const manifesto = q<HTMLElement>(".st-manifesto");
    const sub = q<HTMLElement>(".st-sub");
    const field = q<HTMLElement>(".st-field");
    if (!sticky || !bg || !num || !val || !field) return;

    const gutter = () =>
      parseFloat(getComputedStyle(el).getPropertyValue("--gutter")) || 48;
    const PARK = 0.16;

    const ctx = gsap.context(() => {
      gsap.set(num, { transformOrigin: "left top" });

      // геометрия (пересчёт на refresh/resize)
      const geo = { monX: 0, monY: 0, parkX: 0, parkY: 0 };
      const setBase = () => {
        const sw = sticky.clientWidth, sh = sticky.clientHeight;
        // монумент: число центрировано по X, чуть выше центра по Y
        geo.monX = sw / 2 - num.offsetWidth / 2;
        geo.monY = sh * 0.44 - num.offsetHeight / 2;
        // парковка: левый-верхний угол; база уедет под «СТОИМОСТЬ»
        geo.parkX = gutter() + 26; // воздух слева под «от»
        geo.parkY = sh * 0.335; // базовая линия числа ≈ 0.382 сверху
        gsap.set(num, { x: geo.monX, y: geo.monY, scale: 1 });
      };

      // стартовое состояние
      gsap.set(digits, { yPercent: 120 });
      gsap.set([pre, cur], { autoAlpha: 0 });
      gsap.set(sub, { autoAlpha: 0, y: 24 });
      gsap.set(field, { autoAlpha: 0, y: 34 });
      gsap.set([word, manifesto], { autoAlpha: 0 });
      // панель: набор по умолчанию виден, остальные скрыты (наложены абсолютом)
      sets.forEach((s, i) =>
        gsap.set(s.querySelectorAll("li"), { autoAlpha: i === 0 ? 1 : 0 })
      );
      setBase();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el, start: "top top", end: "bottom bottom",
          scrub: 1, invalidateOnRefresh: true, onRefresh: setBase,
        },
      });

      // ФАЗА 0 — рамка проявляется белым на чёрном
      tl.to(word, { autoAlpha: 1, duration: 0.05 }, 0.02)
        .to(manifesto, { autoAlpha: 1, duration: 0.05 }, 0.05)

        // ФАЗА 1 — приход разрядов снизу, L→R, каждый одним движением
        .to(digits, { yPercent: 0, ease: "power3.out", duration: 0.16, stagger: 0.028 }, 0.08)

        // ФАЗА 2 — ИНВЕРСИЯ (фон ч→б, число+рамка б→ч), число неподвижно
        .to(bg, { backgroundColor: "#ffffff", ease: "none", duration: 0.15 }, 0.30)
        .to([num, word, manifesto], { color: "#000000", ease: "none", duration: 0.15 }, 0.30)

        // ФАЗА 3 — парковка числа, затем «от», «₽», строка
        .to(num, {
          x: () => geo.parkX, y: () => geo.parkY, scale: PARK,
          ease: "power3.inOut", duration: 0.15,
        }, 0.45)
        .to(pre, { autoAlpha: 1, duration: 0.04 }, 0.55)
        .to(cur, { autoAlpha: 1, duration: 0.04 }, 0.585)
        .to(sub, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.06 }, 0.60)

        // ФАЗА 4 — поле услуг
        .to(field, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.14 }, 0.66)

        // микропараллакс рамки (постоянное движение, нет мёртвых участков)
        .fromTo(word, { y: 0 }, { y: -26, ease: "none", duration: 1 }, 0)
        .fromTo(manifesto, { y: 0 }, { y: 40, ease: "none", duration: 1 }, 0)
        .to({}, { duration: 0 }, 1); // фиксируем полную длину таймлайна = 1

      ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="stoimost" ref={root} className="st" aria-labelledby="st-title">
      <div className="st-outer">
        <div className="st-sticky">
          <div className="st-bg" aria-hidden />

          {/* ── постоянная рамка: h2 = слово + мини-манифест (оба видимы) ── */}
          <h2 className="st-head" id="st-title">
            <span className="st-word">Стоимость</span>
            <span className="st-manifesto">
              Называем цену сразу.<br />И не меняем её<br />по дороге.
            </span>
          </h2>

          {/* ── монумент: число + спутники «от»/«₽» ── */}
          <p className="st-num" aria-label={a11y}>
            <span className="st-pre" aria-hidden>от</span>
            <span className="st-val" aria-hidden>
              {(() => {
                let d = -1;
                return numChars.map((c, i) =>
                  /\d/.test(c) ? (
                    <span key={i} className="st-col" style={{ ["--i" as string]: ++d }}>
                      <span className="st-d">{c}</span>
                    </span>
                  ) : (
                    <span key={i} className="st-gap" aria-hidden />
                  )
                );
              })()}
            </span>
            <span className="st-cur rub" aria-hidden>Р</span>
          </p>

          {/* ── строка про серьёзные проекты (ROOFTOP) ── */}
          <p className="st-sub">Проекты с серьёзной задачей — {range}</p>

          {/* ── поле услуг (фаза 4) ── */}
          <div className="st-field">
            <div className="st-panelwrap">
              {/* ПАНЕЛЬ сверху — на месте бывшего списка «что двигает цену» */}
              <div className="st-panel">
                {/* волосяные линии — статичный каркас, не мигает */}
                <div className="st-rules" aria-hidden>
                  {RULE_W.map((w, i) => (
                    <span key={i} className="st-rule" style={{ width: w }} />
                  ))}
                </div>
                {/* все 5 наборов — постоянно в DOM (коммерческая семантика) */}
                {PANEL.map((set, si) => (
                  <ul
                    key={si}
                    className={`st-set${si === 0 ? " is-active" : ""}`}
                    data-set={si}
                  >
                    {set.map((line, li) => (
                      <li key={li}>{line}</li>
                    ))}
                  </ul>
                ))}
              </div>

              {/* ФОРМАТЫ под панелью — наводишь здесь, меняется выше */}
              <nav className="st-formats" aria-label="Форматы сайтов">
                {FORMATS.map((f, i) =>
                  f.href ? (
                    <Link key={i} href={f.href} className="st-fmt" data-set={i + 1}>
                      <h3 className="st-fmt-h">{f.label}</h3>
                    </Link>
                  ) : (
                    <span key={i} className="st-fmt st-fmt--flat" data-set={i + 1}>
                      <h3 className="st-fmt-h">{f.label}</h3>
                    </span>
                  )
                )}
              </nav>
            </div>

            <div className="st-foot">
              <p className="st-foot-t">
                Точную цифру называем после короткого разговора о задаче —
                пятнадцать минут, без брифа на сорок вопросов.
              </p>
              <Link href="/kontakty/" className="st-foot-link">
                Обсудить проект <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
