# Stage 1: Build
FROM node:20.18.0-alpine AS builder
WORKDIR /usr/src/app

RUN apk add --no-cache openssl python3 make g++

# 1. Сначала копируем только то, что нужно для установки зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# 2. Устанавливаем зависимости и генерируем Prisma Client
RUN npm ci --include=dev
RUN npx prisma generate

# 3. Копируем остальные файлы и собираем проект
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20.18.0-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache openssl

# Копируем ВСЕ необходимые файлы из builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma
COPY .env ./

# Проверяем наличие сгенерированного клиента Prisma
RUN ls -la node_modules/.prisma/client

CMD ["node", "dist/main.js"]