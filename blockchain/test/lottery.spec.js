const LotteryContract = artifacts.require("Lottery")

contract('Lottery test', async (accounts) => {

    it("should have an initial jackpot of 50 ETH", async () => {
        let instance = await LotteryContract.deployed()
        let balance = await web3.eth.getBalance(instance.address)
        assert.equal(web3.fromWei(balance, 'ether').toNumber(), 50)
    })

    it("should have a public flag to check if someone has won", async () => {
        let instance = await LotteryContract.deployed()
        let winner = await instance.winner.call()
        assert.equal(winner, false)
    })

    it("should accept bets", async () => {
        const bet = 5
        const amount = 1 // ETH
        let instance = await LotteryContract.deployed()
        let initialJackpot = web3.fromWei(await web3.eth.getBalance(instance.address), 'ether').toNumber()

        await instance.bet(bet, {
            value: web3.toWei(amount, 'ether')
        })
        let winner = await instance.winner.call()
        let finalJackpot = web3.fromWei(await web3.eth.getBalance(instance.address), 'ether').toNumber()
        
        if(winner) {
            assert.equal(finalJackpot, 0)
        } else {
            assert.equal(finalJackpot, initialJackpot + amount)
        }
    })

    it("should have a private variable where the seed is stored", async () => {
        let instance = await LotteryContract.deployed()
        let seed = web3.eth.getStorageAt(instance.address, 1)
        assert.equal(seed, 87)
    })

    it("should have a public variable where the last result is stored", async () => {
        let instance = await LotteryContract.deployed()
        let lastResult = (await instance.lastResult.call()).toNumber()
        assert.equal(lastResult <= 46 && lastResult >= 0, true)
    })
})