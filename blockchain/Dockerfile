FROM node:20-alpine
WORKDIR /usr/src/app
RUN npm install -g truffle ganache
COPY . .
ENV GANACHE_HOST=ganache GANACHE_PORT=8545
CMD ["truffle", "migrate"]
