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

cd "$(dirname "$0")/.."                 # → studio/ (каталог с docker-compose.yml)

ENV_FILE=.env
NEW_IMAGE="${1:-}"
WEB_CONTAINER=aurea-web                  # container_name из docker-compose.yml
HEALTH_TRIES=18                          # 18 × 5s = до 90s на прогрев
HEALTH_GAP=5

touch "$ENV_FILE"

current_image() { grep -E '^IMAGE=' "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2-; }
set_env() {                             # set_env КЛЮЧ ЗНАЧЕНИЕ
  local k="$1" v="$2"
  if grep -qE "^${k}=" "$ENV_FILE"; then
    sed -i "s#^${k}=.*#${k}=${v}#" "$ENV_FILE"
  else
    echo "${k}=${v}" >> "$ENV_FILE"
  fi
}

# Проверяем здоровье САМОГО приложения (Docker healthcheck веб-контейнера: node
# делает GET / на 127.0.0.1:3000 и ждёт < 500). Не через nginx на 80 — иначе в
# HTTPS-режиме там 301-редирект, и это ложно роняло бы каждый деплой в откат.
health() {
  local i status
  for i in $(seq 1 "$HEALTH_TRIES"); do
    status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' \
      "$WEB_CONTAINER" 2>/dev/null || echo missing)
    if [ "$status" = "healthy" ]; then
      echo "  health OK ($status) на попытке $i"
      return 0
    fi
    if [ "$status" = "none" ]; then
      # у образа нет HEALTHCHECK — подстрахуемся прямым запросом внутрь контейнера
      if docker exec "$WEB_CONTAINER" node -e \
        "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<400?0:1)).on('error',()=>process.exit(1))" 2>/dev/null; then
        echo "  health OK (direct) на попытке $i"
        return 0
      fi
    fi
    echo "  health: попытка $i/$HEALTH_TRIES → ${status}, жду ${HEALTH_GAP}s"
    sleep "$HEALTH_GAP"
  done
  return 1
}

PREV_IMAGE="$(current_image || true)"
echo "== текущий (откатный) образ: ${PREV_IMAGE:-<нет>} =="

if [ -n "$NEW_IMAGE" ]; then
  echo "== deploy CI/CD → $NEW_IMAGE =="
  set_env IMAGE "$NEW_IMAGE"
  # тянем все сервисы из GHCR (web + nginx + certbot-зеркала) — docker.io не трогаем
  docker compose pull
  docker compose up -d
else
  echo "== deploy fallback → сборка на сервере (нужен swap) =="
  docker compose up -d --build
fi

echo "== health-check $HEALTH_URL =="
if health; then
  echo "✓ Релиз здоров."
  if [ -n "$NEW_IMAGE" ]; then
    set_env PREV_IMAGE "$NEW_IMAGE"     # запомнить как последний хороший (для ручного отката)
  fi
  docker image prune -f
  exit 0
fi

echo "✗ Health-check ПРОВАЛЕН — выполняю откат."
if [ -n "$NEW_IMAGE" ] && [ -n "$PREV_IMAGE" ] && [ "$PREV_IMAGE" != "$NEW_IMAGE" ]; then
  set_env IMAGE "$PREV_IMAGE"
  docker compose pull web || true
  docker compose up -d
  if health; then
    echo "↩ Откат на $PREV_IMAGE успешен. Провальный образ: $NEW_IMAGE — смотрите логи Actions."
  else
    echo "‼ Откат тоже нездоров — нужна ручная диагностика: docker compose logs -f web nginx"
  fi
else
  echo "‼ Нет предыдущего образа для отката (первый деплой?). Диагностика: docker compose logs -f web nginx"
fi
exit 1
