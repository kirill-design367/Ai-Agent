"use client";

import { useEffect, useRef } from "react";

/*
  «AUREA ИЗ ЧАСТИЦ» — RAW WebGL (один draw call), форма по макету.

  Начертание построено ВРУЧНУЮ (Druk не даёт нужную «A»): тонкий геометрический
  широкий гротеск; «A» — Λ-образная, без перекладины, с крупной СПЛОШНОЙ точкой в
  контрформе (точки рисуются отдельными DOM-кружками, не частицами).

  Живая материя:
  • размеры точек — заметный разброс (пыль / средние / редкие крупные), все
    калибры перемешаны в каждой области;
  • ТЕЧЕНИЕ — curl-noise поле в вершинном шейдере (uniform времени, без пересчёта
    буферов на CPU): плавные потоки и завихрения, буква держит форму мягким
    возвратом (на кромке жёстче);
  • СЛИЯНИЕ — у точек непрозрачное ядро + мягкая кромка одного цвета: пересечения
    чёрных ядер сливаются в единую массу без «наложения кружков».

  Перф: rAF стоит вне вьюпорта (IntersectionObserver) + пауза во вкладке; без
  аллокаций в кадре; dpr динамический (потолок 3, откат при просадке); адаптив
  (замер FPS ~2с). Нет WebGL → фолбэк на canvas-2D. reduce-motion — статично.
  Вход «из тумана» один раз. Курсор — деликатно.
*/

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

// ширины букв (в долях кегля fs) и зазор
const LW: Record<string, number> = { A: 0.92, U: 0.80, R: 0.76, E: 0.66 };
const GAP = 0.16;

const VERT = `
precision highp float;
attribute vec2 aHome;
attribute vec2 aStart;
attribute vec2 aDisp;
attribute float aSize;
attribute float aShade;
attribute float aFlow;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uEnter;
uniform float uFlowAmt;
varying float vShade;
varying float vSoft;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
vec2 curl(vec2 p){
  float e=0.6;
  float n1=snoise(p+vec2(0.0,e));
  float n2=snoise(p-vec2(0.0,e));
  float n3=snoise(p+vec2(e,0.0));
  float n4=snoise(p-vec2(e,0.0));
  return vec2(n1-n2, -(n3-n4)) / (2.0*e);
}
void main(){
  vec2 base = mix(aStart, aHome, uEnter);
  float t = uTime*0.00006;
  vec2 fp = aHome*0.010 + vec2(t, -t*0.7);
  vec2 flow = curl(fp) * aFlow * uFlowAmt;   // aFlow — амплитуда в px, поле мелкое → буква держит форму
  vec2 pos = base + aDisp + flow;
  gl_Position = vec4(pos.x/uRes.x*2.0-1.0, 1.0-pos.y/uRes.y*2.0, 0.0, 1.0);
  float ps = aSize * uDpr * (0.35 + 0.65*uEnter);
  gl_PointSize = max(ps, 1.0);
  vShade = aShade;
  vSoft = clamp(0.13 + ps*0.007, 0.13, 0.34);
}`;

