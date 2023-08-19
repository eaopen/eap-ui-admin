<template>
  <el-dialog title="发送测试" :close-on-click-modal="false" :append-to-body="true"
    :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center" lock-scroll width="500px">
    <el-form ref="testForm" label-width="100px" :model="testForm" :rules="dataRule">
      <el-form-item label="收件邮箱" prop="testSendEmail">
        <user-select v-model="testForm.testSendEmail" placeholder="收件人" :multiple="false" />
      </el-form-item>
      <el-form-item label="邮件标题" prop="testEmailTitle">
        <el-input placeholder="邮件标题" v-model="testForm.testEmailTitle" clearable />
      </el-form-item>
      <el-form-item label="邮件内容" prop="testEmailContent">
        <el-input placeholder="邮件内容" v-model="testForm.testEmailContent" clearable />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" :loading="btnLoading" @click="testSubmit()">
        {{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {
  testConfig
} from '@/api/extn/accountConfig'
export default {
  data() {
    return {
      visible: false,
      testForm: {
        testSendEmail: "",
        testEmailTitle: "",
        testEmailContent: ""
      },
      dataForm: {},
      btnLoading: false,
      dataRule: {
        testSendEmail: [
          { required: true, message: '请选择收件人', trigger: 'click' },
        ],
        testEmailTitle: [
          { required: true, message: '请输入邮件标题', trigger: 'blur' },
          { max: 50, message: '编码最多为50个字符！', trigger: 'blur' }
        ],
        testEmailContent: [
          { required: true, message: '请输入邮件内容', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init(data) {
      this.visible = true
      this.dataForm = data
      this.testForm.testSendEmail = '';
      this.testForm.testEmailTitle = '测试';
      this.testForm.testEmailContent = '测试';
      this.$nextTick(() => {
        this.$refs['testForm'].resetFields()
      })
    },
    testSubmit() {
      this.$refs['testForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          let query = {
            ...this.testForm,
            ...this.dataForm,
            type: 2
          }
          query.testSendEmail = [query.testSendEmail]
          testConfig(query, 'testSendMail').then(res => {
            this.$message({
              type: 'success',
              message: res.msg,
              duration: 1000,
              onClose: () => {
                this.btnLoading = false
              }
            });
          }).catch(() => {
            this.btnLoading = false
          })
        }
      })
    }
  }
}
</script>
