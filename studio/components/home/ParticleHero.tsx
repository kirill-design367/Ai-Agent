"use client";

import { useEffect, useRef } from "react";

/*
  «AUREA ИЗ ЧАСТИЦ» — фирменный атом студии: «от точки до шедевра».
  Слово набирается Druk-ом в оффскрин-канвас, читаются пикселы, и по сетке
  ставятся частицы-ТОЧКИ так, чтобы ТЕЛО букв читалось плотно (крупные точки
  почти смыкаются), а к правому краю — разрежение в летящую пыль.

  ПРОИЗВОДИТЕЛЬНОСТЬ (главный приоритет):
  • данные частиц — в типизированных массивах (Float32Array/Uint8Array),
    без объектов на частицу и без аллокаций в кадре;
  • рендер — drawImage предрендеренного круглого спрайта (несколько бакетов
    по размеру), НЕ beginPath/arc на каждую точку;
  • канвас в физических пикселях (× dpr) → гладкие края на ретине/зуме;
  • IntersectionObserver: когда hero уходит из вьюпорта — rAF ПОЛНОСТЬЮ
    останавливается (скролл страницы не платит за анимацию); + пауза во
    вкладке (visibilitychange). Частиц немного (качество даём размером).

  ДВИЖЕНИЕ:
  • вход — частицы прилетают ИЗДАЛЕКА (мелкие, разрежённые, «из тумана») и
    уплотняются в слово с ease-out; НИ В ОДНОМ кадре нет сплошного текста;
    проигрывается РОВНО ОДИН РАЗ (флаг played — фикс перезапуска на мобиле);
  • покой — тихое «дыхание» (микродрейф) + деликатная реакция на курсор
    (малый радиус, слабая сила, мягкий возврат — буквы не разваливаются).
  reduce-motion — слово застыло собранным. Мобайл — без реакции на курсор.
*/

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

// Бакеты спрайтов [радиус CSS px, цвет]. 0–1 — серая пыль, 2 — тёмный переход,
// 3–5 — чёрное тело буквы (крупные, чтобы строки читались плотно).
const SPR: [number, string][] = [
  [1.1, "#9a9a9a"],
  [1.5, "#727272"],
  [2.0, "#333333"],
  [2.7, "#0b0b0b"],
  [3.3, "#0b0b0b"],
  [3.9, "#0b0b0b"],
];

