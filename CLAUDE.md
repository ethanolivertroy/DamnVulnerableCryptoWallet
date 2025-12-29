# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DVCW (Damn Vulnerable Crypto Wallet) is an intentionally vulnerable Ethereum cryptocurrency wallet built for security education and training. It demonstrates 16 different security vulnerabilities across smart contracts, web APIs, and desktop applications.

**CRITICAL**: This is an educational security project containing intentional vulnerabilities. Never use this code in production or as a template for real applications.

## Architecture

The project consists of three main modules:

### 1. Blockchain (`blockchain/`)
- **Tech Stack**: Solidity 0.8.19, Truffle 5.x, Ganache 7.x
- **Smart Contracts**:
  - `Lottery.sol`: Lottery contract with bad randomness, reentrancy, and private seed vulnerabilities
  - `Donations.sol`: Donations contract with integer underflow, reentrancy, and tx.origin vulnerabilities
- **Contract Addresses** (after deployment):
  - Lottery: `0x2fcea879fdc9fe5e90394faf0ca644a1749d0ad6`
  - Donations: `0x6da3f6cffb5dd0fbfbdcb1b681b189c9beb3b490`
  - Owner account: `(5) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e`
  - Default user account: `(0) 0x627306090abab3a6e1400e9345bc60c78a8bef57`

### 2. Web API (`web-api/`)
- **Tech Stack**: Node.js 20.x, Express, SQLite (better-sqlite3), Web3.js 4.16
- **Key Components**:
  - `server.js`: Express server setup with vulnerable CORS configuration
  - `controllers/`: Business logic for wallets, transactions, lottery, donations
  - `data/`: SQLite database layer with SQL injection vulnerability
  - `route/`: API route definitions
  - Connects to Ganache blockchain via Web3
- **Port**: 3000

### 3. Desktop App (`desktop-app/`)
- **Tech Stack**: Electron 30.x, Vue 3.4, Materialize CSS
- **Key Components**:
  - `main.js`: Electron main process with debug port and protocol handler vulnerabilities
  - `render/`: Vue-based renderer processes for UI (login, wallet, settings, lottery, donations)
  - `services.js`: API communication layer
  - `utils.js`: Utility functions including weak MD5 hashing
- **Vulnerable Features**: 2FA bypass, XSS to RCE, open debug port, custom protocol handler

## Development Commands

### Initial Setup
```bash
# Full Docker setup (recommended)
make install              # Build and start all services

# Manual setup (each module)
cd blockchain && npm install
cd web-api && npm install
cd desktop-app && npm install
```

### Blockchain
```bash
cd blockchain

# Start local Ganache blockchain
./start-ganache.sh        # Production mode (port 7545, persistent in bchain/prod/)
./start-test-ganache.sh   # Test mode (port 7545, ephemeral)

# Compile and deploy contracts
truffle compile           # Compile Solidity contracts
truffle migrate           # Deploy to local blockchain
truffle console           # Interactive blockchain console
npm test                  # Run contract tests
```

### Web API
```bash
cd web-api

npm start                 # Start API server
npm run dev               # Start with nodemon (auto-reload)
npm test                  # Run API tests (requires blockchain running)
```

### Desktop App
```bash
cd desktop-app

npm start                 # Run Electron app in development
npm run pack              # Package app for distribution
```

### Docker Operations
```bash
make install              # Build and start all backend services
make stop                 # Stop services without deleting
make resume               # Resume stopped services
make reset                # Fresh restart (deletes everything, rebuilds)
make kill                 # Stop and delete all services
```

### Vulnerability Verification
```bash
# From repository root
node verify-vulns.js      # Automated vulnerability checks
node test-basic.js        # Basic functionality tests
```

## Critical File Locations

