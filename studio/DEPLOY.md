# Деплой AUREA на VPS (Node + nginx)

Целевая площадка — российский VPS (Timeweb Cloud или аналог). Next.js работает
в Node-режиме (`output: standalone`) за nginx: TLS, кэш статики, редиректы.
GH Pages — только аварийный fallback (см. в конце).

## 0. Что нужно

- VPS с Ubuntu 22.04+, 1–2 vCPU, 2 ГБ RAM.
- Docker + Docker Compose (`curl -fsSL https://get.docker.com | sh`).
- Домен `aureadesign.ru` с A-записью на IP сервера (и `www` — тоже A на тот же IP).

## 1. Код на сервер

```bash
git clone <repo> aurea && cd aurea/studio
```

Прод-домен для canonical/OG/JSON-LD задаётся в `lib/seo/site.ts` (`SITE.url`).

## 2. SSL-сертификат (Let's Encrypt, один раз)

nginx в compose монтирует `/etc/letsencrypt`. Сначала выпускаем сертификат
хостовым certbot'ом (порт 80 должен быть свободен — контейнеры ещё не подняты):

```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d aureadesign.ru -d www.aureadesign.ru \
  --agree-tos -m kirill0061@mail.ru --no-eff-email
```

Сертификаты лягут в `/etc/letsencrypt/live/aureadesign.ru/`.

## 3. Запуск

```bash
docker compose up -d --build
```

- `web` — Next.js на :3000 (наружу не смотрит).
- `nginx` — :80/:443, проксирует на `web`, отдаёт статику с кэшем, гонит
  http→https и www→apex.

Проверка:

```bash
curl -I https://aureadesign.ru/                 # 200
curl -I https://www.aureadesign.ru/             # 301 → apex
curl -sS https://aureadesign.ru/uslugi/landing/ | grep -o '<title>.*</title>'  # мета в HTML
```

## 4. Обновление сайта

```bash
cd aurea && git pull && cd studio
docker compose up -d --build          # пересборка образа + бесшовный рестарт
docker image prune -f                 # подчистить старые слои
```

Добавление/правка страницы = правка файла в `content/**` + `git pull` +
пересборка. Кода это не требует (см. README «как добавить страницу»).

## 5. Автопродление сертификата

certbot ставит systemd-таймер. После продления перечитать конфиг nginx:

```bash
sudo certbot renew --dry-run          # проверка
# hook перезагрузки nginx в контейнере:
echo 'docker exec aurea-nginx nginx -s reload' | sudo tee \
  /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

## 6. Логи и диагностика

```bash
docker compose logs -f web            # логи Next
docker compose logs -f nginx          # логи nginx
docker compose ps                     # статус + healthcheck
```

## 7. Проверка Core Web Vitals после деплоя

Локальные цифры Lighthouse на dev-VM — гипотеза; приёмка — по живому URL через
[PageSpeed Insights](https://pagespeed.web.dev/) (mobile), после прогрева ISR-кэша
(открыть каждый URL 1–2 раза перед замером).

**Прогнать (mobile):**

| URL | Что это |
|---|---|
| `https://aureadesign.ru/` | главная (тир сцены зависит от устройства) |
| `https://aureadesign.ru/uslugi/korporativnyi-sait/` | шаблон услуги |
| `https://aureadesign.ru/dlya-biznesa/avto-iz-korei/` | шаблон ниши |
| `https://aureadesign.ru/keisy/nasledie/` | шаблон кейса |

**Приёмка (mobile):**

- Услуга / ниша / кейс: **Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 95,
  LCP < 2.5 s, CLS < 0.1, INP < 200 ms.**
- Главная: **Performance ≥ 85, LCP < 2.5 s, CLS < 0.1** (тяжёлый тир сцены — только
  на способном desktop; mobile получает лёгкий тир).
- Проверить, что `curl -s <URL>` (без JS) возвращает `<title>`, `<h1>`, текст и
  блоки `application/ld+json` — критично для Яндекса.

Если по живому URL цель не достигнута — резать вес three.js-сцены (полигоны,
текстуры, постпроцессинг), а не отменять её.

---

## Аварийный fallback — GitHub Pages (статика)

Если VPS недоступен, сайт можно собрать в статику. Ограничения: без ISR,
`next/image` без оптимизации, редиректы не работают.

```bash
NEXT_OUTPUT=export NEXT_PUBLIC_BASE_PATH=/Ai-Agent npm run build   # → out/
```

Содержимое `out/` кладётся в корень ветки `gh-pages`. Под этот режим сайт
специально не оптимизируется — это только escape-hatch.
