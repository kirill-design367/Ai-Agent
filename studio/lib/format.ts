// Форматирование цены живёт в едином источнике цен (правило проекта №2).
// Реэкспорт — чтобы существующие импорты `@/lib/format` продолжали работать.
export { formatPrice } from "@/content/pricing";

/** ISO YYYY-MM-DD → «16 июля 2026». */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}
