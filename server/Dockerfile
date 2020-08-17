FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV PORT=80
EXPOSE 80
ENV NODE_ENV=production

CMD yarn start
