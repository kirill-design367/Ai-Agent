# AUREA Studio

Кинематографические, премиальные сайты на чистом коде — движок студии и сайт-портфолио.

Главный проект репозитория. Приложение — в [`studio/`](./studio).

## Стек

Next.js · React · React-Three-Fiber · GSAP (ScrollTrigger/SplitText) · Lenis · Tailwind · TypeScript.

```bash
cd studio
npm install
npm run dev      # http://localhost:3000
npm run build    # статический экспорт в out/
```

## Структура репозитория

```
studio/              — приложение (движок + сцены сайта)
.claude/skills/      — установленные скилы Claude Code (см. ниже)
docs/aurea-bible/    — AUREA Design Bible (памятка вкуса, не скил)
.github/workflows/   — деплой на GitHub Pages
```

## Установленные скилы

Набор скилов Claude Code для премиального фронтенда, 3D и моушна
(в `.claude/skills/`):

- **frontend-design**, **premium-ui**, **ui-ux-pro-max**, **ui-styling**, **design-system**, **design**, **brand**, **banner-design**, **slides** — дизайн и UI.
- **gsap-scrolltrigger** — скролл-режиссура (примеры, easings, паттерны).
- **threejs-** ×10 — fundamentals, geometry, materials, lighting, shaders, textures, loaders, animation, interaction, postprocessing.
- **motion-design**, **motion-art-direction**, **motion-background**, **animation-principles**, **color-motion**, **logo-animation**, **shot-composition**, **after-effects**, **beat-sync-editing**, **remotion-video** — моушн-дизайн.
- **nextjs-** ×9 + **vercel-ai-sdk** — Next.js-паттерны.

## AUREA Bible

`docs/aurea-bible/` — внутренний стандарт вкуса студии (философия, моушн,
драматургия, UI-система, библиотека техник, правила). Используется как
ориентир, а конкретные техники реализуются через установленные скилы.
