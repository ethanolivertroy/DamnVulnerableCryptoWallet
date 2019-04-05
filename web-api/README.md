## Web API for DVCW

This application assumes you have the Ganache-cli service already running on *host:port* configured in the `config/default.json` file.

## Setup

### Build from sources
> If you're on Windows, first open a terminal with admin privileges and run `npm install --global --production windows-build-tools`. This may take a while to complete. (More details about this step at [node-gyp](https://github.com/nodejs/node-gyp))

1. Clone this repository
2. `cd web-api`
3. `nvm use 8.15.1`
3. Run `npm install` 
4. Run `npm start`. If everything went well, you should see the message `Started DVCW API on localhost:3000`
5. Browse to [http://localhost:3000](http://localhost:3000) to confirm

### Build using Docker
1. Install [Docker](https://www.docker.com/)
2. Build Docker image: `docker build -t apps/dvcw-web-api .`
3. Check that the image was successfuly built running `docker images`
4. Now run `docker run -p 3000:3000 -d apps/dvcw-web-api`. This will make the app listen on port `3000`
5. To check that everything went well, you can run:
  - `docker ps` to get the Container ID and then `docker logs <container-id>` and see the app's logs
  - Browse to `http://localhost:3000` and see the server's response `{"app":"DVCW"}`
