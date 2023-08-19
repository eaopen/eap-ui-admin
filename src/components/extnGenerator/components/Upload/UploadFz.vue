<template>
  <div class="UploadFile-container">
    <template v-if="!detailed">
      <el-button size="small" icon="el-icon-upload" @click="uploadFile" :disabled="disabled">
        {{buttonText}}
      </el-button>
      <a type="text" @click="downloadAll" style="float:right;" v-if="fileList.length"
        class="el-button el-button--text el-button--small"><i class="el-icon-download"></i>全部下载</a>
    </template>
    <template v-if="fileList.length">
      <ul class="el-upload-list el-upload-list el-upload-list--text">
        <li class="el-upload-list__item is-success" v-for="(file,index) in fileList"
          :key="file.fileId" :class="{'el-upload-list__item_detail':detailed}">
          <a class="el-upload-list__item-name" :style="{'color': !showIcon?'#409eff':''}"
            :title="file.name+(file.fileSize?`（${jnpf.toFileSize(file.fileSize)}）`:'')">
            <i class="el-icon-paperclip" v-if="showIcon"></i>
            {{file.name}}{{file.fileSize?`（${jnpf.toFileSize(file.fileSize)}）`:''}}
          </a>
          <i class="el-icon-view" title="查看" @click="handlePreview(file)"></i>
          <i class="el-icon-download" title="下载" @click="handleClick(file)"></i>
          <label class="el-upload-list__item-status-label" :class="{'disabled':disabled}">
            <i class="el-icon-upload-success el-icon-circle-check"></i>
          </label>
          <i class="el-icon-close" title="删除" v-if="!disabled" @click="handleRemove(index)"></i>
        </li>
      </ul>
    </template>
    <template>
      <div class="el-upload__tip" v-if="tipText">
        {{ tipText }}
      </div>
    </template>
    <fileUploader ref="fileUploader" v-bind="$props" @fileSuccess="fileSuccess" />
    <Preview :visible.sync="previewVisible" :file="activeFile" />
  </div>
</template>

<script>
import { getDownloadUrl, getPackDownloadUrl } from '@/api/extn/common'
import Preview from './Preview'
import FileUploader from './vue-simple-uploader/fileUploader'
export default {
  name: 'UploadFile',
  components: { Preview, FileUploader },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'annex'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    showTip: {
      type: Boolean,
      default: false
    },
    detailed: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 0
    },
    accept: {
      type: String,
      default: '*'
    },
    buttonText: {
      type: String,
      default: '选择文件'
    },
    sizeUnit: {
      type: String,
      default: 'MB'
    },
    pathType: {
      type: String,
      default: 'defaultPath'
    },
    isAccount: {
      type: Number,
      default: 0
    },
    folder: {
      type: String,
      default: ''
    },
    fileSize: {
      default: 10
    },
    tipText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fileList: [],
      previewVisible: false,
      activeFile: {},
    }
  },
  computed: {
    acceptText() {
      let txt = ''
      if (this.accept.includes('image/*')) {
        txt += '、图片'
      }
      if (this.accept.includes('video/*')) {
        txt += '、视频'
      }
      if (this.accept.includes('audio/*')) {
        txt += '、音频'
      }
      if (this.accept.includes('.xls,.xlsx')) {
        txt += '、excel'
      }
      if (this.accept.includes('.doc,.docx')) {
        txt += '、word'
      }
      if (this.accept.includes('.pdf')) {
        txt += '、pdf'
      }
      if (this.accept.includes('.txt')) {
        txt += '、txt'
      }
      return txt.slice(1)
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.fileList = Array.isArray(val) ? val : []
      }
    }
  },
  methods: {
    handleRemove(index) {
      this.fileList.splice(index, 1)
      this.$emit("input", this.fileList)
      this.$emit('change', this.fileList)
    },
    handleClick(file) {
      // 点击下载文件
      if (!file.fileId) return
      getDownloadUrl(this.type, file.fileId).then(res => {
        this.jnpf.downloadFile(res.data.url, file.name)
      })
    },
    handlePreview(file) {
      this.activeFile = file
      this.previewVisible = true
    },
    uploadFile() {
      const isTopLimit = this.limit ? this.value.length >= this.limit : false
      if (isTopLimit) {
        this.$message.error(`当前限制最多可以上传${this.limit}个文件`)
        return false
      }
      this.$refs.fileUploader && this.$refs.fileUploader.openUploader()
    },
    fileSuccess(data) {
      const isTopLimit = this.limit ? this.value.length >= this.limit : false
      if (isTopLimit) {
        this.$message.error(`当前限制最多可以上传${this.limit}个文件`)
        return false
      }
      this.fileList.push(data)
      this.$emit('input', this.fileList)
      this.$emit('change', this.fileList)
    },
    downloadAll() { //下载全部（打包下载）
      if (!this.fileList.length) {
        this.$message.error('未发现文件')
        return
      }
      let fileInfo = [];
      for (let i = 0, len = this.fileList.length; i < len; i++) {
        fileInfo.push({ fileId: this.fileList[i].fileId, fileName: this.fileList[i].name })
      }
      getPackDownloadUrl(this.type, fileInfo).then(res => {
        this.jnpf.downloadFile(res.data.downloadVo.url, res.data.downloadName)
      })

    }
  }
}
</script>
<style lang="scss" scoped>
.UploadFile-container {
  position: relative;
  .el-upload__tip {
    line-height: 1.2;
    color: #a5a5a5;
    margin-top: 5px;
    word-break: break-all;
  }
}
.el-upload-list__item {
  &.el-upload-list__item_detail:first-child {
    margin-top: 5px !important;
  }
  .el-upload-list__item-name {
    margin-right: 70px;
  }
  &:hover {
    .el-upload-list__item-status-label.disabled {
      display: block !important;
    }
  }
  .el-icon-download {
    display: inline-block;
    position: absolute;
    top: 5px;
    right: 25px;
    cursor: pointer;
    opacity: 0.75;
    color: #606266;
  }
  .el-icon-view {
    display: inline-block;
    position: absolute;
    top: 5px;
    right: 45px;
    cursor: pointer;
    opacity: 0.75;
    color: #606266;
  }
}
</style>
