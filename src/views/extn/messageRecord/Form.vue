<template>
  <el-dialog title="查看消息" :close-on-click-modal="false" :visible.sync="visible"
    class="OBPM-dialog OBPM-dialog_center OBPM-dialog-notice" lock-scroll width="80%"
    append-to-body>
    <div class="notice-wrapper" v-loading="loading">
      <h1 class="title">{{info.title}}</h1>
      <div class="info">
        <span>{{info.releaseTime|toDate()}}</span><span>{{info.releaseUser}}</span>
      </div>
      <div class="main" v-html="info.bodyText"></div>
      <div class="file-list" v-if="files.length">
        <JNPF-UploadFz v-model="files" disabled detailed />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { ReadInfo } from '@/api/extn/cache'
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
