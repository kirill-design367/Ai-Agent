"use client";

import { useEffect, useRef } from "react";

/*
  БЛОК 02 — MANIFESTO. Словарная статья. Композиция по φ: единый левый блок
  (Aurea + транскрипция + этимология, левый край на 8%), манифест в правой нижней
  зоне (левый край 61.8%, верх 61.8%), диагональная пустота между ними. Глубина
  180vh: группы проявляются по мере прокрутки (каждая своим IO). Появление —
  «Aurea» побуквенно из-под маски (stagger), транскрипция/этимология сдвигом
  слева-направо, манифест построчно из-под маски. reduce-motion — всё сразу.

  Шрифт «Aurea»: заявлена Antiqva, но загруженный файл Antiqva — КАПИТЕЛЬ (unicase,
  строчные нарисованы в высоту прописных, проверено по метрикам глифов), поэтому
  mixed-case («не капс», критично по ТЗ) в ней невозможен. Словоформа набрана
  mixed-case антиквой (переменная --mf-serif). При наличии брендовой антиквы со
  строчными — заменить одной переменной.

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
    return () => io.disconnect();
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
          <p className="mf2-ipa mf2-rv"><span className="mf2-ipa-tr">[au·re·a]</span> существительное</p>
          <p className="mf2-etym mf2-rv">
            от&nbsp;лат. <i>aureus</i> — «золотой», «ценный», «совершенный»
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
