const docsUrl = 'https://github.com/electron/electron/tree/v1.6.7'
const template  = [
    {
        label: 'File',
        submenu: [
            {role: 'close'}
        ]
    },
    {
        label: 'View',
        submenu: [
            {role: 'reload'},
            {role: 'toggledevtools'}
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'About',
                click () {
                    require('electron').shell.openExternal(docsUrl)
                }
            }
        ]
    }
]

module.exports = template