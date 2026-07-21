"use client";

import { useEffect, useRef } from "react";

/*
  «AUREA ИЗ МАКРОЧАСТИЦ» (по референсу): слово набрано серифом, левая часть —
  литая с зерном, правая распадается в облако частиц-брызг, которое едва заметно
  дрейфует (невесомость). Чистый canvas 2D, без библиотек:
  1) слово → оффскрин → пикселы сэмплируются сеткой;
  2) вероятность распада растёт слева направо (smoothstep + шум) —
     «целые» пикселы запекаются в статичную подложку (зерно из джиттера),
     «распавшиеся» становятся частицами со смещением вправо-вверх;
  3) rAF-дрейф: sin/cos с индивидуальной фазой, амплитуда 1.5–3px, период 6–12с.
  reduce-motion → статичный кадр. Мобайл — реже сетка (меньше частиц).
*/
type P = { x: number; y: number; s: number; ph: number; sp: number; ax: number; ay: number };

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function ParticleHero({ word = "AUREA" }: { word?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cnv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current, canvas = cnv.current;
    if (!el || !canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: P[] = [];
    let soft: P[] = [];
    let base: HTMLCanvasElement | null = null;
    let W = 0, H = 0, dpr = 1;

    const build = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(320, Math.floor(r.width));
      H = Math.max(300, Math.floor(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";

      // ── 1. слово в оффскрин (сериф, как на референсе; латиница) ──
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      let fs = Math.floor(W / (word.length * 0.62));
      o.font = `700 ${fs}px Georgia, "Times New Roman", serif`;
      const tw = o.measureText(word).width;
      fs = Math.floor(fs * Math.min(1, (W * 0.78) / tw));
      o.font = `700 ${fs}px Georgia, "Times New Roman", serif`;
      o.textBaseline = "middle"; o.textAlign = "left";
      const w2 = o.measureText(word).width;
      const x0 = (W - w2 * 1.22) / 2;           // сдвиг влево: облаку нужен воздух справа
      const y0 = H * 0.46;
      o.fillStyle = "#000";
      o.fillText(word, x0, y0);
      const img = o.getImageData(0, 0, W, H).data;

      // ── 2. сэмплирование: подложка + частицы ──
      const coarse = window.matchMedia("(hover: none)").matches;
      const step = Math.max(2, Math.round(fs / (coarse ? 70 : 110)));
      const maxScatter = w2 * 0.36;
      base = document.createElement("canvas");
      base.width = W * dpr; base.height = H * dpr;
      const b = base.getContext("2d")!;
      b.scale(dpr, dpr);
      particles = []; soft = [];
      const budget = coarse ? 3500 : 8000;

      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (img[(y * W + x) * 4 + 3] < 140) continue;
          const nx = (x - x0) / w2; // 0..1 по слову
          const p = smooth(0.52, 1.02, nx + (Math.random() - 0.5) * 0.08);
          if (Math.random() > p * 0.88) {  // даже в зоне распада часть пикселов остаётся — буква-«призрак» читается
            // целый пиксел → подложка с зерном (джиттер + пропуски у кромки)
            if (Math.random() < 0.05 + p * 0.42) continue;
            b.globalAlpha = 0.72 + Math.random() * 0.28;
            b.fillStyle = "#0b0b0b";
            b.fillRect(x + (Math.random() - 0.5) * 1.2, y + (Math.random() - 0.5) * 1.2, step + 0.5, step + 0.5);
          } else if (particles.length < budget) {
            // распавшийся → частица, смещение вправо-вверх, дальше = сильнее
            const d = p * p * (0.15 + Math.random() * 0.85) * maxScatter;
            const dx = d * (0.55 + Math.random() * 0.6);
            const dy = -d * (Math.random() - 0.32) * 0.95;
            const s = Math.random() < 0.12 ? 2 + Math.random() * 3.2 : 1 + Math.random() * 1.6;
            const pt: P = {
              x: x + dx, y: y + dy, s,
              ph: Math.random() * Math.PI * 2,
              sp: 0.00035 + Math.random() * 0.00055,   // период ~6–12с
              ax: 1.2 + Math.random() * 1.8,           // амплитуда 1.2–3px
              ay: 1.0 + Math.random() * 1.6,
            };
            (Math.random() < 0.72 ? particles : soft).push(pt);
          }
        }
      }
      // крупные кляксы в гуще облака (как на референсе)
      const cx = x0 + w2 * 0.92, cy = y0 - fs * 0.1;
      for (let i = 0; i < (coarse ? 40 : 90); i++) {
        const a = Math.random() * Math.PI * 2;
        const rr = Math.pow(Math.random(), 0.6) * maxScatter * 0.62;
        soft.push({
          x: cx + Math.cos(a) * rr * 1.15, y: cy + Math.sin(a) * rr * 0.8,
          s: 2.5 + Math.random() * 4.5, ph: Math.random() * Math.PI * 2,
          sp: 0.0003 + Math.random() * 0.0004, ax: 1.5 + Math.random() * 2, ay: 1.2 + Math.random() * 1.8,
        });
      }
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (base) ctx.drawImage(base, 0, 0, W, H);
      ctx.fillStyle = "#0b0b0b";
      ctx.globalAlpha = 0.95;
      for (const p of particles) {
        const dx = Math.sin(t * p.sp + p.ph) * p.ax;
        const dy = Math.cos(t * p.sp * 0.83 + p.ph * 1.31) * p.ay;
        ctx.fillRect(p.x + dx, p.y + dy, p.s, p.s);
      }
      ctx.globalAlpha = 0.5;
      for (const p of soft) {
        const dx = Math.sin(t * p.sp + p.ph) * p.ax;
        const dy = Math.cos(t * p.sp * 0.83 + p.ph * 1.31) * p.ay;
        ctx.fillRect(p.x + dx, p.y + dy, p.s, p.s);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => { draw(t); raf = requestAnimationFrame(loop); };

    build();
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => { build(); if (reduce) draw(0); }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(rt);
      window.removeEventListener("resize", onResize);
    };
  }, [word]);

  return (
    <div ref={wrap} className="ph-wrap" aria-hidden>
      <canvas ref={cnv} />
    </div>
  );
}
