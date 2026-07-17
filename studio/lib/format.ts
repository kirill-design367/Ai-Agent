/** «30000» → «30 000 ₽» (неразрывные пробелы для тысяч). */
export function formatPrice(n: number): string {
  return `${n.toLocaleString("ru-RU").replace(/\s/g, " ")} ₽`;
}

/** ISO YYYY-MM-DD → «16 июля 2026». */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}
