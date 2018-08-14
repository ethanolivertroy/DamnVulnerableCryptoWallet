process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const db = require('../data')
const should = chai.should()
const config = require('config')

chai.use(chaiHttp)

const baseUri = '/wallets'
const initialWalletCount = 2

function testWalletCount(count, done) {
    chai.request(server)
        .get(`${baseUri}/count`)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('count')
            res.body.count.should.be.a('number')
            res.body.count.should.be.eql(count)
            done()
        })
}

describe('Wallets API Endpoint', () => {

    describe(`GET ${baseUri}/count`, () => {
        it('should get the number of registered wallets', (done) => {
            testWalletCount(initialWalletCount, done)
        })
    })

    describe(`GET ${baseUri}/:walletId`, () => {
        it('should retrieve all data of the given wallet', (done) => {
            var testWallet = {
                walletId: '9b4e0740f29f395215b7b5fbb02f472656d50a17',
                publicAddress: '0x6330a553fc93768f612722bb8c2ec78ac90b3bbc',
                seedEncrypted: '30a3e0867b445b4c641da455fa5c41570e59b653cd19b52f30705c049ca536e9c9ea0843dcfd92e1ea178c841c41084e151616d1fbd37fd3779cc26a55de4aace3f75596b1e79ff04eae6fba058dc2c3d474b516b8ffa9fb743a3612d29b61fd9b4af4116ae8b3e1d8d828db58f3e80f1d7a57cad8ecec6b6a13048ce7b2b6495d',
                currency: 'ETH',
                password: '5a105e8b9d40e1329780d62ea2265d8a',
                firstname: 'Test',
                lastname: 'One',
                email: 'testone@fakeemail.org',
                walletIndex: 8,
                twoFactorAuthKey: 'FA2GKY3HOYQVQZDGMNAFIULPGQUHEXKF'
            }
            chai.request(server)
            .get(`${baseUri}/${testWallet.walletId}/`)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('walletId').eql(testWallet.walletId)                
                res.body.should.have.property('publicAddress')
                res.body.publicAddress.toLowerCase().should.be.eql(testWallet.publicAddress.toLowerCase())
                res.body.should.have.property('seedEncrypted').eql(testWallet.seedEncrypted)                
                res.body.should.have.property('password').eql(testWallet.password)
                res.body.should.have.property('firstname').eql(testWallet.firstname)
                res.body.should.have.property('lastname').eql(testWallet.lastname)
                res.body.should.have.property('email').eql(testWallet.email)
                res.body.should.have.property('walletIndex').eql(testWallet.walletIndex)
                res.body.should.have.property('twoFactorAuthKey').eql(testWallet.twoFactorAuthKey)
                done()
            })
        })

        it('should return a 404 error for not found wallet ID', (done) => {
            var walletId = 'bf180a0ef0dabc3e9b4494ad2048a2928698a7f2'
            chai.request(server)
                .get(`${baseUri}/${walletId}/`)
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Unknown ID')
                    done()
                })
        })
    })

    describe(`GET ${baseUri}/:address/transactions`, () => {
        it('should return all transactions of the given address', (done) => {
            let address = '0x6330a553fc93768f612722bb8c2ec78ac90b3bbc'
            let query = '?page=1'
            chai.request(server)
                .get(`${baseUri}/${address}/transactions${query}`)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('transactions')
                    res.body.transactions.should.be.a('object')
                    res.body.transactions.should.have.property('data')
                    res.body.transactions.data.should.be.a('array')
                    res.body.transactions.data.forEach((item) => {
                        item.should.be.a('object')
                        item.should.have.property('from')
                        item.should.have.property('to')
                        item.should.satisfy((i) => {
                            return i.from.toLowerCase() === address || i.to.toLowerCase() === address
                        })
                    });
                    done()
                })
        })
        it('should indicate if there are more transactions to be read', (done) => {
            let address = '0x6330a553fc93768f612722bb8c2ec78ac90b3bbc'
            let query = '?page=1'
            chai.request(server)
                .get(`${baseUri}/${address}/transactions${query}`)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('transactions')
                    res.body.transactions.should.have.property('next')
                    res.body.transactions.next.should.be.a('boolean')                    
                    done()
                })
        })
        it('should indicate the current balance of the given address', (done) => {
            let address = '0x6330a553fc93768f612722bb8c2ec78ac90b3bbc'
            let query = '?page=1'
            chai.request(server)
                .get(`${baseUri}/${address}/transactions${query}`)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('balance')
                    res.body.balance.should.be.a('number')                    
                    done()
                })
        })
        it('should return a 400 error when page parameter is not a number', (done) => {
            let address = '0x6330a553fc93768f612722bb8c2ec78ac90b3bbc'
            let query = '?page=;'
            chai.request(server)
                .get(`${baseUri}/${address}/transactions${query}`)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error')
                    res.body.error.should.be.a('string')
                    res.body.error.should.be.eql('Invalid data')
                    done()
                })
        })
        it('should return a 400 error when page parameter is empty', (done) => {
            let address = '0x6330a553fc93768f612722bb8c2ec78ac90b3bbc'
            let query = '?page='
            chai.request(server)
                .get(`${baseUri}/${address}/transactions${query}`)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error')
                    res.body.error.should.be.a('string')
                    res.body.error.should.be.eql('Invalid data')
                    done()
                })
        })
        it('should return an empty array when valid address is not registered', (done) => {
            let address = '0x6110a553fc93768f612722bb8c2ec78ac90b3bbc'
            let query = '?page=1'
            chai.request(server)
                .get(`${baseUri}/${address}/transactions${query}`)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('transactions')
                    res.body.transactions.should.have.property('data')
                    res.body.transactions.data.should.be.a('array')
                    res.body.transactions.data.length.should.eql(0)
                    res.body.transactions.should.have.property('next')
                    res.body.transactions.next.should.be.a('boolean')
                    res.body.transactions.next.should.be.eql(false)             
                    done()
                })
        })
    })
    
    describe(`POST ${baseUri}/new`, () => {

        it('should return the default wallet', (done) => {
            var data = {}
            let walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'
            let password = '5a105e8b9d40e1329780d62ea2265d8a'
            chai.request(server)
                .post(`${baseUri}/new`)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('walletId').eql(walletId)
                    res.body.should.have.property('seedEncrypted')
                    res.body.should.have.property('publicAddress')
                    res.body.should.have.property('mnemonic')
                    res.body.should.have.property('twoFactorAuthKey')
                    res.body.should.have.property('walletIndex').eql(config.walletIndex)
                    // Rollback changes in DB
                    db.registerWalletPassword(walletId, password)
                    // No wallet should have been added to DB
                    testWalletCount(initialWalletCount, done)
                })
        })        
    })

    describe(`POST ${baseUri}/:walletId/register-password`, () => {
        var walletId = 'bf180a0ef0dabc3e9b4494ad2048a2928698a0d0'
        var data = {password: 'test'}
        it('should set the password of the given wallet', (done) => {
            chai.request(server)
                .post(`${baseUri}/${walletId}/register-password`)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message').eql('Password successfully registered')
                    // Clean DB
                    db.registerWalletPassword(walletId, '')
                    done()
                })
        })
        it('should return a 400 error for invalid wallet IDs', (done) => {
            var walletId = 'test1wallet2id'
            var data = {password: 'test'}
            chai.request(server)
                .post(`${baseUri}/${walletId}/register-password`)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid data')
                    done()
                })
        })
        it('should return a 400 error for invalid passwords', (done) => {
            var walletId = 'bf180a0ef0dabc3e9b4494ad2048a2928698a0d0'
            var data = {password: ''}
            chai.request(server)
                .post(`${baseUri}/${walletId}/register-password`)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid data')
                    done()
                })
        })
        it('should return a 400 error if wallet already has a password', (done) => {
            var walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'
            var data = {password: 'test'}
            chai.request(server)
                .post(`${baseUri}/${walletId}/register-password`)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid data')
                    done()
                })
        })
    })

    describe(`POST ${baseUri}/:walletId/change-password`, () => {
        var walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'
        var data = "['5a105e8b9d40e1329780d62ea2265d8a','test']"
        var header = {
            type: 'Content-Type',
            value: 'text/plain'
        }
        it('should change the password of the given wallet', (done) => {
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-password`)
                .set(header.type, header.value)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message').eql('Password successfully changed')
                    // Rollback changes in DB
                    db.registerWalletPassword(walletId, '5a105e8b9d40e1329780d62ea2265d8a')
                    done()
                })
        })
        it('should return a 400 error if wallet does not have a password yet', (done) => {
            var walletId = 'bf180a0ef0dabc3e9b4494ad2048a2928698a0d0'
            var data = "['','test']"
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-password`)
                .set(header.type, header.value)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Cannot change password')
                    done()
                })
        })
        it('should return a 400 error for invalid wallet IDs', (done) => {
            var walletId = 'test1wallet2id'
            var data = "['5a105e8b9d40e1329780d62ea2265d8a','test']"
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-password`)
                .set(header.type, header.value)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid data')
                    done()
                })
        })
        it('should return a 400 error for invalid new password', (done) => {
            var walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'
            var data = "['5a105e8b9d40e1329780d62ea2265d8a','']"
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-password`)
                .set(header.type, header.value)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid data')
                    done()
                })
        })
        it('should return a 400 error for invalid old password', (done) => {
            var walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'
            var data = "['test','test']"
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-password`)
                .set(header.type, header.value)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Cannot change password')
                    done()
                })
        })
        it('should return a 400 error if no passwords are provided', (done) => {
            var walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'
            var data = ''
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-password`)
                .set(header.type, header.value)
                .send(data)
                .end((err, res) => {                    
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid data')
                    done()
                })
        })
    })

    describe(`POST ${baseUri}/:walletId/change-profile`, () => {
        var currentProfile = {
            firstname: 'Test',
            lastname: 'One',
            email: 'testone@fakeemail.org'
        }
        it('should update the given wallet\'s profile data', (done) => {
            var walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'            
            var newProfile = {
                firstname: 'John',
                lastname: 'Doe Doe',
                email: 'email_john.doe+hey@email.com'
            }
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-profile`)
                .send(newProfile)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message').eql('Profile successfully updated')
                    // Rollback DB
                    db.updateWalletProfile(walletId, currentProfile)
                    done()
                })
        })
        it('should return a 400 error for invalid emails', (done) => {
            var walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'
            var data = Object.assign({}, currentProfile)
            data.email = 'wrongemail@email'
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-profile`)
                .send(data)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid data')
                    done()
                })
        })
        it('should return a 400 error if no data is sent', (done) => {
            var walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-profile`)
                .send()
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error')
                    res.body.should.have.property('error').eql('Invalid data')
                    done()
                })
        })
        it('should be vulnerable to injection in wallet ID', (done) => {
            var walletId = `' OR 1=1 ORDER BY lastname--`
            chai.request(server)
                .post(`${baseUri}/${walletId}/change-profile`)
                .send(currentProfile)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message').eql('Profile successfully updated')
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('object')
                    res.body.data.should.have.property('walletId').eql('9b4e0740f29f395215b7b5fbb02f472656d50a17')
                    res.body.data.should.have.property('publicAddress')
                    res.body.data.should.have.property('seedEncrypted')                    
                    res.body.data.should.have.property('password')
                    res.body.data.should.have.property('firstname')
                    res.body.data.should.have.property('lastname')
                    res.body.data.should.have.property('email')
                    res.body.data.should.have.property('twoFactorAuthKey')
                    res.body.data.should.have.property('walletIndex')
                    done()
                })
        })
    })

    describe(`POST ${baseUri}/recover`, () => {
        let mnemonic = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
        it('should return default wallet data for the given mnemonic', (done) => {
            let walletId = '9b4e0740f29f395215b7b5fbb02f472656d50a17'
            let password = '5a105e8b9d40e1329780d62ea2265d8a'
            chai.request(server)
                .post(`${baseUri}/recover`)
                .send({mnemonic})
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('walletId').eql(walletId)
                    res.body.should.have.property('seedEncrypted').eql('30a3e0867b445b4c641da455fa5c41570e59b653cd19b52f30705c049ca536e9c9ea0843dcfd92e1ea178c841c41084e151616d1fbd37fd3779cc26a55de4aace3f75596b1e79ff04eae6fba058dc2c3d474b516b8ffa9fb743a3612d29b61fd9b4af4116ae8b3e1d8d828db58f3e80f1d7a57cad8ecec6b6a13048ce7b2b6495d')
                    res.body.should.have.property('publicAddress').eql('0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc')
                    res.body.should.not.have.property('password')
                    res.body.should.have.property('twoFactorAuthKey').eql('FA2GKY3HOYQVQZDGMNAFIULPGQUHEXKF')
                    res.body.should.have.property('firstname').eql('Test')
                    res.body.should.have.property('lastname').eql('One')
                    res.body.should.have.property('email').eql('testone@fakeemail.org')                    
                    res.body.should.have.property('balance')
                    res.body.should.have.property('mnemonic')
                    // Rollback changes in DB
                    db.registerWalletPassword(walletId, password)
                    done()
                })
        })
        it('should return a 400 error if the mnemonic is not valid', (done) => {
            let mnemonic = 'an invalid mnemonic'
            chai.request(server)
                .post(`${baseUri}/recover`)
                .send({mnemonic})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid mnemonic')
                    done()
                })
        })
        it('should return a 400 error if no data is sent', (done) => {
            chai.request(server)
                .post(`${baseUri}/recover`)
                .send()
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid mnemonic')
                    done()
                })
        })
        it('should return a new wallet with balance = 0 if none is found with the given mnemonic', (done) => {
            let mnemonic = 'census rigid upper battle opera lonely cave scare inject list gentle brass'
            chai.request(server)
                .post(`${baseUri}/recover`)
                .send({mnemonic})
                .end((err, res) => {                    
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('walletId')
                    res.body.should.have.property('seedEncrypted')
                    res.body.should.have.property('publicAddress')
                    res.body.should.have.property('twoFactorAuthKey')
                    res.body.should.not.have.property('password')
                    res.body.should.have.property('balance').eql(0)
                    res.body.should.have.property('mnemonic')
                    res.body.should.not.have.property('firstname')
                    res.body.should.not.have.property('lastname')
                    res.body.should.not.have.property('email')
                    db.deleteLastWallet()
                    done()
                })
        })
    })

})
