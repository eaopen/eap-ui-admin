<template>
  <div id="common-file-uploader" :class="{'hasDefault': !!value.length}">
    <uploader ref="uploader" :options="options" :autoStart="false" @file-added="onFileAdded"
      @file-success="onFileSuccess" @file-progress="onFileProgress" @file-error="onFileError"
      class="uploader-app" @complete="onComplete" :file-status-text="statusText">
      <uploader-unsupport></uploader-unsupport>
      <uploader-btn id="file-uploader-btn" ref="uploadBtn" :attrs="attrs">选择文件</uploader-btn>
      <uploader-list>
        <template slot-scope="{ fileList }">
          <ul class="el-upload-list el-upload-list el-upload-list--text">
            <li class="el-upload-list__item" v-for="file in fileList" :key="file.id">
              <uploader-file :class="'file_' + file.id" ref="files" :file="file" :list="true">
                <template slot-scope="props">
                  <FileItem :file="props.file" :list="props.list" />
                </template>
              </uploader-file>
            </li>
          </ul>
        </template>
      </uploader-list>
    </uploader>
  </div>
</template>

<script>
import { chunkMerge } from '@/api/common'
import uploadMixin from '@/components/Generator/components/Upload/vue-simple-uploader/mixin'

const units = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024
}

export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'annex'
    },
    limit: {
      type: Number,
      default: 0
    },
    accept: {
      type: String,
      default: '*'
    },
    sizeUnit: {
      type: String,
      default: 'MB'
    },
    fileSize: {
      default: 5
    }
  },
  mixins: [uploadMixin],
  data() {
    return {

    }
  },
  computed: {
    acceptText() {
      let txt = ''
      switch (this.accept) {
        case 'image/*':
          txt = '图片'
          break;
        case 'video/*':
          txt = '视频'
          break;
        case 'audio/*':
          txt = '音频'
          break;
        case '.xls,.xlsx':
          txt = 'excel'
          break;
        case '.doc,.docx':
          txt = 'word'
          break;
        case '.pdf':
          txt = 'pdf'
          break;
        case '.txt':
          txt = 'txt'
          break;
        default:
          txt = ''
          break;
      }
      return txt
    },
  },
  methods: {
    beforeUpload(file) {
      const isTopLimit = this.limit ? this.value.length >= this.limit : false
      if (isTopLimit) {
        this.$message.error(`当前限制最多可以上传${this.limit}个文件`)
        return false
      }
      const unitNum = units[this.sizeUnit]
      let isRightSize = this.fileSize ? file.size / unitNum < this.fileSize : true
      if (!isRightSize) {
        this.$message.error(`文件大小超过${this.fileSize}${this.sizeUnit}`)
        return isRightSize
      }
      let extension = file.getExtension()
      let isAccept = this.accept.indexOf(extension) > -1
      if (!isAccept) {
        this.$message.error(`请选择${this.accept}类型的文件`)
        return isAccept
      }
      return true
    },
    handelSuccess(file) {
      const form = new FormData()
      form.append('identifier', file.uniqueIdentifier)
      form.append('fileName', file.name)
      form.append('fileSize', file.size)
      form.append('fileType', file.getType())
      form.append('extension', file.getExtension())
      form.append('type', this.type)
      chunkMerge(form).then(res => {
        // 自定义完成状态
        this.$set(file, 'customCompleted', true)
        let data = {
          name: file.name,
          fileId: res.data.name,
          fileSize: res.data.fileSize,
          fileExtension: res.data.fileExtension,
          fileVersionId: res.data.fileVersionId,
          url: res.data.url
        }
        this.$emit('fileSuccess', data)
        file.cancel()
      }).catch(() => {
        file.cancel()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#common-file-uploader {
  margin: 0;
  padding: 0;
  font-size: 0;
  &.hasDefault {
    .el-upload-list__item:first-child {
      margin-top: 5px;
    }
  }
  .el-upload-list {
    >>> .uploader-file {
      border-bottom: none;
      height: 25px !important;
      line-height: 25px;
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
  >>> .uploader-file-icon {
    &:before {
      content: '' !important;
    }
  }
  >>> .uploader-file-actions > span {
    margin-right: 6px;
  }
}
/* 隐藏上传按钮 */
#file-uploader-btn {
  position: absolute;
  clip: rect(0, 0, 0, 0);
}
</style>