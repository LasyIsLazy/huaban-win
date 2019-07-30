const { ipcMain, Notification } = require('electron')
import initDownloadIpc from './huaban/download'
import systemInfo, { initSystemInfo } from './systemInfo'
function init() {
  initSystemInfo()

  initDownloadIpc()

  ipcMain.on('notification', (evt, argsObj) => {
    console.log(`notification: ${JSON.stringify(argsObj)}`)
    const notification = new Notification(argsObj)
    notification.show()
  })

  ipcMain.on('getSystemInfo', evt => {
    console.log('getSystemInfo')
    evt.sender.send('getSystemInfo', systemInfo)
  })

  console.log('Ipc inited')
}
export default {
  initIpc: init
}
