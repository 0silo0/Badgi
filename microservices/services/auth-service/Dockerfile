# services/auth-service/Dockerfile (и аналогично для mail-service)
FROM node:22.12-alpine AS builder

WORKDIR /usr/src/app

# Устанавливаем Prisma движки
ENV PRISMA_ENGINES_MIRROR=https://prisma-builds.s3-eu-west-1.amazonaws.com

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3002

CMD ["node", "dist/main"]