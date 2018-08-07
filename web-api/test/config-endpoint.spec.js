process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const db = require('../data')
const should = chai.should()

chai.use(chaiHttp)

const baseUri = '/config'

describe('Config API Endpoint', () => {
    describe(`GET ${baseUri}`, () => {        
        it('should return a 400 error if no \'f\' parameter is provided', (done) => {
            chai.request(server)
                .get(`${baseUri}`)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Cannot read configuration')
                    done()
                })
        })
    })
    describe(`GET ${baseUri}?f=<filename>`, () => {
        it('should return a configuration file content', (done) => {
            var filename = 'default.json'
            chai.request(server)
                .get(`${baseUri}?f=${filename}`)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('config')
                    res.body.config.should.be.a('object')
                    done()
                })
        })
        it('should allow traversing the app\'s directory', (done) => {
            var filename = '../package.json'
            chai.request(server)
                .get(`${baseUri}?f=${filename}`)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('config')
                    res.body.config.should.be.a('object')
                    done()
                })
        })
        it('should return a 403 error if requested file is not JSON', (done) => {
            var filename = '../server.js'
            chai.request(server)
                .get(`${baseUri}?f=${filename}`)
                .end((err, res) => {
                    res.should.have.status(403)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Cannot read configuration')
                    done()
                })
        })
        it('should return a 404 error if requested JSON file does not exist', (done) => {
            var filename = 'develop.json'
            chai.request(server)
                .get(`${baseUri}?f=${filename}`)
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error').eql('Cannot read configuration')
                    done()
                })
        })
    })
})