const DVCTokenContract = artifacts.require('DVCToken');
const DVCTokenSaleContract = artifacts.require('DVCTokenSale');


async function execute(callback){
  // Get contract instances 
  let DVCToken = await DVCTokenContract.deployed(DVCTokenContract);
  let DVCTokenAddress = await DVCToken.address;
  let DVCTokenSale = await DVCTokenSaleContract.deployed(DVCTokenSaleContract);
  let DVCTokenSaleAddress = await DVCTokenSale.address;

  // GET 
  let account = await web3.eth.accounts[8];
  let balance = await DVCToken.balanceOf(DVCTokenSale.address);
  let tokenPrice = 1000000000000000000;
  let tokensAvailable = 750000;
  let numberOfTokens = 2;
  let paid = tokenPrice * numberOfTokens;
  let totalSupply = await DVCToken.totalSupply();
  let tokenSold = 0; 
  
  // GET initial Balances 
  let DVCTokenSaleBalanceETH1 = web3.fromWei(await web3.eth.getBalance(DVCTokenSaleAddress));
  console.log('The DVCTokenSale balance in ETH is: ' + DVCTokenSaleBalanceETH1);
  let accountBalanceETH1 = web3.fromWei(await web3.eth.getBalance(account));
  console.log('The account balance in ETH is: ' + accountBalanceETH1);
  let DVCTokenBalanceETH1 = web3.fromWei(await web3.eth.getBalance(DVCTokenSaleAddress));
  console.log('The DVCToken balance in ETH is: ' + DVCTokenBalanceETH1);
  let DVCTokenBalance = await DVCToken.balanceOf(DVCToken.address)
  console.log('The DVCToken balance in DVC is: ' + DVCTokenBalance);
  
  try {
    // print stuff
    console.log('token price: ' + tokenPrice);
    console.log('number of tokens to buy ' + numberOfTokens);
    console.log('WEI Paid: ' + paid);
    console.log("Total Supply : " + totalSupply);

    
    console.log("[X] We transfer some tokens from the DVCToken address to the DVCTokenSale contract address")

    let balanceAccount1 = await DVCToken.balanceOf(account);
    console.log("Balance of admin account before transfer: " + balanceAccount1);

    await DVCToken.transfer(DVCTokenSaleAddress, tokensAvailable, {from: account});

    console.log("[X] We get the admin account balance to see if the transfer was successful;")

    balanceAccount1 = await DVCToken.balanceOf(DVCTokenSaleAddress);
    console.log("Balance of admin account after transfer: " + balanceAccount1);

    console.log("[X] We transfer an additional ETH so it allows to withdraw also the gifted tokens")


    let transaction = await web3.eth.sendTransaction({from: web3.eth.accounts[9],to: DVCTokenSaleAddress,value: 99000000000000000000})
    console.log(transaction)
    

  }
  catch (err) {
    console.log(err);
  }

  callback();

}

module.exports = execute

