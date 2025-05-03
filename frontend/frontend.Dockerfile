FROM node:20.18.0-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20.18.0-alpine
RUN npm install -g serve
COPY --from=build /usr/src/app/build /usr/src/app/build
CMD ["serve", "-s", "build", "-l", "3000"]