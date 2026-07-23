"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

/*
  БЛОК КЕЙСОВ (реф noth.in «WORKS»). Абсолютно чёрное полотно (#000), белый текст.
  • Разделитель: слово «КЕЙСЫ» (Druk), буквы расходятся по горизонтали на scrub —
    разные скорости/амплитуды, от схождения (читается) до расхождения к краям.
  • Список строк (не карточки): номер, крупное имя (Druk), суть (Rooftop #999),
    тип у правого края (+ «воссозданная работа» приглушённо), тонкая линия-разделитель,
    превью-изображение асимметрично сбоку с параллаксом (у каждого свой коэффициент).
  • hover: превью растёт, имя разряжается трекингом, прочие строки тухнут до 0.35,
    кастомный курсор «Смотреть →» (Ø~90px) следует за мышью с инерцией (масштаб 0→1).
  • Появление: строки из-под маски со stagger, линии вычерчиваются, превью с масштабом.
  • Мультискорость (параллакс), кастом-курсор — ОДИН rAF-цикл, стоп вне блока.
  Тач: курсора нет, вся строка кликабельна, параллакс слабее.
*/

type Case = {
  n: string; name: string; sub: string; type: string; recreated: boolean;
  href: string; img: string; w: number; h: number;
  side: "l" | "r"; mw: number; pk: number;   // сторона превью, ширина (vw), коэф. параллакса
};

const CASES: Case[] = [
  { n: "01", name: "Наследие", sub: "Семейная история, ставшая арт-объектом", type: "Интернет-витрина", recreated: false, href: "/keisy/nasledie/", img: "/work/cases/case-01.webp", w: 736, h: 1308, side: "r", mw: 23, pk: 0.16 },
  { n: "02", name: "Volume — After Dark", sub: "Тишина, в которой слышно каждую деталь", type: "Лендинг", recreated: true, href: "/keisy/volume-after-dark/", img: "/work/cases/case-02.webp", w: 676, h: 1200, side: "l", mw: 27, pk: 0.10 },
  { n: "03", name: "Aristide", sub: "Портфолио, где работа говорит сама", type: "Портфолио", recreated: true, href: "/keisy/aristide/", img: "/work/cases/case-03.webp", w: 676, h: 1200, side: "r", mw: 20, pk: 0.22 },
  { n: "04", name: "Анна Рыковская", sub: "Личный бренд без лишних слов", type: "Визитка", recreated: false, href: "/keisy/anna-rykovskaya/", img: "/work/cases/case-04.webp", w: 736, h: 481, side: "l", mw: 32, pk: 0.13 },
  { n: "05", name: "Garden Eight", sub: "Пространство, собранное из движения", type: "Сайт студии", recreated: true, href: "/keisy/garden-eight/", img: "/work/cases/case-05.webp", w: 735, h: 1086, side: "r", mw: 25, pk: 0.18 },
];

const WORD = ["К", "Е", "Й", "С", "Ы"];
// индивидуальные амплитуда (доля полуширины) и скорость расхождения буквы
const SPREAD = [
  { dir: -1, amp: 0.92, sp: 1.0 },
  { dir: -1, amp: 0.44, sp: 0.7 },
  { dir: 1, amp: 0.12, sp: 0.5 },   // центральная почти стоит
  { dir: 1, amp: 0.5, sp: 0.8 },
  { dir: 1, amp: 0.96, sp: 1.0 },
];

