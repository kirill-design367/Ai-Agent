"use client";

import { useEffect, useRef } from "react";

/*
  БЛОК 02 — MANIFESTO. Словарная статья, разворот дорогого журнала. Композиция по
  φ: левый остров (Aurea ~6vw + одна мелкая строка «транскрипция·часть речи·
  этимология», левый край 4.5%, база ~38.2% высоты) сверху слева; манифест — правая
  нижняя зона (левый край 61.8%, верх ~56%, правый край не доходит до края экрана).
  Между островами — большая диагональная пустота. Глубина ~265vh: над Aurea ~120vh
  воздуха (догорают частицы hero), события разнесены по прокрутке (каждое — свой IO).
  Появление: «Aurea» побуквенно из-под маски, строка-статья сдвигом слева-направо
  (с паузой), манифест построчно из-под маски. Параллакс (только transform): левый
  остров почти стоит, манифест уезжает быстрее → расходятся. reduce-motion — сразу.

  Шрифт «Aurea» — Antiqva (капитель/unicase, по закрытой теме шрифтов): строчные
  нарисованы в высоту прописных, поэтому слово набирается капителью — намеренно.

  Сохранено для отдельной секции (убрано отсюда по ТЗ):
    «Хорошие бренды общаются. Великие бренды удивляют.»
*/
const WORD = ["A", "u", "r", "e", "a"];

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".mf2-rv"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((i) => i.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -14% 0px", threshold: 0.25 });
    const vh = window.innerHeight;
    items.forEach((i) => {
      if (i.getBoundingClientRect().top < vh * 0.82) i.classList.add("is-in");
      else io.observe(i);
    });

    // ── ПАРАЛЛАКС по скроллу (только transform): левый блок почти стоит (apparent
    //    ~0.1× скорости страницы), манифест чуть быстрее (~0.28×) → блоки расходятся.
    const head = el.querySelector<HTMLElement>(".mf2-head");
    const man = el.querySelector<HTMLElement>(".mf2-manifesto");
    let blockTop = 0, praf = 0, prunning = false;
    const measure = () => { blockTop = el.getBoundingClientRect().top + (window.scrollY || 0); };
    measure();
    // сильный пин (почти стоит), но с ПОТОЛКОМ: после ~полэкрана скролла элемент
    // «отпускается» и уезжает вместе со страницей → не наплывает на след. блок.
    const clampY = (prog: number, k: number, cap: number) =>
      Math.max(-0.25 * vh, Math.min(cap * vh, prog * k));
    const ploop = () => {
      prunning = false;
      const prog = (window.scrollY || 0) - blockTop;
      // левый остров почти стоит (apparent ~0.1× = k 0.9), манифест уезжает
      // заметно быстрее, но всё ещё медленнее страницы (apparent ~0.4× = k 0.6)
      // → острова расходятся. Потолок отпускает их, чтобы не наплыть на след. блок.
      if (head) head.style.transform = `translate3d(0, ${clampY(prog, 0.9, 0.7).toFixed(1)}px, 0)`;
      if (man) man.style.transform = `translate3d(0, ${clampY(prog, 0.6, 0.45).toFixed(1)}px, 0)`;
    };
    const onParallax = () => { if (!prunning) { prunning = true; praf = requestAnimationFrame(ploop); } };
    ploop();
    window.addEventListener("scroll", onParallax, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      io.disconnect(); cancelAnimationFrame(praf);
      window.removeEventListener("scroll", onParallax); window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section ref={root} className="mf2" aria-labelledby="mf2-title" data-no-reveal>
      <div className="mf2-inner">
        <div className="mf2-head">
          <h2 className="mf2-word mf2-rv" id="mf2-title" aria-label="Aurea">
            {WORD.map((ch, i) => (
              <span className="mf2-l" key={i} aria-hidden><span className="mf2-l-in">{ch}</span></span>
            ))}
          </h2>
          {/* транскрипция · часть речи · этимология — одной мелкой строкой */}
          <p className="mf2-meta mf2-rv">
            <span className="mf2-ipa-tr">[au·re·a]</span>
            <span className="mf2-sep" aria-hidden>·</span>существительное
            <span className="mf2-sep" aria-hidden>·</span>от&nbsp;лат. <i>aureus</i> — «золотой», «ценный», «совершенный»
          </p>
        </div>

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
