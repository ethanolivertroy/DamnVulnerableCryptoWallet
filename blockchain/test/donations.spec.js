const DonationsContract = artifacts.require('Donations')

contract('Donations test', async (accounts) => {
    
    const OWNER = accounts[5]
    const INITIAL_BALANCE = 20

    it('should have an owner', async () => {
        let instance = await DonationsContract.deployed()
        let owner = await instance.owner.call()
        assert.equal(!!owner, true)
    })

    it('should have a public function that allows the transfer of the ownership', async () => {
        let instance = await DonationsContract.deployed()
        await instance.newOwner(accounts[1])
        let owner = await instance.owner.call()
        assert.equal(owner, accounts[1])
        await instance.newOwner(OWNER)
    })

    it('should allow to view the donations made by an account', async () => {
        let instance = await DonationsContract.deployed()
        let donationTotal = await instance.getDonationAmount(OWNER)
        assert.equal(web3.fromWei(donationTotal, 'ether'), INITIAL_BALANCE)
    })

    it('should allow donations', async () => {
        let instance = await DonationsContract.deployed()
        let donor = accounts[1]
        await instance.donate({
            from: donor,
            value: web3.toWei(0.5, 'ether')
        })
        let donationTotal = await instance.getDonationAmount(donor)
        assert.equal(web3.fromWei(donationTotal, 'ether'), 0.5)
    })
})