export default function ParticleHero({ word = "AUREA" }: { word?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cnv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current, canvas = cnv.current;
    if (!el || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none)").matches;
    const ENTRY_MS = 1500;

    // ── типизированные массивы (SoA), без объектов на частицу ──
    let N = 0;
    let hx = new Float32Array(0), hy = new Float32Array(0);   // дом
    let ox = new Float32Array(0), oy = new Float32Array(0);   // старт (издалека)
    let px = new Float32Array(0), py = new Float32Array(0);   // текущее
    let vx = new Float32Array(0), vy = new Float32Array(0);   // скорость
    let phf = new Float32Array(0), spf = new Float32Array(0); // фаза/скорость дыхания
    let amp = new Float32Array(0);                            // амплитуда дыхания
    let si = new Uint8Array(0);                               // бакет спрайта
    let sprites: { c: HTMLCanvasElement; r: number }[] = [];
    let W = 0, H = 0, dpr = 1;

    let raf = 0, running = false, onScreen = false, docVisible = true;
    let played = false, started = false, entry0 = 0;
    // курсор (деликатный)
    let cxp = -1e5, cyp = -1e5, rectL = 0, rectT = 0;
    const CR = 82, CR2 = CR * CR, CFORCE = 0.55;
    const K = 0.085, DAMP = 0.86;

    const makeSprites = () => {
      sprites = SPR.map(([r, color]) => {
        const s = Math.ceil((r + 1) * 2);
        const c = document.createElement("canvas");
        c.width = Math.ceil(s * dpr); c.height = Math.ceil(s * dpr);
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
      H = Math.max(180, Math.floor(rect.height));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      rectL = rect.left; rectT = rect.top;
      makeSprites();

      // слово в оффскрин (CSS-пикселы достаточно — сетка крупная)
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      const ref = 100;
      o.font = `900 ${ref}px Druk, "Arial Black", sans-serif`;
      o.textAlign = "center"; o.textBaseline = "alphabetic";
      const m = o.measureText(word);
      const wR = m.width / ref;
      const aR = (m.actualBoundingBoxAscent || ref * 0.72) / ref;
      const FILLW = coarse ? 1.0 : 1.06;          // десктоп — шире, к краям экрана
      const fsW = (W * FILLW) / wR;
      const fsH = (H * 1.14) / aR;                 // допускаем лёгкий вертикальный вылет
      const fs = Math.max(24, Math.min(fsW, fsH));
      const baseline = H + fs * 0.05;              // низ букв срезан кромкой
      const wpx = wR * fs, x0 = (W - wpx) / 2;
      o.font = `900 ${fs}px Druk, "Arial Black", sans-serif`;
      o.textAlign = "center"; o.textBaseline = "alphabetic";
      o.fillStyle = "#000";
      o.fillText(word, W / 2, baseline);
      const img = o.getImageData(0, 0, W, H).data;

      // ── сетка: одна частица на заполненную ячейку → тело букв плотное ──
      const step = coarse ? 5 : 7;
      const budget = coarse ? 2600 : 5000;
      const cxw = W / 2, cyw = baseline - aR * fs * 0.5; // центр слова
      const cells: number[] = []; // x,y,nx упаковано тройками
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (img[(y * W + x) * 4 + 3] < 130) continue;
          const nx = wpx > 0 ? (x - x0) / wpx : x / W;
          // плотное читаемое ядро; разрежение ТОЛЬКО в последней трети
          const keep = nx < 0.68 ? 1 : 1 - 0.6 * smooth(0.68, 1.04, nx);
          if (Math.random() > keep) continue;
          cells.push(x, y, nx);
        }
      }
      let total = cells.length / 3;
      // равномерно прорежаем до бюджета (сохраняет распределение)
      const prob = total > budget ? budget / total : 1;
      const sx: number[] = [], sy: number[] = [], sn: number[] = [];
      for (let i = 0; i < total; i++) {
        if (prob < 1 && Math.random() > prob) continue;
        sx.push(cells[i * 3]); sy.push(cells[i * 3 + 1]); sn.push(cells[i * 3 + 2]);
      }
      N = sx.length;

      hx = new Float32Array(N); hy = new Float32Array(N);
      ox = new Float32Array(N); oy = new Float32Array(N);
      px = new Float32Array(N); py = new Float32Array(N);
      vx = new Float32Array(N); vy = new Float32Array(N);
      phf = new Float32Array(N); spf = new Float32Array(N); amp = new Float32Array(N);
      si = new Uint8Array(N);

      for (let i = 0; i < N; i++) {
        const jx = (Math.random() - 0.5) * step * 0.7;
        const jy = (Math.random() - 0.5) * step * 0.7;
        const homeX = sx[i] + jx, homeY = sy[i] + jy, nx = sn[i];
        hx[i] = homeX; hy[i] = homeY;
        // размер: ядро — крупное чёрное тело; правая треть — мельче/серее
        let s: number;
        const r = Math.random();
        if (nx > 0.72) s = r < 0.5 ? (r < 0.22 ? 0 : 1) : (r < 0.8 ? 2 : 3);
        else if (nx > 0.6) s = r < 0.28 ? 1 + Math.floor(r * 7) % 2 : 3 + (r < 0.7 ? 0 : 1);
        else s = r < 0.14 ? 2 : r < 0.6 ? 4 : (r < 0.85 ? 5 : 3);
        si[i] = Math.min(SPR.length - 1, s);
        // старт «из тумана»: далеко в случайном направлении от дома
        const ang = Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 620;
        ox[i] = homeX + Math.cos(ang) * dist;
        oy[i] = homeY + Math.sin(ang) * dist * 0.82;
        phf[i] = Math.random() * Math.PI * 2;
        spf[i] = 0.0006 + Math.random() * 0.0009;
        amp[i] = 0.7 + Math.random() * 0.9 + si[i] * 0.06; // крупные дышат чуть шире
        px[i] = ox[i]; py[i] = oy[i];
      }
      void cxw; void cyw;
    };

    const drawEntry = (e: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const inv = 1 - e;
      const scale = 0.22 + 0.78 * e; // растут из мелких «дальних» → плотные
      for (let i = 0; i < N; i++) {
        const x = ox[i] + (hx[i] - ox[i]) * e;
        const y = oy[i] + (hy[i] - oy[i]) * e;
        px[i] = x; py[i] = y;
        const s = sprites[si[i]], rr = s.r * scale;
        ctx.drawImage(s.c, x - rr, y - rr, rr * 2, rr * 2);
      }
      void inv;
    };

    const drawSteady = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const useCursor = !coarse && cxp > -1e4;
      for (let i = 0; i < N; i++) {
        const bx = Math.sin(t * spf[i] + phf[i]) * amp[i];
        const by = Math.cos(t * spf[i] * 0.9 + phf[i] * 1.3) * amp[i];
        const tx = hx[i] + bx, ty = hy[i] + by;
        let ax = (tx - px[i]) * K, ay = (ty - py[i]) * K;
        if (useCursor) {
          const dx = px[i] - cxp, dy = py[i] - cyp, d2 = dx * dx + dy * dy;
          if (d2 < CR2 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / CR) * CFORCE;
            ax += (dx / d) * f; ay += (dy / d) * f;
          }
        }
        let nvx = (vx[i] + ax) * DAMP, nvy = (vy[i] + ay) * DAMP;
        vx[i] = nvx; vy[i] = nvy;
        const x = px[i] + nvx, y = py[i] + nvy;
        px[i] = x; py[i] = y;
        const s = sprites[si[i]];
        ctx.drawImage(s.c, x - s.r, y - s.r, s.r * 2, s.r * 2);
      }
    };

    const drawStatic = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        const s = sprites[si[i]];
        ctx.drawImage(s.c, hx[i] - s.r, hy[i] - s.r, s.r * 2, s.r * 2);
      }
    };

    const frame = (t: number) => {
      if (!started) { started = true; entry0 = t; }
      if (!played) {
        const e = easeOut(smooth(0, ENTRY_MS, t - entry0));
        drawEntry(e);
        if (t - entry0 >= ENTRY_MS) {
          played = true;
          for (let i = 0; i < N; i++) { px[i] = hx[i]; py[i] = hy[i]; vx[i] = 0; vy[i] = 0; }
        }
      } else {
        drawSteady(t);
      }
      raf = requestAnimationFrame(frame);
    };

    const sync = () => {
      const want = onScreen && docVisible;
      if (want && !running) {
        if (reduce) { for (let i = 0; i < N; i++) { px[i] = hx[i]; py[i] = hy[i]; } played = true; drawStatic(); return; }
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!want && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    // курсор
    const onMove = (ev: PointerEvent) => { cxp = ev.clientX - rectL; cyp = ev.clientY - rectT; };
    const onLeave = () => { cxp = -1e5; cyp = -1e5; };
    const onScroll = () => { const r = canvas.getBoundingClientRect(); rectL = r.left; rectT = r.top; };
    const onVis = () => { docVisible = document.visibilityState !== "hidden"; sync(); };

    // порядок: сначала считаем частицы (после готовности шрифта), потом наблюдаем
    let cancelled = false, io: IntersectionObserver | null = null;
    const boot = () => {
      if (cancelled) return;
      build();
      if (reduce) { for (let i = 0; i < N; i++) { px[i] = hx[i]; py[i] = hy[i]; } played = true; }
      io = new IntersectionObserver(
        (ents) => { onScreen = ents[0].isIntersecting; sync(); },
        { rootMargin: "120px 0px", threshold: 0 }
      );
      io.observe(el);
      if (!coarse) {
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onMove, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        canvas.addEventListener("pointerleave", onLeave);
      }
      document.addEventListener("visibilitychange", onVis);
      // на случай если IO не сработает мгновенно — отрисуем первый кадр
      if (reduce) drawStatic();
    };
    if (document.fonts && document.fonts.load) {
      document.fonts.load("900 200px Druk").then(boot).catch(boot);
    } else boot();

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        const wasPlayed = played;
        build();
        played = wasPlayed; started = wasPlayed; // не переигрываем вход
        if (wasPlayed || reduce) { for (let i = 0; i < N; i++) { px[i] = hx[i]; py[i] = hy[i]; vx[i] = 0; vy[i] = 0; } }
        if (running) drawStatic(); else if (reduce) drawStatic();
      }, 220);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(rt);
      io?.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [word]);

  return (
    <div ref={wrap} className="ph" aria-hidden>
      <canvas ref={cnv} />
    </div>
  );
}
