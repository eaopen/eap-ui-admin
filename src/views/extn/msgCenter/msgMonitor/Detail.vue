<template>
  <el-dialog title="查看" :close-on-click-modal="false" :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body width='600px'>
    <el-form :model="detailForm" label-width="100px" v-loading="loading">
      <el-form-item label="账号名称" prop="accountName" v-if="detailForm.accountName">
        <p>{{detailForm.accountName}}</p>
      </el-form-item>
      <el-form-item label="账号编码" prop="accountCode" v-if="detailForm.accountCode">
        <p>{{detailForm.accountCode}}</p>
      </el-form-item>
      <el-form-item label="消息来源" prop="accountCode">
        <p>{{detailForm.messageSource}}</p>
      </el-form-item>
      <el-form-item label="消息类型" prop="messageType">
        <p>{{detailForm.messageType}}</p>
      </el-form-item>
      <el-form-item label="发送时间" prop="sendTime">
        <p>{{detailForm.sendTime|toDate()}}</p>
      </el-form-item>
      <el-form-item label="接收人" prop="receiveUser">
        <p>{{detailForm.receiveUser}}</p>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <p>{{detailForm.title}}</p>
      </el-form-item>
      <el-form-item label="内容" prop="fieldName">
        <p class="content" v-html="detailForm.content"></p>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false" size="small">{{$t('common.cancelButton')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getMsgMonitorDetail } from '@/api/extn/msgMonitor'
export default {
  name: 'msgMonitor-Form',
  data() {
    return {
      detailForm: {},
      visible: false,
      loading: false
    }
  },
  methods: {
    init(id) {
      this.visible = true
      this.loading = true
      getMsgMonitorDetail(id).then((res) => {
        this.loading = false
        this.detailForm = res.data
      }).catch(() => {
        this.loading = false
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.JNPF-dialog {
  p {
    color: #999;
  }
  .content {
    >>> img {
      width: 100%;
    }
  }
}
</style>