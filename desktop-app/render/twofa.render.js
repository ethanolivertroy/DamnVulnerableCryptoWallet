const electron = require('electron')
const { createApp } = Vue
const { ipcRenderer } = electron

const vm = createApp({
    data() {
        return {
            error: '',
            otp: ''
        }
    },
    methods: {
        submit() {
            ipcRenderer.send('otp-submission', vm.otp)
            vm.otp = ''
        },
        dismissError() {
            vm.error = ''
        }
    }
}).mount('#twofa-root')

document.getElementById('otp').focus()

ipcRenderer.on('error-push', (event, message) => {
    vm.error = message
})
