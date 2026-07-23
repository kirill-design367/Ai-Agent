"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

/*
  БЛОК КЕЙСОВ (реф noth.in «WORKS»). Чёрное полотно #000, белый текст.
  СЕМАНТИКА (важна для SEO): заголовок блока — <h2>, название каждого кейса —
  <h3>, суть — <p>, тип работы и пометка — отдельные <span>. Никаких склеек
  соседних текстовых узлов (между h3 и p — блочная граница).
  Курсор «Смотреть →» рисуется через CSS content (::after) + aria-hidden —
  его текста НЕТ в HTML-исходнике, в индекс не попадает.
  Движение (один rAF, стоп вне блока):
   • параллакс изображения ВНУТРИ рамки (рамка overflow:hidden, слой на ~26%
     выше рамки смещается по --py) — двигается картинка, а не весь блок;
   • фон блока (.cs-bg) плывёт медленнее содержимого (≈0.87×);
   • кастом-курсор-капсула с инерцией за указателем.
  Тач: курсора нет, вся область кликабельна, одна колонка.
*/

type Case = {
  n: string; name: string; sub: string; site: string; note: string;
  href: string; img: string; w: number; h: number; pk: number;   // pk — сила параллакса
};

const CASES: Case[] = [
  { n: "01", name: "Наследие", sub: "Семейная история, ставшая арт-объектом", site: "Интернет-витрина", note: "Собственный проект", href: "/keisy/nasledie/", img: "/work/cases/case-01.webp", w: 736, h: 1308, pk: 0.14 },
  { n: "02", name: "Volume — After Dark", sub: "Тишина, в которой слышно каждую деталь", site: "Лендинг", note: "Воссозданная работа", href: "/keisy/volume-after-dark/", img: "/work/cases/case-02.webp", w: 676, h: 1200, pk: 0.22 },
  { n: "03", name: "Aristide", sub: "Портфолио, где работа говорит сама", site: "Портфолио", note: "Воссозданная работа", href: "/keisy/aristide/", img: "/work/cases/case-03.webp", w: 676, h: 1200, pk: 0.10 },
  { n: "04", name: "Анна Рыковская", sub: "Личный бренд без лишних слов", site: "Сайт-визитка", note: "Клиентский проект", href: "/keisy/anna-rykovskaya/", img: "/work/cases/case-04.webp", w: 736, h: 481, pk: 0.24 },
  { n: "05", name: "Garden Eight", sub: "Пространство, собранное из движения", site: "Сайт студии", note: "Воссозданная работа", href: "/keisy/garden-eight/", img: "/work/cases/case-05.webp", w: 735, h: 1086, pk: 0.16 },
];

