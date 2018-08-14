const electron = require('electron')
const QRCode = require('qrcode')
const {ipcRenderer} = electron

var vm = new Vue({
    el: '#settings-root',
    data: {
        error: '',
        message: '',
        settings: {
            password: {
                old: '',
                new: ''
            },
            profile: {
                firstname: '',
                lastname: '',
                email: ''
            },
            qrcode: {
                data: '',
                loading: true
            },
            server: ''
        }        
    },
    methods: {
        savePasswordChanges: () => {
            if(vm.settings.password.old.trim().length > 0 && vm.settings.password.new.trim().length > 0) {
                ipcRenderer.send('change-password-settings-request', vm.settings)    
            }
            else {
                vm.error = 'Invalid password'
            }
        },
        saveServerChanges: () => {
            if(vm.settings.server.trim().length > 0) {
                let init = false
                let server = vm.settings.server
                ipcRenderer.send('change-server-settings-request', {server, init})    
            }
            else {
                vm.error = 'Invalid server address'
            }
        },
        saveProfileChanges: () => {
            if(true) {
                ipcRenderer.send('change-profile-settings-request', vm.settings)    
            }
            else {
                vm.error = 'Invalid profile settings'
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

ipcRenderer.send('settings-data-pull')

ipcRenderer.on('error-push', (event, message) => {
    vm.error = message
})

ipcRenderer.on('settings-data-push', (event, data) => {
    vm.settings.profile = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email
    }
    QRCode
        .toDataURL(`otpauth://totp/DVCW?secret=${data.twoFactorAuthKey}`)
        .then(imageData => {
            vm.settings.qrcode.data = imageData
            vm.settings.qrcode.loading = false
        })
})

ipcRenderer.on('server-settings-data-push', (event, server) => {
    vm.settings.server = server
})

ipcRenderer.on('change-settings-response', (event, data) => {
    vm.message = data.message
    vm.settings.password.old = ''
    vm.settings.password.new = ''
})
