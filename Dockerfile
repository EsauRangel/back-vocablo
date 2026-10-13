# syntax=docker/dockerfile:1

# ---------- Etapa 1: dependencias + build ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN yarn build

# ---------- Etapa 2: dependencias de producción ----------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# ---------- Etapa 3: imagen final ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    DB_FILE=/app/data/db.json

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 3000
VOLUME ["/app/data"]

CMD ["node", "dist/main"]
