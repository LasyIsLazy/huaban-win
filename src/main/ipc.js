const { ipcMain, Notification, dialog } = require('electron')
import initDownloadIpc from './huaban/download'
import systemInfo, { initSystemInfo, updateDownloadPath } from './systemInfo'
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

  ipcMain.on('setDownloadPath', evt => {
    const filePaths = dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!filePaths.length) return
    const downloadPath = filePaths[0]
    console.log('setDownloadPath', downloadPath)
    updateDownloadPath(downloadPath)
    evt.sender.send('updateDownloadPath', downloadPath)
  })

  console.log('Ipc inited')
}
export default {
  initIpc: init
}