### Intentional Vulnerabilities (DO NOT FIX)
- Smart Contracts:
  - `blockchain/contracts/Lottery.sol:26` - Bad randomness using block.timestamp
  - `blockchain/contracts/Lottery.sol:12` - Private seed in storage slot 1
  - `blockchain/contracts/Lottery.sol:40` - Reentrancy (transfer before state update)
  - `blockchain/contracts/Donations.sol:27` - Integer underflow in unchecked block
  - `blockchain/contracts/Donations.sol:28` - Reentrancy (call before state update)
  - `blockchain/contracts/Donations.sol:53` - tx.origin authorization

- Web API:
  - `web-api/data/index.js:94` - SQL injection vulnerability
  - `web-api/route/wallets.route.js:53` - Server-side JS injection (eval)
  - `web-api/controllers/config.ctrl.js:14` - Path traversal
  - `web-api/server.js:20` - CORS misconfiguration
  - `web-api/controllers/wallets.ctrl.js:172` - RC4 weak encryption
  - `web-api/controllers/wallets.ctrl.js:21` - MD5 hashing

- Desktop App:
  - `desktop-app/main.js:278` - 2FA bypass (secret in localdata.json)
  - `desktop-app/main.js:15` - Open debug port 9334
  - `desktop-app/main.js:12` - Protocol handler (CVE-2018-1000118)
  - `desktop-app/render/index.render.js` - XSS to RCE in transaction messages
  - `desktop-app/utils.js:24` - MD5 password hashing

### Configuration Files
- `docker-compose.yml` - Service orchestration (Ganache, Truffle, Web API)
- `blockchain/truffle-config.js` - Blockchain network configuration
- `web-api/config/default.json` - API default configuration
- `web-api/config/development.json` - Development environment config
- `desktop-app/config/default-config.json` - Desktop app configuration
- `desktop-app/data/default-localdata.json` - Default user data template

## Important Patterns

### Ganache Mnemonic (DO NOT CHANGE)
```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```
This mnemonic must remain constant to ensure contracts deploy at expected addresses.

### Web3 Version
The project uses Web3.js 4.16.0. Note the API differences from 1.x versions:
- Async/await patterns throughout
- `web3.eth.Contract` constructor changes
- Different transaction receipt handling

### Truffle Migration
Contracts must deploy in specific order to maintain addresses:
1. Migrations contract
2. Lottery contract → `0x2fcea879fdc9fe5e90394faf0ca644a1749d0ad6`
3. Donations contract → `0x6da3f6cffb5dd0fbfbdcb1b681b189c9beb3b490`

### Database
SQLite database stored at `web-api/data/db.sqlite`. Schema initialization happens automatically on first run from `web-api/data/schema.sql`.

## Testing Considerations

### Running Tests
1. Start Ganache: `cd blockchain && ./start-test-ganache.sh`
2. Deploy contracts: `truffle migrate`
3. Run blockchain tests: `npm test` (in blockchain/)
4. Start Web API: `cd web-api && npm start`
5. Run API tests: `npm test` (in web-api/)
6. Verify vulnerabilities: `node verify-vulns.js` (from root)

### Test Prerequisites
- Tests require Ganache running on port 7545
- Web API tests require contracts deployed
- Desktop app tests are manual (documented in `verify-vulns.js`)

## Version Information

Upgraded to v2.0 with:
- Node.js 8.x → 20.x LTS
- Electron 1.6.7 → 30.x
- Solidity 0.4.21 → 0.8.19
- Web3.js 1.0.0-beta.34 → 4.16.0
- Vue 2.5.13 → 3.4.21
- Ganache CLI → Ganache 7.x

All 16 vulnerabilities preserved across the upgrade.

## Security Notes

This codebase intentionally contains:
- Weak cryptography (MD5, RC4)
- Injection vulnerabilities (SQL, JavaScript, XSS)
- Smart contract vulnerabilities (reentrancy, integer underflow, bad randomness)
- Authentication bypasses
- Insecure configurations

When working on this codebase:
- **NEVER** propose fixes for documented vulnerabilities
- **NEVER** suggest security improvements unless explicitly requested
- **DO** analyze and explain how vulnerabilities work
- **DO** help maintain vulnerability functionality during updates
- **DO** verify vulnerabilities remain exploitable after changes
