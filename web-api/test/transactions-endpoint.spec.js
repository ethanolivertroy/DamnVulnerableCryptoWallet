process.env.NODE_ENV = 'test'

const assert = require('assert')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const db = require('../data')
const getWeb3 = require('../data/web3')

const should = chai.should()
const baseEndpoint = '/transactions'
chai.use(chaiHttp)

async function getAddressTransactions(address) {
    let web3 = getWeb3()
    return web3.eth.getTransactionCount(address)
}

describe('Transactions API Endpoint', () => {
    describe(`POST ${baseEndpoint}/new`, () => {
        let nTransaction = 0
        let fromAddr = '0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc'
        let tx = {
            fromWalletId: '9b4e0740f29f395215b7b5fbb02f472656d50a17',
            toAddr: '0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE',
            value: 0.00001,
            message: 'test'
        }        
        
        before(async () => { nTransaction = await getAddressTransactions(fromAddr)})
        after(async () => {
            let nTransactionAfter = await getAddressTransactions(fromAddr)
            assert.equal(nTransactionAfter, nTransaction + 2)
        })

        it('should register and return a new transaction with positive value', done => {
            chai.request(server)
                .post(baseEndpoint + '/new')
                .send({tx})
                .end(async (err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('hash')
                    res.body.should.have.property('from')
                    res.body.should.have.property('to').eql(tx.toAddr)
                    res.body.should.have.property('value').eql(tx.value)
                    res.body.should.have.property('timestamp')
                    res.body.should.have.property('message').eql(tx.message)                    
                    done()
                })
        })
        it('should register and return a new transaction without message', done => {
            tx.message = ''
            chai.request(server)
                .post(baseEndpoint + '/new')
                .send({tx})
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('hash')
                    res.body.should.have.property('from')
                    res.body.should.have.property('to').eql(tx.toAddr)
                    res.body.should.have.property('value').eql(tx.value)
                    res.body.should.have.property('timestamp')
                    res.body.should.have.property('message').eql(tx.message)                    
                    done()
                })
        })
        it('should not allow new transaction with negative value', done => {
            let tx = {
                fromWalletId: '9b4e0740f29f395215b7b5fbb02f472656d50a17',
                toAddr: '0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE',
                value: -5,
                message: 'test'
            }
            chai.request(server)
                .post(baseEndpoint + '/new')
                .send({tx})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error')
                    res.body.should.have.property('error').eql('Invalid transaction')
                    done()
                })
        })        
        it('should return a 400 error for transaction with value = 0', done => {
            let tx = {
                fromWalletId: '9b4e0740f29f395215b7b5fbb02f472656d50a17',
                toAddr: '0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE',
                value: 0,
                message: 'test'
            }
            chai.request(server)
                .post(baseEndpoint + '/new')
                .send({tx})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid transaction')
                    done()
                })
        })
        it('should return a 400 error if transaction sender is the same as receiver', done => {
            let tx = {
                fromWalletId: '9b4e0740f29f395215b7b5fbb02f472656d50a17',
                toAddr: '0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc',
                value: 1,
                message: 'test'
            }
            chai.request(server)
                .post(baseEndpoint + '/new')
                .send({tx})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid transaction')
                    done()
                })
        })
        it('should return a 400 error if no data is sent', done => {            
            chai.request(server)
                .post(baseEndpoint + '/new')
                .send()
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Invalid parameters')                    
                    done()
                })
        })
    })
})
