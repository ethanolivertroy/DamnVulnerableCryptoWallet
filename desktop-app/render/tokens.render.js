const electron = require('electron')
const {ipcRenderer} = electron
var vm = new Vue({
    el: '#tokens-root',
    data: {
        amountToBuy: 1,
        amountToSell: 0,
        tokens: {},
        otpAction: '',
        error: '',
        message: ''
    },
    methods: {
        submitBuyTransaction: () => {
            ipcRenderer.send('new-buy-request', vm.amountToBuy)        
        },
        submitSellTransaction: () => {
            ipcRenderer.send('new-sell-request', vm.amountToSell)          
        },
        openTwoFactorAuth: (action) => {
            ipcRenderer.send('open-twofactorauth-request', action)
        },
        dismissError: () => {
            vm.error = ''
        },
        dismissMessage: () => {
            vm.message = ''
        },
        openModal: () => {
            $('#modal-contract').modal({})
            $('#modal-contract').modal('open')
        },
        openDVCSaleModal: () => {
            $('#modal-contract-dvctokensale').modal({})
            $('#modal-contract-dvctokensale').modal('open')
        },
    }
})

ipcRenderer.send('tokens-data-pull')

ipcRenderer.on('tokens-data-push', (event, tokenObject) => {
    // Update token object
    vm.tokens = tokenObject
});

ipcRenderer.on('new-tokens-response', (event, data) => {
    vm.error = ''
    vm.message = ''
    try{
        if(data.data.logs[0].topics[0] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
            vm.message = 'DVCTokens Bought !'
        } else {
            vm.message = 'DVCTokens Selled !'
        }
    } catch(err) {
        vm.error = 'Transaction Failed !' + data.logs[0].topics[0]
    }

})


ipcRenderer.on('valid-otp-buy', (event) => {
    vm.submitBuyTransaction()
})

ipcRenderer.on('valid-otp-sell', (event) => {
    vm.submitSellTransaction()
})

ipcRenderer.on('error-push', (event, message) => {
    vm.message = ''
    vm.error = message
})
