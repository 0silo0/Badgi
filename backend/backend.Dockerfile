FROM node:20
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential openssl

COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
CMD ["npm", "start"]