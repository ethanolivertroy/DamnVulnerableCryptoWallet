const Database = require('better-sqlite3');
const config = require('config')

function saveWallet(wallet) {
    let db = _loadDb()
    db.prepare(`INSERT INTO wallets(walletId, publicAddress, seedEncrypted, twoFactorAuthKey, walletIndex)
                VALUES (@walletId, @publicAddress, @seedEncrypted, @twoFactorAuthKey, @walletIndex);`)
      .run(wallet)    
    db.close()
}

function countWallets() {
    /**
     * Counts the number of registered wallets
     */
    let db = _loadDb()
    let count = db.prepare('SELECT COUNT(*) count FROM wallets;').get().count
    db.close()
    return count
}

function getWalletTransactions(address, page) {
    /**
     * Retrieves all transactions where the given address was involved (from or to)
     */
    let db = _loadDb()
    let max = 5

    let count = db.prepare(`SELECT COUNT(*) count FROM transactions
                            WHERE lower(fromAddr) = lower(@address) OR lower(toAddr) = lower(@address);`)
                  .get({"address": address}).count

    let data = db.prepare(`SELECT hash, message, timestamp FROM transactions WHERE lower(fromAddr) = lower(@address) OR lower(toAddr) = lower(@address)
                            ORDER BY timestamp DESC LIMIT @lim OFFSET @off;`)
                 .all({"address": address, "lim": max, "off": (page-1)*max})
    db.close()
    return {data, next: count > page*max}
}

function saveTransaction(tx) {
    /**
     * Stores new transaction in DB just to easily keep track of each wallet's transactions.
     * Balances are updated directly in the blockchain.
     * Returns the transaction that was stored.
     */
    let db = _loadDb()
    db.prepare(
        `INSERT INTO transactions(hash, fromAddr, toAddr, message, timestamp) 
        VALUES (@hash, @fromAddr, @toAddr, @message, @timestamp);`
    ).run(tx)

    db.close()
    return tx
}

function deleteWalletPassword(walletId) {
    let db = _loadDb()
    db.prepare('UPDATE wallets SET password = NULL WHERE walletId = ?;').run(walletId)
    db.close()
}

function deleteLastWallet() {
    var db = _loadDb()
    db.prepare('DELETE FROM wallets WHERE walletId = (SELECT walletId FROM wallets ORDER BY ROWID DESC LIMIT 1);')
      .run()
    db.close()
}

function deleteLastTransaction() {
    let db = _loadDb()
    let tx = db.prepare('SELECT * FROM transactions ORDER BY ROWID DESC LIMIT 1').get()
    db.prepare('DELETE FROM transactions WHERE hash = @hash;').run(tx)
    db.close()
}

function registerWalletPassword(walletId, newPassword) {
    /**
     * Changes the password for the given wallet ID
     */
    let db = _loadDb()
    db.prepare('UPDATE wallets SET password = @newPassword WHERE walletId = @walletId;')
      .run({newPassword, walletId})
    db.close()
}

function getWalletPassword(walletId) {
    let result = getWalletById(walletId)
    let password = result ? result.password : null
    return password
}

function getWalletById(walletId) {
    let db = _loadDb()
    let result = db.prepare(`SELECT * FROM wallets WHERE walletId = '${walletId}';`).get()
    db.close()
    return result
}

function updateWalletProfile(walletId, profile) {
    let db = _loadDb()
    db.prepare(`UPDATE wallets SET firstname = @firstname, lastname = @lastname, email = @email
                WHERE walletId = ?;`)
      .run(profile, walletId)
    db.close()
}

function _loadDb() {
    let options = {"fileMustExist": true}
    return new Database(config.database, options)
}

module.exports = {
    saveWallet,
    countWallets,
    deleteLastWallet,
    getWalletTransactions,
    saveTransaction,
    deleteLastTransaction,
    registerWalletPassword,
    getWalletPassword,
    getWalletById,
    updateWalletProfile,
    deleteWalletPassword
}
