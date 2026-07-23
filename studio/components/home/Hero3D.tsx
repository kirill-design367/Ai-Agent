"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

/*
  HERO-НАДПИСЬ AUREA — настоящий 3D: тысячи чёрных глянцевых сфер (MatCap-лак),
  один InstancedMesh (один draw call). Геометрия букв — точные координаты (Λ без
  перекладины, R с просветом), частицы сеются по трубке радиуса 0.065.

  Слои: основной по буквам + пыль + ореол + выбросы из концов + далёкая пыль +
  сферические точки в контрформах Λ. Дрейф/вход/скролл/курсор — в вершинном
  шейдере (uniform времени, без пересчёта буферов в кадре). Цикл — gsap.ticker,
  стоп вне вьюпорта и при скрытой вкладке; dpr≤2; адаптив по FPS; мобайл — втрое
  меньше частиц, без курсора; reduce-motion — статичное собранное облако.
  Канвас декоративный (aria-hidden), h1/манифест — в DOM (LCP, 3D после гидратации).
*/

// ── геометрия букв: полилинии (line/arc). высота=1, штрих r=0.065 ──
type Seg =
  | { k: "L"; ax: number; ay: number; bx: number; by: number; len: number }
  | { k: "A"; cx: number; cy: number; r: number; a0: number; a1: number; len: number };

const L = (ax: number, ay: number, bx: number, by: number): Seg =>
  ({ k: "L", ax, ay, bx, by, len: Math.hypot(bx - ax, by - ay) });
const A = (cx: number, cy: number, r: number, a0: number, a1: number): Seg =>
  ({ k: "A", cx, cy, r, a0, a1, len: r * Math.abs(a1 - a0) });

function lambda(ox: number): Seg[] { return [L(ox - 0.37, 0, ox, 1), L(ox, 1, ox + 0.37, 0)]; }
function letterU(ox: number): Seg[] {
  const r = 0.30;
  return [L(ox - r, 1, ox - r, 0.32), A(ox, 0.32, r, Math.PI, Math.PI * 2), L(ox + r, 0.32, ox + r, 1)];
}
function letterR(ox: number): Seg[] {
  const x0 = ox - 0.29, r = 0.20, xr = 0.32;
  return [
    L(x0, 0, x0, 1),
    L(x0, 1, x0 + xr, 1),
    A(x0 + xr, 0.80, r, Math.PI / 2, 0),
    L(x0 + xr + r, 0.80, x0 + xr + r, 0.71),
    A(x0 + xr, 0.71, r, 0, -Math.PI / 2),
    L(x0 + xr, 0.51, x0 + 0.60, 0),
  ];
}
function letterE(ox: number): Seg[] {
  const x0 = ox - 0.28;
  return [L(x0, 0, x0, 1), L(x0, 1, x0 + 0.55, 1), L(x0, 0.51, x0 + 0.46, 0.51), L(x0, 0, x0 + 0.55, 0)];
}
const WORD: Seg[] = [
  ...lambda(-1.72), ...letterU(-0.82), ...letterR(0.06), ...letterE(0.92), ...lambda(1.78),
];
const DOTS = [[-1.72, 0.27], [1.78, 0.27]] as const;
const CX = 0.03, CY = 0.5; // центр слова → к началу координат

function segPoint(s: Seg, t: number) {
  if (s.k === "L") {
    const px = s.ax + (s.bx - s.ax) * t, py = s.ay + (s.by - s.ay) * t;
    let tx = s.bx - s.ax, ty = s.by - s.ay; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    return { px, py, tx, ty };
  }
  const a = s.a0 + (s.a1 - s.a0) * t;
  const px = s.cx + s.r * Math.cos(a), py = s.cy + s.r * Math.sin(a);
  const sgn = s.a1 >= s.a0 ? 1 : -1;
  return { px, py, tx: -Math.sin(a) * sgn, ty: Math.cos(a) * sgn };
}

