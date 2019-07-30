import axios from 'axios'
import fs from 'fs'
import path from 'path'
import systemInfo from '../systemInfo'
import { ipcMain } from 'electron'
import Board from 'huaban-dl'
import {
  PROCESS_FAILED,
  PROCESS_PROCESSING,
  PROCESS_SUCCESS
} from '../../common/constant.js'

let board = null

async function next() {
  if (!board) {
    return
  }
  const data = await board.getNextPage()
  return data
}
export default async function initDownloadIpc() {
  ipcMain.on('initBoard', async (evt, boardId) => {
    console.log(`initBoard: ${boardId}`)
    board = new Board(boardId)
    console.log('初始化中……')
    try {
      await board.init()
    } catch (error) {
      evt.sender.send('initBoard', {
        boardId,
        status: PROCESS_FAILED,
        msg: '画板信息获取失败'
      })
    }
    evt.sender.send('initBoard', {
      boardId,
      status: PROCESS_SUCCESS,
      msg: '画板信息获取成功',
      board
    })
  })

  ipcMain.on('getAllData', async (evt, boardId) => {
    console.log(`getAllData: ${boardId}`)
    if (board && boardId !== board.id) {
      console.log(`Not init, ${boardId}, ${board}`)
      return
    }
    let isProcessing = true
    while (isProcessing) {
      const data = await next(boardId)
      if (!data) {
        isProcessing = false
      }
      evt.sender.send('getAllData', {
        boardId,
        status: PROCESS_PROCESSING,
        board,
        msg: `获取数据中，已获取图片链接数：${board.links.length}`
      })
    }
    evt.sender.send('getAllData', {
      boardId,
      status: PROCESS_SUCCESS,
      board,
      msg: '数据获取完成'
    })
  })

  ipcMain.on('download', async (evt, boardId) => {
    console.log(`download: ${boardId}`)
    if (board && boardId !== board.id) {
      console.log(`Not init, ${boardId}, ${board}`)
      return
    }
    const { links } = board
    let isProcessing = true
    for (let index = 0; index < links.length; index++) {
      const link = links[index]
      console.log(`下载图片: ${link}`)
      const { data } = await axios({
        method: 'GET',
        url: link,
        responseType: 'arraybuffer'
      })
      const { downloadPath } = systemInfo
      const directory = path.join(downloadPath, 'huaban-downloads')
      isProcessing = index + 1 < links.length
      fs.exists(directory, isExists => {
        if (!isExists) {
          console.log(`创建文件夹：${directory}`)
          fs.mkdir(directory, () => console.error)
        }
        const imgPath = `${directory}/img${index + 1}.jpeg`
        console.log(`写入路径：${imgPath}`)
        fs.writeFile(imgPath, data, err => {
          if (err) {
            console.log(err)
            evt.sender.send('download', {
              boardId,
              board,
              status: PROCESS_FAILED,
              index,
              link,
              msg: `第 ${index + 1} 张图片写入失败`
            })
          }
        })
        evt.sender.send('download', {
          boardId,
          board,
          status: isProcessing ? PROCESS_PROCESSING : PROCESS_SUCCESS,
          index,
          link,
          msg: isProcessing
            ? `正在下载第 ${index + 1} 张图片`
            : `${index + 1} 张图片下载完成`
        })
      })
    }
  })
}
