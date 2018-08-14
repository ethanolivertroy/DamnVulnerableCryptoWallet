module.exports = {
  networks: {
    development: {
      host: process.env.GANACHE_HOST || "127.0.0.1",
      port: process.env.GANACHE_PORT || 7545,
      network_id: "*" // Match any network id
    }
  }
}
