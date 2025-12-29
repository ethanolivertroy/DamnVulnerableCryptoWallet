# DVCW v2.0 Upgrade Notes

## Breaking Changes

### For Users
- **Node.js 20.x required** - No longer supports Node.js 8.x
- **Docker images rebuilt** - Uses node:20-alpine base
- **New dependencies** - Must run `npm install` after upgrade

### For Developers
- **Solidity 0.4.21 → 0.8.19** - Major syntax changes
- **Vue 2 → Vue 3** - Breaking API changes
- **Web3.js 1.0.0-beta.34 → 4.16.0** - Transaction signing API changed
- **Electron 1.6.7 → 30.x** - Electron API updates
- **Materialize CSS 0.100.2 → 1.0.0** - Modal API changed

## What Changed

### Docker Infrastructure
- `docker-compose.yml`: Updated ganache image to `trufflesuite/ganache:latest`
- `blockchain/Dockerfile`: Base image changed to `node:20-alpine`, install `ganache` globally
- `web-api/Dockerfile`: Base image changed to `node:20-alpine`
- `blockchain/start-ganache.sh`: Updated to use `ganache` command (not `ganache-cli`)

### Smart Contracts (Solidity 0.8.19)
- `Lottery.sol`:
  - Constructor syntax: `function Lottery()` → `constructor()`
  - keccak256 encoding: Added `abi.encodePacked()`
  - Transfer syntax: `msg.sender.transfer()` → `payable(msg.sender).transfer()`
  - VULN preserved: Bad randomness, reentrancy, private seed
- `Donations.sol`:
  - Constructor syntax: `function Donations()` → `constructor()`
  - Underflow: Added `unchecked` block to preserve integer underflow vulnerability
  - Call syntax: `call.value()` → `call{value: }`
  - VULN preserved: Underflow, reentrancy, tx.origin
- `Migrations.sol`: Constructor syntax updated
- `2_deploy_contracts.js`:
  - Updated to use async/await for `web3.eth.getAccounts()`
  - Changed `web3.toWei()` → `web3.utils.toWei()`
- `truffle-config.js`: Added `compilers.solc.version` and gas settings
- Test files (`lottery.spec.js`, `donations.spec.js`):
  - All `web3.fromWei()` → `web3.utils.fromWei()`
  - Added `await` to `web3.eth.getStorageAt()`

### Web API
- `package.json`: Updated all dependencies to latest compatible versions
  - better-sqlite3: 4.1.0 → 9.4.0
  - express: 4.16.3 → 4.19.2
  - web3: 1.0.0-beta.34 → 4.16.0
  - nodemon: 1.17.2 → 3.0.3
- `wallets.ctrl.js`:
  - Fixed deprecated `createCipher()` → `createCipheriv()`
  - Fixed deprecated `createDecipher()` → `createDecipheriv()`
  - Fixed deprecated `new Buffer()` → `Buffer.from()`
  - **VULN preserved**: RC4 encryption (still weak), MD5 hashing, SHA1 wallet ID
- `transactions.ctrl.js`:
  - Updated `signTransaction()` to use object parameter format
  - Added `await` to `sendSignedTransaction()`
- **VULN preserved**: SQL injection, code injection, path traversal, CORS, no sessions

### Desktop App (Vue 3 + Electron 30)
- `package.json`: Updated all dependencies
  - electron: 1.6.7 → 30.x
  - vue: 2.5.13 → 3.4.21
  - materialize-css: 0.100.2 → 1.0.0
  - axios: 0.18.0 → 1.6.7
  - electron-log: 2.2.14 → 5.0.1
- **All render files migrated to Vue 3**:
  - `index.render.js`: Main wallet page
  - `login.render.js`: Login page
  - `register.render.js`: Password setup
  - `lottery.render.js`: Lottery game
  - `donations.render.js`: Donations
  - `settings.render.js`: Settings
  - `twofa.render.js`: 2FA
  - `server-settings.render.js`: Server config
  - **Changes made**:
    - `new Vue()` → `createApp()`
    - `data: {}` → `data() { return {} }`
    - `filters: {}` → Converted to methods
    - `el: '#id'` → `.mount('#id')`
    - Added `const { createApp } = Vue` import
    - Updated modal initialization to `M.Modal.init()` and `M.Modal.getInstance()`
