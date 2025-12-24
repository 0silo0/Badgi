# gateway/Dockerfile
FROM node:22.12-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4132

CMD ["npm", "run", "start:prod"]