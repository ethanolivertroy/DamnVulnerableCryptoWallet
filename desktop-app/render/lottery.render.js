const electron = require('electron')
const {ipcRenderer} = electron
const MIN_BET = 10
var vm = new Vue({
    el: '#lottery-root',
    data: {
        bet: MIN_BET,
        guess: 0,
        lastResult: 0,
        jackpot: 0,
        winner: false,
        address: '',
        error: '',
        message: ''
    },
    methods: {
        submitBet: () => {
            if(vm.bet >= MIN_BET) {
                if(vm.guess >= 0 && vm.guess <= 46) {
                    ipcRenderer.send('new-bet-request', vm.bet, vm.guess)
                } else {
                    vm.error = 'Number must be between 0 and 46'
                }                
            } else {
                vm.error = 'Bet must be at least 10 ETH'
            }
        },
        reclaimJackpot: () => {
            if(vm.winner) {
                ipcRenderer.send('reclaim-jackpot-request')
                vm.winner = false
            }
        },
        openTwoFactorAuth: () => {
            ipcRenderer.send('open-twofactorauth-request')
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
        }
    }
})

ipcRenderer.send('lottery-data-pull')

ipcRenderer.on('lottery-data-push', (event, data) => {
    vm.lastResult = data.lastResult
    vm.jackpot = data.jackpot
    if(data.address) {
        vm.address = data.address
    }
})

ipcRenderer.on('new-bet-response', (event, data) => {
    if(data.winner) {
        vm.winner = data.winner
        vm.message = 'Congratulations! You won!'
    } else {
        vm.error = 'Nope, wrong number. Try again!'
    }
})

ipcRenderer.on('valid-otp', (event) => {
    vm.submitBet()
})

ipcRenderer.on('error-push', (event, message) => {
    vm.error = message
})
