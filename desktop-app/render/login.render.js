const electron = require('electron')
const { createApp } = Vue
const { ipcRenderer } = electron

const vm = createApp({
    data() {
        return {
            password: '',
            error: ''
        }
    },
    methods: {
        login() {
            ipcRenderer.send('login-request', vm.password)
        },
        dismissError() {
            vm.error = ''
        }
    }
}).mount('#login-root')

ipcRenderer.on('error-push', (event, message) => {
    vm.password = vm.password || ''
    vm.error = message
    vm.password = ''
})

document.getElementById('password').focus()
