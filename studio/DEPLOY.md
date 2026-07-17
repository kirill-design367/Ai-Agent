# Деплой AUREA — Timeweb Cloud (Node + nginx)

**Сервер (утверждён):** Timeweb Cloud, регион Москва, Ubuntu LTS,
2 vCPU / 4 ГБ RAM / 50 ГБ NVMe, бэкапы включены.

Next.js работает в Node-режиме (`output: standalone`) за nginx: TLS, кэш статики,
единая политика trailing slash (301), gzip. GH Pages — только аварийный fallback
(в конце). Прод-домен для canonical/OG/JSON-LD — в `lib/seo/site.ts` (`SITE.url`).

Артефакты деплоя в репозитории: `Dockerfile`, `docker-compose.yml`,
`deploy/nginx.conf`, этот файл.

---

## ⚠️ Риск OOM при сборке (4 ГБ RAM + three.js)

`next build` с three.js/R3F на 4 ГБ может упасть по памяти. Два пути — выбрать один:

### Путь A (рекомендуется): собрать образ вне сервера, привезти артефакт
Собирается на машине с ≥8 ГБ (локально или в CI), на сервер приезжает готовый образ.

```bash
# на билд-машине:
cd studio && docker build -t aurea-web:latest .
docker save aurea-web:latest | gzip > aurea-web.tgz
scp aurea-web.tgz root@<server>:/opt/aurea/
# на сервере:
docker load < /opt/aurea/aurea-web.tgz
# docker-compose.yml → у сервиса web заменить `build: .` на `image: aurea-web:latest`
docker compose up -d
```
(Либо через приватный registry: `docker push` / `docker pull`.)

### Путь B: собирать на сервере, добавив swap
```bash
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab   # включать при перезагрузке
free -h   # проверить, что swap виден
```
После этого обычный `docker compose up -d --build` проходит. Сборка медленнее,
но памяти хватает. Dockerfile уже поднимает лимит heap Node на билде.

---

## Чеклист деплоя

### Шаг 1 — Сервер
- Создать VPS (параметры выше), зайти по SSH.
- Docker + Compose: `curl -fsSL https://get.docker.com | sh`.
- Открыть порты 80 и 443 (firewall Timeweb / `ufw allow 80,443/tcp`).
- Выбрать путь сборки A или B (см. выше); для B — включить swap.

### Шаг 2 — Домен
- A-записи `aureadesign.ru` и `www.aureadesign.ru` → IP сервера.
- Дождаться распространения DNS: `dig +short aureadesign.ru` = IP сервера.

### Шаг 3 — SSL (Let's Encrypt, один раз)
Порт 80 должен быть свободен (контейнеры ещё не подняты):
```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d aureadesign.ru -d www.aureadesign.ru \
  --agree-tos -m kirill0061@mail.ru --no-eff-email
```
Сертификаты: `/etc/letsencrypt/live/aureadesign.ru/`. Nginx монтирует `/etc/letsencrypt`.

### Шаг 4 — Первый деплой
```bash
git clone <repo> /opt/aurea && cd /opt/aurea/studio
docker compose up -d --build          # путь B; для пути A см. выше
docker compose ps                     # web + nginx, healthcheck healthy
```
Проверка:
```bash
curl -I https://aureadesign.ru/                       # 200
curl -I https://www.aureadesign.ru/                   # 301 → apex
curl -I https://aureadesign.ru/uslugi/landing         # 308 → /uslugi/landing/ (trailing slash)
curl -sS https://aureadesign.ru/keisy/nasledie/ | grep -o '<title>.*</title>'
```

### Шаг 5 — Обновление
```bash
cd /opt/aurea && git pull && cd studio
docker compose up -d --build          # пересборка + бесшовный рестарт (путь B)
docker image prune -f
```
Правка/добавление страницы = правка файла в `content/**` + `git pull` + пересборка.
Кода не требует (README «как добавить страницу»). На билде прогоняются проверки
паритета (`check:parity`) и генерация OG (`gen:og`).

