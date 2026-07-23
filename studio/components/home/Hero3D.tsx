"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

/*
  HERO-НАДПИСЬ AUREA — настоящий 3D: тысячи чёрных глянцевых сфер (MatCap-лак),
  один InstancedMesh (один draw call). Геометрия букв — точные координаты (Λ без
  перекладины, R с просветом), частицы сеются по трубке радиуса 0.065.

  КОМПОЗИЦИЯ (не шум): асимметрия (масса гуще слева-снизу, редеет вправо-вверх),
  зоны концентрации по золотому сечению, кластеризация (центры → гауссов разброс),
  10-15% одиночек, ~60% площади вокруг — чистая пустота; плотность максимальна
  у букв и концов штрихов. Калибр букв — 8 ступеней (крупные редки, мелкие часты).

  БЕЗ ГРАНИЦ: канвас 150vh, уходит далеко за низ hero (нет overflow:hidden у
  родителей); частицы гаснут по мировой Y-координате в нижних ~30% канваса до нуля
  — ровного края нет ни при каком скролле. По бокам — мягкое NDC-затухание.

  HOVER: параллакс по глубине (слои с разным Z смещаются с разной скоростью) +
  световой отклик (сферы у курсора светлеют — курсор «протирает лак»). Отталкивание
  очень слабое, форма букв не гуляет.

  ПЕРФ: набор частиц генерируется ОДИН раз; адаптив по FPS только уменьшает
  mesh.count (ambient-слои в хвосте) — позиции не пересчитываются, скачка нет.
  Замер во время входной анимации (незаметно). dpr≤2; мобайл — меньше частиц,
  без курсора; reduce-motion — статично. Канвас декоративный (aria-hidden),
  h1/манифест — в DOM (LCP, 3D после гидратации).
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

// ── 8-ступенчатая калибровка размера ВНУТРИ букв (микс, не зонами) ──
const MAXR = 0.042;
const TIER_M = [1.0, 0.72, 0.52, 0.37, 0.26, 0.18, 0.12, 0.07];
const TIER_PCT = [3, 5, 8, 11, 14, 17, 20, 22];
const TIER_CUM: number[] = [];
{ let a = 0; for (const p of TIER_PCT) { a += p; TIER_CUM.push(a); } } // →100
function tierSize(): number {
  const r = Math.random() * 100;
  for (let t = 0; t < 8; t++) if (r < TIER_CUM[t]) return TIER_M[t] * MAXR;
  return TIER_M[7] * MAXR;
}
// пыль — только мелкие ступени 6–8
function dustSize(): number {
  const r = Math.random() * (TIER_PCT[5] + TIER_PCT[6] + TIER_PCT[7]);
  if (r < TIER_PCT[5]) return TIER_M[5] * MAXR;
  if (r < TIER_PCT[5] + TIER_PCT[6]) return TIER_M[6] * MAXR;
  return TIER_M[7] * MAXR;
}
// скорость дрейфа по калибру: мелкая пыль медленнее
const speedFor = (size: number) => 0.12 + (size / (TIER_M[5] * MAXR)) * 0.42;
// псевдо-гаусс (сумма uniform) для разброса вокруг кластеров
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5);

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

    // ── uniforms ──
    let mesh: THREE.InstancedMesh | null = null;
    const material = new THREE.MeshMatcapMaterial({ matcap, color: 0x0b0b0b, transparent: true });
    const uni = {
      uTime: { value: 0 }, uEnter: { value: reduce ? 1 : 0 }, uBreath: { value: reduce ? 0 : 1 },
      uScroll: { value: 0 }, uMouse: { value: new THREE.Vector2(9e3, 9e3) },
      uParallax: { value: new THREE.Vector2(0, 0) }, uRepel: { value: 0.015 }, uRepelR: { value: 0.45 },
      uLightR: { value: 0.7 }, uLightStr: { value: 0.55 },
      uFadeY0: { value: -3 }, uFadeY1: { value: -5 },
    };
    material.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uni);
      sh.vertexShader = `
        attribute vec3 aHome; attribute vec3 aDrift; attribute vec3 aEject; attribute float aPhase; attribute float aFlow; attribute float aSpeed;
        uniform float uTime, uEnter, uBreath, uScroll, uRepel, uRepelR, uFadeY0, uFadeY1; uniform vec2 uMouse, uParallax;
        varying float vFade; varying vec2 vWorld;
      ` + sh.vertexShader;
      sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
        vec3 _drift = aDrift * sin(uTime * aSpeed + aPhase) * (aFlow * uBreath);
        vec3 _far = aHome + aEject * 3.2;
        float _sc = smoothstep(0.08, 0.72, uScroll);
        vec3 _base = mix(_far, aHome, uEnter) + _drift + aEject * (_sc * 2.4);
        // параллакс по глубине: ближние (больше Z) смещаются сильнее
        _base.xy += uParallax * (0.35 + _base.z * 0.9);
        // очень слабое отталкивание от курсора (форма не гуляет)
        vec2 _md = _base.xy - uMouse; float _d = length(_md);
        _base.xy += normalize(_md + vec2(1e-4)) * (smoothstep(uRepelR, 0.0, _d) * uRepel);
        vWorld = _base.xy;
      `);
      sh.vertexShader = sh.vertexShader.replace("#include <project_vertex>", `
        vec4 mvPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif
        mvPosition.xyz += _base;
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;
        vec2 _ndc = gl_Position.xy / gl_Position.w;
        float _fx = smoothstep(1.04, 0.72, abs(_ndc.x));         // мягкие боковые края
        float _fyb = smoothstep(uFadeY1, uFadeY0, _base.y);      // низ канваса → в ноль (мировая Y)
        float _leave = 1.0 - smoothstep(0.16, 0.9, uScroll);     // растворение при уходе героя
        vFade = _fx * _fyb * _leave;
      `);
      sh.fragmentShader = `
        varying float vFade; varying vec2 vWorld; uniform vec2 uMouse; uniform float uLightR, uLightStr;
      ` + sh.fragmentShader;
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        float _ld = distance(vWorld, uMouse);
        float _lift = smoothstep(uLightR, 0.0, _ld) * uLightStr;  // курсор «протирает лак»
        gl_FragColor.rgb += (vec3(1.0) - gl_FragColor.rgb) * _lift;
        gl_FragColor.a *= vFade;`
      );
    };

    // порядок слоёв: важное первым (word → точки → концы → пыль → ambient),
    // адаптив урезает mesh.count с ХВОСТА — сначала гаснет ambient, буквы целы.
    let N = 0, keepMin = 0;
    const outward = (x: number, y: number) => { const dx = x - CX, dy = y - CY, l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l] as const; };

    const lite = new URLSearchParams(location.search).has("lite");
    const build = () => {
      if (mesh) { group.remove(mesh); mesh.dispose(); }
      const dm = (coarse ? 0.5 : 1) * (lite ? 0.14 : 1);
      const R = (n: number) => Math.max(1, Math.round(n * dm));
      const nMain = R(10000), nDot = R(200), nEject = R(600), nDust = R(4200), nField = R(3800);
      N = nMain + nDot * 2 + nEject + nDust + nField;
      keepMin = nMain + nDot * 2; // минимум, ниже которого буквы теряются
      const home = new Float32Array(N * 3), drift = new Float32Array(N * 3), eject = new Float32Array(N * 3);
      const phase = new Float32Array(N), flow = new Float32Array(N), scl = new Float32Array(N), spd = new Float32Array(N);
      let i = 0;
      const put = (x: number, y: number, z: number, size: number, ejx: number, ejy: number, ejz: number, fl: number, sp: number) => {
        home[i * 3] = x - CX; home[i * 3 + 1] = y - CY; home[i * 3 + 2] = z;
        drift[i * 3] = Math.sin(y * 3.1 + x * 1.7); drift[i * 3 + 1] = Math.cos(x * 2.9 - y * 1.3); drift[i * 3 + 2] = Math.sin(x * 2.0 + y * 2.3);
        eject[i * 3] = ejx; eject[i * 3 + 1] = ejy; eject[i * 3 + 2] = ejz;
        phase[i] = Math.random() * 6.283; flow[i] = fl; scl[i] = size; spd[i] = sp; i++;
      };
      const sampleSeg = () => {
        let r = Math.random() * totalLen; let s = WORD[0];
        for (const seg of WORD) { if (r <= seg.len) { s = seg; break; } r -= seg.len; }
        return segPoint(s, Math.random());
      };
      const tips: number[][] = [];
      for (const s of WORD) { if (s.k === "L") { tips.push([s.ax, s.ay], [s.bx, s.by]); } }

      // 1) основной — по поверхности трубки, 8-ступенчатый калибр
      for (let k = 0; k < nMain; k++) {
        const p = sampleSeg(), th = Math.random() * 6.283, rr = 0.065;
        const x = p.px - p.ty * rr * Math.cos(th), y = p.py + p.tx * rr * Math.cos(th), z = rr * Math.sin(th);
        const [ox, oy] = outward(p.px, p.py);
        put(x, y, z, tierSize(), ox * (0.2 + Math.random() * 0.5), oy * (0.2 + Math.random() * 0.5), (Math.random() - 0.5) * 0.6, 0.010, 0.5);
      }
      // 2) точки в контрформах Λ (часть начертания)
      for (const [dxc, dyc] of DOTS) {
        for (let k = 0; k < nDot; k++) {
          const u = Math.random(), rr = 0.10 * Math.cbrt(u), th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
          const x = dxc + rr * Math.sin(ph) * Math.cos(th), y = dyc + rr * Math.sin(ph) * Math.sin(th), z = rr * Math.cos(ph);
          put(x, y, z, 0.0014 + (0.009 - 0.0014) * (1 - rr / 0.10), (x - dxc) * 2, (y - dyc) * 2, z * 2, 0.006, 0.45);
        }
      }
      // 3) выбросы из концов штрихов (связь с буквами)
      for (let k = 0; k < nEject; k++) {
        const tp = tips[(Math.random() * tips.length) | 0]; const [ox, oy] = outward(tp[0], tp[1]);
        const dist = Math.pow(Math.random(), 1.6) * 0.75, jx = ox + (Math.random() - 0.5) * 0.4, jy = oy + (Math.random() - 0.5) * 0.4;
        const l = Math.hypot(jx, jy) || 1;
        const x = tp[0] + (jx / l) * dist, y = tp[1] + (jy / l) * dist, z = (Math.random() - 0.5) * 0.2;
        put(x, y, z, 0.008 - (0.008 - 0.001) * (dist / 0.75), (jx / l) * (0.8 + Math.random()), (jy / l) * (0.8 + Math.random()), (Math.random() - 0.5) * 1.2, 0.024, 0.55);
      }
      // 4) пыль, обнимающая буквы (плотность максимальна у надписи)
      for (let k = 0; k < nDust; k++) {
        const p = sampleSeg(), th = Math.random() * 6.283, rr = 0.065 + (Math.random() - 0.5) * 0.03;
        const x = p.px - p.ty * rr * Math.cos(th), y = p.py + p.tx * rr * Math.cos(th), z = rr * Math.sin(th) + (Math.random() - 0.5) * 0.032;
        const [ox, oy] = outward(p.px, p.py);
        const s = 0.0013 + (0.007 - 0.0013) * Math.random();
        put(x, y, z, s, ox * (0.3 + Math.random() * 0.6), oy * (0.3 + Math.random() * 0.6), (Math.random() - 0.5) * 0.8, 0.016, speedFor(s));
      }
      // 5) КОМПОЗИЦИОННОЕ ПОЛЕ — кластеры по φ-зонам, асимметрия слева-снизу,
      //    гауссов разброс, 14% одиночек, пустоты между скоплениями.
      // зоны концентрации: центры по φ (0.382/0.618 от краёв кадра), вес задаёт
      // асимметрию (гуще слева-снизу, редеет вправо-вверх); spread мал → скопления
      // компактные, между ними пустоты. Дальше от букв — реже.
      const ZONES = [
        [-1.55, -0.80, 1.00, 0.52], // доминанта: слева-снизу
        [-0.80, -0.54, 0.62, 0.44], // φ низ-лево
        [-2.20, 0.00, 0.46, 0.46],  // левый фланг
        [-0.10, -0.78, 0.40, 0.40], // под серединой слова
        [0.90, -0.52, 0.24, 0.44],  // φ низ-право (легче)
        [0.40, 0.36, 0.14, 0.46],   // φ верх (редко)
        [1.90, 0.55, 0.07, 0.48],   // верх-право (почти пусто)
      ];
      const CEN: number[][] = []; // [x, y, weight, spread]
      for (const [zx, zy, zw, zs] of ZONES) {
        const subs = 1 + Math.round(zw * 2);
        for (let s = 0; s < subs; s++) {
          CEN.push([zx + (Math.random() - 0.5) * zs * 1.4, zy + (Math.random() - 0.5) * zs * 1.4, zw * (0.5 + Math.random() * 0.7), zs * (0.6 + Math.random() * 0.6)]);
        }
      }
      for (const tp of tips) CEN.push([tp[0], tp[1], 0.26, 0.16]); // тонкие сгустки у концов штрихов
      let wsum = 0; for (const c of CEN) wsum += c[2];
      for (let k = 0; k < nField; k++) {
        let x: number, y: number;
        if (Math.random() < 0.82) { // в кластерах
          let r = Math.random() * wsum, c = CEN[0];
          for (const cc of CEN) { if (r < cc[2]) { c = cc; break; } r -= cc[2]; }
          x = c[0] + gauss() * c[3]; y = c[1] + gauss() * c[3];
        } else { // одиночки, смещение влево-вниз, разрежённо
          x = -3.1 + Math.pow(Math.random(), 1.6) * 6.0;
          y = -1.5 + Math.pow(Math.random(), 1.5) * 2.6;
        }
        const z = (Math.random() - 0.5) * 0.9;
        const [ox, oy] = outward(x, y);
        // мельче основной пыли — тонкая взвесь, не чёрные массы
        const s = 0.0011 + (0.0052 - 0.0011) * Math.pow(Math.random(), 1.7);
        put(x, y, z, s, ox * Math.random() * 0.5, oy * Math.random() * 0.5, (Math.random() - 0.5) * 1.2, 0.04, speedFor(s));
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
      gm.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(spd, 1));
      mesh.frustumCulled = false;
      group.add(mesh);
    };

    // размеры/камера: слово сохраняет кегль (5.2 world на ширину вьюпорта) и
    // позицию (центр нижней полосы); канвас 150vh — низ гаснет по мировой Y.
    let W = 0, H = 0, wpp = 1, camCY = 0;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      const hero = (el.parentElement || el).getBoundingClientRect();
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(W, H, false);
      const vw = window.innerWidth, vh = window.innerHeight;
      wpp = 5.2 / vw;                       // world-единиц на пиксель вьюпорта
      const halfW = wpp * W / 2, halfH = wpp * H / 2;
      const bandPx = Math.min(0.425 * vw, 0.66 * vh);     // видимая полоса слова
      const yTarget = hero.bottom - bandPx * 0.5;         // центр слова (пиксель вьюпорта)
      camCY = wpp * ((yTarget - rect.top) - H / 2);        // world-Y центра слова = 0
      cam.left = -halfW; cam.right = halfW; cam.top = camCY + halfH; cam.bottom = camCY - halfH;
      cam.updateProjectionMatrix();
      // затухание нижних ~30% высоты канваса (мировая Y)
      uni.uFadeY0.value = camCY - halfH * 0.4;
      uni.uFadeY1.value = camCY - halfH;
    };

    // ── интерактив + цикл ──
    let mnx = 0, mny = 0, parX = 0, parY = 0, mvx = 9e3, mvy = 9e3, tmvx = 9e3, tmvy = 9e3;
    let scrollTarget = 0, scrollCur = 0, running = false, onScreen = false, docVis = true;
    let measured = false, frames = 0, tStart = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1, ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mnx = Math.max(-1, Math.min(1, nx)); mny = Math.max(-1, Math.min(1, ny));
      tmvx = (e.clientX - rect.left - W / 2) * wpp;
      tmvy = camCY + (H / 2 - (e.clientY - rect.top)) * wpp;
    };
    const onLeave = () => { mnx = 0; mny = 0; tmvx = 9e3; tmvy = 9e3; };
    const onScroll = () => { const r = el.getBoundingClientRect(); const h = (el.parentElement || el).clientHeight || 1; scrollTarget = Math.min(1, Math.max(0, (-(r.top) + 0) / h)); };

    const tick = () => {
      uni.uTime.value = performance.now() * 0.001;
      if (!coarse) {
        // параллакс: инерционное смещение слоёв (без вращения группы)
        parX += ((mnx * 0.09) - parX) * 0.06; parY += ((-mny * 0.09) - parY) * 0.06;
        uni.uParallax.value.set(parX, parY);
        mvx += (tmvx - mvx) * 0.12; mvy += (tmvy - mvy) * 0.12;
        uni.uMouse.value.set(mvx, mvy);
      }
      scrollCur += (scrollTarget - scrollCur) * 0.1; uni.uScroll.value = scrollCur;
      renderer.render(scene, cam);
      if (!measured) {
        frames++; if (!tStart) tStart = performance.now();
        const dt = performance.now() - tStart;
        if (dt > 1500) {
          measured = true; const fps = frames / (dt / 1000);
          const thr = coarse ? 40 : 52, tgt = coarse ? 46 : 58;
          if (fps < thr && mesh) { // НЕ пересобираем — только урезаем хвост (ambient)
            const factor = Math.max(0.5, Math.min(1, fps / tgt));
            mesh.count = Math.max(keepMin, Math.floor(N * factor));
          }
        }
      }
    };
    const start = () => { if (running) return; running = true; gsap.ticker.add(tick); };
    const stop = () => { if (!running) return; running = false; gsap.ticker.remove(tick); };
    const sync = () => { const w = onScreen && docVis; if (w) start(); else stop(); };

    // старт
    build(); resize();
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
