# Деплой AUREA — VPS (Docker) + автодеплой через GitHub Actions

Сайт крутится в Docker на VPS: **Next.js (standalone)** за **nginx** (TLS, кэш
статики, единая политика trailing slash, gzip), сертификат — **Let's Encrypt** с
авто-продлением. Прод-домен для canonical/OG/JSON-LD — в `lib/seo/site.ts`
(`SITE.url`). GitHub Pages остаётся только аварийным fallback (в самом конце).

**Идея:** после первичной настройки владелец **не заходит в терминал**. Правка
контента → `git push` в `main` → GitHub Actions сам собирает образ, публикует его
и выкатывает на сервер с проверкой здоровья и авто-откатом.

Артефакты в репозитории (каталог `studio/`):

| Файл | Роль |
|---|---|
| `Dockerfile` | образ приложения (multi-stage, standalone) |
| `docker-compose.yml` | стек: `web` + `nginx` + `certbot` (авто-SSL) |
| `deploy/nginx.http.conf` | nginx до SSL (проверка по IP + ACME) |
| `deploy/nginx.https.conf` | nginx после SSL (HTTPS, www→apex, редиректы) |
| `scripts/bootstrap.sh` | разовая подготовка чистого сервера |
| `scripts/deploy-remote.sh` | серверный деплой релиза (health-check + откат) |
| `.env.example` | пример `.env` сервера (без секретов) |
| `.github/workflows/deploy.yml` | CI/CD: сборка → GHCR → SSH-деплой |

> **Два пути доставки образа.** Основной — **CI/CD**: образ собирается в Actions
> (не на 4 ГБ сервере — иначе OOM) и лежит в **GHCR** (`ghcr.io`), сервер только
> `pull`. Запасной — **fallback**: если из РФ `ghcr.io` недоступен, сервер сам
> собирает образ (есть swap). Переключение — в разделе **В**.

---

## ⚠️ Безопасность — прочитать первым

- **root-пароль засветился в переписке.** Первый шаг раздела **А** — сменить его
  и перейти на SSH-ключи (bootstrap отключает пароли и root-логин совсем).
- **Никаких паролей, ключей и сертификатов в репозитории.** Всё чувствительное —
  только в **GitHub Secrets** и на сервере. `.gitignore` закрывает `.env*`, `*.pem`,
  `*.key`, `*.crt`, `id_ed25519*`, `id_rsa*`.
- Сайт слушает наружу только **80/443** (через nginx). Порт приложения 3000 —
  внутренний (`expose`, не `ports`).

## ⚠️ Регион сервера — проверить до переключения DNS

Для §2.4 (поведенческие факторы Яндекса) критична низкая задержка из РФ. Сервер
должен быть в России.

```bash
curl -s https://ipinfo.io/104.171.137.47 | grep -E '"country"|"city"|"region"'
# ожидаем "country": "RU" и московский регион
```

Если регион **не RU** — деплой откладываем и переносим сервер, DNS не трогаем.
(Утверждено: Timeweb Cloud **MSK-1**, Москва, `104.171.137.47`.)

---

# А. Первичная настройка (~30 минут, один раз)

Терминал нужен только здесь. Дальше — только `git push`.

### А0. Сменить root-пароль (он скомпрометирован)
Зайдите под root (по паролю, последний раз) и сразу смените его:
```bash
ssh root@104.171.137.47
passwd            # задать новый длинный пароль
```

### А1. Завести ключ деплоя (на своём компьютере)
GitHub Actions будет ходить на сервер этим ключом. Сгенерируйте пару **без пароля**
(нужна для неинтерактивного CI):
```bash
ssh-keygen -t ed25519 -f ~/.ssh/aurea_deploy -N "" -C "aurea-actions"
cat ~/.ssh/aurea_deploy.pub     # ПУБЛИЧНЫЙ — пойдёт на сервер
cat ~/.ssh/aurea_deploy         # ПРИВАТНЫЙ — пойдёт в GitHub Secret SSH_KEY
```

### А2. Подготовить сервер одним скриптом
Скопируйте `bootstrap.sh` на сервер и запустите, передав **публичный** ключ из А1:
```bash
scp studio/scripts/bootstrap.sh root@104.171.137.47:/root/
ssh root@104.171.137.47
sudo DEPLOY_PUBKEY="$(cat <<'KEY'
ssh-ed25519 AAAA...ВЕСЬ_ПУБЛИЧНЫЙ_КЛЮЧ_ИЗ_A1... aurea-actions
KEY
)" bash /root/bootstrap.sh
```
Скрипт идемпотентный (можно перезапускать). Он ставит Docker, swap 4 ГБ, firewall
(22/80/443), fail2ban, создаёт пользователя **`deploy`** с этим ключом, каталог
**`/opt/aurea`**, и **отключает пароли и root-логин по SSH**.

Проверьте, что заходите новым пользователем по ключу (в новом окне, root ещё не рвём):
```bash
ssh -i ~/.ssh/aurea_deploy deploy@104.171.137.47 'docker --version && ls -ld /opt/aurea'
```