const FRAG = `
precision mediump float;
varying float vShade;
varying float vSoft;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = 1.0 - smoothstep(0.5 - vSoft, 0.5, d);
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
    let dprCap = 3, qualityRatio = 1;
    let scheduleRebuild: () => void = () => {};
    let home = new Float32Array(0), start = new Float32Array(0), size = new Float32Array(0),
        shade = new Float32Array(0), flow = new Float32Array(0), disp = new Float32Array(0),
        velx = new Float32Array(0), vely = new Float32Array(0);
    let dotEls: HTMLElement[] = [];

    let raf = 0, running = false, onScreen = false, docVisible = true;
    let played = false, started = false, t0 = 0;
    let measured = false, activeMs = 0, mFrames = 0, mLast = 0;
    let cx = -1e5, cy = -1e5, lastMove = -1e9, rectL = 0, rectT = 0;
    const CR = 84, CR2 = CR * CR, CFORCE = 0.42, CK = 0.11, CDAMP = 0.82;

    // ── рисуем «AUREA» вручную (тонкий геометрический, «A» = Λ + точка) ──
    const drawGlyph = (o: CanvasRenderingContext2D, ch: string, x: number, top: number, fs: number) => {
      const w = (LW[ch] || 0.8) * fs;
      o.beginPath();
      if (ch === "A") { o.moveTo(x, top + fs); o.lineTo(x + 0.46 * fs, top); o.lineTo(x + 0.92 * fs, top + fs); }
      else if (ch === "U") { const r = w / 2; o.moveTo(x, top); o.lineTo(x, top + fs - r); o.arc(x + r, top + fs - r, r, Math.PI, 0, true); o.lineTo(x + w, top); }
      else if (ch === "R") { o.moveTo(x, top + fs); o.lineTo(x, top); o.lineTo(x + 0.5 * w, top); o.bezierCurveTo(x + 1.04 * w, top, x + 1.04 * w, top + 0.52 * fs, x + 0.5 * w, top + 0.52 * fs); o.lineTo(x, top + 0.52 * fs); o.moveTo(x + 0.42 * w, top + 0.52 * fs); o.lineTo(x + w, top + fs); }
      else if (ch === "E") { o.moveTo(x + w, top); o.lineTo(x, top); o.lineTo(x, top + fs); o.lineTo(x + w, top + fs); o.moveTo(x, top + 0.5 * fs); o.lineTo(x + 0.82 * w, top + 0.5 * fs); }
      o.stroke();
    };

    const sample = () => {
      const rect = el.getBoundingClientRect();
      dpr = Math.min(dprCap, window.devicePixelRatio || 1);
      W = Math.max(320, Math.floor(rect.width));
      H = Math.max(120, Math.floor(rect.height));
      rectL = rect.left; rectT = rect.top;

      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d")!;

      // кегль: слово целиком в кадре (min по высоте полосы и по ширине)
      const chars = word.split("");
      const unitW = chars.reduce((s, c) => s + (LW[c] || 0.8), 0) + GAP * (chars.length - 1);
      const targetW = W * 0.96;
      const fsH = H * 0.80;                 // высота слова ~80% полосы (сверху/снизу воздух)
      const fs = Math.max(24, Math.min(fsH, targetW / unitW));
      const wordW = unitW * fs;
      const x0 = (W - wordW) / 2;
      const topY = (H - fs) / 2;            // по центру полосы → не срезано
      o.lineWidth = Math.max(3, fs * 0.095);
      o.strokeStyle = "#000"; o.lineJoin = "miter"; o.miterLimit = 3; o.lineCap = "butt";

      const dotSpecs: { x: number; y: number; r: number }[] = [];
      let x = x0;
      for (const ch of chars) {
        drawGlyph(o, ch, x, topY, fs);
        if (ch === "A") dotSpecs.push({ x: x + 0.46 * fs, y: topY + fs * 0.66, r: fs * 0.155 });
        x += (LW[ch] || 0.8) * fs + GAP * fs;
      }
      const data = o.getImageData(0, 0, W, H).data;
      const A = (xx: number, yy: number) => (xx < 0 || yy < 0 || xx >= W || yy >= H) ? 0 : data[(yy * W + xx) * 4 + 3];

      // сэмплируем штрихи: контур (кромка) + заполнение, равномерно
      const ex: number[] = [], ey: number[] = [];
      const fx: number[] = [], fy: number[] = [];
      for (let y = 0; y < H; y++) {
        for (let xx = 0; xx < W; xx++) {
          if (A(xx, y) < 130) continue;
          const edge = A(xx - 1, y) < 130 || A(xx + 1, y) < 130 || A(xx, y - 1) < 130 || A(xx, y + 1) < 130;
          if (edge) { ex.push(xx); ey.push(y); }
          else { fx.push(xx); fy.push(y); }
        }
      }
      const targetTotal = coarse ? 24000 : 62000;
      edgeCount = ex.length;
      const fillBudget = Math.max(0, targetTotal - edgeCount);
      const fillKeep = fx.length > fillBudget ? fillBudget / fx.length : 1;

      const HX: number[] = [], HY: number[] = [], KIND: number[] = [];
      for (let i = 0; i < ex.length; i++) { HX.push(ex[i]); HY.push(ey[i]); KIND.push(0); }
      // заливку ПЕРЕМЕШИВАЕМ: снижение drawCount (адаптив) прорежает равномерно,
      // а не срезает низ букв (иначе верх плотный, низ — голый контур)
      const fi = fx.map((_, i) => i);
      for (let i = fi.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = fi[i]; fi[i] = fi[j]; fi[j] = t; }
      for (const i of fi) { if (fillKeep < 1 && Math.random() > fillKeep) continue; HX.push(fx[i]); HY.push(fy[i]); KIND.push(1); }
      N = HX.length;

      home = new Float32Array(N * 2); start = new Float32Array(N * 2);
      size = new Float32Array(N); shade = new Float32Array(N); flow = new Float32Array(N);
      disp = new Float32Array(N * 2); velx = new Float32Array(N); vely = new Float32Array(N);

      const k = Math.max(0.5, fs / 260); // масштаб размеров под кегль
      for (let i = 0; i < N; i++) {
        const hx = HX[i], hy = HY[i], kind = KIND[i];
        home[i * 2] = hx; home[i * 2 + 1] = hy;
        // РАЗБРОС размеров (все калибры перемешаны): пыль/средние/крупные (~1:10)
        let dia: number, sh: number;
        const r = Math.random();
        if (r < 0.60) { dia = (0.8 + Math.random() * 1.5) * k; sh = Math.random() < 0.45 ? 0.06 : 0.45 + Math.random() * 0.22; }
        else if (r < 0.88) { dia = (3.0 + Math.random() * 1.8) * k; sh = 0.05 + Math.random() * 0.06; }
        else { dia = (6.0 + Math.random() * 5.0) * k; sh = 0.03; }
        if (kind === 0 && dia > 3 * k) dia = (1.2 + Math.random() * 1.2) * k; // кромку держим мелкой и чёткой
        size[i] = dia; shade[i] = kind === 0 ? Math.min(sh, 0.1) : sh;
        flow[i] = kind === 0 ? 0.5 : 1.6 + Math.random() * 1.4; // амплитуда течения (px×curl); на кромке слабее — буква держит форму
        const ang = Math.random() * Math.PI * 2, dist = 180 + Math.random() * 700;
        start[i * 2] = hx + Math.cos(ang) * dist;
        start[i * 2 + 1] = hy + Math.sin(ang) * dist * 0.8;
      }
      drawCount = qualityRatio < 1 ? Math.max(edgeCount, Math.floor(N * qualityRatio)) : N;

      // DOM-точки в контрформах «A»
      while (dotEls.length > dotSpecs.length) { dotEls.pop()?.remove(); }
      while (dotEls.length < dotSpecs.length) { const d = document.createElement("i"); d.className = "ph-dot"; d.setAttribute("aria-hidden", "true"); el.appendChild(d); dotEls.push(d); }
      dotSpecs.forEach((s, i) => { const d = dotEls[i]; d.style.left = s.x + "px"; d.style.top = s.y + "px"; d.style.width = d.style.height = s.r * 2 + "px"; });
    };

    // ══════════════ WebGL ══════════════
    const gl = (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false })
      || canvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false })) as WebGLRenderingContext | null;
    let glFrame: ((t: number) => void) | null = null;
    let glResize: (() => void) | null = null;

    const setupGL = (): boolean => {
      if (!gl) return false;
      const mk = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
      const vs = mk(gl.VERTEX_SHADER, VERT), fs = mk(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      const bufs: Record<string, WebGLBuffer> = {};
      const bind = (name: string, arr: Float32Array, comp: number, usage: number) => {
        let b = bufs[name]; if (!b) { b = gl.createBuffer()!; bufs[name] = b; }
        gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, usage);
        const loc = gl.getAttribLocation(prog, name);
        if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, comp, gl.FLOAT, false, 0, 0); }
      };
      const uRes = gl.getUniformLocation(prog, "uRes"), uDpr = gl.getUniformLocation(prog, "uDpr"),
        uTime = gl.getUniformLocation(prog, "uTime"), uEnter = gl.getUniformLocation(prog, "uEnter"),
        uFlowAmt = gl.getUniformLocation(prog, "uFlowAmt");
      gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const applyGeom = () => {
        canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + "px"; canvas.style.height = H + "px";
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, W, H); gl.uniform1f(uDpr, dpr);
        bind("aHome", home, 2, gl.STATIC_DRAW); bind("aStart", start, 2, gl.STATIC_DRAW);
        bind("aSize", size, 1, gl.STATIC_DRAW); bind("aShade", shade, 1, gl.STATIC_DRAW);
        bind("aFlow", flow, 1, gl.STATIC_DRAW); bind("aDisp", disp, 2, gl.DYNAMIC_DRAW);
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
            const gx = home[i * 2] + dxp - cx, gy = home[i * 2 + 1] + dyp - cy, d2 = gx * gx + gy * gy;
            if (d2 < CR2 && d2 > 0.01) { const d = Math.sqrt(d2), f = (1 - d / CR) * CFORCE; ax += (gx / d) * f; ay += (gy / d) * f; }
          }
          const nvx = (velx[i] + ax) * CDAMP, nvy = (vely[i] + ay) * CDAMP;
          velx[i] = nvx; vely[i] = nvy;
          const nx = dxp + nvx, ny = dyp + nvy; disp[i * 2] = nx; disp[i * 2 + 1] = ny;
          const ad = Math.abs(nx) + Math.abs(ny); if (ad > maxD) maxD = ad;
        }
        dispDirty = active || maxD > 0.05;
        gl.bindBuffer(gl.ARRAY_BUFFER, bufs.aDisp); gl.bufferSubData(gl.ARRAY_BUFFER, 0, disp);
      };

      glFrame = (t: number) => {
        if (!started) { started = true; t0 = t; mLast = t; }
        activeMs += t - mLast; mLast = t; mFrames++;
        let enter = 1, flowAmt = 1;
        if (!reduce && !played) { const e = smooth(0, ENTRY_MS, t - t0); enter = easeOut(e); flowAmt = e; if (t - t0 >= ENTRY_MS) played = true; }
        if (!coarse && !reduce) cursorStep();
        gl.uniform1f(uTime, t); gl.uniform1f(uEnter, reduce ? 1 : enter); gl.uniform1f(uFlowAmt, reduce ? 0 : flowAmt);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, drawCount);
        if (!measured && activeMs > 2000) {
          measured = true;
          const fps = mFrames / (activeMs / 1000), targetFps = coarse ? 46 : 55;
          if (fps < targetFps) {
            qualityRatio = Math.max(0.4, fps / targetFps);
            drawCount = Math.max(edgeCount, Math.floor(N * qualityRatio));
            if (fps < targetFps * 0.65 && dprCap > 2) { dprCap = 2; scheduleRebuild(); }
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
      let enter = 1, br = 1;
      if (!reduce && !played) { const e = smooth(0, ENTRY_MS, t - t0); enter = easeOut(e); br = e; if (t - t0 >= ENTRY_MS) played = true; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const active = !coarse && !reduce && t - lastMove < 900;
      for (let i = 0; i < drawCount; i++) {
        const hx = home[i * 2], hy = home[i * 2 + 1];
        let x = reduce ? hx : start[i * 2] + (hx - start[i * 2]) * enter;
        let y = reduce ? hy : start[i * 2 + 1] + (hy - start[i * 2 + 1]) * enter;
        if (!reduce) { x += Math.sin(t * 0.0009 + hx * 0.05) * flow[i] * 3 * br; y += Math.cos(t * 0.0007 + hy * 0.05) * flow[i] * 3 * br; }
        if (active) { const gx = x - cx, gy = y - cy, d2 = gx * gx + gy * gy; if (d2 < CR2 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / CR) * 12; x += gx / d * f; y += gy / d * f; } }
        ctx.globalAlpha = 1 - shade[i] * 0.9; ctx.fillStyle = shade[i] < 0.2 ? "#0b0b0b" : "#8a8a8a";
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.4, size[i] * (0.35 + 0.65 * enter) / 2), 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (reduce || !running) return;
      raf = requestAnimationFrame(frame2D);
    };
    const setup2D = () => {
      ctx2d = canvas.getContext("2d");
      if (N > (coarse ? 4000 : 9000)) drawCount = coarse ? 4000 : 9000;
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
    };

    const drawOnce = (t: number) => { if (glOk) glFrame!(t); else frame2D(t); };
    const startLoop = () => { if (running) return; running = true; mLast = performance.now(); raf = requestAnimationFrame(glOk ? glFrame! : frame2D); };
    const stopLoop = () => { if (!running) return; running = false; cancelAnimationFrame(raf); if (!played) { played = true; started = false; measured = true; } };
    const sync = () => { const want = onScreen && docVisible; if (want) startLoop(); else stopLoop(); };

    const onMove = (ev: PointerEvent) => { cx = ev.clientX - rectL; cy = ev.clientY - rectT; lastMove = performance.now(); };
    const onLeave = () => { lastMove = -1e9; };
    const onScroll = () => { const r = canvas.getBoundingClientRect(); rectL = r.left; rectT = r.top; };
    const onVis = () => { docVisible = document.visibilityState !== "hidden"; sync(); };

    let cancelled = false, io: IntersectionObserver | null = null;
    const boot = () => {
      if (cancelled) return;
      sample();
      if (glOk) glResize?.(); else setup2D();
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

    // ── зум/ресайз/dpr → пересборка backing store + позиций ──
    let rt = 0;
    const rebuild = () => { if (cancelled) return; sample(); played = true; if (glOk) glResize?.(); else setup2D(); if (reduce || !running) drawOnce(performance.now()); };
    scheduleRebuild = () => { window.clearTimeout(rt); rt = window.setTimeout(rebuild, 180); };
    let dprMq: MediaQueryList | null = null;
    const onDpr = () => { if (dprMq) { dprMq.removeEventListener ? dprMq.removeEventListener("change", onDpr) : dprMq.removeListener(onDpr); } scheduleRebuild(); watchDpr(); };
    function watchDpr() { const d = window.devicePixelRatio || 1; try { dprMq = window.matchMedia(`(resolution: ${d}dppx)`); } catch { dprMq = null; } if (dprMq) { dprMq.addEventListener ? dprMq.addEventListener("change", onDpr) : dprMq.addListener(onDpr); } }
    watchDpr();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(() => scheduleRebuild()); ro.observe(el); }
    window.addEventListener("resize", scheduleRebuild);

    return () => {
      cancelled = true; running = false;
      cancelAnimationFrame(raf); window.clearTimeout(rt);
      io?.disconnect(); ro?.disconnect();
      if (dprMq) { dprMq.removeEventListener ? dprMq.removeEventListener("change", onDpr) : dprMq.removeListener(onDpr); }
      window.removeEventListener("resize", scheduleRebuild);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      dotEls.forEach((d) => d.remove()); dotEls = [];
    };
  }, [word]);

  return (
    <div ref={wrap} className="ph" aria-hidden>
      <canvas ref={cnv} />
    </div>
  );
}
