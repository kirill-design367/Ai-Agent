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
    // Явные сигналы пользователя — единственные жёсткие opt-out'ы.
    // reduce-motion уважаем как доступность; saveData — как осознанный выбор.
    // (Богатую вёрстку под reduce-motion с приглушённым движением даёт сам
    //  кинематограф — «упрощать в Lite» его задача не входит.)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const nav = navigator as NavClass;
    if (nav.connection?.saveData) return false;

    // «Это десктоп с мышью» — большой экран + точный указатель + hover.
    // Дальше НЕ судим десктоп по сетевым/CPU-эвристикам: effectiveType/ядра —
    // предохранитель для слабых МОБИЛЬНЫХ, а на десктопе он бил мимо (Chrome на
    // первой тяжёлой загрузке с РФ-VPS часто оценивает связь как 3g → терял
    // кинематограф на способной машине). Тяжёлое грузится lazy, прелоадер
    // перекрывает подмену — задержка сети не повод отдавать статичный Lite.
    return (
      window.innerWidth >= 1024 &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  } catch {
    return (
      window.innerWidth >= 1024 &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  }
}