### А3. Склонировать репозиторий на сервер
```bash
ssh -i ~/.ssh/aurea_deploy deploy@104.171.137.47
git clone https://github.com/kirill-design367/ai-agent.git /opt/aurea
cd /opt/aurea/studio
cp .env.example .env            # NGINX_CONF уже = http (проверка по IP)
```

### А4. Прописать GitHub Secrets
GitHub → репозиторий → **Settings → Secrets and variables → Actions → New secret**:

| Secret | Значение |
|---|---|
| `SSH_HOST` | `104.171.137.47` |
| `SSH_USER` | `deploy` |
| `SSH_KEY` | приватный ключ целиком (`~/.ssh/aurea_deploy`, из А1) |
| `GHCR_TOKEN` | PAT c правом **`read:packages`** (сервер тянет образ из GHCR) |

`GHCR_TOKEN`: GitHub → **Settings → Developer settings → Personal access tokens →
Tokens (classic)** → создать с областью `read:packages`. Сборку/публикацию в Actions
делает встроенный `GITHUB_TOKEN` — отдельно его заводить не нужно.

> Убедитесь, что пакет `aurea-web` в GHCR доступен серверу: после первого билда
> откройте пакет в GitHub и при необходимости в его настройках дайте доступ
> (или держите приватным — тогда `GHCR_TOKEN` обязателен, он уже прописан).

### А5. Первый деплой
Слейте рабочую ветку в `main` (workflow слушает `main`) — либо запустите вручную:
GitHub → **Actions → Deploy AUREA (VPS) → Run workflow**.

Actions соберёт образ, положит в GHCR и выкатит на сервер. В конце `deploy-remote.sh`
прогоняет health-check (до 90 с) и при провале откатывается сам.

### А6. Проверка ПО IP (DNS ещё на Pages — не трогаем)
```bash
curl -I http://104.171.137.47/                      # 200
curl -sS http://104.171.137.47/ | grep -o '<title>[^<]*</title>'
curl -sS http://104.171.137.47/keisy/nasledie/ | grep -o '<title>[^<]*</title>'
```
Открылось, отдаёт `<title>` и контент → идём переключать домен.

### А7. Переключить DNS на сервер
У регистратора домена `aureadesign.ru` (TTL уже понижен до 1 ч):
- **удалить** 4 A-записи Pages (`@ → 185.199.108–111.153`) и `CNAME www`;
- **создать**: `A @ → 104.171.137.47` и `A www → 104.171.137.47`.

Дождаться распространения:
```bash
dig +short aureadesign.ru        # = 104.171.137.47
dig +short www.aureadesign.ru    # = 104.171.137.47
```

### А8. Выпустить SSL и включить HTTPS
Когда DNS указывает на сервер (порт 80 отвечает через nginx с ACME):
```bash
ssh -i ~/.ssh/aurea_deploy deploy@104.171.137.47
cd /opt/aurea/studio
# разовый выпуск сертификата (webroot; nginx уже отдаёт /.well-known/)
docker compose run --rm --entrypoint "certbot certonly \
  --webroot -w /var/www/certbot \
  -d aureadesign.ru -d www.aureadesign.ru \
  --agree-tos -m kirill0061@mail.ru --no-eff-email" certbot
# переключить nginx на HTTPS-конфиг и перезапустить
sed -i 's#^NGINX_CONF=.*#NGINX_CONF=./deploy/nginx.https.conf#' .env
docker compose up -d
```
Проверка:
```bash
curl -I https://aureadesign.ru/                     # 200
curl -I https://www.aureadesign.ru/                 # 301 → apex
curl -I http://aureadesign.ru/                      # 301 → https
curl -I https://aureadesign.ru/uslugi/landing       # 308 → /uslugi/landing/
```
Продление certbot делает сам (контейнер `certbot`, цикл каждые 12 ч; nginx
перечитывает сертификат каждые 6 ч) — вмешательство не требуется.

**Готово.** Дальше — раздел **Б**.

---

# Б. Ежедневно — без терминала

Изменить контент = отредактировать файл в `studio/content/**` (`.mdx`) или в коде,
закоммитить и запушить в `main`:

```
правка → git commit → git push       →  сайт обновился сам
```

Что происходит после `push` в `main`:
1. GitHub Actions собирает Docker-образ (в облаке, не на сервере).
2. Публикует его в GHCR (теги `:<sha>` и `:latest`).
3. По SSH заходит на сервер, `docker compose pull` + `up -d`.
4. Health-check `/` (до 90 с). **200 → готово. Не 200 → авто-откат** на прошлый
   рабочий образ, сайт остаётся жив.

Смотреть ход: GitHub → **Actions**. Зелёная галочка = сайт обновлён.

Добавить страницу (услуга/ниша/кейс/статья) — это тоже правка контента: новый
`.mdx` в нужной папке `content/**` + `push`. На билде прогоняются проверки
паритета (`check:parity`) и генерация OG (`gen:og`); при расхождении билд падает
в Actions, до сервера ничего не доедет.

---

# В. Аварийные ситуации

