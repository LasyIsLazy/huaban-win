<template>
  <div class="wrapper">
    <el-form label-width="80px">
      <el-form-item label="id">
        <el-input type="number" v-model="boardId" @input="handleInput"></el-input>
      </el-form-item>
      <el-form-item label="操作">
        <el-button @click="handleInitBtnClicked" :disabled="curProcess===PROCESS_NOT_INPUTED">获取画板信息</el-button>
        <el-button @click="handleGetBtnClicked" :disabled="curProcess < PROCESS_INFO_GETED">获取下载链接</el-button>
        <el-button @click="handleBtnClicked" :disabled="curProcess !== PROCESS_LINK_GETED">下载</el-button>
        <el-button @click="openDir" icon="el-icon-folder-opened">打开</el-button>
      </el-form-item>
      <el-form-item label="状态">
        <span v-if="isProcessing">处理中：</span>
        <span v-if="isSuccess ">完成：</span>
        <span v-if="isFailed">失败：</span>
        <span>{{ msg }}</span>
      </el-form-item>
      <el-form-item label="画板 ID">{{boardId}}</el-form-item>
      <el-form-item label="标题">{{title}}</el-form-item>
      <el-form-item label="下载位置">
        {{downloadPath}}
        <el-button @click="handleSetPathClicked">更改位置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import path from 'path'
const log = console.log
const { shell, ipcRenderer } = require('electron')
import {
  PROCESS_FAILED,
  PROCESS_PROCESSING,
  PROCESS_SUCCESS
} from '../../common/constant.js'

const PROCESS_NOT_INPUTED = 0
const PROCESS_INPUTED = 1
const PROCESS_INFO_GETED = 2
const PROCESS_LINK_GETED = 3
const PROCESS_DOWNLOADING = 4
const PROCESS_DOWNLOAD_FINISH = 4

export default {
  name: 'landing-page',
  components: {},
  data() {
    return {
      boardId: '',
      status: '',
      msg: '',
      downloadPath: '',
      board: {},
      PROCESS_NOT_INPUTED,
      PROCESS_INPUTED,
      PROCESS_INFO_GETED,
      PROCESS_LINK_GETED,
      PROCESS_DOWNLOADING,
      PROCESS_DOWNLOAD_FINISH,
      curProcess: PROCESS_NOT_INPUTED
    }
  },
  computed: {
    isProcessing() {
      return this.status === PROCESS_PROCESSING
    },
    isFailed() {
      return this.status === PROCESS_FAILED
    },
    isSuccess() {
      return this.status === PROCESS_SUCCESS
    },
    amount() {
      return this.board && this.board.amount
    },
    title() {
      return this.board && this.board.title
    },
    id() {
      return this.board && this.board.id
    }
  },
  methods: {
    open(link) {
      this.$electron.shell.openExternal(link)
    },
    handleInitBtnClicked() {
      ipcRenderer.send('initBoard', this.boardId)
    },
    handleGetBtnClicked() {
      log('handleGetBtnClicked')
      ipcRenderer.send('getAllData', this.boardId)
    },
    handleBtnClicked() {
      log('download clicked')
      if (this.isProcessing) {
        log('processing')
        return
      }
      ipcRenderer.send('download', this.boardId, this.title)
    },
    handleInput() {
      if (!this.boardId) {
        this.curProcess = PROCESS_NOT_INPUTED
        return
      }
      this.curProcess = PROCESS_INPUTED
    },
    handleSetPathClicked() {
      ipcRenderer.send('setDownloadPath')
    },
    openDir() {
      const isOpened = shell.showItemInFolder(
        path.join(this.downloadPath, this.title || '')
      )
      log('Open folder:', this.downloadPath, isOpened)
    },
    initIpc() {
      ipcRenderer.on('getAllData', (e, data) => {
        const { status, board, msg } = data
        this.status = status
        this.msg = msg
        this.board = board
        log(data)
        this.curProcess = PROCESS_LINK_GETED
      })

      ipcRenderer.on('initBoard', (e, data) => {
        const { status, board, msg } = data
        this.status = status
        this.msg = msg
        this.board = board
        log(data)
        this.curProcess = PROCESS_INFO_GETED
      })

      ipcRenderer.on('download', (e, data) => {
        const { status, board, msg } = data
        this.status = status
        this.msg = msg
        this.board = board
        log(data)
      })

      ipcRenderer.on('getSystemInfo', (e, systemInfo) => {
        const { downloadPath } = systemInfo
        log('downloadPath', downloadPath)
        if (!this.downloadPath) {
          this.downloadPath = downloadPath
        }
      })
      ipcRenderer.send('getSystemInfo')

      ipcRenderer.on('updateDownloadPath', (e, downloadPath) => {
        console.log('updateDownloadPath', downloadPath)
        this.downloadPath = downloadPath
      })
    }
  },
  mounted() {
    this.initIpc()
  }
}
</script>
<style scoped>
.wrapper {
  width: 70%;
  margin: 0 auto;
}
</style>

