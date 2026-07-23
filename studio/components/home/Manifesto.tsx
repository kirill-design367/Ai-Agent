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
    const dbg = !!(window as unknown as { __mfDbg?: boolean }).__mfDbg;

    // ── ПОЯВЛЕНИЕ — ДЕТЕРМИНИРОВАННО по РЕАЛЬНОЙ позиции (не IntersectionObserver).
    //    На каждом скролле через rAF проверяем getBoundingClientRect().top: как только
    //    элемент выше 85% высоты вьюпорта — ставим is-in (CSS-переход отыгрывает
    //    появление). Не зависит от таймингов IO/iOS и НЕ может «отыграть заранее»:
    //    класс ставится строго когда элемент реально виден. Взводится после того, как
    //    стартовый форс-скролл к hero улёгся (иначе блок мог пометиться при загрузке).
    const isDesktop = window.matchMedia("(min-width: 761px)").matches;
    const head = el.querySelector<HTMLElement>(".mf2-head");
    const man = el.querySelector<HTMLElement>(".mf2-manifesto");
    let pending = items.slice();
    let armed = false, rafReveal = 0, rafPar = 0, queued = false, blockTop = 0;
    const measure = () => { blockTop = el.getBoundingClientRect().top + (window.scrollY || 0); };
    measure();
    const clampY = (prog: number, k: number, cap: number) => {
      const vh = window.innerHeight;
      return Math.max(-0.25 * vh, Math.min(cap * vh, prog * k));
    };

    // ПОЯВЛЕНИЕ: НЕПРЕРЫВНЫЙ rAF-цикл (не зависит от scroll-событий — на iOS во время
    // инерции они приходят редко/рывками). Крутится только пока есть непоявившиеся
    // группы, затем сам останавливается. Класс ставится строго по реальной позиции.
    const revealLoop = () => {
      rafReveal = requestAnimationFrame(revealLoop);
      if (!armed) return;
      const vh = window.innerHeight;
      pending = pending.filter((i) => {
        if (i.getBoundingClientRect().top < vh * 0.85) { i.classList.add("is-in"); if (dbg) console.log("[mf2] reveal", i.className, "@scrollY", Math.round(window.scrollY)); return false; }
        return true;
      });
      if (!pending.length) { cancelAnimationFrame(rafReveal); rafReveal = 0; }
    };
    rafReveal = requestAnimationFrame(revealLoop);
    // взводим появление после стартового форс-скролла (SmoothScroll держит верх ~1.5с)
    const armT = window.setTimeout(() => { armed = true; if (dbg) console.log("[mf2] armed; pending", pending.length); }, 1600);

    // ПАРАЛЛАКС островов — только десктоп (на мобиле одна колонка, transform ломал бы
    // вёрстку). Скролл-триггер + rAF (не на каждом кадре впустую).
    const par = () => {
      queued = false;
      if (!isDesktop) return;
      const prog = (window.scrollY || 0) - blockTop;
      if (head) head.style.transform = `translate3d(0, ${clampY(prog, 0.85, 0.34).toFixed(1)}px, 0)`;
      if (man) man.style.transform = `translate3d(0, ${clampY(prog, 0.72, 0.26).toFixed(1)}px, 0)`;
    };
    const onScroll = () => { if (!queued) { queued = true; rafPar = requestAnimationFrame(par); } };
    if (isDesktop) { window.addEventListener("scroll", onScroll, { passive: true }); par(); }
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(rafReveal); cancelAnimationFrame(rafPar); window.clearTimeout(armT);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", measure);
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
