const electron = require('electron')
const {ipcRenderer} = electron

var vm = new Vue({
    el: '#donations-root',
    data: {
        donationAmount: 0,
        donationTotal: 0,
        address: '',
        error: '',
        message: ''
    },
    methods: {
        makeDonation: () => {
            if(vm.donationAmount > 0) {
                ipcRenderer.send('new-donation-request', vm.donationAmount)
            } else {
                vm.error = 'Please, make sure your donation is greater than zero'
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

ipcRenderer.send('donations-data-pull')
document.getElementById('donationAmount').focus()

ipcRenderer.on('donations-data-push', (event, data) => {
    vm.donationTotal = data.donationTotal
    if(data.address) {
        vm.address = data.address
    }    
})

ipcRenderer.on('new-donation-response', (event) => {
    vm.message = 'Thank you! Your donation has been successfuly made.'
})

ipcRenderer.on('valid-otp', (event) => {
    vm.makeDonation()
})

ipcRenderer.on('error-push', (event, message) => {
    vm.error = message
})
