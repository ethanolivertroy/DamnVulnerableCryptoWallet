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
4. Build the desktop app from source: `cd desktop-app && npm install && npm start`

> **Note**: This is a maintained fork with modernized dependencies. The original project can be found at https://gitlab.com/badbounty/dvcw

### Other useful commands
#### Stop & resume backend
- Stop: `make stop`
- Resume: `make resume`

#### Fresh restart
- Run `make reset`

> Bear in mind that every time you do a fresh restart, you will have to re-scan the two-factor authentication QR code provided by the app so as to re-syncronize the OTP.

## What Changed in v2.0

The v2.0 upgrade modernized DVCW from legacy unmaintained dependencies to current, stable versions while carefully preserving all 16 educational security vulnerabilities.

### Major Version Upgrades
- **Node.js**: 8.x → 20.x LTS (full async/await support, modern JavaScript features)
- **Electron**: 1.6.7 → 30.x (security updates, modern APIs)
- **Solidity**: 0.4.21 → 0.8.19 (major syntax migration)
- **Truffle**: 4.x → 5.11.5 (updated compilation and migration APIs)
- **Ganache**: ganache-cli → ganache 7.x (Docker-based blockchain)
- **Web3.js**: 1.0.0-beta.34 → 4.16.0 (stable release with async/await APIs)
- **Vue**: 2.5.13 → 3.4.21 (Composition API, new reactive system)
- **Materialize CSS**: 0.100.2 → 1.0.0
- **Express**: 4.16.3 → 4.19.2
- **better-sqlite3**: 4.1.0 → 9.4.0

### Technical Migration Work
- **Smart Contracts**: Migrated Solidity syntax (constructor patterns, keccak256, payable addresses, call syntax)
- **Vulnerability Preservation**: Wrapped integer underflow in `unchecked` blocks to maintain exploitability
- **Web API**: Updated deprecated crypto APIs (createCipheriv, Buffer.from), modernized transaction signing
- **Desktop App**: Complete Vue 3 migration across all 8 render files, updated modal APIs
- **Docker**: Updated base images from node:8 to node:20-alpine
- **Testing**: Added automated vulnerability verification (verify-vulns.js) and basic structure tests

### Files Modified
38 files changed with 26,058 insertions and 9,938 deletions

### Verification
✅ All 16 vulnerabilities preserved and verified
✅ Smart contract compilation successful
✅ 1514 blockchain dependencies installed
✅ 315 web API dependencies installed
✅ 35 desktop app dependencies installed
✅ Docker stack functional

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

## Credits & Attribution

### Original Project
**Damn Vulnerable Crypto Wallet (DVCW)**
Copyright © 2018 BadBounty
License: MIT
Original Repository: https://gitlab.com/badbounty/dvcw

### Original Authors
- **BadBounty** - Organization and project sponsor
- **Wilmer Riveros** - Initial project setup and architecture
- **Martin Abbatemarco** - Project structure and documentation
- **Iván Bonilla** - Primary development (smart contracts, web API, desktop app)

### v2.0 Upgrade (2024)
- **Ethan Troy** - Modernization and dependency upgrades while preserving all 16 educational vulnerabilities
