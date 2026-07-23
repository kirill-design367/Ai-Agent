"use client";

import { useEffect, useRef } from "react";

/*
  БЛОК 02 — MANIFESTO. Словарная статья: бренд как термин, не как список услуг.
  Тихая зона после hero — воздух, чтение, спокойствие. Композиция: гигантская
  «Aurea» слева-сверху, манифест справа-снизу, огромная диагональная пустота
  между ними. Тонкие технические метки (крестики + вертикали колонок) — на грани
  различимости. Motion — однократный reveal на IntersectionObserver + CSS (без
  GSAP/скролл-скраба/WebGL). Частицы из hero долетают сверху (канвас 150vh) —
  связывают блоки. Контент — в SSR-HTML (h2 семантически корректен, SEO цел).
*/
export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("is-in"); return; }
    // над сгибом — показать сразу без мигания; иначе — вычертить при входе
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} className="mf2" aria-labelledby="mf2-title" data-no-reveal>
      {/* тонкие технические метки сетки — почти невидимые */}
      <div className="mf2-grid" aria-hidden>
        <span className="mf2-vline" style={{ left: "25%" }} />
        <span className="mf2-vline" style={{ left: "50%" }} />
        <span className="mf2-vline" style={{ left: "75%" }} />
        <span className="mf2-cross" style={{ left: "25%", top: "18%" }} />
        <span className="mf2-cross" style={{ left: "75%", top: "34%" }} />
        <span className="mf2-cross" style={{ left: "50%", top: "72%" }} />
        <span className="mf2-cross" style={{ left: "25%", top: "88%" }} />
      </div>

      <div className="mf2-wrap">
        <p className="mf2-kicker">02 — AUREA</p>

        <h2 className="mf2-word" id="mf2-title"><span className="mf2-word-in">Aurea</span></h2>
        <p className="mf2-ipa"><span className="mf2-ipa-tr">[au·re·a]</span> существительное</p>

        <p className="mf2-def">«То, что делает первое впечатление ценнее, чем&nbsp;слова.»</p>

        <p className="mf2-etym">от&nbsp;лат. <i>aureus</i> — «золотой», «ценный», «совершенный»</p>

        <div className="mf2-manifesto">
          <p>
            Большинство компаний уже построили хороший продукт. Но&nbsp;их&nbsp;сайт
            всё ещё выглядит так, будто он&nbsp;стоит намного дешевле самого бизнеса.
          </p>
          <p>
            Мы&nbsp;создаём цифровое присутствие, которое наконец начинает
            соответствовать уровню компании. Когда первое впечатление совпадает
            с&nbsp;реальной ценностью, доверие возникает ещё до&nbsp;первого разговора.
          </p>
        </div>
      </div>
    </section>
  );
}
