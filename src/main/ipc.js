const { ipcMain, Notification } = require('electron')
import { download } from './huaban/download'
function init() {
  ipcMain.on('download', async (evt, boardId) => {
    console.log(`boardId: ${boardId}`)
    await download(boardId, arg => {
      console.log(arg)
      evt.sender.send('download', arg)
    })
  })
  ipcMain.on('notification', (evt, argsObj) => {
    console.log(`notification: ${JSON.stringify(argsObj)}`)
    const notification = new Notification(argsObj)
    notification.show()
  })
  console.log('Ipc inited')
}
export default {
  initIpc: init
}
