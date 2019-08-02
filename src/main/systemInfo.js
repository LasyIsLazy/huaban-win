import { app } from 'electron'
const info = {}

export function initSystemInfo() {
  info.downloadPath = app.getPath('downloads')
  console.log(info)
}

export function updateDownloadPath(downloadPath) {
  info.downloadPath = downloadPath
}

export default info
