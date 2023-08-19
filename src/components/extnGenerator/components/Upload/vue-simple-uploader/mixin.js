import Vue from 'vue'
import uploader from 'vue-simple-uploader'
import SparkMD5 from 'spark-md5';
import FileItem from './fileItem'

Vue.use(uploader)
export default {
  components: { FileItem },
  data() {
    return {
      options: {
        target: this.define.comUrl + '/api/file/chunk',
        chunkSize: 1024 * 1024 * 5,
        maxChunkRetries: 5,
        singleFile: this.limit === 1,
        testChunks: true, //是否开启服务器分片校验
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: function (chunk, message) {
          const objMessage = JSON.parse(message)
          if (objMessage.code === 200) {
            if (objMessage.data.uploaded) {
              return true
            }
            const chunkNumbers = objMessage.data.chunkNumbers
            return (chunkNumbers || []).indexOf(chunk.offset + 1) >= 0
          } else {
            return true
          }
        },
        headers: {
          Authorization: this.$store.getters.token
        },
        query: {
          fileType: '',
          extension: ''
        }
      },
      attrs: {
        accept: this.accept || '*'
      },
      statusText: {
        success: '上传成功',
        error: '上传失败',
        uploading: '上传中',
        paused: '暂停中',
        waiting: '等待中'
      },
      panelShow: false, //选择文件后，展示上传panel
    }
  },
  watch: {
    limit(val) {
      this.options.singleFile = val === 1
    },
    accept(val) {
      this.attrs.accept = val ? val : '*'
    }
  },
  computed: {
    //Uploader实例
    uploader() {
      return this.$refs.uploader.uploader;
    }
  },
  methods: {
    openUploader() {
      this.$refs.uploadBtn.$el.click()
    },
    onFileAdded(file) {
      if (this.beforeUpload && typeof this.beforeUpload === "function") {
        if (!this.beforeUpload(file)) return file.cancel()
      }
      // 自定义状态
      file.customStatus = 'check'
      this.panelShow = true;
      this.options.query.fileType = file.fileType
      this.options.query.extension = file.getExtension()
      this.computeMD5(file);
    },
    onFileProgress(rootFile, file, chunk) {
      // console.log(`上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${chunk.endByte / 1024 / 1024}`)
    },
    onFileError(rootFile, file, response, chunk) {
      file.cancel()
      this.$message.error(`上传失败`)
    },
    onFileSuccess(rootFile, file, response, chunk) {
      const res = JSON.parse(response)
      if (res.code != 200) {
        this.$message.error(res.msg)
        file.cancel()
        return
      }
      setTimeout(() => {
        // 秒传 直接展示
        if (res.data.uploaded) {
          // 秒传结果
        } else if (res.data.merge) {
          // 需要合并
          this.handelSuccess(file)
        } else {
          // 上传错误
          console.log(res.msg)
        }
      }, 300);
    },
    /**
     * 计算md5，实现断点续传及秒传
     * @param file
     */
    computeMD5(file) {
      let _this = this
      const fileReader = new FileReader()
      const time = new Date().getTime()
      const blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice
      let currentChunk = 0
      const chunkSize = 10 * 1024 * 1000
      const chunks = Math.ceil(file.size / chunkSize)
      const spark = new SparkMD5.ArrayBuffer()

      file.pause()
      loadNext()

      fileReader.onload = e => {
        spark.append(e.target.result)
        if (currentChunk < chunks) {
          currentChunk++
          loadNext()
          // 实时展示MD5的计算进度
          this.$nextTick(() => {
            // $(`.myStatus_${file.id}`).text('正在校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%')
          })
        } else {
          const md5 = spark.end()
          this.computeMD5Success(md5, file)
          // console.log(
          //   `MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size
          //   } 用时：${new Date().getTime() - time} ms`
          // )
        }
      }
      fileReader.onerror = function () {
        _this.$message.error(`文件${file.name}读取出错，请检查该文件`)
        file.cancel()
      }

      function loadNext() {
        const start = currentChunk * chunkSize
        const end =
          start + chunkSize >= file.size ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
    },
    computeMD5Success(md5, file) {
      file.uniqueIdentifier = md5 // 把md5值作为文件的识别码
      file.customStatus = 'uploading'
      file.resume() // 开始上传
    },
    close() {
      this.uploader.cancel();
      this.panelShow = false;
    },
    onComplete() {
      // this.uploader.cancel();
      // this.panelShow = false;
    }
  }
}