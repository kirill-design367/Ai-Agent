/*
  ТИРИНГ ПО СПОСОБНОСТИ УСТРОЙСТВА (главная §1б). Решение принимается ДО монтирования
  тяжёлой three.js-сцены, синхронно, без мигания между вариантами. SSR-безопасно:
  на сервере всегда false (тяжёлое не рендерим на сервере).

  Полная сцена — только «способный» тир:
    desktop/крупный экран, точный указатель, не reduced-motion, не save-data,
    приемлемый effectiveType (4g/неизвестно), достаточно ядер CPU.
  Иначе — статичный постер/CSS-кадр той же сцены (не «урезанный вид»).
*/
type NavClass = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  hardwareConcurrency?: number;
};

export function isHeavyCapable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
    if (window.innerWidth < 1024) return false;

    const nav = navigator as NavClass;
    if (nav.connection?.saveData) return false;
    const et = nav.connection?.effectiveType;
    if (et && !/4g/.test(et)) return false; // 2g/3g/slow-2g → лёгкий тир
    if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) return false;

    return true;
  } catch {
    // если Network Information API недоступен (Safari/Firefox) — не наказываем
    // десктоп: проверок экрана/указателя выше достаточно.
    return window.innerWidth >= 1024 &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }
}