export default function Cases() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none)").matches;

    // ── появление строк по реальной позиции (детерминированно, как в блоке 02) ──
    const revs = Array.from(el.querySelectorAll<HTMLElement>(".cs-rv"));
    if (reduce) revs.forEach((r) => r.classList.add("is-in"));
    let pending = reduce ? [] : revs.slice();

    const dividerWrap = el.querySelector<HTMLElement>(".cs-div-wrap");
    const letters = Array.from(el.querySelectorAll<HTMLElement>(".cs-w-l"));
    const medias = Array.from(el.querySelectorAll<HTMLElement>(".cs-media"));
    const cursor = el.querySelector<HTMLElement>(".cs-cursor");

    // курсор
    let mx = -200, my = -200, cx = -200, cy = -200, cScale = 0, cScaleT = 0;
    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });

    // hover строки → активная строка, курсор, притухание прочих
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".cs-row"));
    const setActive = (idx: number) => {
      el.classList.toggle("is-hovering", idx >= 0);
      rows.forEach((r, i) => r.classList.toggle("is-dim", idx >= 0 && i !== idx));
      cScaleT = idx >= 0 ? 1 : 0;
    };
    if (!coarse) rows.forEach((r, i) => {
      r.addEventListener("pointerenter", () => setActive(i));
      r.addEventListener("pointerleave", () => setActive(-1));
    });

    let raf = 0, armed = false, running = true;
    const vh = () => window.innerHeight;
    const near = () => {
      const r = el.getBoundingClientRect();
      return r.bottom > -vh() * 0.5 && r.top < vh() * 1.5;
    };
    const loop = () => {
      const H = vh();
      // появление
      if (armed && pending.length) {
        pending = pending.filter((i) => {
          if (i.getBoundingClientRect().top < H * 0.86) { i.classList.add("is-in"); return false; }
          return true;
        });
      }
      // ОДИН rAF-цикл, СТОП вне блока (перезапуск по скроллу/движению мыши)
      if (!near() && !pending.length) { running = false; if (cursor) cursor.style.opacity = "0"; return; }
      raf = requestAnimationFrame(loop);
      if (!near()) { if (cursor) cursor.style.opacity = "0"; return; }

      // буквы КЕЙСЫ — прогресс дивайдера (0 при входе → 1 когда прокрутили насквозь)
      if (dividerWrap && !reduce) {
        const dr = dividerWrap.getBoundingClientRect();
        const total = dr.height - H;
        const p = total > 0 ? Math.min(1, Math.max(0, -dr.top / total)) : 0;
        const half = window.innerWidth * 0.5;
        letters.forEach((l, i) => {
          const s = SPREAD[i];
          const x = s.dir * s.amp * half * Math.min(1, p * s.sp * 1.25);
          l.style.transform = `translateX(${x.toFixed(1)}px)`;
          l.style.opacity = String(1 - Math.max(0, p * s.sp - 0.7) * 1.6);
        });
      }
      // параллакс превью — по положению относительно центра экрана
      if (!reduce) {
        const mul = coarse ? 0.4 : 1;
        medias.forEach((m) => {
          const r = m.getBoundingClientRect();
          const center = r.top + r.height / 2 - H / 2;
          const k = parseFloat(m.dataset.pk || "0.14") * mul;
          m.style.transform = `translate3d(0, ${(-center * k).toFixed(1)}px, 0)`;
        });
      }
      // кастом-курсор (инерция + масштаб)
      if (!coarse && cursor) {
        cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
        cScale += (cScaleT - cScale) * 0.16;
        cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%,-50%) scale(${cScale.toFixed(3)})`;
        cursor.style.opacity = cScale > 0.01 ? "1" : "0";
      }
    };
    raf = requestAnimationFrame(loop);
    const armT = window.setTimeout(() => { armed = true; kick(); }, 1200);
    // перезапуск цикла при возврате в зону блока (скролл) или движении мыши
    function kick() { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
    const onScroll = () => kick();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!coarse) window.addEventListener("pointermove", kick, { passive: true });

    return () => {
      cancelAnimationFrame(raf); window.clearTimeout(armT);
      window.removeEventListener("scroll", onScroll);
      if (!coarse) { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointermove", kick); }
    };
  }, []);

  return (
    <section ref={root} className="cs" aria-labelledby="cs-title" data-no-reveal>
      {/* РАЗДЕЛИТЕЛЬ: КЕЙСЫ — буквы расходятся на scrub (100vh пиннинга) */}
      <div className="cs-div-wrap">
        <div className="cs-divider">
          <h2 className="cs-word" id="cs-title" aria-label="Кейсы">
            {WORD.map((ch, i) => (
              <span className="cs-w-l" key={i} aria-hidden>{ch}</span>
            ))}
          </h2>
          <p className="cs-div-sub cs-rv">Отобранные работы — и воссозданные эталоны</p>
        </div>
      </div>

      {/* СПИСОК КЕЙСОВ */}
      <ol className="cs-list">
        {CASES.map((c, i) => (
          <li className={`cs-row cs-rv side-${c.side}`} key={c.href} style={{ ["--pk" as string]: c.pk }}>
            <Link href={c.href} className="cs-link" aria-label={`Кейс: ${c.name}`}>
              <span className="cs-num">{c.n}</span>
              <h3 className="cs-name">{c.name}</h3>
              <p className="cs-sub">{c.sub}</p>
              <span className="cs-tag">
                {c.type}
                {c.recreated && <span className="cs-recreated"> · воссозданная работа</span>}
              </span>
              <span className="cs-media" data-pk={c.pk} style={{ ["--mw" as string]: `${c.mw}vw` }}>
                <span className="cs-media-in" style={{ aspectRatio: `${c.w} / ${c.h}` }}>
                  <Image src={c.img} alt={`Превью кейса «${c.name}»`} fill sizes="(max-width: 760px) 70vw, 34vw"
                    priority={i < 2} loading={i < 2 ? undefined : "lazy"} />
                </span>
              </span>
              <span className="cs-line" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>

      <div className="cs-foot cs-rv">
        <Link href="/keisy/" className="cs-all" data-magnetic>Все работы <span aria-hidden>→</span></Link>
      </div>

      {/* КАСТОМНЫЙ КУРСОР (десктоп) */}
      <div className="cs-cursor" aria-hidden>
        <span className="cs-cursor-t">Смотреть</span>
        <span className="cs-cursor-a">→</span>
      </div>
    </section>
  );
}
