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

## Дизайн-система редизайна (2026)

Арт-дирекшен и система — в `docs/`: `ART-DIRECTION.md` (концепция «От точки до
шедевра» + фирменная идея «Разворот из точки»), `INTENSITY-MAP.md`,
`TYPOGRAPHY.md`, `REFERENCES.md`.

### Типо-шкала — √φ (в `globals.css`)
База 16px, ратио **√φ = 1.272**. Хитрость: шаг `n` и `n+2` различаются ровно на
**φ (1.618)** — контраст кеглей математический, не «на глаз». Переменные `--fs-micro`
(Martian-лейбл) … `--fs-9` (hero-манифест 139px); дисплейные ступени `--fs-3…9`
fluid (`clamp`), контраст микро↔дисплей держится и на 390px. Трекинг/LH — токены
`--tr-*`, `--lh-*`. Отступы — `--sp-1…8` + `--sp-section` (большие паузы, §1.3).
Композиция по φ: `--phi-major/-minor` (деление вместо 50/50). Полные правила —
`docs/TYPOGRAPHY.md`.

### Motion-система (`theme/motion.ts` + токены `--ease-*`/`--dur-*`)
Один язык — «разворот из точки». Свои кривые **«AUREA ease»**: `unfold`
(вход, ease-out доминирует), `fold` (сворачивание в точку), `move` (переход).
Никаких дефолтных `ease-in-out`. Длительности `DUR` (φ-шкала), ритм `STAGGER`.
GSAP: `registerAureaEases(gsap)` → `ease: "aurea-unfold"`. reduce-motion: та же
вёрстка, длительности → к нулю. **Правило мотивированности:** анимация без функции
удаляется. `--accent` управляет **температурой света** (не заливкой; золото убрано).

## Что заменить под реальный проект

- `DeviceScene.tsx` → реальная GLB-модель (`useGLTF("/models/macbook.glb")`).
- Акцент `--accent` → выбранная палитра (бронза / синий / чёрный).
- Шрифты → лицензионные type.today / CSTM, когда будет бюджет.
- Демо-секции в `page.tsx` → сцены Боль…Финал по мере готовности анимаций.

## Карта сцен (Bible Chapter III)

Hero → Боль → Как работаю → Что получаете → Цены → **Портфолио (кульминация)**
→ Сравнение → Отзывы → FAQ → Финал. Порядок зафиксирован драматургией.
