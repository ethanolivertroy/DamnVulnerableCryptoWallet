const electron = require('electron')
const {ipcRenderer} = electron

var vm = new Vue({
    el: '#twofa-root',
    data: {
        error: '',
        otp: '',
        otpAction: '',
    },
    methods: {
        submit: () => {
            ipcRenderer.send('otp-submission', vm.otp, vm.otpAction)
            vm.otp = ''
        },
        dismissError: () => {
            vm.error = ''
        }
    }
})

document.getElementById('otp').focus()

ipcRenderer.on('error-push', (event, message) => {
    vm.error = message
})

ipcRenderer.on('change-otp-action', (event, message) => {
    vm.otpAction = message
})
