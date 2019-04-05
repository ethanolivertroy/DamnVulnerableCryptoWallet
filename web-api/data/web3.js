const Web3 = require('web3')
const config = require('config')
let web3
const http = require('http')

function _getContractInstance(position, contractAddress) {
  return new web3.eth.Contract(config.contracts[position].abi, contractAddress)
}

function _getContractAddresses() {
  let url = ''
  if(process.env.TRUFFLE_HOST) {
    url = `http://${process.env.TRUFFLE_HOST}:8000/contractAddress.txt`
  }
  else{
    url = `http://localhost:8000/contractAddress.txt`
  }
  console.log("url web3 " + url)
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      res.setEncoding('utf8');
      let body = ''; 
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body.toString('utf8').split(',')));
    }).on('error', reject);
  }
)}

async function suscribeTokenEvents(){
  let addresses =  await _getContractAddresses()
  let tokenInstance = await _getContractInstance(0, addresses[0])
  tokenInstance.events.Withdraw({}, (error, data) => {
    if(error){
        console.log("Error: " + error)
    }
    else {
        console.log("Withdraw Data: " + JSON.stringify(data))
    };
  })  
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
}

async function suscribeTokenSaleEvents(){
  let addresses =  await _getContractAddresses()
  let tokenSaleInstance = await _getContractInstance(1, addresses[1])
  tokenSaleInstance.events.Buy({}, (error, data) => {
    if(error){
        console.log("Error: " + error)
    }
    else {
        console.log("Buy Data: " + JSON.stringify(data))
    };
  });
  tokenSaleInstance.events.Sell({}, (error, data) => {
    if(error){
        console.log("Error: " + error)
    }
    else {
        console.log("Sell Data: " + JSON.stringify(data))
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
    const eventProvider = new Web3.providers.WebsocketProvider(ganacheServer)
    web3.setProvider(eventProvider)
    suscribeTokenEvents()
    suscribeTokenSaleEvents()
  }
  return web3
}

module.exports = getWeb3
