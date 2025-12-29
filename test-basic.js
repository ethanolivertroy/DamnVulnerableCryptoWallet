#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 DVCW v2.0 Basic Structure Check\n');

const checks = [];

// 1. Check blockchain contracts compile
try {
    const buildDir = path.join(__dirname, 'blockchain', 'build', 'contracts');
    const lotteryJson = path.join(buildDir, 'Lottery.json');
    const donationsJson = path.join(buildDir, 'Donations.json');

    if (fs.existsSync(lotteryJson) && fs.existsSync(donationsJson)) {
        console.log('✅ Smart contracts compiled');
        checks.push(true);
    } else {
        console.log('❌ Smart contracts not compiled');
        checks.push(false);
    }
} catch (e) {
    console.log(`❌ Smart contracts check failed: ${e.message}`);
    checks.push(false);
}

// 2. Check web-api package.json
try {
    const apiPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'web-api', 'package.json'), 'utf8'));
    const hasWeb3 = apiPackage.dependencies.web3 === '^4.16.0';
    const hasExpress = apiPackage.dependencies.express === '^4.19.2';

    if (hasWeb3 && hasExpress) {
        console.log('✅ Web API dependencies updated');
        checks.push(true);
    } else {
        console.log('❌ Web API dependencies not updated');
        checks.push(false);
    }
} catch (e) {
    console.log(`❌ Web API check failed: ${e.message}`);
    checks.push(false);
}

// 3. Check desktop app package.json
try {
    const desktopPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'desktop-app', 'package.json'), 'utf8'));
    const hasVue3 = desktopPackage.dependencies.vue === '^3.4.21';
    const hasElectron30 = desktopPackage.devDependencies.electron && desktopPackage.devDependencies.electron.startsWith('^30');

    if (hasVue3 && hasElectron30) {
        console.log('✅ Desktop App dependencies updated');
        checks.push(true);
    } else {
        console.log('❌ Desktop App dependencies not updated');
        checks.push(false);
    }
} catch (e) {
    console.log(`❌ Desktop App check failed: ${e.message}`);
    checks.push(false);
}

// 4. Check Vue 3 migration
try {
    const indexRender = fs.readFileSync(path.join(__dirname, 'desktop-app', 'render', 'index.render.js'), 'utf8');
    const hasCreateApp = indexRender.includes('createApp');
    const hasMount = indexRender.includes('.mount');

    if (hasCreateApp && hasMount) {
        console.log('✅ Vue 3 migration completed');
        checks.push(true);
    } else {
        console.log('❌ Vue 3 migration not completed');
        checks.push(false);
    }
} catch (e) {
    console.log(`❌ Vue migration check failed: ${e.message}`);
    checks.push(false);
}

// 5. Check Solidity 0.8.19
try {
    const lottery = fs.readFileSync(path.join(__dirname, 'blockchain', 'contracts', 'Lottery.sol'), 'utf8');
    const donations = fs.readFileSync(path.join(__dirname, 'blockchain', 'contracts', 'Donations.sol'), 'utf8');

    const lotteryHas08 = lottery.includes('pragma solidity ^0.8.19');
    const donationsHas08 = donations.includes('pragma solidity ^0.8.19');

    if (lotteryHas08 && donationsHas08) {
        console.log('✅ Solidity 0.8.19 upgrade completed');
        checks.push(true);
    } else {
        console.log('❌ Solidity 0.8.19 upgrade not completed');
        checks.push(false);
    }
} catch (e) {
    console.log(`❌ Solidity check failed: ${e.message}`);
    checks.push(false);
}

// 6. Check vulnerabilities preserved
try {
    const lottery = fs.readFileSync(path.join(__dirname, 'blockchain', 'contracts', 'Lottery.sol'), 'utf8');
    const donations = fs.readFileSync(path.join(__dirname, 'blockchain', 'contracts', 'Donations.sol'), 'utf8');

    const vulnKeywords = ['VULN:', 'bad randomness', 'tx.origin', 'reentrancy', 'unchecked'];
    const hasVulnComments = vulnKeywords.some(kw =>
        lottery.toLowerCase().includes(kw.toLowerCase()) ||
        donations.toLowerCase().includes(kw.toLowerCase())
    );

    if (hasVulnComments) {
        console.log('✅ Vulnerabilities documented in code');
        checks.push(true);
    } else {
        console.log('⚠️  Vulnerability comments may be missing');
        checks.push(false);
    }
} catch (e) {
    console.log(`❌ Vulnerabilities check failed: ${e.message}`);
    checks.push(false);
}

// 7. Check verification script exists
try {
    const verifyScript = path.join(__dirname, 'verify-vulns.js');
    if (fs.existsSync(verifyScript)) {
        console.log('✅ Vulnerability verification script exists');
        checks.push(true);
    } else {
        console.log('❌ Verification script not found');
        checks.push(false);
    }
} catch (e) {
    console.log(`❌ Verification script check failed: ${e.message}`);
    checks.push(false);
}

// Summary
const passed = checks.filter(c => c).length;
const total = checks.length;
console.log(`\n📊 ${passed}/${total} basic checks passed`);

if (passed === total) {
    console.log('\n✨ All basic checks passed! Ready to test with running services.');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: make install (to start ganache and deploy contracts)');
    console.log('2. Run: cd web-api && npm start (to start API)');
    console.log('3. Run: cd desktop-app && npm start (to launch app)');
    console.log('4. Run: node verify-vulns.js (to verify vulnerabilities)');
} else {
    console.log('\n⚠️  Some checks failed. Review the errors above.');
    process.exit(1);
}