export default function Hero3D() {
  const wrap = useRef<HTMLDivElement>(null);
  const cnv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current, canvas = cnv.current;
    if (!el || !canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none)").matches;

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" }); }
    catch { return; }
    renderer.setClearAlpha(0);

    const totalLen = WORD.reduce((s, g) => s + g.len, 0);
    // ── matcap: чёрный лак с узкой засветкой сверху ──
    const mc = document.createElement("canvas"); mc.width = mc.height = 256;
    const g = mc.getContext("2d")!;
    g.fillStyle = "#050505"; g.fillRect(0, 0, 256, 256);
    let grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "#3a3a3a"); grd.addColorStop(0.5, "#101010"); grd.addColorStop(1, "#000");
    g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 128, 0, 7); g.fill();
    grd = g.createRadialGradient(112, 74, 4, 112, 74, 60);
    grd.addColorStop(0, "rgba(255,255,255,0.95)"); grd.addColorStop(0.4, "rgba(255,255,255,0.28)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.beginPath(); g.arc(112, 74, 60, 0, 7); g.fill();
    grd = g.createRadialGradient(150, 190, 2, 150, 190, 40);
    grd.addColorStop(0, "rgba(120,120,120,0.4)"); grd.addColorStop(1, "rgba(120,120,120,0)");
    g.fillStyle = grd; g.beginPath(); g.arc(150, 190, 40, 0, 7); g.fill();
    const matcap = new THREE.CanvasTexture(mc); matcap.colorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-2.5, 2.5, 1.5, -1.5, 0.1, 100);
    cam.position.z = 5;

    const group = new THREE.Group(); scene.add(group);
    const sphere = new THREE.SphereGeometry(1, 8, 6);

    // ── генерация частиц по слоям в единый пул ──
    let mesh: THREE.InstancedMesh | null = null;
    const material = new THREE.MeshMatcapMaterial({ matcap, color: 0x0b0b0b });
    const uni = { uTime: { value: 0 }, uEnter: { value: reduce ? 1 : 0 }, uBreath: { value: reduce ? 0 : 1 }, uScroll: { value: 0 }, uMouse: { value: new THREE.Vector2(9e3, 9e3) }, uMouseR: { value: 0.5 }, uMouseStr: { value: 0.06 } };
    material.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uni);
      sh.vertexShader = `
        attribute vec3 aHome; attribute vec3 aDrift; attribute vec3 aEject; attribute float aPhase; attribute float aFlow;
        uniform float uTime, uEnter, uBreath, uScroll, uMouseR, uMouseStr; uniform vec2 uMouse;
      ` + sh.vertexShader;
      sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
        vec3 _drift = aDrift * sin(uTime * 0.5 + aPhase) * (aFlow * uBreath);
        vec3 _far = aHome + aEject * 3.2;
        vec3 _base = mix(_far, aHome, uEnter) + _drift + aEject * (uScroll * 0.7);
        vec2 _md = _base.xy - uMouse; float _d = length(_md);
        _base.xy += normalize(_md + vec2(1e-4)) * (smoothstep(uMouseR, 0.0, _d) * uMouseStr);
      `);
      sh.vertexShader = sh.vertexShader.replace("#include <project_vertex>", `
        vec4 mvPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif
        mvPosition.xyz += _base;
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;
      `);
    };

    const build = (q: number) => {
      if (mesh) { group.remove(mesh); mesh.dispose(); }
      const C = (n: number) => Math.max(1, Math.round(n * q));
      const nMain = C(13000), nDust = C(25000), nHalo = C(2600), nEject = C(900), nFar = C(700), nDot = C(240);
      const N = nMain + nDust + nHalo + nEject + nFar + nDot * 2;
      const home = new Float32Array(N * 3), drift = new Float32Array(N * 3), eject = new Float32Array(N * 3);
      const phase = new Float32Array(N), flow = new Float32Array(N), scl = new Float32Array(N);
      let i = 0;
      const put = (x: number, y: number, z: number, size: number, ejx: number, ejy: number, ejz: number, fl: number) => {
        home[i * 3] = x - CX; home[i * 3 + 1] = y - CY; home[i * 3 + 2] = z;
        // когерентный дрейф-вектор (псевдо-curl) + фаза
        drift[i * 3] = Math.sin(y * 3.1 + x * 1.7); drift[i * 3 + 1] = Math.cos(x * 2.9 - y * 1.3); drift[i * 3 + 2] = Math.sin(x * 2.0 + y * 2.3);
        eject[i * 3] = ejx; eject[i * 3 + 1] = ejy; eject[i * 3 + 2] = ejz;
        phase[i] = Math.random() * 6.283; flow[i] = fl; scl[i] = size; i++;
      };
      const sampleSeg = () => { // случайная точка на слове по длине + касательная
        let r = Math.random() * totalLen; let s = WORD[0];
        for (const seg of WORD) { if (r <= seg.len) { s = seg; break; } r -= seg.len; }
        return segPoint(s, Math.random());
      };
      const outward = (x: number, y: number) => { const dx = x - CX, dy = y - CY, l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l] as const; };
      // а) основной — по поверхности трубки
      for (let k = 0; k < nMain; k++) {
        const p = sampleSeg(), th = Math.random() * 6.283, rr = 0.065;
        const x = p.px - p.ty * rr * Math.cos(th), y = p.py + p.tx * rr * Math.cos(th), z = rr * Math.sin(th);
        const [ox, oy] = outward(p.px, p.py);
        put(x, y, z, 0.0075 + (0.042 - 0.0075) * Math.pow(Math.random(), 2.2), ox * (0.2 + Math.random() * 0.5), oy * (0.2 + Math.random() * 0.5), (Math.random() - 0.5) * 0.6, 0.010);
      }
      // б) пыль — поверх/вокруг + глубина
      for (let k = 0; k < nDust; k++) {
        const p = sampleSeg(), th = Math.random() * 6.283, rr = 0.065 + (Math.random() - 0.5) * 0.03;
        const x = p.px - p.ty * rr * Math.cos(th), y = p.py + p.tx * rr * Math.cos(th), z = rr * Math.sin(th) + (Math.random() - 0.5) * 0.032;
        const [ox, oy] = outward(p.px, p.py);
        put(x, y, z, 0.0013 + (0.007 - 0.0013) * Math.random(), ox * (0.3 + Math.random() * 0.6), oy * (0.3 + Math.random() * 0.6), (Math.random() - 0.5) * 0.8, 0.016);
      }
      // в) ореол — разлёт от букв
      for (let k = 0; k < nHalo; k++) {
        const p = sampleSeg(); const [ox, oy] = outward(p.px, p.py);
        const dist = Math.pow(Math.random(), 2.4) * 0.42, ang = Math.random() * 6.283;
        const dx = ox * 0.6 + Math.cos(ang) * 0.5, dy = oy * 0.6 + Math.sin(ang) * 0.5;
        const x = p.px + dx * dist, y = p.py + dy * dist, z = (Math.random() - 0.5) * 0.12;
        put(x, y, z, 0.011 - (0.011 - 0.0012) * (dist / 0.42), dx * (0.6 + Math.random()), dy * (0.6 + Math.random()), (Math.random() - 0.5), 0.02);
      }
      // г) выбросы из концов штрихов
      const tips: number[][] = [];
      for (const s of WORD) { if (s.k === "L") { tips.push([s.ax, s.ay], [s.bx, s.by]); } }
      for (let k = 0; k < nEject; k++) {
        const tp = tips[(Math.random() * tips.length) | 0]; const [ox, oy] = outward(tp[0], tp[1]);
        const dist = Math.pow(Math.random(), 1.6) * 0.75, jx = ox + (Math.random() - 0.5) * 0.4, jy = oy + (Math.random() - 0.5) * 0.4;
        const l = Math.hypot(jx, jy) || 1;
        const x = tp[0] + (jx / l) * dist, y = tp[1] + (jy / l) * dist, z = (Math.random() - 0.5) * 0.2;
        put(x, y, z, 0.008 - (0.008 - 0.001) * (dist / 0.75), (jx / l) * (0.8 + Math.random()), (jy / l) * (0.8 + Math.random()), (Math.random() - 0.5) * 1.2, 0.024);
      }
      // д) далёкая пыль по сцене
      for (let k = 0; k < nFar; k++) {
        const x = (Math.random() - 0.5) * 5.6, y = (Math.random() - 0.5) * 2.6, z = (Math.random() - 0.5) * 1.2;
        const [ox, oy] = outward(x, y);
        put(x, y, z, 0.0008 + Math.random() * 0.0022, ox * Math.random(), oy * Math.random(), (Math.random() - 0.5) * 1.4, 0.03);
      }
      // е) точки в контрформах Λ
      for (const [dxc, dyc] of DOTS) {
        for (let k = 0; k < nDot; k++) {
          const u = Math.random(), rr = 0.10 * Math.cbrt(u), th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
          const x = dxc + rr * Math.sin(ph) * Math.cos(th), y = dyc + rr * Math.sin(ph) * Math.sin(th), z = rr * Math.cos(ph);
          put(x, y, z, 0.0014 + (0.009 - 0.0014) * (1 - rr / 0.10), (x - dxc) * 2, (y - dyc) * 2, z * 2, 0.006);
        }
      }

      mesh = new THREE.InstancedMesh(sphere, material, N);
      const dummy = new THREE.Object3D();
      for (let j = 0; j < N; j++) { dummy.position.set(0, 0, 0); dummy.scale.setScalar(scl[j]); dummy.updateMatrix(); mesh.setMatrixAt(j, dummy.matrix); }
      mesh.instanceMatrix.needsUpdate = true;
      const gm = mesh.geometry as THREE.InstancedBufferGeometry;
      gm.setAttribute("aHome", new THREE.InstancedBufferAttribute(home, 3));
      gm.setAttribute("aDrift", new THREE.InstancedBufferAttribute(drift, 3));
      gm.setAttribute("aEject", new THREE.InstancedBufferAttribute(eject, 3));
      gm.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));
      gm.setAttribute("aFlow", new THREE.InstancedBufferAttribute(flow, 1));
      mesh.frustumCulled = false;
      group.add(mesh);
    };

    // размеры/камера под полосу
    let W = 0, H = 0;
    const resize = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(W, H, false);
      const fw = 5.2, fh = fw * (H / W); // кадр по ширине слова
      cam.left = -fw / 2; cam.right = fw / 2; cam.top = fh / 2; cam.bottom = -fh / 2;
      cam.updateProjectionMatrix();
      uni.uMouseR.value = fw * 0.10;
    };

    // ── интерактив + цикл ──
    let mnx = 0, mny = 0, rotX = 0, rotY = 0, mvx = 9e3, mvy = 9e3, tmvx = 9e3, tmvy = 9e3;
    let scrollTarget = 0, scrollCur = 0, running = false, onScreen = false, docVis = true;
    let measured = false, frames = 0, tStart = 0, q = coarse ? 0.32 : (new URLSearchParams(location.search).has("lite") ? 0.12 : 1);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      mnx = Math.max(-1, Math.min(1, nx)); mny = Math.max(-1, Math.min(1, ny));
      tmvx = mnx * 2.6; tmvy = -mny * (2.6 * H / W);
    };
    const onLeave = () => { mnx = 0; mny = 0; tmvx = 9e3; tmvy = 9e3; };
    const onScroll = () => { const r = el.getBoundingClientRect(); const hero = el.offsetHeight || 1; scrollTarget = Math.min(1, Math.max(0, -r.top / hero)); };

    const tick = () => {
      uni.uTime.value = performance.now() * 0.001;
      if (!coarse) {
        rotX += ((-mny * 0.07) - rotX) * 0.06; rotY += ((mnx * 0.07) - rotY) * 0.06;
        group.rotation.x = rotX; group.rotation.y = rotY;
        mvx += (tmvx - mvx) * 0.12; mvy += (tmvy - mvy) * 0.12;
        uni.uMouse.value.set(mvx, mvy);
      }
      scrollCur += (scrollTarget - scrollCur) * 0.1; uni.uScroll.value = scrollCur;
      renderer.render(scene, cam);
      if (!measured) {
        frames++; if (!tStart) tStart = performance.now();
        const dt = performance.now() - tStart;
        if (dt > 2000) {
          measured = true; const fps = frames / (dt / 1000);
          if (fps < (coarse ? 40 : 52) && q > 0.3) { q = Math.max(0.28, q * (fps / (coarse ? 44 : 56))); build(q); }
        }
      }
    };
    const start = () => { if (running) return; running = true; gsap.ticker.add(tick); };
    const stop = () => { if (!running) return; running = false; gsap.ticker.remove(tick); };
    const sync = () => { const w = onScreen && docVis; if (w) start(); else stop(); };

    // старт
    build(q); resize();
    if (!reduce) { gsap.to(uni.uEnter, { value: 1, duration: 1.5, ease: "power2.out" }); uni.uBreath.value = 1; }
    else { renderer.render(scene, cam); }

    const io = new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; sync(); }, { rootMargin: "160px 0px" });
    io.observe(el);
    const onVis = () => { docVis = document.visibilityState !== "hidden"; sync(); };
    if (!coarse && !reduce) { window.addEventListener("pointermove", onMove, { passive: true }); el.addEventListener("pointerleave", onLeave); }
    if (!reduce) window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    let rt = 0; const onRe = () => { window.clearTimeout(rt); rt = window.setTimeout(resize, 200); };
    window.addEventListener("resize", onRe);

    return () => {
      stop(); io.disconnect(); window.clearTimeout(rt);
      window.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll); document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onRe);
      mesh?.dispose(); sphere.dispose(); material.dispose(); matcap.dispose(); renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrap} className="ph" aria-hidden>
      <canvas ref={cnv} className="ph-gl" />
    </div>
  );
}
