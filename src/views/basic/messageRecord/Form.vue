<template>
  <el-dialog title="查看消息" :close-on-click-modal="false" :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center JNPF-dialog-notice" lock-scroll width="80%"
    append-to-body>
    <div class="notice-wrapper" v-loading="loading">
      <div class="notice-hd">
        <h1 class="title">{{info.title}}</h1>
        <div class="info">
          <span>{{info.releaseTime|toDate()}}</span><span>{{info.releaseUser}}</span>
        </div>
      </div>
      <p class="excerpt">{{ info.excerpt }}</p>
      <div class="main" v-html="info.bodyText"></div>
      <div class="file-list" v-if="files.length">
        <JNPF-UploadFz v-model="files" disabled detailed />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { ReadInfo } from '@/api/system/message'
export default {
  data() {
    return {
      visible: false,
      loading: false,
      files: [],
      info: {}
    }
  },
  methods: {
    init(id) {
      this.visible = true
      this.loading = true
      ReadInfo(id).then(res => {
        this.info = res.data
        this.files = res.data.files ? JSON.parse(res.data.files) : []
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.main >>> a {
  color: #06c !important;
}
.main {
  margin-top: 0px !important;
}
.notice-wrapper {
  .notice-hd {
    padding: 24px 0;
    .title {
      color: #303133;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .info {
      color: #606266;
      padding-bottom: 24px;
      line-height: normal;
    }
  }
  .excerpt {
    color: #303133;
    margin-bottom: 8px !important;
  }
}
</style>
