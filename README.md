# DVCW
Damn Vulnerable Crypto Wallet is an extremely insecure Ethereum cryptowallet written in JavaScript.
It has three main modules:
1. **Desktop app**: built with Electron and Vue
2. **Web API**: built with NodeJS using Express, SQLite and Web3
3. **Local Ethereum blockchain**: built using Truffle and Ganache-cli with deployed smart contracts written in Solidity

## Setup
> Note: The following steps **are the preferred way** of running the whole application. For those who would rather build the project from the sources, there's a README in each module's folder with detailed explanations for each case.

1. Install Docker and [Docker Compose](https://docs.docker.com/compose/install/)
2. Clone this repository
3. In the root folder, run `make install` to deploy all backend services
4. Wait for the "Started DVCW API on localhost:3000" message to appear on the console. 
5. Download the [desktop app latest release](https://gitlab.com/badbounty/dvcw/tags/) and launch it
wever, bear in mind that many patterns and practices used are totally custom, deprecated and highly insecure, so you should NEVER use this project's code as a template to build your Ethereum wallet, web API or Electron app.

## How to use the application

The first time the application is launched, it will present to you your mnemonic and will prompt to you to set up a password for your wallet. 

On the upper left side, you can find your ETH balance and on the right side, the balance of the wallet on DVCTokens and three different icons. 

Before operating we need to enter the "Settings" menu and set up your OTP. To achieve this, you only need to scan the QR code with the Microsoft or Google Authenticator mobile application. Optionally, you can set up your personal information such as email account and name.

Now, you are ready to start operating but first, you need a little bit of background information.
This vulnerable application sets up a test Ethereum node with ganache-cli , which gives you 10 accounts that you can use to make transactions. By default, the application sets up **(0)** as the account that the client uses. 
Below, you can find a detailed list of the available accounts that you can send money to :

Available Accounts

| (0) | 0x627306090abab3a6e1400e9345bc60c78a8bef57 (~100 ETH)
| (1) | 0xf17f52151ebef6c7334fad080c5704d77216b732 (~100 ETH)
| (2) | 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef (~100 ETH)
| (3) | 0x821aea9a577a9b44299b9c15c88cf3087f3b5544 (~100 ETH)
| (4) | 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2 (~100 ETH)
| (5) | 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e (~100 ETH)
| (6) | 0x2191ef87e392377ec08e7c08eb105ef5448eced5 (~100 ETH)
| (7) | 0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5 (~100 ETH)
| (8) | 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc (~100 ETH)
| (9) | 0x5aeda56215b167893e80b4fe645ba6d5bab767de (~100 ETH)


The default account you will be using is **(0) 0x627306090abab3a6e1400e9345bc60c78a8bef57**
The account (8) 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc is the owner of the DVCToken.sol contract
The account (9) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e is the owner of the DVCTokenSale.sol contract (see migrations/2_deploy_contracts.js)


Once you enter one of the available accounts on the "To" field, complete the "Amount" and "Message" fields with your desired input and press "Send". This will prompt an OTP window and, once you complete the OTP confirmation and press "Submit", this will generate the transaction.

To buy and sell DVCTokens, you need to press on the "Buy & Sell Tokens" button. This will prompt a window where you can observe the Smart contracts source code and also perform the operations. The process is similar to the transactions workflow, just fill the fields and press the corresponding button, which will prompt an OTP window and after this confirmation, it will generate the transaction.



### Other useful commands
#### Stop & resume backend
- Stop: `make stop`
- Resume: `make resume`

#### Fresh restart
- Run `make reset`

> Bear in mind that every time you do a fresh restart, you will have to re-scan the two-factor authentication QR code provided by the app so as to re-syncronize the OTP.

## Features
- Wallet creation
- Wallet recovery using mnemonic
- Send Ethereum transactions to other addresses
- Attach a message to any transaction
- Two-factor authentication
- Profile management
- Interact with smart contracts: DVCToken & DVCTokenSale 

## List of Vulnerabilities
Vulnerabilities can be found in the Electron application, the web API or in the Ethereum smart contracts deployed to the local blockchain.
These include:
1. Insecure storage (weak ciphers and hashing algorithms, no integrity checking mechanisms)
2. Stored XSS to RCE
3. Outdated Electron version
4. Two-factor authentication bypass
5. Debug port open vulnerable to DNS rebinding
6. Protocol handler vulnerability (CVE-2018-1000118)
7. Log files in packaged app
8. SQL injection
9. Wallet takeover
10. Server-side JavaScript injection
11. Path traversal
12. CORS misconfiguration
13. No session management
14. Smart contracts vulnerabilities:
     - Arithmetic misuse (Overflows and Underfows)
     - Inadequate access controls
     - Reentrancy
     - Bad randomness

## Disclaimer
We tried to keep the implementation of all Ethereum-related stuff as close as possible to a real cryptowallet. However, bear in mind that many patterns and practices used are totally custom, deprecated and highly insecure, so you should NEVER use this project's code as a template to build your Ethereum wallet, web API or Electron app.

## Tutorial
To get a basic understanding on how to interact with the client, please refer to the [Tutorial](Tutorial.md) file