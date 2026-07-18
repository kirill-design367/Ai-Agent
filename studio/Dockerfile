# AUREA — production image (Next.js standalone, Node-режим за nginx).
# Мультистейдж: deps → build → минимальный runtime.
# База — node:22-slim (Debian/glibc): sharp и satori работают из коробки
# (на билде — генерация OG; в рантайме — оптимизация next/image). На alpine/musl
# sharp капризнее, поэтому берём slim.

# ── deps: установка зависимостей (кэш, пока не меняется lock) ──
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── build: сборка standalone-выхода (+ prebuild: паритет, генерация OG) ──
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# поднимаем heap Node на билде (three.js/R3F тяжёлые; помогает на 4 ГБ RAM)
ENV NODE_OPTIONS=--max-old-space-size=3072
RUN npm run build

# ── runtime: только то, что нужно серверу standalone ──
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# непривилегированный пользователь (Debian)
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m -s /usr/sbin/nologin nextjs

# standalone тянет минимальный набор node_modules внутрь себя.
# --chown: файлы принадлежат nextjs, иначе /app/.next оказывается root-owned и
# процесс под nextjs не может писать рантайм-кэш next/image / ISR (EACCES).
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Рантайм-кэш next/image (optimized images) и ISR пишутся в /app/.next/cache.
# Создаём каталог заранее и отдаём владельца nextjs — тогда (а) нет EACCES на
# mkdir, (б) смонтированный named volume наследует владельца nextjs при первом
# монтировании (Docker копирует права из образа в свежий volume).
RUN mkdir -p /app/.next/cache/images && chown -R nextjs:nodejs /app/.next

USER nextjs
EXPOSE 3000
# server.js генерируется output:standalone
CMD ["node", "server.js"]
