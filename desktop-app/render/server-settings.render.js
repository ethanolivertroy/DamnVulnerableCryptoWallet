const electron = require('electron')
const {ipcRenderer} = electron

var vm = new Vue({
    el: '#server-settings-root',
    data: {
        error: '',
        message: '',
        server: ''
    },
    methods: {
        saveServerChanges: () => {
            if(vm.server.trim().length > 0) {
                let init = true
                let server = vm.server
                ipcRenderer.send('change-server-settings-request', {server, init})
            }
            else {
                vm.error = 'Invalid server address'
            }
        },
        dismissError: () => {
            vm.error = ''
        },
        dismissMessage: () => {
            vm.message = ''
        }
    }
})
