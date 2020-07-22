FROM node:latest

WORKDIR /usr/src/app
VOLUME /usr/src/app
# COPY package*.json ./

ENV NODE_ENV production

RUN yarn
RUN npm install -g nodemon
RUN yarn add mysql

EXPOSE 3000

CMD ["yarn", "start:dev"]
