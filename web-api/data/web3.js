const Web3 = require('web3')
const config = require('config')
const fs = require('fs')
let web3


function _getContractInstance(position, contractAddress) {
  return new web3.eth.Contract(config.contracts[position].abi, contractAddress)
}

async function _getContractAddresses() {
  try {
      let addresses = await fs.readFileSync('../blockchain/contractAddress.txt')
      addresses = addresses.toString('utf8').split(',')
      return addresses
  }
  catch(err){
      console.log(err)
  }
}

async function suscribeTokenEvents(){
  let addresses =  await _getContractAddresses()
  let tokenInstance = await _getContractInstance(0, addresses[0])
  tokenInstance.events.Transfer({}, (error, data) => {
    if(error){
        console.log("Error: " + error)
    }
    else {
        console.log("Transfer Data: " + JSON.stringify(data))
    };
  });
  tokenInstance.events.Approval({}, (error, data) => {
    if(error){
        console.log("Error: " + error)
    }
    else {
        console.log("Data: " + JSON.stringify(data))
    };
  })
  tokenInstance.events.Withdraw({}, (error, data) => {
    if(error){
        console.log("Error: " + error)
    }
    else {
        console.log("Withdraw Data: " + JSON.stringify(data))
    };
  })
}

async function suscribeTokenSaleEvents(){
  let addresses =  await _getContractAddresses()
  let tokenSaleInstance = await _getContractInstance(1, addresses[1])
  tokenSaleInstance.events.Sell({}, (error, data) => {
    if(error){
        console.log("Error: " + error)
    }
    else {
        console.log("Sell Data: " + JSON.stringify(data))
    };
  });
  tokenSaleInstance.events.ThirdParty({}, (error, data) => {
    if(error){
        console.log("Error: " + error)
    }
    else {
        console.log("ThirdParty Data: " + JSON.stringify(data))
    };
  });

}

function getWeb3 () {
  if (!web3) {
    let ganacheServer = config.ganacheServer
    if(process.env.GANACHE_HOST && process.env.GANACHE_PORT) {
      ganacheServer = `ws://${process.env.GANACHE_HOST}:${process.env.GANACHE_PORT}`
    }
     
    web3 = new Web3(ganacheServer)
    const eventProvider = new Web3.providers.WebsocketProvider('ws://localhost:7545')
    web3.setProvider(eventProvider)
    let tokenSuscription = suscribeTokenEvents()
    let tokenSaleSuscription = suscribeTokenSaleEvents()
  }
  return web3
}

module.exports = getWeb3