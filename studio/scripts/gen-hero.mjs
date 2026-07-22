// Генерация адаптивных ассетов hero-надписи из оригинала (3200×1350, RGBA).
// Три ширины × {webp, png}. Прозрачность сохраняется.
import sharp from "sharp";
const SRC = "public/hero/AUREA_FINAL.png";
const widths = [3200, 1920, 960];
for (const w of widths) {
  await sharp(SRC).resize({ width: w }).webp({ quality: 82, alphaQuality: 92, effort: 5 }).toFile(`public/hero/aurea-${w}.webp`);
  await sharp(SRC).resize({ width: w }).png({ compressionLevel: 9, palette: false }).toFile(`public/hero/aurea-${w}.png`);
  console.log("done", w);
}
