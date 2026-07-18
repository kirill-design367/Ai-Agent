# AUREA — IMAGE-BRIEF (генерация в Nano Banana Pro)

> Изображения генерирует владелец. От студии — точное ТЗ, выведенное из
> арт-дирекшена. **Визуальный язык — ОДНА серия:** материя проявляется из тьмы
> тёплым светом; свет тёплый (bone/off-white), не жёлтый; форма рождается из
> минимума; всё узнаётся как один источник света и одна рука.
>
> **Запрещено везде:** сток, AI-глянец, люди в офисе/портреты, золото/gold в кадре,
> радужные градиенты, логотипы брендов, текст в кадре. Фон — глубокий тёплый
> near-black (#0a0a0b…#141210). Настроение: тихо, дорого, точно.
>
> Общий негатив-промпт (добавлять к каждому): `--no text, watermark, logo, people,
> faces, hands, gold, yellow, saturated colors, rainbow, stock photo, 3d render
> glossy, plastic, lens flare kitsch`.
> Технически: экспорт **AVIF + WebP** (fallback), sRGB. Именование: `public/img/<slug>.avif`
> (+ `.webp`). Плейсхолдер до генерации — фирменная тёмная карточка (уже в коде).

---

## Приоритеты
- **P1 — витрина (кейсы):** обложки 6 кейсов + 1 «геройский» кадр на кейс.
- **P2 — глубина главной и ниш:** фон-свет героя главной; 3 материальных акцента ниш.
- **P3 — опционально:** акценты услуг.

---

## P1 · Обложки кейсов — 6 шт.
Роль: превью работы в индексе (главная «Кейсы», хабы, `related`) и обложка страницы
кейса. Соотношение **16:10** (φ-близкое к странице). Размеры: 1x **720×450**,
2x **1440×900**. Формат AVIF+WebP. Бюджет: ≤ 90 КБ (1x), ≤ 200 КБ (2x).
Слот в коде: `content/cases/<slug>.mdx` поле `cover: /img/case-<slug>.avif`
(рендерится в `HubGrid .pg-hub-cover` и на странице кейса, `next/image`, lazy;
на LCP кейса — `priority`).

Каждый кадр — абстрактная материя, отражающая суть работы, не скриншот сайта:

1. **nasledie** (генеалогия, металл ChromaLuxe, арт-объекты):
   `A single warm point of light emerging from deep near-black, unfolding into fine
   engraved metallic lines that form an abstract family-tree lattice; brushed dark
   metal surface catching one soft warm highlight along its edges; extreme minimalism,
   vast negative space, cinematic low-key lighting, matte, editorial.`
2. **volume-after-dark** (клуб/ночь, «After Dark»):
   `Warm light bleeding from darkness into a smooth volumetric form, like a horizon of
   light in a black void; subtle grain, deep shadow, one warm rim-light defining a
   soft geometric edge; quiet, expensive, abstract, no objects.`
3. **aristide** (тёмный фотопортфолио):
   `An abstract dark gallery space rendered as pure light and shadow — a warm shaft of
   light falling across a matte charcoal plane, revealing faint texture; museum
   stillness, negative space, low-key, no people, no frames.`
4. **anna-rykovskaya** (сайт-визитка, спокойствие):
   `A minimal warm-lit fold of matte paper-like material emerging from black, one clean
   curve catching soft off-white light; calm, refined, tactile, lots of empty space.`
5. **dream-doll** (свой бренд, нежность+тьма):
   `A delicate translucent form lit from within by a warm point of light, surfacing out
   of deep darkness; soft caustics, matte finish, restrained, abstract, elegant.`
6. **step-into-web3** (технологичность, сеть):
   `Fine luminous warm lines assembling from a single point into an abstract network
   lattice over near-black; precise, engineered, cold structure warmed by one light
   source; minimal, no glow kitsch.`

## P1 · Геройский кадр кейса — по 1 на кейс (та же серия)
Роль: иммерсивный широкий кадр в начале/середине страницы кейса. Соотношение
**21:9**. Размеры: 1x **1600×686**, 2x **2400×1029**. Бюджет ≤ 160/320 КБ.
Слот: `content/cases/<slug>.mdx` поле `gallery: [/img/case-<slug>-hero.avif, …]`
(рендерится галереей кейса; первый — `priority` если это LCP).
Промпт: тот же мир, что обложка соответствующего кейса, но шире и «просторнее» —
больше тьмы, один тёплый источник, форма разворачивается слева направо.

## P2 · Фон-свет героя главной — 1 шт.
Роль: едва заметная глубина под заголовком-манифестом (не конкурирует с текстом).
Соотношение **16:9**, full-bleed. Размеры: 1x **1920×1080**, 2x **2880×1620**.
Бюджет ≤ 120/260 КБ. Слот: добавить `next/image` с `priority` в `.hero-m`
(за `.hero-m-inner`, `object-fit:cover`, `opacity ~0.5`, поверх — затемнение).
Промпт: `Near-black warm void with a single soft warm point of light off-center,
its glow barely unfolding into faint volumetric haze; 90% darkness, no forms, no
objects, extremely subtle, cinematic, grain; must not compete with foreground text.`

## P2 · Материальные акценты ниш — 3 шт.
Роль: один тактильный кадр-материал на нишу (в hero или между секциями).
Соотношение **3:2**. Размеры: 1x **1080×720**, 2x **2160×1440**. Бюджет ≤ 110/240 КБ.
Слот: `content/niches/<slug>.mdx` — добавить поле `accentImage` + рендер в hero
(next/image, lazy). Промпты:
- **mebel-na-zakaz:** `Macro of matte wood grain and a fine metal hinge edge emerging
  from darkness, one warm raking light revealing texture; craftsmanship, quiet luxury.`
- **avto-iz-korei:** `Macro of a dark brushed-metal surface with a single warm light
  streak along a precise machined edge; engineered, premium, no car, abstract.`
- **salon-krasoty:** `Soft warm light falling on a smooth matte stone-and-linen
  surface emerging from black; serene, clean, tactile, no people, abstract spa mood.`

## P3 · Акценты услуг (опционально)
Только если захотим усилить страницы услуг. Соотношение **3:2**, те же правила.
По одному абстрактному «свет-из-тьмы» кадру, ассоциирующемуся с типом сайта.

---

## Что уже готово в коде (слоты)
- `HubGrid .pg-hub-cover` + карточка кейса — рендерят `cover` (next/image-совместимо,
  lazy, hover-zoom); плейсхолдер — тёмная карточка.
- OG-картинки (25 шт.) генерируются на билде (`scripts/gen-og.mjs`) — отдельно от этого брифа.
- **Нужно добавить в код при поступлении картинок:** фон-слот в `.hero-m` (P2),
  поле `accentImage` в нишах (P2). Обложки/галереи кейсов — слоты уже есть (поля
  `cover`/`gallery` в MDX).
