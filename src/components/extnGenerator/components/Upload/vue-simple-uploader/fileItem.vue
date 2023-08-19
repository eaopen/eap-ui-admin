<template>
  <div class="uploader-file" :status="status">
    <div class="uploader-file-progress" :class="progressingClass"
      :style="file.customCompleted||status==='error'?successProgressStyle:progressStyle"></div>
    <div class="uploader-file-info">
      <div class="uploader-file-name">
        <i class="el-icon-paperclip"></i>{{file.name.replaceAll('#', '')}}
      </div>
      <!-- <div class="uploader-file-size">{{formatedSize}}</div>
      <div class="uploader-file-meta"></div> -->
      <div class="uploader-file-status">
        <span v-show="file.customCompleted">{{statusText}}</span>
        <span v-show="!file.customCompleted">
          <span v-if="status !== 'uploading' && status !== 'success'">
            {{file.customStatus==='check'?'文件校验中':statusText}}</span>
          <span v-else>
            <span>{{progressStyle.progress==='100%'?'99%':progressStyle.progress}}</span>
            <!-- <em>{{formatedAverageSpeed}}</em>
            <i>{{formatedTimeRemaining}}</i> -->
          </span>
        </span>
      </div>
      <div class="uploader-file-actions">
        <template v-if="file.customStatus !=='check'">
          <i class="actions-icon ym-custom ym-custom-pause"
            v-show="status==='waiting'||status==='uploading'" @click="pause"></i>
          <i class="actions-icon el-icon-caret-right" v-show="status==='paused'"
            @click="resume"></i>
          <i class="actions-icon el-icon-refresh-right" v-show="status==='error'"
            @click="retry"></i>
          <i class="actions-icon el-icon-close" v-show="status!=='success'" @click="remove"></i>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Uploader from 'simple-uploader.js'

const COMPONENT_NAME = 'uploader-file'
const secondsToStr = (temp) => {
  const years = Math.floor(temp / 31536000)
  if (years) {
    return years + ' year' + numberEnding(years)
  }
  const days = Math.floor((temp %= 31536000) / 86400)
  if (days) {
    return days + ' day' + numberEnding(days)
  }
  const hours = Math.floor((temp %= 86400) / 3600)
  if (hours) {
    return hours + ' hour' + numberEnding(hours)
  }
  const minutes = Math.floor((temp %= 3600) / 60)
  if (minutes) {
    return minutes + ' minute' + numberEnding(minutes)
  }
  const seconds = temp % 60
  return seconds + ' second' + numberEnding(seconds)
  function numberEnding(number) {
    return (number > 1) ? 's' : ''
  }
}

const events = ['fileProgress', 'fileSuccess', 'fileComplete', 'fileError']