- **VULN preserved**: Debug port, protocol handler, 2FA bypass, XSS, MD5 hashing

### New Files
- `verify-vulns.js`: Automated vulnerability verification script
- `blockchain/package.json`: New file for managing blockchain dependencies

### Documentation Updates
- `README.md`: Added v2.0 changes section, updated vulnerability list
- `blockchain/README.md`: Updated requirements, added vulnerability details
- `web-api/README.md`: Added vulnerability details
- `desktop-app/README.md`: Added vulnerability details

## Preserved Vulnerabilities (All 16)

### Smart Contracts (5)
1. ✅ Bad randomness (Lottery.sol:26) - `block.timestamp` + `blockhash` still exploitable
2. ✅ Reentrancy (Lottery.sol:40) - State update after `transfer()`
3. ✅ Integer underflow (Donations.sol:27) - `unchecked` block preserves vulnerability
4. ✅ Private seed (Lottery.sol:12) - Storage slot 1 still readable
5. ✅ tx.origin (Donations.sol:53) - Still uses `tx.origin` for auth

### Web API (6)
6. ✅ SQL injection (data/index.js:94) - User input in SQL query
7. ✅ Code injection (route/wallets.route.js:53) - `eval()` on user input
8. ✅ Path traversal (config.ctrl.js:14) - File reads via `../..`
9. ✅ CORS open (server.js:20) - Allows all origins
10. ✅ RC4 encryption (wallets.ctrl.js:172) - Still uses RC4 (weak)
11. ✅ MD5 hashing (wallets.ctrl.js:21) - Still uses MD5 (weak)

### Desktop App (5)
12. ✅ 2FA bypass (main.js:278) - Localdata.json contains secret
13. ✅ Debug port (main.js:15) - Port 9334 exposed
14. ✅ Protocol handler (main.js:12, utils.js:78) - `dvcw://` protocol
15. ✅ XSS (index.render.js) - Stored XSS in transactions
16. ✅ No sessions (API design) - No auth tokens/sessions

## Migration Guide

### Solidity 0.4 → 0.8
- `function Constructor()` → `constructor()`
- `keccak256(a, b, c)` → `keccak256(abi.encodePacked(a, b, c))`
- `msg.sender.transfer()` → `payable(msg.sender).transfer()`
- `_donor.call.value(x)()` → `_donor.call{value: x}("")`
- To preserve underflow: wrap in `unchecked { }` block

### Vue 2 → Vue 3
- `new Vue({ el: '#id', data: {...} })` → `createApp({ data() { return {...} }).mount('#id')`
- `filters: { filter: fn }` → Use methods instead
- `const vm = new Vue(...)` → `const vm = createApp(...)`
- Add `const { createApp } = Vue` import

### Web3.js 1.x → 4.x
- `web3.toWei()` → `web3.utils.toWei()`
- `web3.fromWei()` → `web3.utils.fromWei()`
- `signTransaction(tx, key)` → `signTransaction({...tx}, key)`
- `sendSignedTransaction()` now returns promise (use `await`)

### Node.js Crypto API
- `createCipher('rc4', key)` → `createCipheriv('rc4', Buffer.from(key), Buffer.alloc(0))`
- `createDecipher('rc4', key)` → `createDecipheriv('rc4', Buffer.from(key), Buffer.alloc(0))`
- `new Buffer(data)` → `Buffer.from(data)`

## Testing

After upgrade:
1. Run `make install` to build and start all services
2. Run `node verify-vulns.js` to verify automated vulnerabilities
3. Manually test:
   - Smart contract vulnerabilities via Truffle console
   - Web API vulnerabilities via curl/Postman
   - Desktop app vulnerabilities by launching app
4. Verify each vulnerability in code comments marked with `VULN:`

## Rollback

If you need to rollback to v0.2.1:
```bash
git checkout <commit-hash>
cd blockchain && npm install
cd ../web-api && npm install
cd ../desktop-app && npm install
make reset
```
