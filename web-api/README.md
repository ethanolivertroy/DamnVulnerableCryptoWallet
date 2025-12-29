## Web API for DVCW

This application assumes you have the Ganache service already running on *host:port* configured in the `config/default.json` file.

## Setup (Updated for v2.0)

### Build from sources
> If you're on Windows, first open a terminal with admin privileges and run `npm install --global --production windows-build-tools`. This may take a while to complete. (More details about this step at [node-gyp](https://github.com/nodejs/node-gyp))

1. Clone this repository
2. `cd web-api`
3. Run `npm install` (or `yarn install`)
4. Run `npm start`. If everything went well, you should see the message `Started DVCW API on localhost:3000`
5. Browse to [http://localhost:3000](http://localhost:3000) to confirm

### Build using Docker
1. Install [Docker](https://www.docker.com/)
2. Build Docker image: `docker build -t apps/dvcw-web-api .`
3. Check that the image was successfully built running `docker images`
4. Now run `docker run -p 3000:3000 -d apps/dvcw-web-api`. This will make to app listen on port `3000`
5. To check that everything went well, you can run:
   - `docker ps` to get the Container ID and then `docker logs <container-id>` and see the app's logs
   - Browse to `http://localhost:3000` and see the server's response `{"app":"DVCW"}`

### API Vulnerabilities (Preserved)
- **SQL Injection** (`data/index.js:94`): User input directly in SQL query
- **Path Traversal** (`controllers/config.ctrl.js:14`): Reads arbitrary files via `../..`
- **CORS Open** (`server.js:20`): Allows all origins
- **Code Injection** (`route/wallets.route.js:53`): Uses `eval()` on user input
- **RC4 Encryption** (`controllers/wallets.ctrl.js:172`): Weak cipher using deprecated API
- **MD5 Hashing** (`controllers/wallets.ctrl.js:21`): MD5 for wallet ID

### Testing
Run `npm test` to run API tests.
Run `node ../verify-vulns.js` to verify vulnerabilities.