export default {
  name: COMPONENT_NAME,
  props: {
    file: {
      type: Object,
      default() {
        return {}
      }
    },
    list: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      response: null,
      paused: false,
      error: false,
      averageSpeed: 0,
      currentSpeed: 0,
      isComplete: false,
      isUploading: false,
      size: 0,
      formatedSize: '',
      uploadedSize: 0,
      progress: 0,
      timeRemaining: 0,
      type: '',
      extension: '',
      progressingClass: '',
      successProgressStyle: {
        progress: '100%',
        webkitTransform: 'translateX(0)',
        mozTransform: 'translateX(0)',
        msTransform: 'translateX(0)',
        transform: 'translateX(0)'
      }
    }
  },
  computed: {
    fileCategory() {
      const extension = this.extension
      const isFolder = this.file.isFolder
      let type = isFolder ? 'folder' : 'unknown'
      const categoryMap = this.file.uploader.opts.categoryMap
      const typeMap = categoryMap || {
        image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
        video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
        document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx']
      }
      Object.keys(typeMap).forEach((_type) => {
        const extensions = typeMap[_type]
        if (extensions.indexOf(extension) > -1) {
          type = _type
        }
      })
      return type
    },
    progressStyle() {
      const realProgress = this.progress === 1 ? .99 : this.progress
      const progress = Math.floor(realProgress * 100)
      const style = `translateX(${Math.floor(progress - 100)}%)`
      return {
        progress: `${progress}%`,
        webkitTransform: style,
        mozTransform: style,
        msTransform: style,
        transform: style
      }
    },
    formatedAverageSpeed() {
      return `${Uploader.utils.formatSize(this.averageSpeed)} / s`
    },
    status() {
      const isUploading = this.isUploading
      const isComplete = this.isComplete
      const isError = this.error
      const paused = this.paused
      if (isComplete) {
        return 'success'
      } else if (isError) {
        return 'error'
      } else if (isUploading) {
        return 'uploading'
      } else if (paused) {
        return 'paused'
      } else {
        return 'waiting'
      }
    },
    statusText() {
      const status = this.status
      const fileStatusText = this.file.uploader.fileStatusText
      let txt = status
      if (typeof fileStatusText === 'function') {
        txt = fileStatusText(status, this.response)
      } else {
        txt = fileStatusText[status]
      }
      return txt || status
    },
    formatedTimeRemaining() {
      const timeRemaining = this.timeRemaining
      const file = this.file
      if (timeRemaining === Number.POSITIVE_INFINITY || timeRemaining === 0) {
        return ''
      }
      let parsedTimeRemaining = secondsToStr(timeRemaining)
      const parseTimeRemaining = file.uploader.opts.parseTimeRemaining
      if (parseTimeRemaining) {
        parsedTimeRemaining = parseTimeRemaining(timeRemaining, parsedTimeRemaining)
      }
      return parsedTimeRemaining
    }
  },
  watch: {
    status(newStatus, oldStatus) {
      if (oldStatus && newStatus === 'uploading' && oldStatus !== 'uploading') {
        this.tid = setTimeout(() => {
          this.progressingClass = 'uploader-file-progressing'
        }, 200)
      } else {
        clearTimeout(this.tid)
        this.progressingClass = ''
      }
    }
  },
  methods: {
    _actionCheck() {
      this.paused = this.file.paused
      this.error = this.file.error
      this.isUploading = this.file.isUploading()
    },
    pause() {
      this.file.pause()
      this._actionCheck()
      this._fileProgress()
    },
    resume() {
      this.file.resume()
      this._actionCheck()
    },
    remove() {
      this.file.cancel()
    },
    retry() {
      this.file.retry()
      this._actionCheck()
    },
    processResponse(message) {
      let res = message
      try {
        res = JSON.parse(message)
      } catch (e) { }
      this.response = res
    },
    fileEventsHandler(event, args) {
      const rootFile = args[0]
      const file = args[1]
      const target = this.list ? rootFile : file
      if (this.file === target) {
        if (this.list && event === 'fileSuccess') {
          this.processResponse(args[2])
          return
        }
        this[`_${event}`].apply(this, args)
      }
    },
    _fileProgress() {
      this.progress = this.file.progress()
      this.averageSpeed = this.file.averageSpeed
      this.currentSpeed = this.file.currentSpeed
      this.timeRemaining = this.file.timeRemaining()
      this.uploadedSize = this.file.sizeUploaded()
      this._actionCheck()
    },
    _fileSuccess(rootFile, file, message) {
      if (rootFile) {
        this.processResponse(message)
      }
      this._fileProgress()
      this.error = false
      this.isComplete = true
      this.isUploading = false
    },
    _fileComplete() {
      this._fileSuccess()
    },
    _fileError(rootFile, file, message) {
      this._fileProgress()
      this.processResponse(message)
      this.error = true
      this.isComplete = false
      this.isUploading = false
    }
  },
  mounted() {
    const staticProps = ['paused', 'error', 'averageSpeed', 'currentSpeed']
    const fnProps = [
      'isComplete',
      'isUploading',
      {
        key: 'size',
        fn: 'getSize'
      },
      {
        key: 'formatedSize',
        fn: 'getFormatSize'
      },
      {
        key: 'uploadedSize',
        fn: 'sizeUploaded'
      },
      'progress',
      'timeRemaining',
      {
        key: 'type',
        fn: 'getType'
      },
      {
        key: 'extension',
        fn: 'getExtension'
      }
    ]
    staticProps.forEach(prop => {
      this[prop] = this.file[prop]
    })
    fnProps.forEach((fnProp) => {
      if (typeof fnProp === 'string') {
        this[fnProp] = this.file[fnProp]()
      } else {
        this[fnProp.key] = this.file[fnProp.fn]()
      }
    })

    const handlers = this._handlers = {}
    const eventHandler = (event) => {
      handlers[event] = (...args) => {
        this.fileEventsHandler(event, args)
      }
      return handlers[event]
    }
    events.forEach((event) => {
      this.file.uploader.on(event, eventHandler(event))
    })
  },
  destroyed() {
    events.forEach((event) => {
      this.file.uploader.off(event, this._handlers[event])
    })
    this._handlers = null
  }
}
</script>

<style lang="scss" scoped>
.uploader-file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .uploader-file-actions {
    width: 50px;
    padding-right: 5px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .actions-icon {
      color: #606266;
      opacity: 0.8;
      cursor: pointer;
      margin-left: 6px;
      font-size: 14px;
      display: block;
    }
    .el-icon-close {
      display: block;
      position: static;
    }
  }
  .uploader-file-status {
    width: 150px !important;
    text-indent: 10px !important;
    em {
      margin: 0 5px;
    }
  }
}
.uploader-file-name {
  width: calc(100% - 200px);
  text-indent: 0px !important;
  padding-left: 4px;
  padding-right: 10px;
  .el-icon-paperclip {
    margin-right: 7px;
    line-height: 25px;
  }
}
.uploader-file-size {
  width: 13%;
  text-indent: 10px;
}
.uploader-file-meta {
  width: 8%;
}
</style>