"use client";

import { useEffect, useRef } from "react";

/*
  БЛОК 02 — MANIFESTO. Словарная статья: «Aurea» как термин (mixed-case,
  строчными — как в словаре). Композиция по золотому сечению: верхние ~38%
  пустые (догорают частицы из hero), «Aurea» слева с базой ~38% высоты, манифест
  в правой нижней зоне (левый край 61.8%, верх 61.8%), между ними — огромная
  диагональная пустота. В конце — акцентный пуант. Глубина блока 180vh: группы
  проявляются в свои моменты прокрутки (каждая своим IntersectionObserver), между
  ними — паузы-воздух. Никакого скролл-скраба/WebGL. Частицы hero долетают сверху.

  ШРИФТ «Aurea»/финала: заявлена Antiqva, но это капительная (unicase) гарнитура
  без строчных — mixed-case в ней невозможен, а mixed-case здесь критичен. Поэтому
  словоформа и пуант набраны элегантной mixed-case антиквой (Georgia-стек). При
  наличии брендовой антиквы со строчными — заменить одной переменной --mf-serif.

  Сохранено для другой секции (убрано отсюда по ТЗ):
    «То, что делает первое впечатление ценнее, чем слова.»
*/
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
    }, { rootMargin: "0px 0px -16% 0px", threshold: 0.2 });
    const vh = window.innerHeight;
    items.forEach((i) => {
      if (i.getBoundingClientRect().top < vh * 0.85) i.classList.add("is-in"); // над сгибом — сразу
      else io.observe(i);
    });
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} className="mf2" aria-labelledby="mf2-title" data-no-reveal>
      <div className="mf2-inner">
        <div className="mf2-head mf2-rv">
          <h2 className="mf2-word" id="mf2-title"><span className="mf2-word-in">Aurea</span></h2>
          <p className="mf2-ipa"><span className="mf2-ipa-tr">[au·re·a]</span> существительное</p>
        </div>

        <p className="mf2-etym mf2-rv">
          от&nbsp;лат. <i>aureus</i> — «золотой», «ценный», «совершенный»
        </p>

        <div className="mf2-manifesto mf2-rv">
          <p>
            Вы&nbsp;уже делаете свою работу хорошо. Но&nbsp;сайт часто выглядит
            так, будто стоит дешевле, чем то, что вы&nbsp;на&nbsp;самом деле создаёте.
          </p>
          <p>
            Мы&nbsp;делаем цифровое присутствие, которое соответствует уровню
            вашего дела. Когда первое впечатление совпадает с&nbsp;реальной
            ценностью, доверие возникает ещё до&nbsp;первого разговора.
          </p>
        </div>

        <p className="mf2-final mf2-rv">
          <span className="mf2-final-l">Хорошие бренды общаются.</span>
          <span className="mf2-final-l">Великие бренды удивляют.</span>
        </p>
      </div>
    </section>
  );
}