### Шаг 6 — Откат (rollback)
```bash
cd /opt/aurea
git log --oneline -5                  # найти рабочий коммит
git checkout <хороший-хеш>
cd studio && docker compose up -d --build
# вернуться на ветку: git checkout claude/studio-design-system-lh4w78
```
Путь A: держать предыдущий образ (`aurea-web:previous`) и переключить `image:` обратно.
На уровне инфраструктуры — снапшоты/бэкапы Timeweb (включены) как последний рубеж.

---

## Автопродление сертификата
certbot ставит systemd-таймер. Хук перезагрузки nginx в контейнере:
```bash
sudo certbot renew --dry-run
echo 'docker exec aurea-nginx nginx -s reload' | sudo tee \
  /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

## Логи и диагностика
```bash
docker compose logs -f web            # Next
docker compose logs -f nginx          # nginx
docker compose ps                     # статус + healthcheck
```

---

## Проверка после деплоя (обязательно)

### 1. Серверный рендер (без JS) — критично для Яндекса
```bash
for u in / /uslugi/korporativnyi-sait/ /dlya-biznesa/avto-iz-korei/ /keisy/nasledie/; do
  echo "== $u =="; curl -sS "https://aureadesign.ru$u" \
    | grep -oE '<title>[^<]*</title>|application/ld\+json' | head -3
done
```
Каждый URL должен вернуть `<title>`, текст, `<h1>` и блоки `application/ld+json`.

### 2. Core Web Vitals — [PageSpeed Insights](https://pagespeed.web.dev/) (mobile)
Прогреть ISR (открыть URL 1–2 раза), затем прогнать mobile по четырём шаблонам:

| URL | Приёмка (mobile) |
|---|---|
| `/` (главная) | Perf ≥ 85, LCP < 2.5 s, CLS < 0.1 |
| `/uslugi/korporativnyi-sait/` | Perf ≥ 90, SEO ≥ 95, A11y ≥ 95, LCP < 2.5 s, CLS < 0.1 |
| `/dlya-biznesa/avto-iz-korei/` | то же |
| `/keisy/nasledie/` | то же |

Если по живому URL цель не достигнута — резать вес three.js-сцены (полигоны,
текстуры, постпроцессинг), а не отменять её.

### 3. INP — только полевые замеры (§10, п.9)
Лабораторный TBT ≈ 0 принят как прокси, но **INP < 200 ms считается выполненным
только по полевым данным** (CrUX / Яндекс.Метрика Web Vitals) на живом сайте.
Особое внимание — **десктопный кинематографический тир** (тяжёлые GSAP/WebGL):
после накопления поля (2–4 недели) свериться в PageSpeed (раздел «Данные
о реальных пользователях») и в отчёте Метрики; при INP > 200 ms на десктопе —
дефёрить/облегчать анимации героя и переходов.

### 4. Поисковые системы
- **Яндекс.Вебмастер** (webmaster.yandex.ru): добавить и подтвердить
  `aureadesign.ru`, отправить sitemap `https://aureadesign.ru/sitemap.xml`.
- **Google Search Console** (search.google.com/search-console): добавить ресурс
  (домен или URL-префикс), подтвердить, отправить тот же sitemap.
- Проверить `https://aureadesign.ru/robots.txt` (открыт, ссылка на sitemap).
- Валидировать разметку: [validator.schema.org](https://validator.schema.org/)
  по 2–3 URL (Organization/Service/FAQPage/CreativeWork/Article без ошибок).

---

## Аварийный fallback — GitHub Pages (статика)
Если VPS недоступен. Ограничения: без ISR, `next/image` без оптимизации,
редиректы не работают.
```bash
NEXT_OUTPUT=export NEXT_PUBLIC_BASE_PATH=/Ai-Agent npm run build   # → out/
```
Содержимое `out/` — в корень ветки `gh-pages`. Под этот режим не оптимизируем.
