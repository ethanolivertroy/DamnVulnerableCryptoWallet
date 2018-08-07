const electron = require('electron')
const moment = require('moment')
const {ipcRenderer} = electron

const maxNumTransactions = 5
var vm

vm = new Vue({
    el: '#app-root',
    data: {
        wallet: {},
        transactions: [],
        tx: {},
        error: '',
        currentPage: 1,
        next: false,
        message: ''
    },
    methods: {
        sendTransaction: () => {            
            if(!vm.tx.message) {
                vm.tx.message = ''
            }
            ipcRenderer.send('new-transaction-request', vm.tx)
        },
        copyAddress: () => {            
            ipcRenderer.send('copy-address')
        },
        dismissError: () => {
            vm.error = ''
        },
        dismissMessage: () => {
            vm.message = ''
        },
        changePage: (value) => {
            vm.currentPage = value
            ipcRenderer.send('change-page-request', vm.currentPage)
        },
        openSettings: () => {
            ipcRenderer.send('open-settings-request')
        },
        openLottery: () => {
            ipcRenderer.send('open-lottery-request')
        },
        openDonations: () => {
            ipcRenderer.send('open-donations-request')
        },
        openModal: (id) => {
            $('#modal-' + id).modal({})
            $('#modal-' + id).modal('open')
        },
        openTwoFactorAuth: () => {
            ipcRenderer.send('open-twofactorauth-request')
        }
    },
    filters: {
        formatDate: (value) => {
            return moment.unix(value).calendar()
        }
    }
})

ipcRenderer.send('tx-data-pull', vm.currentPage)
document.getElementById('toAddr').focus()

ipcRenderer.on('tx-data-push', (event, wallet, transactions, next, tx) => {
    // Update wallet balance
    vm.wallet = wallet
    // Update transactions
    vm.transactions = transactions
    vm.next = next
    // Clear transaction
    vm.tx = tx
});

ipcRenderer.on('new-transaction-response', (event, tx) => {
    if(vm.transactions.length === maxNumTransactions) {
        // Remove oldest transaction before inserting newest
        vm.transactions.pop()
        vm.next = true
    }
    vm.transactions.unshift(tx)
    // Clean current transaction data
    vm.tx = {}
    // Update wallet balance
    vm.wallet.balance -= tx.value
    // Show success message
    vm.message = 'Transaction sent!'    
});

ipcRenderer.on('change-page-response', (event, data) => {
    vm.transactions = data.transactions
    vm.next = data.next
})

ipcRenderer.on('update-wallet-balance', (event, balance) => {
    vm.wallet.balance = balance
})

ipcRenderer.on('valid-otp', (event) => {
    vm.sendTransaction()
})

ipcRenderer.on('error-push', (event, message) => {
    vm.error = message
})
