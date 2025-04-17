# Stage 1: Build
FROM node:20.18.0-alpine AS builder
WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Удаляем ненужные зависимости (devDependencies)
RUN npm prune --production

# Stage 2: Production
FROM node:20.18.0-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma
COPY .env ./

CMD ["npm", "start"]