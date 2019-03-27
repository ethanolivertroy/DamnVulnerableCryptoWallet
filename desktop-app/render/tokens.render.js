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
            vm.message = 'DVCTokens bought !'               
        },
        submitSellTransaction: () => {
            ipcRenderer.send('new-sell-request', vm.amountToSell)
            vm.message = 'DVCTokens selled !'               
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
    if(data.winner) {
        vm.winner = data.winner
        vm.message = 'Congratulations! You won!'
    } else {
        vm.error = 'Nope, wrong number. Try again!'
    }
})


ipcRenderer.on('valid-otp-buy', (event) => {
    vm.submitBuyTransaction()
})

ipcRenderer.on('valid-otp-sell', (event) => {
    vm.submitSellTransaction()
})

ipcRenderer.on('error-push', (event, message) => {
    vm.error = message
})
