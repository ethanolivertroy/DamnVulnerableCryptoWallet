const electron = require('electron')
const {ipcRenderer} = electron

var vm = new Vue({
    el: '#twofa-root',
    data: {
        error: '',
        otp: ''
    },
    methods: {
        submit: () => {
            ipcRenderer.send('otp-submission', vm.otp)
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
