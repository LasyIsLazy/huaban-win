import { app } from 'electron'
import fs from 'fs'
import path from 'path'
const info = {}
const configPath = path.join(app.getPath('userData'), 'config.json')
const systemDownloadsPath = app.getPath('downloads')

/**
 * 初始化获取系统信息
 */
export function initSystemInfo() {
  console.log('configPath', configPath)
  fs.exists(configPath, exists => {
    if (exists) {
      fs.readFile(configPath, (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        const { downloadPath } = JSON.parse(data)
        info.downloadPath = downloadPath
        console.log('initSystemInfo', info)
      })
    } else {
      info.downloadPath = systemDownloadsPath
    }
  })
}

/**
 * 更新下载路径
 * @param {string} downloadPath 下载路径
 */
export function updateDownloadPath(downloadPath) {
  info.downloadPath = downloadPath
  let data = {}
  // 写入配置文件
  if (fs.existsSync(configPath)) {
    data = JSON.parse(fs.readFileSync(configPath))
  }
  data.downloadPath = downloadPath
  fs.writeFile(configPath, JSON.stringify(data), err => {
    err && console.error('WriteFile failed:', err)
  })
}

export default info
