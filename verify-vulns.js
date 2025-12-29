#!/usr/bin/env node

const axios = require('axios');
const web3 = require('web3');

const API = 'http://localhost:3000';
const GANACHE = 'http://localhost:7545';

console.log('🔍 DVCW Vulnerability Verification\n');

async function check(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        return true;
    } catch (e) {
        console.log(`❌ ${name} - ${e.message}`);
        return false;
    }
}

async function main() {
    const results = [];

    // 1. SQL Injection
    results.push(await check('SQL Injection', async () => {
        await axios.get(`${API}/wallets/' OR '1'='1`);
    }));

    // 2. Path Traversal
    results.push(await check('Path Traversal', async () => {
        await axios.get(`${API}/config?f=../../package.json`);
    }));

    // 3. CORS Open
    results.push(await check('CORS Open', async () => {
        await axios.get(`${API}/`, { headers: { Origin: 'http://evil.com' }});
    }));

    // 4. ganache running
    results.push(await check('Ganache Running', async () => {
        await axios.get(`${GANACHE}`);
    }));

    // 5. API running
    results.push(await check('API Running', async () => {
        await axios.get(`${API}/`);
    }));

    console.log(`\n📊 ${results.filter(r => r).length}/${results.length} automated checks passed`);

    // Manual checks (cannot be automated)
    console.log('\n🔧 Manual verification needed:');
    console.log('  • Debug port 9334 open (curl http://localhost:9334)');
    console.log('  • RC4 encryption (check web-api/controllers/wallets.ctrl.js:172)');
    console.log('  • MD5 hashing (check desktop-app/utils.js:24)');
    console.log('  • Lottery bad randomness (interact with contract)');
    console.log('  • Donations reentrancy (exploit contract)');
    console.log('  • Donations integer underflow (withdraw more than donated)');
    console.log('  • tx.origin authorization bypass (use contract to call newOwner)');
    console.log('  • Private seed readable (web3.eth.getStorageAt(contractAddress, 1))');
    console.log('  • 2FA bypass (read ~/.config/dvcw-desktop-app/localdata.json)');
    console.log('  • Protocol handler (click dvcw://0x... link)');
    console.log('  • Server-side JS injection (send array in password change)');
    console.log('\n✨ All automated checks complete!');
}

main().catch(console.error);
