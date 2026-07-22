"use client";

import { useEffect, useRef } from "react";

/*
  «AUREA ИЗ ЧАСТИЦ» — движок на RAW WebGL (один draw call на всё облако).

  Почему WebGL: canvas-2D drawImage давал одинаковые спрайты, пикселизацию при
  зуме и потолок ~5000 точек. Здесь:
  • форма точки — во фрагментном шейдере через gl_PointCoord (расстояние от центра
    + smoothstep) → идеальный круг при любом dpr/зуме, без спрайтов;
  • размер каждой точки — индивидуальный атрибут gl_PointSize; степенное
    распределение (мельчайшая пыль / средние / редкие крупные акценты);
  • вход «из тумана» и «дыхание» — в вершинном шейдере (uniform-driven, БЕЗ
    загрузки буферов в кадр) → десятки тысяч точек почти бесплатно;
  • курсор — деликатное смещение (буфер aDisp) считается на CPU в Float32Array
    ТОЛЬКО во время взаимодействия; в покое — только draw call.

  Контур: по кромке глифа (детекция края в оффскрин-рендере) точки плотно и мелко
  → резкий силуэт; внутри — свободнее; пыль — за контуром в правой трети.

  Перф: rAF стоит вне вьюпорта (IntersectionObserver) + пауза во вкладке; без
  аллокаций в кадре; dpr с потолком 2; адаптив (замер FPS ~2с → снижаем число
  точек). Нет WebGL → фолбэк на лёгкий canvas-2D. reduce-motion — статичное слово.
  Вход играется один раз (фикс перезапуска на мобиле).
*/

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

const VERT = `
precision mediump float;
attribute vec2 aHome;
attribute vec2 aStart;
attribute vec2 aDisp;
attribute float aSize;
attribute float aShade;
attribute float aPhase;
attribute float aAmp;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uEnter;
uniform float uBreath;
varying float vShade;
varying float vEdge;
void main(){
  vec2 base = mix(aStart, aHome, uEnter);
  vec2 br = vec2(sin(uTime*0.0011 + aPhase), cos(uTime*0.0009 + aPhase*1.3)) * aAmp * uBreath;
  vec2 pos = base + aDisp + br;
  vec2 clip = vec2(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  float ps = aSize * uDpr * (0.32 + 0.68 * uEnter);
  gl_PointSize = max(ps, 1.0);
  vShade = aShade;
  vEdge = 1.5 / max(ps, 1.0);
}`;

const FRAG = `
precision mediump float;
varying float vShade;
varying float vEdge;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = 1.0 - smoothstep(0.5 - vEdge, 0.5, d);
  if (a <= 0.01) discard;
  gl_FragColor = vec4(vec3(vShade), a);
}`;

