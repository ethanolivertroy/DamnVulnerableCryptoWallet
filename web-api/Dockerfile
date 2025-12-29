FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
EXPOSE 3000
ENV GANACHE_HOST=ganache GANACHE_PORT=8545
CMD ["yarn", "start"]
