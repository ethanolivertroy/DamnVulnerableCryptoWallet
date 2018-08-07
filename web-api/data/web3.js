const Web3 = require('web3')
const config = require('config')
let web3

function getWeb3 () {
  if (!web3) {
    let ganacheServer = config.ganacheServer
    if(process.env.GANACHE_HOST && process.env.GANACHE_PORT) {
      ganacheServer = `http://${process.env.GANACHE_HOST}:${process.env.GANACHE_PORT}`
    }
    web3 = new Web3(ganacheServer)
  }
  return web3
}

module.exports = getWeb3