# DVCW
Damn Vulnerable Crypto Wallet is an extremely insecure Ethereum cryptowallet written in JavaScript.
It has three main modules:
1. **Desktop app**: built with Electron and Vue
2. **Web API**: built with NodeJS using Express, SQLite and Web3
3. **Local Ethereum blockchain**: built using Truffle and Ganache

## Setup (Updated for v2.0)
> Note: The following steps **are the preferred way** of running the whole application. For those who would rather build the project from the sources, there's a README in each module's folder with detailed explanations for each case.

1. Install Docker and [Docker Compose](https://docs.docker.com/compose/install/)
2. Clone this repository
3. In the root folder, run `make install` to deploy all backend services
4. Download the [desktop app latest release](https://gitlab.com/badbounty/dvcw/tags/) and launch it

### Other useful commands
#### Stop & resume backend
- Stop: `make stop`
- Resume: `make resume`

#### Fresh restart
- Run `make reset`

> Bear in mind that every time you do a fresh restart, you will have to re-scan the two-factor authentication QR code provided by the app so as to re-syncronize the OTP.

## What Changed in v2.0
- ✅ Node.js upgraded from 8.x to 20.x LTS
- ✅ Electron upgraded from 1.6.7 to 30.x
- ✅ Solidity upgraded from 0.4.21 to 0.8.19
- ✅ Truffle upgraded to 5.x
- ✅ ganache-cli replaced with ganache 7.x
- ✅ Web3.js upgraded from 1.0.0-beta.34 to 4.16.0
- ✅ Vue upgraded from 2.5.13 to 3.4.21
- ✅ All 16 educational vulnerabilities preserved and verified
- ✅ Docker images updated to node:20-alpine

## Features
- Wallet creation
- Wallet recovery using mnemonic
- Send Ethereum transactions to other addresses
- Attach a message to any transaction
- Two-factor authentication
- Profile management
- Interact with smart contracts: Lottery & Donations

## List of Vulnerabilities (All Preserved in v2.0)
Vulnerabilities can be found in the Electron application, the web API or in the Ethereum smart contracts deployed to the local blockchain.

### Smart Contract Vulnerabilities
1. **Bad randomness** (Lottery.sol:26) - Uses `block.timestamp` and `blockhash` for random number generation
2. **Reentrancy** (Donations.sol:28) - State update after external call
3. **Integer underflow** (Donations.sol:27) - Underflow vulnerability in `unchecked` block
4. **Private seed readable** (Lottery.sol:12) - Storage slot 1 contains the seed
5. **tx.origin authorization** (Donations.sol:53) - Uses `tx.origin` instead of `msg.sender`

### Web API Vulnerabilities
6. **SQL injection** (web-api/data/index.js:94) - User input directly in SQL query
7. **Server-side JS injection** (web-api/route/wallets.route.js:53) - Uses `eval()` on user input
8. **Path traversal** (web-api/controllers/config.ctrl.js:14) - Reads files via `../..`
9. **CORS misconfiguration** (web-api/server.js:20) - Allows all origins
10. **RC4 weak encryption** (web-api/controllers/wallets.ctrl.js:172) - Deprecated RC4 cipher
11. **MD5 hashing** (web-api/controllers/wallets.ctrl.js:21) - MD5 for wallet ID

### Desktop App Vulnerabilities
12. **2FA bypass** (desktop-app/main.js:278) - Localdata.json contains secret
13. **Open debug port** (desktop-app/main.js:15) - Debug port 9334 exposed
14. **Protocol handler** (CVE-2018-1000118) (desktop-app/main.js:12, utils.js:78) - `dvcw://` protocol
15. **XSS to RCE** (desktop-app/render/index.render.js) - Stored XSS in transaction messages
16. **No session management** (API design) - No authentication tokens or sessions

## Vulnerability Verification
After starting the app, run `node verify-vulns.js` to automatically verify vulnerabilities that can be tested programmatically.

## Disclaimer
We tried to keep the implementation of all Ethereum-related stuff as close as possible to a real cryptowallet. However, bear in mind that many patterns and practices used are totally custom, deprecated and highly insecure, so you should NEVER use this project's code as a template to build your Ethereum wallet, web API or Electron app.
