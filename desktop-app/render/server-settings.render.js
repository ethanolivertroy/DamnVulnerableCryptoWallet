const electron = require('electron')
const { createApp } = Vue
const { ipcRenderer } = electron

const vm = createApp({
    data() {
        return {
            error: '',
            message: '',
            server: ''
        }
    },
    methods: {
        saveServerChanges() {
            if(vm.server.trim().length > 0) {
                let init = true
                let server = vm.server
                ipcRenderer.send('change-server-settings-request', {server, init})
            }
            else {
                vm.error = 'Invalid server address'
            }
        },
        dismissError() {
            vm.error = ''
        },
        dismissMessage() {
            vm.message = ''
        }
    }
}).mount('#server-settings-root')
