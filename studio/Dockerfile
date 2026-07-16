# AUREA — production image (Next.js standalone, Node-режим за nginx).
# Мультистейдж: deps → build → минимальный runtime (~120–180 МБ).

# ── deps: только установка зависимостей (кэшируется, пока не меняется lock) ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── build: сборка standalone-выхода ────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Прод-домен для canonical/OG/JSON-LD берётся из lib/seo/site.ts.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── runtime: только то, что нужно серверу standalone ───────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# непривилегированный пользователь
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# standalone тянет минимальный набор node_modules внутрь себя
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER nextjs
EXPOSE 3000
# server.js генерируется output:standalone
CMD ["node", "server.js"]
