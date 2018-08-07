const electron = require('electron')
const {ipcRenderer} = electron

var vm = new Vue({
    el: '#login-root',
    data: {
        password: '',
        error: ''
    },
    methods: {
        login: () => {            
            ipcRenderer.send('login-request', vm.password)
        },
        dismissError: () => {
            vm.error = ''
        }
    }
})

ipcRenderer.on('error-push', (event, message) => {
    vm.error = message
    vm.password = ''
})

document.getElementById('password').focus()
