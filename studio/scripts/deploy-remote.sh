#!/usr/bin/env bash
# AUREA — серверный деплой одного релиза. Вызывается GitHub Actions по SSH
# (путь CI/CD) либо руками на сервере (fallback). Идемпотентный,
# с health-check и АВТО-ОТКАТОМ на предыдущий рабочий образ.
#
#   CI/CD:    bash scripts/deploy-remote.sh ghcr.io/<owner>/aurea-web:<sha>
#   Fallback: bash scripts/deploy-remote.sh          # без аргумента → сборка на сервере
#
# Запускать из каталога studio/ (рядом с docker-compose.yml) или любым путём —
# скрипт сам перейдёт в каталог с compose-файлом.
set -euo pipefail

cd "$(dirname "$0")/.."                   # → studio/ (каталог с docker-compose.yml)
SELF="$(basename "$0")"

# ── Безопасные дефолты для ВСЕХ настроек (:= не падает под set -u на пустом
#    окружении). Любую можно переопределить через окружение: HEALTH_TRIES=30 bash … ──
: "${ENV_FILE:=.env}"
: "${ENV_EXAMPLE:=.env.example}"
: "${WEB_CONTAINER:=aurea-web}"          # container_name из docker-compose.yml
: "${HEALTH_TRIES:=18}"                  # 18 × 5s = до 90s на прогрев
: "${HEALTH_GAP:=5}"
: "${HEALTH_URL:=http://127.0.0.1/}"     # только для лога; сам чек — по healthcheck контейнера
NEW_IMAGE="${1:-}"

# ── Отличаем «ошибку самого скрипта» от «сайт не отвечает». Любой неожиданный
#    сбой команды перехватывает ERR-trap и НЕ запускает откат (контейнеры уже
#    могли поднятья и работать — бессмысленно их трогать из-за бага в скрипте). ──
on_err() {
  local ec=$?
  echo "‼ Внутренняя ошибка скрипта $SELF (строка ${BASH_LINENO[0]:-?}, код $ec)."
  echo "  Это сбой САМОГО скрипта, а не проверки здоровья сайта — авто-откат НЕ выполняю,"
  echo "  контейнеры не трогаю. Разберите ошибку выше и перезапустите деплой."
  exit "$ec"
}
trap on_err ERR

touch "$ENV_FILE"

# ── Сверка .env с .env.example: дописываем недостающие НЕзакомментированные ключи
#    их дефолтами. Так добавление новой переменной в репо не роняет старый .env. ──
sync_env_from_example() {
  [ -f "$ENV_EXAMPLE" ] || return 0
  local line key added=0
  while IFS= read -r line; do
    case "$line" in ''|\#*) continue ;; esac      # пусто/коммент — пропускаем
    key="${line%%=*}"
    [ "$key" = "$line" ] && continue              # не вида KEY=value
    if ! grep -qE "^${key}=" "$ENV_FILE"; then
      echo "  .env: нет '${key}' — дописываю дефолт из ${ENV_EXAMPLE}: ${line}"
      echo "$line" >> "$ENV_FILE"
      added=1
    fi
  done < "$ENV_EXAMPLE"
  if [ "$added" = 0 ]; then
    echo "  .env актуален — все ключи из ${ENV_EXAMPLE} на месте."
  fi
  return 0                                # всегда 0 — иначе set -e прибил бы скрипт
}

current_image() { grep -E '^IMAGE=' "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2-; }
set_env() {                               # set_env КЛЮЧ ЗНАЧЕНИЕ
  local k="$1" v="$2"
  if grep -qE "^${k}=" "$ENV_FILE"; then
    sed -i "s#^${k}=.*#${k}=${v}#" "$ENV_FILE"
  else
    echo "${k}=${v}" >> "$ENV_FILE"
  fi
}

# Здоровье САМОГО приложения (Docker healthcheck веб-контейнера: node делает GET /
# на 127.0.0.1:3000 и ждёт < 500). Не через nginx на 80 — иначе в HTTPS-режиме там
# 301-редирект, и это ложно роняло бы каждый деплой в откат. Возврат 1 = «не ожил».
health() {
  local i status
  for i in $(seq 1 "$HEALTH_TRIES"); do
    status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' \
      "$WEB_CONTAINER" 2>/dev/null || echo missing)
    if [ "$status" = "healthy" ]; then
      echo "  health OK ($status) на попытке $i"; return 0
    fi
    if [ "$status" = "none" ]; then
      # у образа нет HEALTHCHECK — подстрахуемся прямым запросом внутрь контейнера
      if docker exec "$WEB_CONTAINER" node -e \
        "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<400?0:1)).on('error',()=>process.exit(1))" 2>/dev/null; then
        echo "  health OK (direct) на попытке $i"; return 0
      fi
    fi
    echo "  health: попытка $i/$HEALTH_TRIES → ${status}, жду ${HEALTH_GAP}s"
    sleep "$HEALTH_GAP"
  done
  return 1
}

echo "== сверяю .env с ${ENV_EXAMPLE} =="
sync_env_from_example

PREV_IMAGE="$(current_image || true)"
echo "== текущий (откатный) образ: ${PREV_IMAGE:-<нет>} =="

if [ -n "$NEW_IMAGE" ]; then
  echo "== deploy CI/CD → $NEW_IMAGE =="
  set_env IMAGE "$NEW_IMAGE"
  docker compose pull                     # все сервисы из GHCR — docker.io не трогаем
  docker compose up -d
else
  echo "== deploy fallback → сборка на сервере (нужен swap) =="
  docker compose up -d --build
fi

echo "== health-check (контейнер ${WEB_CONTAINER}; наружный ориентир ${HEALTH_URL}) =="
if health; then
  echo "✓ Релиз здоров."
  [ -n "$NEW_IMAGE" ] && set_env PREV_IMAGE "$NEW_IMAGE"   # запомнить как последний хороший
  docker image prune -f
  exit 0
fi

# Сюда попадаем ТОЛЬКО когда health() честно вернул 1 (сайт не ожил). Ошибки самого
# скрипта перехвачены trap on_err ВЫШЕ и до этой ветки не доходят. Дальше правим
# сами — снимаем ERR-trap, чтобы штатные сбои отката (|| true) не сбивали логику.
trap - ERR
echo "✗ Health-check ПРОВАЛЕН: сайт не ответил за $((HEALTH_TRIES * HEALTH_GAP))s."
echo "──────── ЛОГИ ПЕРЕД ОТКАТОМ (видны в GitHub Actions) ────────"
echo "### docker compose ps"; docker compose ps || true
echo "### web (последние 50 строк)"; docker compose logs --tail=50 web 2>&1 || true
echo "### nginx (последние 30 строк)"; docker compose logs --tail=30 nginx 2>&1 || true
echo "─────────────────────────────────────────────────────────────"
echo "Выполняю откат."
if [ -n "$NEW_IMAGE" ] && [ -n "$PREV_IMAGE" ] && [ "$PREV_IMAGE" != "$NEW_IMAGE" ]; then
  set_env IMAGE "$PREV_IMAGE"
  docker compose pull web || true
  docker compose up -d || true
  if health; then
    echo "↩ Откат на $PREV_IMAGE успешен. Провальный образ: $NEW_IMAGE — смотрите логи Actions."
  else
    echo "‼ Откат тоже нездоров — нужна ручная диагностика: docker compose logs -f web nginx"
  fi
else
  echo "‼ Нет предыдущего образа для отката (первый деплой?). Диагностика: docker compose logs -f web nginx"
fi
exit 1
