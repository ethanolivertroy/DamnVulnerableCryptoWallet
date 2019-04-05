## Electron desktop application for DVCW

## Setup

### From packaged app
1. Download latest release from [the Tags page](https://gitlab.com/badbounty/dvcw/tags/)
2. Run the app

### From sources
1. Run `nvm use 8.15.1`
2. Run `npm install` to install dependencies
3. Run `npm start` to start the desktop application

### Packaging the application
- We use [electron-packager](https://github.com/electron-userland/electron-packager). The script used is `packager.js`.
- To pack the application, run `yarn run pack`
