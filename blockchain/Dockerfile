FROM node:8.11
WORKDIR /usr/src/app
RUN yarn global add truffle
COPY . .
ENV GANACHE_HOST=ganache GANACHE_PORT=8545
CMD ["truffle", "migrate"]
