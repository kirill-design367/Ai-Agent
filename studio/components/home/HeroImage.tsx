"use client";

import { useEffect, useRef } from "react";

/*
  HERO-НАДПИСЬ — фотореалистичный 3D-рендер AUREA (PNG/WebP, прозрачный фон),
  оживлённый композитными слоями (тихая роскошь, не аттракцион):
  • CSS-появление один раз (fade + scale + подъём) на .ph-enter — автоплей от
    загрузки, LCP не блокирует (картинка preload, статична и красива сразу);
  • JS rAF на .ph-stage: ДЫХАНИЕ (translateY ±5px + scale→1.008, ~9с) +
    ПАРАЛЛАКС курсора (десктоп: ±8px, rotateX/Y до 1.5°, инерция lerp) +
    ПАРАЛЛАКС скролла (уходит медленнее контента, фактор 0.85, + лёгкий fade);
  • ЖИВАЯ ПЫЛЬ — canvas поверх: 60–120 мелких точек, дрейф + реакция на курсор.

  Перф: всё на transform/opacity (композит, без repaint); rAF стоит вне вьюпорта
  (IntersectionObserver) и при скрытой вкладке; пыль в типизированных массивах,
  один проход; эффекты после гидратации; prefers-reduced-motion → статика.
  Картинка декоративная? Нет — alt="AUREA" (бренд); h1-манифест остаётся.
*/

const SIZES = [960, 1920, 3200];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function HeroImage() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current, st = stage.current, canvas = dust.current;
    if (!el || !st || !canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none)").matches;
    if (reduce) return; // статичная картинка, никаких эффектов

    const ctx = canvas.getContext("2d");
    let raf = 0, running = false, onScreen = false, docVisible = true, t0 = 0;
    let W = 0, H = 0, dpr = 1;

    // курсор-параллакс (нормированные -1..1), с инерцией
    let mtx = 0, mty = 0, cxLerp = 0, cyLerp = 0;
    // скролл-параллакс
    let scrollY = 0, scrollLerp = 0;

    // ── живая пыль (типизированные массивы) ──
    let DN = 0;
    let dx = new Float32Array(0), dy = new Float32Array(0), dvx = new Float32Array(0),
        dvy = new Float32Array(0), dr = new Float32Array(0), da = new Float32Array(0);
    let mx = -1e5, my = -1e5;

    const buildDust = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.floor(r.width));
      H = Math.max(1, Math.floor(r.height));
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      DN = coarse ? 55 : 110;
      dx = new Float32Array(DN); dy = new Float32Array(DN); dvx = new Float32Array(DN);
      dvy = new Float32Array(DN); dr = new Float32Array(DN); da = new Float32Array(DN);
      for (let i = 0; i < DN; i++) {
        dx[i] = Math.random() * W; dy[i] = Math.random() * H;
        const sp = 0.08 + Math.random() * 0.16, ang = Math.random() * Math.PI * 2;
        dvx[i] = Math.cos(ang) * sp; dvy[i] = Math.sin(ang) * sp;
        dr[i] = 0.6 + Math.random() * 1.9;
        da[i] = 0.14 + Math.random() * 0.4;
      }
    };

    const drawDust = () => {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0b0b0b";
      const R = 80, R2 = R * R;
      for (let i = 0; i < DN; i++) {
        let x = dx[i] + dvx[i], y = dy[i] + dvy[i];
        // мягкая реакция на курсор (десктоп)
        if (!coarse && mx > -1e4) {
          const gx = x - mx, gy = y - my, d2 = gx * gx + gy * gy;
          if (d2 < R2 && d2 > 0.5) { const d = Math.sqrt(d2), f = (1 - d / R) * 1.4; x += (gx / d) * f; y += (gy / d) * f; }
        }
        // тор-обёртка по зоне надписи
        if (x < -6) x += W + 12; else if (x > W + 6) x -= W + 12;
        if (y < -6) y += H + 12; else if (y > H + 6) y -= H + 12;
        dx[i] = x; dy[i] = y;
        ctx.globalAlpha = da[i];
        ctx.beginPath(); ctx.arc(x, y, dr[i], 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (t: number) => {
      if (!t0) t0 = t;
      const el2 = t - t0;
      // дыхание
      const by = Math.sin(el2 * 0.00068) * 5;
      const bs = 1 + (Math.sin(el2 * 0.00068 - Math.PI / 2) * 0.5 + 0.5) * 0.008;
      // курсор-параллакс (инерция)
      cxLerp = lerp(cxLerp, mtx, 0.06); cyLerp = lerp(cyLerp, mty, 0.06);
      const px = coarse ? 0 : cxLerp * 8, py = coarse ? 0 : cyLerp * 8;
      const rx = coarse ? 0 : -cyLerp * 1.5, ry = coarse ? 0 : cxLerp * 1.5;
      // скролл-параллакс: уходит медленнее (лаг) + fade
      scrollLerp = lerp(scrollLerp, scrollY, 0.12);
      const heroH = el.offsetHeight || 1;
      const prog = Math.min(1, Math.max(0, scrollLerp / heroH));
      const sy = prog * heroH * 0.15;           // лаг ~15% (эффективно фактор 0.85)
      const fade = 1 - prog * 0.55;

      st.style.transform =
        `translate3d(${px.toFixed(2)}px, ${(by + py + sy).toFixed(2)}px, 0) scale(${(bs).toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      st.style.opacity = fade.toFixed(3);

      drawDust();
      if (running) raf = requestAnimationFrame(frame);
    };

    const startLoop = () => { if (running) return; running = true; raf = requestAnimationFrame(frame); };
    const stopLoop = () => { if (!running) return; running = false; cancelAnimationFrame(raf); };
    const sync = () => { const want = onScreen && docVisible; if (want) startLoop(); else stopLoop(); };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      mtx = Math.max(-1, Math.min(1, (mx / Math.max(1, r.width)) * 2 - 1));
      mty = Math.max(-1, Math.min(1, (my / Math.max(1, r.height)) * 2 - 1));
    };
    const onLeave = () => { mtx = 0; mty = 0; mx = -1e5; my = -1e5; };
    const onScroll = () => { scrollY = window.scrollY || window.pageYOffset || 0; };
    const onVis = () => { docVisible = document.visibilityState !== "hidden"; sync(); };

    buildDust();
    const io = new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; sync(); }, { rootMargin: "120px 0px", threshold: 0 });
    io.observe(el);
    if (!coarse) { window.addEventListener("pointermove", onMove, { passive: true }); el.addEventListener("pointerleave", onLeave); }
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    let rt = 0;
    const onResize = () => { window.clearTimeout(rt); rt = window.setTimeout(buildDust, 200); };
    window.addEventListener("resize", onResize);

    return () => {
      stopLoop();
      io.disconnect();
      window.clearTimeout(rt);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const webp = SIZES.map((w) => `/hero/aurea-${w}.webp ${w}w`).join(", ");
  const png = SIZES.map((w) => `/hero/aurea-${w}.png ${w}w`).join(", ");

  return (
    <div ref={wrap} className="ph">
      <div className="ph-enter">
        <div ref={stage} className="ph-stage">
          <picture>
            <source type="image/webp" srcSet={webp} sizes="100vw" />
            <img
              src="/hero/aurea-1920.png"
              srcSet={png}
              sizes="100vw"
              width={3200}
              height={1350}
              alt="AUREA"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
      </div>
      <canvas ref={dust} className="ph-dust" aria-hidden />
    </div>
  );
}