### В1. Откатиться на прошлую версию
Авто-откат уже срабатывает при неудачном health-check. Ручной откат:
```bash
ssh -i ~/.ssh/aurea_deploy deploy@104.171.137.47
cd /opt/aurea/studio
cat .env | grep -E 'IMAGE|PREV_IMAGE'          # PREV_IMAGE — последний рабочий
sed -i "s#^IMAGE=.*#IMAGE=$(grep '^PREV_IMAGE=' .env | cut -d= -f2-)#" .env
docker compose pull web && docker compose up -d
```
Либо укажите любой прошлый тег из GHCR (история — в разделе Packages репозитория):
```bash
bash scripts/deploy-remote.sh ghcr.io/kirill-design367/aurea-web:<нужный-sha>
```

### В2. Actions не достучался до сервера (ghcr.io недоступен из РФ / SSH лёг)
Переключиться на **fallback — сборку на сервере** (нужен swap, он поднят bootstrap'ом):
```bash
ssh -i ~/.ssh/aurea_deploy deploy@104.171.137.47
cd /opt/aurea && git pull && cd studio
sed -i 's#^IMAGE=.*#IMAGE=#' .env              # очистить IMAGE → соберётся aurea-web:local
bash scripts/deploy-remote.sh                  # без аргумента = локальная сборка + health-check
```
Вернуться на CI/CD-путь: просто снова запушить в `main` (или Run workflow) —
`deploy-remote.sh` с образом из GHCR перезапишет `IMAGE` в `.env`.

### В3. Логи и статус
```bash
cd /opt/aurea/studio
docker compose ps                 # web + nginx + certbot, healthcheck
docker compose logs -f web        # приложение (Next)
docker compose logs -f nginx      # nginx / TLS
docker compose logs certbot       # продление сертификата
```

### В4. Перезапуск / место на диске
```bash
docker compose restart            # мягкий рестарт
docker compose up -d --force-recreate
docker system df && docker image prune -f   # почистить старые образы
free -h                           # проверить swap, если тяжёлый билд (fallback)
```

### В5. Сертификат: ручная проверка/продление
```bash
docker compose run --rm --entrypoint "certbot renew --dry-run" certbot
docker exec aurea-nginx nginx -s reload      # перечитать после продления
```

---

## Проверка после деплоя (обязательно, на живом HTTPS)

### 1. Серверный рендер без JS — критично для Яндекса
```bash
for u in / /uslugi/korporativnyi-sait/ /dlya-biznesa/avto-iz-korei/ /keisy/nasledie/; do
  echo "== $u =="; curl -sS "https://aureadesign.ru$u" \
    | grep -oE '<title>[^<]*</title>|application/ld\+json' | head -3
done
```
Каждый URL → `<title>`, текст, `<h1>`, блоки `application/ld+json`.

### 2. Core Web Vitals — [PageSpeed Insights](https://pagespeed.web.dev/) (mobile)
Прогреть URL (открыть 1–2 раза), затем mobile по четырём шаблонам:

| URL | Приёмка (mobile) |
|---|---|
| `/` (главная) | Perf ≥ 85, LCP < 2.5 s, CLS < 0.1 |
| `/uslugi/korporativnyi-sait/` | Perf ≥ 90, SEO ≥ 95, A11y ≥ 95, LCP < 2.5 s, CLS < 0.1 |
| `/dlya-biznesa/avto-iz-korei/` | то же |
| `/keisy/nasledie/` | то же |

Не дотягивает по живому URL → резать вес three.js-сцены (полигоны, текстуры,
постпроцессинг), а не отменять её.

### 3. INP — только полевые замеры (§10, п.9)
Лабораторный TBT ≈ 0 принят как прокси, но **INP < 200 ms засчитывается только по
полю** (CrUX / Яндекс.Метрика Web Vitals). Особое внимание — десктопный
кинематографический тир (тяжёлые GSAP/WebGL): через 2–4 недели поля свериться в
PageSpeed и в Метрике; при INP > 200 ms на десктопе — дефёрить/облегчать анимации.

### 4. Поисковые системы
- **Яндекс.Вебмастер** (webmaster.yandex.ru): подтвердить `aureadesign.ru`,
  отправить `https://aureadesign.ru/sitemap.xml`. Регион по §2.4 **не задаём**.
- **Google Search Console**: добавить ресурс, подтвердить, тот же sitemap.
- `https://aureadesign.ru/robots.txt` — открыт, ссылается на sitemap.
- [validator.schema.org](https://validator.schema.org/) по 2–3 URL
  (Organization/Service/FAQPage/CreativeWork/Article без ошибок).

---

## Аварийный fallback — GitHub Pages (статика)
Если VPS недоступен целиком. Ограничения: без ISR, `next/image` без оптимизации,
серверные редиректы не работают.
```bash
NEXT_OUTPUT=export NEXT_PUBLIC_BASE_PATH=/Ai-Agent npm run build   # → out/
```
Содержимое `out/` — в корень ветки `gh-pages`. Под этот режим не оптимизируем.
