"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

/*
  БЛОК КЕЙСОВ (реф noth.in «WORKS»). Чёрное полотно #000, белый текст. Кейсы —
  это КРУПНЫЕ изображения работ в шахматном порядке (лево-верх, право-ниже,
  лево-ниже…), над каждым мелкая метка-название + строка сути (крупнее метки).
  Слева-сверху компактная метка «РАБОТЫ», справа-сверху крупная фраза-утверждение.
  hover: изображение scale 1.03 + кастом-курсор «Смотреть →» с инерцией.
  Параллакс изображений (у каждого свой коэф.) + курсор — один rAF, стоп вне блока.
  Тач: курсора нет, вся область кликабельна, одна колонка.
*/

type Case = {
  n: string; name: string; sub: string; href: string;
  img: string; w: number; h: number; pk: number;   // pk — коэффициент параллакса
};

const CASES: Case[] = [
  { n: "01", name: "Наследие", sub: "Семейная история, ставшая арт-объектом", href: "/keisy/nasledie/", img: "/work/cases/case-01.webp", w: 736, h: 1308, pk: 0.14 },
  { n: "02", name: "Volume — After Dark", sub: "Тишина, в которой слышно каждую деталь", href: "/keisy/volume-after-dark/", img: "/work/cases/case-02.webp", w: 676, h: 1200, pk: 0.22 },
  { n: "03", name: "Aristide", sub: "Портфолио, где работа говорит сама", href: "/keisy/aristide/", img: "/work/cases/case-03.webp", w: 676, h: 1200, pk: 0.10 },
  { n: "04", name: "Анна Рыковская", sub: "Личный бренд без лишних слов", href: "/keisy/anna-rykovskaya/", img: "/work/cases/case-04.webp", w: 736, h: 481, pk: 0.24 },
  { n: "05", name: "Garden Eight", sub: "Пространство, собранное из движения", href: "/keisy/garden-eight/", img: "/work/cases/case-05.webp", w: 735, h: 1086, pk: 0.16 },
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

    const medias = Array.from(el.querySelectorAll<HTMLElement>(".cs-media"));
    const cursor = el.querySelector<HTMLElement>(".cs-cursor");

    let mx = -300, my = -300, cx = -300, cy = -300, cScale = 0, cScaleT = 0;
    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    const links = Array.from(el.querySelectorAll<HTMLElement>(".cs-link"));
    if (!coarse) links.forEach((r) => {
      r.addEventListener("pointerenter", () => { cScaleT = 1; });
      r.addEventListener("pointerleave", () => { cScaleT = 0; });
    });

    let raf = 0, armed = false, running = true;
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
        const mul = coarse ? 0.4 : 1;
        medias.forEach((m) => {
          const r = m.getBoundingClientRect();
          const center = r.top + r.height / 2 - H / 2;
          const k = parseFloat(m.dataset.pk || "0.14") * mul;
          m.style.setProperty("--py", `${(-center * k).toFixed(1)}px`);
        });
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
      <div className="cs-top">
        <span className="cs-label cs-rv" id="cs-title">Работы</span>
        <p className="cs-quote cs-rv">Сайты делают все.<br />Мы делаем так, чтобы выбрали вас.</p>
      </div>

      <ol className="cs-grid">
        {CASES.map((c, i) => (
          <li className={`cs-item cs-rv col-${i % 2 === 0 ? "l" : "r"}`} key={c.href}>
            <Link href={c.href} className="cs-link" aria-label={`Кейс: ${c.name}`}>
              <span className="cs-name">{c.name}</span>
              <span className="cs-sub">{c.sub}</span>
              <span className="cs-media" data-pk={c.pk}>
                <span className="cs-media-in" style={{ aspectRatio: `${c.w} / ${c.h}` }}>
                  <Image src={c.img} alt={`Превью кейса «${c.name}»`} fill sizes="(max-width: 760px) 90vw, 46vw"
                    priority={i < 2} loading={i < 2 ? undefined : "lazy"} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="cs-foot cs-rv">
        <Link href="/keisy/" className="cs-all" data-magnetic>Все работы <span aria-hidden>→</span></Link>
      </div>

      <div className="cs-cursor" aria-hidden>
        <span className="cs-cursor-t">Смотреть</span>
        <span className="cs-cursor-a">→</span>
      </div>
    </section>
  );
}
