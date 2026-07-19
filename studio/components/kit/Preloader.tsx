"use client";

import { useEffect, useRef, useState } from "react";

/*
  ПРЕЛОАДЕР — бренд-занавес (§1.4). Тёмное полотно, из-под обреза выезжает вордмарк
  AUREA, затем полотно уходит вверх, открывая страницу. Это ЕДИНСТВЕННОЕ место
  фирменного жеста «разворот» — на самих экранах его больше нет. ТОЛЬКО главная,
  ТОЛЬКО первый визит за сессию (sessionStorage). Клиентский — в SSR-HTML его нет,
  поэтому боты и Lighthouse-lab получают страницу без него, а LCP-текст под
  полотном уже отрисован (цена для LCP ≈ 0). reduce-motion → не показываем.
*/
export default function Preloader() {
  const [show, setShow] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (sessionStorage.getItem("aurea_seen")) return;
    sessionStorage.setItem("aurea_seen", "1");
    setShow(true);
    document.documentElement.dataset.preloading = "1";

    const el = root.current;
    // тайминги совпадают с CSS-анимацией: вордмарк выезжает → полотно уходит вверх
    const liftAt = window.setTimeout(() => el?.classList.add("is-lifting"), 920);
    const doneAt = window.setTimeout(() => {
      delete document.documentElement.dataset.preloading;
      setShow(false);
    }, 1560);

    return () => {
      window.clearTimeout(liftAt);
      window.clearTimeout(doneAt);
    };
  }, []);

  if (!show) return null;
  return (
    <div ref={root} className="preloader" aria-hidden>
      <span className="pl-word">
        <span className="pl-word-in">AUREA</span>
      </span>
      <span className="pl-word pl-word--sub">
        <span className="pl-word-in pl-word-in--sub">от точки до шедевра</span>
      </span>
    </div>
  );
}
