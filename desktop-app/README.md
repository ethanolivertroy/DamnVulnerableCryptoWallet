## Electron desktop application for DVCW

## Setup (Updated for v2.0)

### From packaged app
1. Download latest release from [the Tags page](https://gitlab.com/badbounty/dvcw/tags/)
2. Run app

### From sources
1. Run `npm install` (or `yarn install`) to install dependencies
2. Run `npm start` (or `yarn start`) to start the desktop application

### Packaging the application
- We use [electron-packager](https://github.com/electron-userland/electron-packager). The script used is `packager.js`.
- To pack the application, run `npm run pack` (or `yarn run pack`)

### Desktop App Vulnerabilities (Preserved)
- **2FA Bypass** (`main.js:278`): Localdata.json contains 2FA secret
- **Open Debug Port** (`main.js:15`): Debug port 9334 exposed (vulnerable to DNS rebinding)
- **Protocol Handler** (`main.js:12`, `utils.js:78`): `dvcw://` protocol (CVE-2018-1000118)
- **XSS to RCE** (`render/index.render.js`): Stored XSS in transaction messages
- **MD5 Hashing** (`utils.js:24`): MD5 for passwords

### Testing
Make sure web-api and blockchain are running first.
Run the desktop app and verify all vulnerabilities can be exploited.

