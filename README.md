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
4. Download the [desktop app latest release](https://gitlab.com/badbounty/dvcw/tags/) and launch it
wever, bear in mind that many patterns and practices used are totally custom, deprecated and highly insecure, so you should NEVER use this project's code as a template to build your Ethereum wallet, web API or Electron app.

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
To get a basic understanding on how to interact with the client, please refer to the 'Tutorial.md' file