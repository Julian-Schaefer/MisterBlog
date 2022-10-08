FROM node:16

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install --ignore-scripts

ENV PATH="./node_modules/.bin:$PATH"

COPY . ./
RUN ng build --configuration production && ng run Mister-Blog:server

EXPOSE 4000
CMD [ "node", "./dist/Mister-Blog/server/main.js" ]