export default function Cases() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none)").matches;

    const revs = Array.from(el.querySelectorAll<HTMLElement>(".cs-rv"));
    if (reduce) revs.forEach((r) => r.classList.add("is-in"));
    let pending = reduce ? [] : revs.slice();

    const frames = Array.from(el.querySelectorAll<HTMLElement>(".cs-media"));
    const bg = el.querySelector<HTMLElement>(".cs-bg");
    const cursor = el.querySelector<HTMLElement>(".cs-cursor");

    let mx = -300, my = -300, cx = -300, cy = -300, cScale = 0, cScaleT = 0;
    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    const links = Array.from(el.querySelectorAll<HTMLElement>(".cs-link"));
    if (!coarse) links.forEach((r) => {
      r.addEventListener("pointerenter", () => { cScaleT = 1; });
      r.addEventListener("pointerleave", () => { cScaleT = 0; });
    });

    let raf = 0, armed = false, running = true;
    const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
    const vh = () => window.innerHeight;
    const near = () => {
      const r = el.getBoundingClientRect();
      return r.bottom > -vh() * 0.5 && r.top < vh() * 1.5;
    };
    const loop = () => {
      const H = vh();
      if (armed && pending.length) {
        pending = pending.filter((i) => {
          if (i.getBoundingClientRect().top < H * 0.88) { i.classList.add("is-in"); return false; }
          return true;
        });
      }
      if (!near() && !pending.length) { running = false; if (cursor) cursor.style.opacity = "0"; return; }
      raf = requestAnimationFrame(loop);
      if (!near()) { if (cursor) cursor.style.opacity = "0"; return; }

      if (!reduce) {
        const mul = coarse ? 0.45 : 1;
        // параллакс картинок ВНУТРИ рамок — смещаем внутренний (более высокий) слой
        frames.forEach((frame) => {
          const inner = frame.firstElementChild as HTMLElement | null;
          if (!inner) return;
          const r = frame.getBoundingClientRect();
          const half = H / 2 + r.height / 2;
          const n = clamp((r.top + r.height / 2 - H / 2) / half, -1, 1);
          const strength = 0.05 + 0.26 * parseFloat(frame.dataset.pk || "0.16");
          inner.style.setProperty("--py", `${(-n * r.height * strength * mul).toFixed(1)}px`);
        });
        // фон блока плывёт медленнее содержимого (≈0.87×): толкаем его в
        // противоход на 0.13 от смещения центра блока, с ограничением по запасу
        if (bg) {
          const rb = el.getBoundingClientRect();
          const center = rb.top + rb.height / 2 - H / 2;
          const cap = el.offsetHeight * 0.13;
          bg.style.transform = `translate3d(0, ${clamp(-center * 0.13, -cap, cap).toFixed(1)}px, 0)`;
        }
      }
      if (!coarse && cursor) {
        cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
        cScale += (cScaleT - cScale) * 0.16;
        cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%,-50%) scale(${cScale.toFixed(3)})`;
        cursor.style.opacity = cScale > 0.01 ? "1" : "0";
      }
    };
    raf = requestAnimationFrame(loop);
    const armT = window.setTimeout(() => { armed = true; kick(); }, 1000);
    function kick() { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
    const onScroll = () => kick();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!coarse) { window.addEventListener("pointermove", onMove, { passive: true }); window.addEventListener("pointermove", kick, { passive: true }); }

    return () => {
      cancelAnimationFrame(raf); window.clearTimeout(armT);
      window.removeEventListener("scroll", onScroll);
      if (!coarse) { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointermove", kick); }
    };
  }, []);

  return (
    <section ref={root} className="cs" aria-labelledby="cs-title" data-no-reveal>
      <div className="cs-bg" aria-hidden />

      <div className="cs-top">
        <h2 className="cs-label cs-rv" id="cs-title">Работы</h2>
        <p className="cs-quote cs-rv">Сайты делают все.<br />Мы делаем так, чтобы выбрали вас.</p>
      </div>

      <ol className="cs-grid">
        {CASES.map((c, i) => (
          <li className={`cs-item cs-rv col-${i % 2 === 0 ? "l" : "r"}`} key={c.href}>
            <Link href={c.href} className="cs-link" aria-label={`Кейс «${c.name}» — ${c.site}`}>
              <div className="cs-cap">
                <div className="cs-meta">
                  <span className="cs-type">{c.site}</span>
                  <span className="cs-note">{c.note}</span>
                </div>
                <h3 className="cs-name">{c.name}</h3>
                <p className="cs-sub">{c.sub}</p>
              </div>
              <div className="cs-media" data-pk={c.pk} style={{ aspectRatio: `${c.w} / ${c.h}` }}>
                <div className="cs-media-in">
                  <Image src={c.img} alt={`Превью работы «${c.name}» — ${c.site}`} fill sizes="(max-width: 760px) 90vw, 46vw"
                    priority={i < 2} loading={i < 2 ? undefined : "lazy"} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <div className="cs-foot cs-rv">
        <Link href="/keisy/" className="cs-all" data-magnetic>Все работы <span aria-hidden>→</span></Link>
      </div>

      <div className="cs-cursor" aria-hidden />
    </section>
  );
}
