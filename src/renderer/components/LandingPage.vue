<template>
  <div class="wrapper">
    <el-form label-width="80px">
      <el-form-item label="id">
        <el-input type="number" v-model="boardId"></el-input>
      </el-form-item>
      <el-form-item label="操作">
        <el-button @click="handleInitBtnClicked">获取画板信息</el-button>
        <el-button @click="handleGetBtnClicked">获取下载链接</el-button>
        <el-button @click="handleBtnClicked">下载</el-button>
        <el-button @click="openDir" icon="el-icon-folder-opened">打开</el-button>
      </el-form-item>
      <el-form-item label="状态">
        <span v-if="isProcessing">处理中：</span>
        <span v-if="isSuccess ">完成：</span>
        <span v-if="isFailed">失败：</span>
        <span>{{ msg }}</span>
      </el-form-item>
      <el-form-item label="画板 ID">{{this.boardId}}</el-form-item>
      <el-form-item label="标题">{{this.title}}</el-form-item>
    </el-form>
  </div>
</template>

<script>
import path from 'path'
const log = console.log
const { shell, ipcRenderer } = require('electron')
const FAILED = -1
const PROCESSING = 0
const SUCCESS = 1

export default {
  name: 'landing-page',
  components: {},
  data() {
    return {
      boardId: '',
      status: '',
      msg: '',
      downloadPath: '',
      board: {}
    }
  },
  computed: {
    isProcessing() {
      return this.status === PROCESSING
    },
    isFailed() {
      return this.status === FAILED
    },
    isSuccess() {
      return this.status === SUCCESS
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
      const boardId = parseInt(this.boardId)
      // NaN
      if (boardId !== boardId) {
        log('Wrong input boardId')
        return
      }
      ipcRenderer.send('initBoard', boardId)
    },
    handleGetBtnClicked() {
      log('handleGetBtnClicked')
      const boardId = parseInt(this.boardId)
      if (boardId !== boardId) {
        log('Wrong input boardId')
        return
      }
      ipcRenderer.send('getAllData', boardId)
    },
    handleBtnClicked() {
      log('download clicked')
      if (this.isProcessing) {
        log('processing')
        return
      }
      const boardId = parseInt(this.boardId)
      // NaN
      if (boardId !== boardId) {
        log('Wrong input boardId')
        return
      }
      ipcRenderer.send('download', boardId)
    },
    openDir() {
      // const os = require("os");
      log(this.downloadPath)
      const isOpened = shell.showItemInFolder(this.downloadPath)
      log('Open folder:', this.downloadPath, isOpened)
    },
    initIpc() {
      ipcRenderer.on('getAllData', (e, data) => {
        const { status, board, msg } = data
        this.status = status
        this.msg = msg
        this.board = board
        log(data)
      })

      ipcRenderer.on('initBoard', (e, data) => {
        const { status, board, msg } = data
        this.status = status
        this.msg = msg
        this.board = board
        log(data)
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
          this.downloadPath = path.join(downloadPath, 'huaban-downloads')
        }
      })
      ipcRenderer.send('getSystemInfo')
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

