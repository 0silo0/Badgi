# Этап сборки
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

RUN apk add --no-cache openssl python3 make g++
RUN npm ci
RUN npm install -g @nestjs/cli
RUN npx prisma generate
COPY . .
RUN npm run build

# Финальный образ
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY .env ./

CMD ["node", "dist/main"]