"use client";

import { useEffect, useRef } from "react";

/*
  «AUREA ИЗ ЧАСТИЦ» — фирменный атом студии: «от точки до шедевра».
  Слово набирается Druk-ом в оффскрин-канвас, пикселы читаются, и на каждый
  «зажжённый» пиксель рождается частица-ТОЧКА (круг), которая помнит свой дом.

  Физика в цикле (пул переиспользуется, частицы не создаются каждый кадр):
  1) SPRING — точка тянется к дому (hx,hy) с инерцией (ease-out возврат);
  2) BREATHING — постоянный броуновский микродрейф (гипнотично даже в покое);
  3) CURSOR FORCE FIELD — курсор расталкивает точки в радиусе, они плавно
     возвращаются домой (главный awwwards-момент);
  4) ENTRY — на загрузке точки собираются из одной точки экрана в слово ~1.4s.

  Размер шрифта берётся из РЕАЛЬНЫХ метрик глифов (не из догадок про cap-height):
  fs = min(по ширине, по высоте) → слово край-в-край и упирается в низ канваса,
  низ букв срезан нижней кромкой экрана. Пул прореживается равномерно до бюджета
  (иначе бюджет тратится на верхние ряды и низ слова пустеет).

  Градиент плотности: густо слева → редкая летящая пыль справа (без видимой
  границы). Глубина: мелкие точки чуть медленнее крупных (параллакс). Ч/б: чёрные
  точки на белом, серая вариация для мелкой пыли (воздушная перспектива). Мобайл —
  меньше точек, без реакции на курсор. reduce-motion — точки застыли в собранном
  слове. Только круглые точки.
*/
type P = {
  hx: number; hy: number;
  x: number; y: number;
  vx: number; vy: number;
  si: number;
  ph: number; sp: number;
  ax: number; ay: number;
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Пул готовых спрайтов-кружков [радиус, цвет]. Мелкая пыль — серая (перспектива),
// крупные ядра — чистый чёрный. Рисуем один раз, в цикле только drawImage.
const SPR: [number, string][] = [
  [0.7, "#8f8f8f"],
  [0.9, "#6f6f6f"],
  [1.1, "#3d3d3d"],
  [1.4, "#0b0b0b"],
  [1.8, "#0b0b0b"],
  [2.3, "#0b0b0b"],
  [2.9, "#0b0b0b"],
  [3.5, "#0b0b0b"],
];

export default function ParticleHero({ word = "AUREA" }: { word?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cnv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current, canvas = cnv.current;
    if (!el || !canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, t0 = 0;
    let particles: P[] = [];
    let sprites: { c: HTMLCanvasElement; r: number }[] = [];
    let W = 0, H = 0, dpr = 1;
    let cx = 0, cy = 0;
    let mx = -9999, my = -9999;
    const R = 130, R2 = R * R, FORCE = 2.8;

    const makeSprites = () => {
      sprites = SPR.map(([r, color]) => {
        const s = Math.ceil(r * 2 + 2);
        const c = document.createElement("canvas");
        c.width = s * dpr; c.height = s * dpr;
        const g = c.getContext("2d")!;
        g.scale(dpr, dpr);
        g.fillStyle = color;
        g.beginPath();
        g.arc(s / 2, s / 2, r, 0, Math.PI * 2);
        g.fill();
        return { c, r };
      });
    };

    const build = () => {
      const rect = el.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(320, Math.floor(rect.width));
      H = Math.max(220, Math.floor(rect.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      makeSprites();

      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d")!;

      // ── размер из реальных метрик глифов ──
      const ref = 100;
      o.font = `900 ${ref}px Druk, "Arial Black", sans-serif`;
      o.textAlign = "center"; o.textBaseline = "alphabetic";
      const m = o.measureText(word);
      const wR = m.width / ref;                                   // ширина / fs
      const aR = (m.actualBoundingBoxAscent || ref * 0.72) / ref; // cap-height / fs
      const dR = (m.actualBoundingBoxDescent || 0) / ref;
      const fsW = (W * 1.04) / wR;          // почти во всю ширину (край-в-край)
      const fsH = (H * 0.99) / aR;          // почти во всю высоту канваса
      const fs = Math.max(24, Math.min(fsW, fsH));
      // базовая линия ниже низа канваса → низ букв уходит за край экрана
      const baseline = H + fs * 0.055;
      const ascent = aR * fs, descent = dR * fs;
      const topY = baseline - ascent;       // верх инкованных глифов
      const wpx = wR * fs;                   // ширина слова в px
      const x0 = (W - wpx) / 2;              // левый край слова

      o.font = `900 ${fs}px Druk, "Arial Black", sans-serif`;
      o.textAlign = "center"; o.textBaseline = "alphabetic";
      o.fillStyle = "#000";
      o.fillText(word, W / 2, baseline);
      const img = o.getImageData(0, 0, W, H).data;

      // ── 1. кандидаты: зажжённые пикселы, прорежены градиентом плотности ──
      const step = coarse ? 3 : 2;
      const budget = coarse ? 4200 : 13000;
      cx = W / 2; cy = topY + ascent * 0.5;
      const cand: number[] = []; // упаковано парами x,y
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (img[(y * W + x) * 4 + 3] < 128) continue;
          const nx = wpx > 0 ? (x - x0) / wpx : x / W;           // 0..1 вдоль слова
          const keep = 1 - 0.62 * smooth(0.28, 1.04, nx);        // слева густо, справа пыль
          if (Math.random() > keep) continue;
          cand.push(x, y);
        }
      }

      // ── 2. равномерное прореживание до бюджета (сохраняет градиент) ──
      const total = cand.length / 2;
      const take = Math.min(budget, total);
      const prob = total > 0 ? take / total : 0;
      particles = [];
      for (let i = 0; i < total; i++) {
        if (Math.random() > prob) continue;
        const x = cand[i * 2], y = cand[i * 2 + 1];
        const big = Math.random();
        let si: number;
        if (big < 0.05) si = 5 + Math.floor(Math.random() * 3);
        else if (big < 0.26) si = 3 + Math.floor(Math.random() * 2);
        else si = Math.floor(Math.random() * 3);
        particles.push({
          hx: x, hy: y,
          x: cx + (Math.random() - 0.5) * 46,
          y: cy + (Math.random() - 0.5) * 46,
          vx: 0, vy: 0, si,
          ph: Math.random() * Math.PI * 2,
          sp: 0.0006 + Math.random() * 0.0009,
          ax: 0.8 + Math.random() * 1.6,
          ay: 0.7 + Math.random() * 1.4,
        });
      }
      // добить до бюджета, если prob округлил вниз
      let i = 0;
      while (particles.length < take && total > 0) {
        const x = cand[(i % total) * 2], y = cand[(i % total) * 2 + 1];
        particles.push({
          hx: x, hy: y, x: cx, y: cy, vx: 0, vy: 0,
          si: Math.floor(Math.random() * 3),
          ph: Math.random() * Math.PI * 2,
          sp: 0.0006 + Math.random() * 0.0009,
          ax: 0.8 + Math.random() * 1.6, ay: 0.7 + Math.random() * 1.4,
        });
        i++;
      }

      if (reduce) drawStatic();
    };

    const drawStatic = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        const s = sprites[p.si];
        ctx.drawImage(s.c, p.hx - s.r, p.hy - s.r, s.r * 2, s.r * 2);
      }
    };

    const frame = (t: number) => {
      if (!t0) t0 = t;
      const elapsed = (t - t0) / 1000;
      const enter = smooth(0, 1.4, elapsed);
      const k = 0.10 - 0.072 * enter;
      const damp = 0.82 + 0.06 * enter;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        const depth = 0.6 + p.si * 0.06;
        const bx = Math.sin(t * p.sp + p.ph) * p.ax;
        const by = Math.cos(t * p.sp * 0.83 + p.ph * 1.3) * p.ay;
        const tx = p.hx + bx, ty = p.hy + by;
        p.vx += (tx - p.x) * k * depth;
        p.vy += (ty - p.y) * k * depth;
        if (!coarse) {
          const ddx = p.x - mx, ddy = p.y - my;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / R) * FORCE;
            p.vx += (ddx / d) * f;
            p.vy += (ddy / d) * f;
          }
        }
        p.vx *= damp; p.vy *= damp;
        p.x += p.vx; p.y += p.vy;
        const s = sprites[p.si];
        ctx.drawImage(s.c, p.x - s.r, p.y - s.r, s.r * 2, s.r * 2);
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    };
    const onLeave = () => { mx = -9999; my = -9999; };

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      build();
      el.classList.add("is-live");
      if (reduce) { drawStatic(); return; }
      if (!coarse) {
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onMove, { passive: true });
        canvas.addEventListener("pointerleave", onLeave);
      }
      raf = requestAnimationFrame(frame);
    };
    if (document.fonts && document.fonts.load) {
      document.fonts.load("900 200px Druk").then(start).catch(start);
    } else start();

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => { t0 = 0; build(); if (reduce) drawStatic(); }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(rt);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [word]);

  return (
    <div ref={wrap} className="ph" aria-hidden>
      <span className="ph-fallback">{word}</span>
      <canvas ref={cnv} />
    </div>
  );
}
