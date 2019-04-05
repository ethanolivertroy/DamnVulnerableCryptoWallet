FROM node:8.11
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
EXPOSE 3000
ENV GANACHE_HOST=ganache GANACHE_PORT=8545 TRUFFLE_HOST=truffle
CMD ["yarn", "start"]