export default function ParticleHero({ word = "AUREA" }: { word?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cnv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current, canvas = cnv.current;
    if (!el || !canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none)").matches;
    const ENTRY_MS = 1600;

    let W = 0, H = 0, dpr = 1;
    let N = 0, drawCount = 0, edgeCount = 0;
    let home = new Float32Array(0), start = new Float32Array(0), size = new Float32Array(0),
        shade = new Float32Array(0), phase = new Float32Array(0), amp = new Float32Array(0),
        disp = new Float32Array(0), velx = new Float32Array(0), vely = new Float32Array(0);

    let raf = 0, running = false, onScreen = false, docVisible = true;
    let played = false, started = false, t0 = 0;
    let measured = false, activeMs = 0, mFrames = 0, mLast = 0;
    let dprCap = 3, qualityRatio = 1;                 // потолок dpr (динамический) и доля точек
    let scheduleRebuild: () => void = () => {};
    let cx = -1e5, cy = -1e5, lastMove = -1e9, rectL = 0, rectT = 0;
    const CR = 84, CR2 = CR * CR, CFORCE = 0.42, CK = 0.11, CDAMP = 0.82;

    // ── сэмплирование слова: контур + заливка + пыль ──
    const sample = () => {
      const rect = el.getBoundingClientRect();
      dpr = Math.min(dprCap, window.devicePixelRatio || 1);
      W = Math.max(320, Math.floor(rect.width));
      H = Math.max(120, Math.floor(rect.height));
      rectL = rect.left; rectT = rect.top;

      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      const ref = 100;
      o.font = `900 ${ref}px Druk, "Arial Black", sans-serif`;
      o.textAlign = "left"; o.textBaseline = "alphabetic";
      const mm = o.measureText(word);
      const wR = mm.width / ref;
      const aR = (mm.actualBoundingBoxAscent || ref * 0.72) / ref;
      // кегль = min(по высоте полосы, по ширине) → десктоп: высота задаёт кегль,
      // трекинг растягивает во всю ширину; мобайл: ширина ограничивает — слово
      // целиком в экране (все буквы видны), лента ниже.
      const targetW = W * (coarse ? 0.98 : 1.02);
      const fs = Math.max(24, Math.min((H * 0.9) / aR, targetW / wR));
      o.font = `900 ${fs}px Druk, "Arial Black", sans-serif`;
      const natW = wR * fs;
      const lsSupported = "letterSpacing" in o;
      let ls = 0;
      if (lsSupported && targetW > natW + 1) ls = (targetW - natW) / word.length;
      if (lsSupported) (o as unknown as { letterSpacing: string }).letterSpacing = ls + "px";
      o.font = `900 ${fs}px Druk, "Arial Black", sans-serif`;
      o.textAlign = "left"; o.textBaseline = "alphabetic";
      const drawnW = natW + ls * word.length;
      const x0 = (W - drawnW) / 2;
      const baseline = H + fs * 0.04;
      o.fillStyle = "#000";
      o.fillText(word, x0, baseline);
      const data = o.getImageData(0, 0, W, H).data;
      const wpx = drawnW;
      const A = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : data[(y * W + x) * 4 + 3];

      const ex: number[] = [], ey: number[] = [];
      const fx: number[] = [], fy: number[] = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (A(x, y) < 130) continue;
          const isEdge = A(x - 1, y) < 130 || A(x + 1, y) < 130 || A(x, y - 1) < 130 || A(x, y + 1) < 130;
          if (isEdge) { ex.push(x); ey.push(y); }
          else {
            const nx = (x - x0) / wpx;
            const keep = nx < 0.7 ? 0.6 : 0.6 * (1 - 0.72 * smooth(0.7, 1.05, nx));
            if (Math.random() < keep) { fx.push(x); fy.push(y); }
          }
        }
      }
      // пыль за контуром в правой трети
      const dxx: number[] = [], dyy: number[] = [];
      const dustN = coarse ? 1400 : 4200;
      for (let i = 0; i < dustN; i++) {
        const nx = 0.62 + Math.random() * 0.5;
        const gx = x0 + nx * wpx;
        const gy = baseline - Math.random() * aR * fs * 1.05;
        if (gx < -20 || gx > W + 20) continue;
        dxx.push(gx); dyy.push(gy);
      }

      const targetTotal = coarse ? 22000 : 56000;
      edgeCount = ex.length;
      const fillBudget = Math.max(0, targetTotal - edgeCount - dxx.length);
      const fillKeep = fx.length > fillBudget ? fillBudget / fx.length : 1;

      const HX: number[] = [], HY: number[] = [], KIND: number[] = [], NRM: number[] = [];
      for (let i = 0; i < ex.length; i++) { HX.push(ex[i]); HY.push(ey[i]); KIND.push(0); NRM.push((ex[i] - x0) / wpx); }
      for (let i = 0; i < fx.length; i++) { if (fillKeep < 1 && Math.random() > fillKeep) continue; HX.push(fx[i]); HY.push(fy[i]); KIND.push(1); NRM.push((fx[i] - x0) / wpx); }
      for (let i = 0; i < dxx.length; i++) { HX.push(dxx[i]); HY.push(dyy[i]); KIND.push(2); NRM.push((dxx[i] - x0) / wpx); }

      N = HX.length;
      home = new Float32Array(N * 2); start = new Float32Array(N * 2);
      size = new Float32Array(N); shade = new Float32Array(N);
      phase = new Float32Array(N); amp = new Float32Array(N);
      disp = new Float32Array(N * 2); velx = new Float32Array(N); vely = new Float32Array(N);

      for (let i = 0; i < N; i++) {
        const hx = HX[i], hy = HY[i], k = KIND[i];
        home[i * 2] = hx; home[i * 2 + 1] = hy;
        let dia: number, sh: number;
        if (k === 0) { dia = 0.9 + Math.random() * 0.9; sh = 0.05; }
        else if (k === 2) { dia = 0.5 + Math.random() * 0.9; sh = 0.5 + Math.random() * 0.22; }
        else {
          const r = Math.random();
          if (r < 0.70) { dia = 0.6 + Math.random() * 1.0; sh = Math.random() < 0.5 ? 0.05 : 0.42 + Math.random() * 0.22; }
          else if (r < 0.95) { dia = 2.0 + Math.random() * 1.2; sh = 0.05 + Math.random() * 0.08; }
          else { dia = 4.0 + Math.random() * 3.0; sh = 0.04; }
        }
        size[i] = dia; shade[i] = sh;
        phase[i] = Math.random() * Math.PI * 2;
        amp[i] = 0.5 + Math.random() * 1.0 + (k === 0 ? 0 : dia * 0.05);
        const ang = Math.random() * Math.PI * 2, dist = 180 + Math.random() * 700;
        start[i * 2] = hx + Math.cos(ang) * dist;
        start[i * 2 + 1] = hy + Math.sin(ang) * dist * 0.8;
      }
      void NRM;
      // сохраняем адаптивную долю точек при пересборке (зум/ресайз)
      drawCount = qualityRatio < 1
        ? Math.max(edgeCount + Math.floor((N - edgeCount) * 0.2), Math.floor(N * qualityRatio))
        : N;
    };

    // ══════════════ WebGL ══════════════
    const gl = (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false })
      || canvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false })) as WebGLRenderingContext | null;

    let glFrame: ((t: number) => void) | null = null;
    let glResize: (() => void) | null = null;

    const setupGL = (): boolean => {
      if (!gl) return false;
      const mk = (type: number, src: string) => {
        const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      };
      const vs = mk(gl.VERTEX_SHADER, VERT), fs = mk(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);

      const bufs: Record<string, WebGLBuffer> = {};
      const bind = (name: string, arr: Float32Array, comp: number, usage: number) => {
        let b = bufs[name]; if (!b) { b = gl.createBuffer()!; bufs[name] = b; }
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, arr, usage);
        const loc = gl.getAttribLocation(prog, name);
        if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, comp, gl.FLOAT, false, 0, 0); }
      };
      const uRes = gl.getUniformLocation(prog, "uRes");
      const uDpr = gl.getUniformLocation(prog, "uDpr");
      const uTime = gl.getUniformLocation(prog, "uTime");
      const uEnter = gl.getUniformLocation(prog, "uEnter");
      const uBreath = gl.getUniformLocation(prog, "uBreath");

      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const applyGeom = () => {
        canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + "px"; canvas.style.height = H + "px";
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, W, H); gl.uniform1f(uDpr, dpr);
        bind("aHome", home, 2, gl.STATIC_DRAW);
        bind("aStart", start, 2, gl.STATIC_DRAW);
        bind("aSize", size, 1, gl.STATIC_DRAW);
        bind("aShade", shade, 1, gl.STATIC_DRAW);
        bind("aPhase", phase, 1, gl.STATIC_DRAW);
        bind("aAmp", amp, 1, gl.STATIC_DRAW);
        bind("aDisp", disp, 2, gl.DYNAMIC_DRAW);
      };
      glResize = applyGeom;

      let dispDirty = false;
      const cursorStep = () => {
        const now = performance.now();
        const active = now - lastMove < 900;
        if (!active && !dispDirty) return;
        let maxD = 0;
        for (let i = 0; i < drawCount; i++) {
          const dxp = disp[i * 2], dyp = disp[i * 2 + 1];
          let ax = -dxp * CK, ay = -dyp * CK;
          if (active) {
            const gx = home[i * 2] + dxp - cx, gy = home[i * 2 + 1] + dyp - cy;
            const d2 = gx * gx + gy * gy;
            if (d2 < CR2 && d2 > 0.01) { const d = Math.sqrt(d2), f = (1 - d / CR) * CFORCE; ax += (gx / d) * f; ay += (gy / d) * f; }
          }
          const nvx = (velx[i] + ax) * CDAMP, nvy = (vely[i] + ay) * CDAMP;
          velx[i] = nvx; vely[i] = nvy;
          const nx = dxp + nvx, ny = dyp + nvy;
          disp[i * 2] = nx; disp[i * 2 + 1] = ny;
          const ad = Math.abs(nx) + Math.abs(ny); if (ad > maxD) maxD = ad;
        }
        dispDirty = active || maxD > 0.05;
        gl.bindBuffer(gl.ARRAY_BUFFER, bufs.aDisp);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, disp);
      };

      glFrame = (t: number) => {
        if (!started) { started = true; t0 = t; mLast = t; }
        activeMs += t - mLast; mLast = t; mFrames++;
        let enter = 1, breath = 1;
        if (!reduce && !played) {
          const e = smooth(0, ENTRY_MS, t - t0);
          enter = easeOut(e); breath = e;
          if (t - t0 >= ENTRY_MS) played = true;
        }
        if (!coarse && !reduce) cursorStep();
        gl.uniform1f(uTime, t);
        gl.uniform1f(uEnter, reduce ? 1 : enter);
        gl.uniform1f(uBreath, reduce ? 0 : breath);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, drawCount);
        if (!measured && activeMs > 2000) {
          measured = true;
          const fps = mFrames / (activeMs / 1000);
          const targetFps = coarse ? 46 : 55;
          if (fps < targetFps) {
            qualityRatio = Math.max(0.35, fps / targetFps);
            drawCount = Math.max(edgeCount + Math.floor((N - edgeCount) * 0.2), Math.floor(N * qualityRatio));
            if (fps < targetFps * 0.65 && dprCap > 2) { dprCap = 2; scheduleRebuild(); } // откат dpr при сильной просадке
          }
        }
        if (reduce || !running) return;
        raf = requestAnimationFrame(glFrame!);
      };

      applyGeom();
      return true;
    };
    const glOk = setupGL();

    // ── canvas-2D фолбэк ──
    let ctx2d: CanvasRenderingContext2D | null = null;
    const frame2D = (t: number) => {
      const ctx = ctx2d!;
      if (!started) { started = true; t0 = t; }
      let enter = 1, breath = 1;
      if (!reduce && !played) { const e = smooth(0, ENTRY_MS, t - t0); enter = easeOut(e); breath = e; if (t - t0 >= ENTRY_MS) played = true; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const active = !coarse && !reduce && t - lastMove < 900;
      for (let i = 0; i < drawCount; i++) {
        const hx = home[i * 2], hy = home[i * 2 + 1];
        let x = reduce ? hx : start[i * 2] + (hx - start[i * 2]) * enter;
        let y = reduce ? hy : start[i * 2 + 1] + (hy - start[i * 2 + 1]) * enter;
        if (!reduce) { x += Math.sin(t * 0.0011 + phase[i]) * amp[i] * breath; y += Math.cos(t * 0.0009 + phase[i] * 1.3) * amp[i] * breath; }
        if (active) { const gx = x - cx, gy = y - cy, d2 = gx * gx + gy * gy; if (d2 < CR2 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / CR) * 12; x += gx / d * f; y += gy / d * f; } }
        ctx.globalAlpha = 1 - shade[i] * 0.9;
        ctx.fillStyle = shade[i] < 0.2 ? "#0b0b0b" : "#8a8a8a";
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.4, size[i] * (0.32 + 0.68 * enter) / 2), 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (reduce || !running) return;
      raf = requestAnimationFrame(frame2D);
    };
    const setup2D = () => {
      ctx2d = canvas.getContext("2d");
      if (N > (coarse ? 1500 : 3000)) drawCount = coarse ? 1500 : 3000;
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
    };

    const drawOnce = (t: number) => { if (glOk) glFrame!(t); else frame2D(t); };
    const startLoop = () => {
      if (running) return; running = true; mLast = performance.now();
      raf = requestAnimationFrame(glOk ? glFrame! : frame2D);
    };
    const stopLoop = () => {
      if (!running) return; running = false; cancelAnimationFrame(raf);
      if (!played) { played = true; started = false; measured = true; } // не переигрывать вход
    };
    const sync = () => { const want = onScreen && docVisible; if (want) startLoop(); else stopLoop(); };

    const onMove = (ev: PointerEvent) => { cx = ev.clientX - rectL; cy = ev.clientY - rectT; lastMove = performance.now(); };
    const onLeave = () => { lastMove = -1e9; };
    const onScroll = () => { const r = canvas.getBoundingClientRect(); rectL = r.left; rectT = r.top; };
    const onVis = () => { docVisible = document.visibilityState !== "hidden"; sync(); };

    let cancelled = false, io: IntersectionObserver | null = null;
    const boot = () => {
      if (cancelled) return;
      sample();
      if (glOk) glResize?.(); else setup2D(); // разместить канвас + залить буферы РЕАЛЬНЫМИ размерами (setupGL при инициализации имел W=H=0)
      if (reduce) { played = true; started = true; measured = true; drawOnce(performance.now()); return; }
      io = new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; sync(); }, { rootMargin: "140px 0px", threshold: 0 });
      io.observe(el);
      if (!coarse) {
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onMove, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        canvas.addEventListener("pointerleave", onLeave);
      }
      document.addEventListener("visibilitychange", onVis);
    };
    if (document.fonts && document.fonts.load) document.fonts.load("900 200px Druk").then(boot).catch(boot);
    else boot();

    // ── зум/ресайз/смена dpr → пересборка backing store и позиций частиц ──
    let rt = 0;
    const rebuild = () => {
      if (cancelled) return;
      sample();                                // новые глифы под актуальный размер и dpr
      played = true;                           // вход не переигрываем
      if (glOk) glResize?.(); else setup2D();  // width/height = cssSize × dpr, viewport, uniform-масштабы
      if (reduce || !running) drawOnce(performance.now());
    };
    scheduleRebuild = () => { window.clearTimeout(rt); rt = window.setTimeout(rebuild, 180); };

    // подписка на КОНКРЕТНОЕ разрешение; при срабатывании пере-подписываемся на новое
    let dprMq: MediaQueryList | null = null;
    const onDpr = () => {
      if (dprMq) { dprMq.removeEventListener ? dprMq.removeEventListener("change", onDpr) : dprMq.removeListener(onDpr); }
      scheduleRebuild();
      watchDpr();
    };
    function watchDpr() {
      const d = window.devicePixelRatio || 1;
      try { dprMq = window.matchMedia(`(resolution: ${d}dppx)`); } catch { dprMq = null; }
      if (dprMq) { dprMq.addEventListener ? dprMq.addEventListener("change", onDpr) : dprMq.addListener(onDpr); }
    }
    watchDpr();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(() => scheduleRebuild()); ro.observe(el); }
    window.addEventListener("resize", scheduleRebuild);

    return () => {
      cancelled = true; running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(rt);
      io?.disconnect();
      ro?.disconnect();
      if (dprMq) { dprMq.removeEventListener ? dprMq.removeEventListener("change", onDpr) : dprMq.removeListener(onDpr); }
      window.removeEventListener("resize", scheduleRebuild);
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
