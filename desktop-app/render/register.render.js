const electron = require('electron')
const {ipcRenderer} = electron

var vm = new Vue({
    el: '#register-root',
    data: {
        mnemonic: '',
        phrase: '',
        password: '',
        confirm: '',
        error: ''
    },
    methods: {
        register: () => {
            if(vm.password === vm.confirm) {
                ipcRenderer.send('register-request', vm.password)
            } else {
                vm.error = 'Passwords do not match'
            }
        },
        recover: () => {
            ipcRenderer.send('recover-wallet-request', vm.phrase)
        },
        dismissError: () => {
            vm.error = ''
        }
    }
})
document.getElementById('password').focus()
ipcRenderer.send('get-mnemonic-request')

ipcRenderer.on('get-mnemonic-response', (event, data) => {
    vm.mnemonic = data
})

ipcRenderer.on('error-push', (event, message) => {
    vm.error = message
    vm.password = ''
    vm.confirm = ''
})
