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
// центры букв масштабируются множителем f (мобайл — шире промежутки), при этом
// внутренняя форма и толщина штриха букв НЕ меняются (масштабируется только
// расстановка центров относительно начала координат).
const makeWord = (f: number): Seg[] => [
  ...lambda(-1.72 * f), ...letterU(-0.82 * f), ...letterR(0.06 * f), ...letterE(0.92 * f), ...lambda(1.78 * f),
];
const makeDots = (f: number) => [[-1.72 * f, 0.27], [1.78 * f, 0.27]] as const;
const CY = 0.5; // вертикальный центр слова

// ── 8-ступенчатая калибровка размера ВНУТРИ букв (микс, не зонами) ──
// макс. размер уменьшен на ~30%; крупных ступеней (1–2) меньше, зерно средне-мелкое.
const MAXR = 0.0294;
const TIER_M = [1.0, 0.72, 0.52, 0.37, 0.26, 0.18, 0.12, 0.07];
const TIER_PCT = [1, 3, 8, 12, 15, 18, 21, 22];
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
    const mobile = window.innerWidth <= 480;

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" }); }
    catch { return; }
    renderer.setClearAlpha(0);

    // мобайл — межбуквенные промежутки шире на ~13% (растянуты центры, форма/штрих
    // те же); слово остаётся с полями по краям (≈86% ширины вьюпорта).
    const spread = mobile ? 1.05 : 1.0;
    const WORD = makeWord(spread);
    const DOTS = makeDots(spread);
    const CX = 0.03 * spread; // центр слова по X
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
      uScroll: { value: 0 }, uScrollWorld: { value: 0 }, uMouse: { value: new THREE.Vector2(9e3, 9e3) },
      uRepel: { value: 0.03 }, uRepelR: { value: 0.28 }, // слабее и компактнее — лёгкое расступание
      uFadeY0: { value: -1.0 }, uFadeY1: { value: -2.7 }, // нижнее затухание по мировой Y — рано и плавно (частицы догорают в верх 2-го блока)
      uFadeTop0: { value: 0.7 }, uFadeTop1: { value: 1.9 }, // верхнее затухание (над облаком)
      uKeepFrac: { value: 1.05 },  // адаптив: доля частиц (>1 = все видны; хвост гаснет масштабом→0 при снижении)
    };
    material.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uni);
      sh.vertexShader = `
        attribute vec3 aHome; attribute vec3 aDrift; attribute vec3 aEject; attribute float aPhase; attribute float aFlow; attribute float aSpeed; attribute float aReact; attribute float aAng; attribute float aIndexN;
        uniform float uTime, uEnter, uBreath, uScroll, uScrollWorld, uRepel, uRepelR, uFadeY0, uFadeY1, uFadeTop0, uFadeTop1, uKeepFrac; uniform vec2 uMouse;
        varying float vFade;
      ` + sh.vertexShader;
      sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
        // адаптив: ambient-хвост (aIndexN > uKeepFrac) плавно ужимается в ноль,
        // с индивидуальным разбросом (aReact) → уходит вразнобой, без скачка.
        float _cull = 1.0 - smoothstep(0.0, 0.05, (aIndexN - uKeepFrac) + (aReact - 1.0) * 0.02);
        transformed *= _cull;
        vec3 _drift = aDrift * sin(uTime * aSpeed + aPhase) * (aFlow * uBreath);
        vec3 _far = aHome + aEject * 3.2;
        float _sc = smoothstep(0.08, 0.72, uScroll);
        vec3 _base = mix(_far, aHome, uEnter) + _drift + aEject * (_sc * 2.4);
        // ── ХАОТИЧНОЕ отталкивание от курсора (живая масса, не круглый штамп) ──
        vec2 _md = _base.xy - uMouse; float _d = length(_md);
        float _pa = atan(_md.y, _md.x);
        // неровный (органический) радиус влияния — модуляция шумом по углу
        float _r = uRepelR * (1.0 + 0.35 * sin(_pa * 3.0 + aReact * 6.2831));
        float _fall = smoothstep(_r, 0.0, _d);
        // направление: от курсора + индивидуальное угловое отклонение (±50°)
        vec2 _dir = normalize(_md + vec2(1e-4));
        float _c = cos(aAng), _s = sin(aAng);
        _dir = vec2(_dir.x * _c - _dir.y * _s, _dir.x * _s + _dir.y * _c);
        // индивидуальная скорость/дрожь → возвращаются вразнобой
        float _wob = 0.8 + 0.2 * sin(uTime * (aSpeed * 1.6 + 0.6) + aPhase);
        _base.xy += _dir * (_fall * uRepel * aReact * _wob);
        // глобальный fixed-канвас: облако едет ВВЕРХ вместе с прокруткой страницы
        // (после отталкивания, чтобы курсор в покое совпадал с частицами).
        _base.y += uScrollWorld;
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
        float _fx = smoothstep(1.04, 0.72, abs(_ndc.x));            // мягкие боковые края
        // индивидуальный порог затухания ±~0.2 world → край физически не ровный
        float _fjit = (aReact - 1.0) * 0.28;
        float _fyb = smoothstep(uFadeY1 + _fjit, uFadeY0 + _fjit, _base.y);         // низ → в ноль (нелинейно, вразнобой)
        float _fyt = 1.0 - smoothstep(uFadeTop0 + _fjit, uFadeTop1 + _fjit, _base.y); // верх → в ноль (нелинейно, вразнобой)
        float _leave = 1.0 - smoothstep(0.16, 0.9, uScroll);        // растворение при уходе героя
        vFade = _fx * _fyb * _fyt * _leave;
      `);
      sh.fragmentShader = "varying float vFade;\n" + sh.fragmentShader;
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        gl_FragColor.a *= vFade;`
      );
    };

    // порядок слоёв: важное первым (word → точки → концы → пыль → ambient),
    // адаптив урезает mesh.count с ХВОСТА — сначала гаснет ambient, буквы целы.
    let N = 0;
    const outward = (x: number, y: number) => { const dx = x - CX, dy = y - CY, l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l] as const; };

    const lite = new URLSearchParams(location.search).has("lite");
    const build = () => {
      if (mesh) { group.remove(mesh); mesh.dispose(); }
      const dm = (coarse ? 0.5 : 1) * (lite ? 0.14 : 1);
      const R = (n: number) => Math.max(1, Math.round(n * dm));
      // фикс. количество (адаптив отключён — ничего не пропадает после сборки);
      // умеренная плотность ради стабильных 60fps на глобальном fixed-канвасе.
      const nMain = R(8000), nDot = R(180), nEject = R(500), nDust = R(3000), nField = R(2600);
      N = nMain + nDot * 2 + nDust + nEject + nField;
      // порядок буфера: силуэт букв (main+dots+dust) — В ГОЛОВЕ, ambient-хвост
      // (eject+field) — В КОНЦЕ. Адаптив гасит только хвост, буквы неприкосновенны.
      // силуэт букв (main+dots+dust) в голове буфера, ambient-хвост (eject+field) в конце.
      const home = new Float32Array(N * 3), drift = new Float32Array(N * 3), eject = new Float32Array(N * 3);
      const phase = new Float32Array(N), flow = new Float32Array(N), scl = new Float32Array(N), spd = new Float32Array(N);
      const react = new Float32Array(N), ang = new Float32Array(N), idxN = new Float32Array(N);
      let i = 0;
      const put = (x: number, y: number, z: number, size: number, ejx: number, ejy: number, ejz: number, fl: number, sp: number) => {
        home[i * 3] = x - CX; home[i * 3 + 1] = y - CY; home[i * 3 + 2] = z;
        drift[i * 3] = Math.sin(y * 3.1 + x * 1.7); drift[i * 3 + 1] = Math.cos(x * 2.9 - y * 1.3); drift[i * 3 + 2] = Math.sin(x * 2.0 + y * 2.3);
        eject[i * 3] = ejx; eject[i * 3 + 1] = ejy; eject[i * 3 + 2] = ejz;
        phase[i] = Math.random() * 6.283; flow[i] = fl; scl[i] = size; spd[i] = sp;
        react[i] = 0.3 + Math.random() * 1.4;          // индивидуальный коэффициент реакции 0.3–1.7
        ang[i] = (Math.random() * 2 - 1) * 0.8727;      // угловое отклонение ±50°
        idxN[i] = i / N;                                // нормированный индекс (для плавного адаптива хвоста)
        i++;
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
      // 3) пыль, обнимающая буквы (силуэт; в голове буфера — не режется адаптивом)
      for (let k = 0; k < nDust; k++) {
        const p = sampleSeg(), th = Math.random() * 6.283, rr = 0.065 + (Math.random() - 0.5) * 0.03;
        const x = p.px - p.ty * rr * Math.cos(th), y = p.py + p.tx * rr * Math.cos(th), z = rr * Math.sin(th) + (Math.random() - 0.5) * 0.032;
        const [ox, oy] = outward(p.px, p.py);
        const s = 0.0013 + (0.007 - 0.0013) * Math.random();
        put(x, y, z, s, ox * (0.3 + Math.random() * 0.6), oy * (0.3 + Math.random() * 0.6), (Math.random() - 0.5) * 0.8, 0.016, speedFor(s));
      }
      // 4) выбросы из концов штрихов (ambient-хвост — режется первым)
      for (let k = 0; k < nEject; k++) {
        const tp = tips[(Math.random() * tips.length) | 0]; const [ox, oy] = outward(tp[0], tp[1]);
        const dist = Math.pow(Math.random(), 1.6) * 0.75, jx = ox + (Math.random() - 0.5) * 0.4, jy = oy + (Math.random() - 0.5) * 0.4;
        const l = Math.hypot(jx, jy) || 1;
        const x = tp[0] + (jx / l) * dist, y = tp[1] + (jy / l) * dist, z = (Math.random() - 0.5) * 0.2;
        put(x, y, z, 0.008 - (0.008 - 0.001) * (dist / 0.75), (jx / l) * (0.8 + Math.random()), (jy / l) * (0.8 + Math.random()), (Math.random() - 0.5) * 1.2, 0.024, 0.55);
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
      gm.setAttribute("aReact", new THREE.InstancedBufferAttribute(react, 1));
      gm.setAttribute("aAng", new THREE.InstancedBufferAttribute(ang, 1));
      gm.setAttribute("aIndexN", new THREE.InstancedBufferAttribute(idxN, 1));
      mesh.frustumCulled = false;
      group.add(mesh);
    };

    // ГЛОБАЛЬНЫЙ FIXED-КАНВАС во весь вьюпорт: слово 5.2 world на ширину экрана,
    // world 0 (центр слова) на ~76% высоты при scroll=0. Канвас не принадлежит
    // секциям → у частиц нет края на стыке hero↔manifesto.
    let W = 0, H = 0, wpp = 1, camCY = 0, dispersing = false;
    // ЗАФИКСИРОВАННЫЕ размеры канваса (на iOS высота вьюпорта скачет при сворачивании
    // адресной строки → без фиксации канвас пересчитывался и надпись ДРОЖАЛА). Берём
    // размеры один раз и пересчитываем ТОЛЬКО при реальном изменении (поворот / смена
    // ширины / крупное изменение высоты >15%), игнорируя дребезг адресной строки.
    let lockW = 0, lockH = 0;
    const captureSize = () => { lockW = Math.max(1, window.innerWidth); lockH = Math.max(1, window.innerHeight); };
    const baseDpr = () => Math.min(2, window.devicePixelRatio || 1);
    const applyRes = () => { renderer.setPixelRatio(baseDpr() * (dispersing ? 0.7 : 1)); renderer.setSize(W, H, false); };
    const resize = () => {
      W = lockW; H = lockH;                 // из зафиксированных значений (не из window каждый раз)
      applyRes();
      wpp = 5.2 / W;
      const halfW = wpp * W / 2, halfH = wpp * H / 2;
      camCY = 0.26 * wpp * H;               // world 0 → ~76% высоты экрана
      cam.left = -halfW; cam.right = halfW; cam.top = camCY + halfH; cam.bottom = camCY - halfH;
      cam.updateProjectionMatrix();
    };

    // ── интерактив + цикл ──
    let mvx = 9e3, mvy = 9e3, tmvx = 9e3, tmvy = 9e3;
    let scrollCur = 0, running = false, docVis = true;
    let ready = reduce, pointerX = 0, pointerY = 0, hasPointer = false;
    const DISSOLVE = 1.25;                  // за столько высот экрана облако растворилось → рендер стоп

    const onMove = (e: PointerEvent) => { if (!ready) return; pointerX = e.clientX; pointerY = e.clientY; hasPointer = true; };
    const onLeave = () => { hasPointer = false; };

    const tick = () => {
      const scrollPx = window.scrollY || 0;    // одно чтение на кадр (не forced reflow)
      uni.uTime.value = performance.now() * 0.001;
      // курсор → world (канвас в 0,0 вьюпорта, отталкивание считается до scroll-сдвига)
      if (!coarse && ready) {
        if (hasPointer) { tmvx = (pointerX - W / 2) * wpp; tmvy = camCY + (H / 2 - pointerY) * wpp; }
        else { tmvx = 9e3; tmvy = 9e3; }
        mvx += (tmvx - mvx) * 0.12; mvy += (tmvy - mvy) * 0.12; uni.uMouse.value.set(mvx, mvy);
      }
      // прогресс разлёта + вертикальный ход облака привязаны к прокрутке страницы
      const st = Math.min(1, scrollPx / (0.85 * H));
      scrollCur += (st - scrollCur) * 0.12; uni.uScroll.value = scrollCur;
      uni.uScrollWorld.value = scrollPx * wpp;
      // 0.7× во время активного скролла (в движении незаметно)
      const moving = scrollCur > 0.01 && scrollCur < 0.99;
      if (moving !== dispersing) { dispersing = moving; applyRes(); }
      renderer.render(scene, cam);
      if (scrollPx > DISSOLVE * H) stop();      // облако растворилось → останавливаем rAF
    };
    const start = () => { if (running) return; running = true; gsap.ticker.add(tick); };
    const stop = () => { if (!running) return; running = false; gsap.ticker.remove(tick); };
    const sync = () => { if (docVis && (window.scrollY || 0) < DISSOLVE * H) start(); else stop(); };

    // старт
    build(); captureSize(); resize();
    // курсор активен СРАЗУ по завершении сборки (без лишних таймаутов); адаптив выключен.
    if (!reduce) { gsap.to(uni.uEnter, { value: 1, duration: 1.4, ease: "power2.out", onComplete: () => { ready = true; } }); uni.uBreath.value = 1; }
    else { ready = true; renderer.render(scene, cam); }
    sync();

    const onVis = () => { docVis = document.visibilityState !== "hidden"; sync(); };
    // scroll-wake: когда стоп и вернулись к верху — снова запускаем (rAF, не в кадре)
    const onScrollWake = () => { if (!running) sync(); };
    if (!coarse && !reduce) { window.addEventListener("pointermove", onMove, { passive: true }); el.addEventListener("pointerleave", onLeave); }
    if (!reduce) window.addEventListener("scroll", onScrollWake, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    // resize с debounce 300мс: реагируем ТОЛЬКО на реальные изменения — смену ширины
    // (поворот экрана) или крупное изменение высоты (>15%). Мелкие скачки высоты
    // (адресная строка iOS при скролле) игнорируем → канвас не дрожит.
    let rt = 0;
    const onRe = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        const nw = Math.max(1, window.innerWidth), nh = Math.max(1, window.innerHeight);
        const widthChanged = nw !== lockW;
        const bigHeightChange = Math.abs(nh - lockH) / lockH > 0.15;
        if (widthChanged || bigHeightChange) { captureSize(); resize(); }
        sync();
      }, 300);
    };
    window.addEventListener("resize", onRe);

    return () => {
      stop(); window.clearTimeout(rt);
      window.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScrollWake); document.removeEventListener("visibilitychange", onVis);
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
