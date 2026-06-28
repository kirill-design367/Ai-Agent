# AUREA Studio — Design System & Engine

Кинематографический, скролл-управляемый движок для сайтов студии.
Собран по **AUREA Design Bible** и ДНК референсов (isladjan-параллакс,
goodie.work, 3d-portfolio, mojito).

## Стек

- **Next.js + React 19** — SSR/SSG (важно для SEO из оффера).
- **React-Three-Fiber + drei + three** — 3D Hero (макбук/айфон/тоннель).
- **GSAP + ScrollTrigger + SplitText** — скролл-режиссура, mask-reveal текста.
- **Lenis** — инерционный smooth-scroll («дорогой» вес), синхронизирован с ScrollTrigger.
- **Tailwind v4** — утилиты поверх дизайн-токенов.

## Запуск

```bash
cd studio
npm install
npm run dev      # http://localhost:3000
npm run build    # прод-сборка
```

## Структура

```
app/
  globals.css         — ДИЗАЙН-ТОКЕНЫ AUREA (цвет, шкала, тени, радиусы, кривые)
  layout.tsx          — шрифтовая пара с кириллицей (Playfair Display × Manrope)
  page.tsx            — сборка движка + сцены
components/
  kit/                — СТУДИЙНЫЙ КИТ (переиспользуется на всех проектах)
    SmoothScroll.tsx  — Lenis + синк с GSAP
    CustomCursor.tsx  — гало-курсор с инерцией
    MagneticTargets.tsx — магнитные CTA (data-magnetic, ≤14px)
    Reveal.tsx        — IntersectionObserver reveal (CSS-vars)
    SplitReveal.tsx   — GSAP SplitText mask-reveal (техника #1)
    GrainOverlay.tsx  — зерно/шум 5% (inline SVG)
    ScrollProgress.tsx — тонкая полоса прогресса
  three/
    HeroCanvas.tsx    — R3F-канвас, скролл → прогресс 0..1
    DeviceScene.tsx   — ЗАГЛУШКА устройства (заменить на GLB-макбук)
  sections/
    Hero.tsx          — Hero: 3D + смешанная типографика
```

## Токены = Библия

Все значения в `globals.css` — это Глава IV Библии в числах: воздух базы 8px,
type scale с коэффициентом ~1.5, многослойные окрашенные тени по высоте,
expo-кривые (никаких дефолтных ease), один акцент (60-30-10).
**Сменить тему всего сайта** = поменять одну переменную `--accent`.

## Что заменить под реальный проект

- `DeviceScene.tsx` → реальная GLB-модель (`useGLTF("/models/macbook.glb")`).
- Акцент `--accent` → выбранная палитра (бронза / синий / чёрный).
- Шрифты → лицензионные type.today / CSTM, когда будет бюджет.
- Демо-секции в `page.tsx` → сцены Боль…Финал по мере готовности анимаций.

## Карта сцен (Bible Chapter III)

Hero → Боль → Как работаю → Что получаете → Цены → **Портфолио (кульминация)**
→ Сравнение → Отзывы → FAQ → Финал. Порядок зафиксирован драматургией.
