FROM node:8.11
WORKDIR /usr/src/app
COPY . .
RUN yarn global add truffle@4.1.15
ENV GANACHE_HOST=ganache GANACHE_PORT=8545
EXPOSE 8545
RUN apt install python
EXPOSE 8000
