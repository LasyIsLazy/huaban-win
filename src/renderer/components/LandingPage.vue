<template>
  <div id="wrapper">
    <el-form>
      <el-form-item label="id">
        <el-input type="number" v-model="boardId"></el-input>
      </el-form-item>
      <el-button @click="handleBtnClicked">下载</el-button>
    </el-form>
    <span v-if="isProcessing">处理中：</span>
    <span v-if="isSuccess ">完成：</span>
    <span v-if="isFailed">失败：</span>
    <span>{{ msg }}</span>
    <el-button @click="openDir">打开</el-button>
    <system-information></system-information>
  </div>
</template>

<script>
import path from 'path'
const log = console.log
const { shell, ipcRenderer } = require('electron')

export default {
  name: 'landing-page',
  components: {},
  data() {
    return {
      boardId: '',
      status: '',
      msg: '',
      downloadPath: ''
    }
  },
  computed: {
    isProcessing() {
      return this.status === 0
    },
    isFailed() {
      return this.status === -1
    },
    isSuccess() {
      return this.status === 1
    }
  },
  methods: {
    open(link) {
      this.$electron.shell.openExternal(link)
    },
    handleBtnClicked() {
      log('clicked')
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
    }
  },
  mounted() {
    ipcRenderer.on('download', (e, arg) => {
      const { status, msg } = arg
      this.status = status
      this.msg = msg
      log(arg)
      if (this.isSuccess) {
        log('notification')
        ipcRenderer.send('notification', {
          title: '获取完成',
          body: '所有信息获取完成'
        })
      }
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
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Source Sans Pro', sans-serif;
}

#wrapper {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;
}

main > div {
  flex-basis: 50%;
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.title.alt {
  font-size: 18px;
  margin-bottom: 10px;
}

.doc p {
  color: black;
  margin-bottom: 10px;
}

.doc button {
  font-size: 0.8em;
  cursor: pointer;
  outline: none;
  padding: 0.75em 2em;
  border-radius: 2em;
  display: inline-block;
  color: #fff;
  background-color: #4fc08d;
  transition: all 0.15s ease;
  box-sizing: border-box;
  border: 1px solid #4fc08d;
}

.doc button.alt {
  color: #42b983;
  background-color: transparent;
}
</style>
