<template>
  <div>
    <el-image v-if="file.fileExtension && imgTypeList.includes(file.fileExtension)"
      style="width: 0; height: 0" :src="define.comUrl+file.url"
      :preview-src-list="[define.comUrl+file.url]" ref="imageRef">
    </el-image>
    <el-dialog v-else v-bind="$attrs" :close-on-click-modal="false" :modal-append-to-body="false"
      v-on="$listeners" fullscreen lock-scroll class="OBPM-full-dialog" append-to-body
      :show-close="false" :modal="false">
      <div class="OBPM-full-dialog-header">
        <div class="header-title">
          <p class="header-txt">{{title}}</p>
        </div>
        <div class="options">
          <el-form>
            <el-button v-if="showDownload" type="primary" @click="handleDownload">下载</el-button>
            <el-button @click="goBack()" :disabled="false">{{$t('common.cancelButton')}}</el-button>
          </el-form>
        </div>
      </div>
      <div class="main">
        <div class="content">
          <iframe width="100%" height="100%" :src="url" frameborder="0"></iframe>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { PreviewFile } from '@/api/extn/common'
import { getDownloadUrl } from '@/api/extn/common'
export default {
  props: {
    'file': {},
    'showDownload': {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      url: '',
      imgTypeList: ['png', 'jpg', 'jpeg', 'bmp', 'gif']
    }
  },
  watch: {
    $attrs: {
      handler: function (val) {
        if (val.visible) {
          if (this.file.fileExtension && this.imgTypeList.includes(this.file.fileExtension)) {
            this.$nextTick(() => {
              this.$refs.imageRef.clickHandler()
              this.$emit('update:visible', false)
            })
          } else {
            this.$nextTick(() => {
              this.onOpen()
            })
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    goBack() {
      this.$emit('update:visible', false)
    },
    onOpen() {
      this.title = '文档预览 - ' + this.file.name
      this.url = ''
      let query = {
        fileName: this.file.fileId,
        fileVersionId: this.file.fileVersionId,
        fileDownloadUrl: this.file.url
      }
      PreviewFile(query).then(res => {
        if (res.data) {
          this.url = res.data + '&token=' + this.$store.getters.token
        } else {
          this.$message.warning('文件不存在')
          this.goBack()
        }
      })
    },
    handleDownload() {
      if (!this.file.fileId) return
      if (this.file.url) {
        let arr = this.file.url.split("\/")
        this.type = arr[arr.length - 2]
      }
      getDownloadUrl(this.type, this.file.fileId).then(res => {
        this.jnpf.downloadFile(res.data.url, this.file.name)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.content {
  width: 100%;
  height: 100%;
  background: #fff;
}
</style>