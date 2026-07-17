/*
  Ключ OG-картинки из внутреннего пути. Один источник и для buildMetadata (ссылка
  на /og/{key}.png), и для генератора scripts/gen-og.mjs (имя файла). Так мета и
  сгенерированный файл не разъедутся.
*/
export function ogKey(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  if (clean === "") return "home";
  return clean.replace(/\//g, "-");
}
