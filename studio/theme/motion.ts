/*
  AUREA MOTION-СИСТЕМА (§4). Единый язык движения — «разворот из точки».
  Источник правды для GSAP; зеркалит CSS-переменные в globals.css (--ease-*,
  --dur-*, --stagger). Меняешь тут — синхронизируй CSS (и наоборот).

  ПРАВИЛО МОТИВИРОВАННОСТИ: анимация обязана нести функцию (вести внимание,
  объяснять, усиливать бренд «разворот из точки», давать ощущение уровня).
  «Потому что красиво» — удаляется. Дополняет иерархию интенсивности (§1.3).
*/

/** Кривые «AUREA ease»: старт из точки → ускорение → мягкая посадка (ease-out дом.). */
export const EASE = {
  /** вход / разворот из точки — основная */
  unfold: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** выход / сворачивание в точку */
  fold: [0.5, 0, 0.75, 0] as [number, number, number, number],
  /** перемещение / переход между состояниями */
  move: [0.65, 0, 0.35, 1] as [number, number, number, number],
} as const;

/** Длительности (сек), φ-информированная шкала. */
export const DUR = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.52,
  page: 0.72, // переход между страницами
  preloader: 1.2, // бренд-момент, только главная / 1-й визит
} as const;

/** Ритм каскада (сек между элементами). */
export const STAGGER = { tight: 0.03, base: 0.045, loose: 0.07 } as const;

/** cubic-bezier(...) строка для CSS/инлайна. */
export const cssCubic = (e: readonly number[]) => `cubic-bezier(${e.join(",")})`;

/** SVG-путь кривой для GSAP CustomEase.create(). */
const bezierPath = (e: readonly number[]) => `M0,0 C${e[0]},${e[1]} ${e[2]},${e[3]} 1,1`;

/** true, если пользователь просит меньше движения. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
  Регистрирует «aurea-*» кривые в GSAP как CustomEase (если плагин доступен),
  чтобы в твинах писать ease: "aurea-unfold". Без CustomEase — тихий no-op,
  используйте встроенные (expo.out ≈ unfold) как запас.
*/
export function registerAureaEases(gsap: {
  registerPlugin?: (...p: unknown[]) => void;
}): void {
  if (typeof window === "undefined") return;
  try {
    // динамический импорт, чтобы не тянуть плагин там, где он не нужен
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("gsap/CustomEase") as { CustomEase?: {
      create: (id: string, path: string) => unknown;
    } };
    const CustomEase = mod.CustomEase;
    if (!CustomEase) return;
    gsap.registerPlugin?.(CustomEase);
    CustomEase.create("aurea-unfold", bezierPath(EASE.unfold));
    CustomEase.create("aurea-fold", bezierPath(EASE.fold));
    CustomEase.create("aurea-move", bezierPath(EASE.move));
  } catch {
    /* CustomEase недоступен — используем встроенные ease как запас */
  }
}

/** Запасные встроенные ease GSAP, если CustomEase не зарегистрирован. */
export const GSAP_EASE_FALLBACK = {
  unfold: "expo.out",
  fold: "power2.in",
  move: "power2.inOut",
} as const;
