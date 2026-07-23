"use client";

import { useEffect, useRef } from "react";

/*
  БЛОК 02 — MANIFESTO как scroll-театр. «AUREA» здесь не заголовок, а МОНУМЕНТ:
  гигантская антиква, обрезанная краями экрана (целиком не видна — глаз достраивает).
  Сцена ПИНится (sticky) на время прокрутки блока: слово дрейфует по горизонтали и
  масштабируется, буквы расходятся (per-letter параллакс) — надпись «читается»
  движением. В диагональной пустоте за буквами всплывает 3D-объект (частицы hero,
  тот же лак — на глобальном канвасе). Манифест врезается в верхний-правый контур
  слова. Транскрипция — тонкой строкой сверху. reduce-motion — всё статично.

  Шрифт «Aurea» — Antiqva (капитель, по закрытой теме шрифтов), намеренно капсом.
  Сохранено для отдельной секции: «Хорошие бренды общаются. Великие бренды удивляют.»
*/
const WORD = ["A", "u", "r", "e", "a"];

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const word = el.querySelector<HTMLElement>(".mf2-word");
    const letters = Array.from(el.querySelectorAll<HTMLElement>(".mf2-l"));
    const meta = el.querySelector<HTMLElement>(".mf2-meta");
    const man = el.querySelector<HTMLElement>(".mf2-manifesto");
    const reveals = Array.from(el.querySelectorAll<HTMLElement>(".mf2-rv"));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { reveals.forEach((r) => r.classList.add("is-in")); return; }

    // прогресс p (0..1) по пути пиннинга сцены: от входа блока до его выхода.
    let raf = 0, running = false, vh = window.innerHeight;
    let secTop = 0, secH = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      secTop = r.top + (window.scrollY || 0);
      secH = el.offsetHeight;
      vh = window.innerHeight;
    };
    measure();

    const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
    const cen = (WORD.length - 1) / 2;

    const apply = () => {
      running = false;
      const y = window.scrollY || 0;
      // сцена пинится, пока (secTop) уходит вверх на (secH - vh)
      const p = clamp01((y - secTop) / Math.max(1, secH - vh));

      // слово: горизонтальный дрейф + масштаб (входит компактным, вырастает,
      // уезжает влево — открывая обрезанные края поочерёдно).
      const driftX = (0.5 - p) * 14;            // +7vw → -7vw
      const scale = 0.9 + p * 0.2;              // 0.9 → 1.1
      if (word) word.style.transform = `translate(-50%, -50%) translateX(${driftX.toFixed(2)}vw) scale(${scale.toFixed(3)})`;
      // буквы расходятся от центра по мере прокрутки (per-letter параллакс)
      letters.forEach((l, i) => {
        const sp = (i - cen) * p * 2.1;          // vw наружу
        l.style.transform = `translateX(${sp.toFixed(2)}vw)`;
      });

      // транскрипция — проявляется рано и держится
      if (meta) {
        const mp = clamp01((p - 0.04) / 0.16);
        meta.style.opacity = String(mp);
        meta.style.transform = `translateX(${((1 - mp) * -26).toFixed(1)}px)`;
      }
      // манифест — врезается позже, построчно (через CSS is-in по порогу)
      if (man) {
        const mp = clamp01((p - 0.24) / 0.22);
        if (mp > 0.02) man.classList.add("is-in"); else man.classList.remove("is-in");
        man.style.setProperty("--mp", mp.toFixed(3));
      }
    };
    const onScroll = () => { if (!running) { running = true; raf = requestAnimationFrame(apply); } };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { measure(); apply(); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={root} className="mf2" aria-labelledby="mf2-title" data-no-reveal>
      <div className="mf2-stage">
        <h2 className="mf2-word" id="mf2-title" aria-label="Aurea">
          {WORD.map((ch, i) => (
            <span className="mf2-l" key={i} aria-hidden>{ch}</span>
          ))}
        </h2>

        {/* транскрипция · часть речи · этимология — одной строкой */}
        <p className="mf2-meta mf2-rv">
          <span className="mf2-ipa-tr">[au·re·a]</span>
          <span className="mf2-sep" aria-hidden>·</span>существительное
          <span className="mf2-sep" aria-hidden>·</span>от&nbsp;лат. <i>aureus</i> — «золотой», «ценный», «совершенный»
        </p>

        <div className="mf2-manifesto mf2-rv">
          <p><span className="mf2-ln">
            Сайт&nbsp;— это не&nbsp;про красиво. Это про то, выберут вас или
            следующего в&nbsp;поиске.
          </span></p>
          <p><span className="mf2-ln">
            Мы&nbsp;делаем сайты, которые продают: от&nbsp;лендинга частного
            эксперта до&nbsp;полноценного сайта компании. Дизайн здесь&nbsp;—
            инструмент, а&nbsp;не&nbsp;украшение. Каждый экран, каждая строка
            и&nbsp;каждая пауза работают на&nbsp;одно&nbsp;— чтобы клиент дошёл
            до&nbsp;заявки и&nbsp;не&nbsp;ушёл сравнивать.
          </span></p>
        </div>
      </div>
    </section>
  );
}
