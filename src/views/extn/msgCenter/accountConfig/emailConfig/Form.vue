<template>
  <el-dialog :title="!dataForm.id ? '新建' : '编辑'" :close-on-click-modal="false"
    :visible.sync="visible" class="OBPM-dialog JNPF-dialog_center" lock-scroll width="600px">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" v-loading="formLoading"
      label-width="140px">
      <el-form-item label="名称" prop="fullName">
        <el-input v-model="dataForm.fullName" placeholder="请输入名称" clearable />
      </el-form-item>
      <el-form-item label="编码" prop="enCode">
        <el-input v-model="dataForm.enCode" placeholder="请输入编码" clearable />
      </el-form-item>
      <el-form-item label="发件人昵称" prop="addressorName">
        <el-input v-model="dataForm.addressorName" placeholder="请输入发件人昵称" clearable />
      </el-form-item>
      <el-form-item label="SMTP服务器" prop="smtpServer">
        <el-input v-model="dataForm.smtpServer" placeholder="请输入SMTP服务器" clearable />
      </el-form-item>
      <el-form-item label="SMTP端口" prop="smtpPort">
        <el-input-number :min="0" :max="999999" v-model="dataForm.smtpPort"
          controls-position="right" />
      </el-form-item>
      <el-form-item label="SSL安全连接" prop="sslLink">
        <el-switch v-model="dataForm.sslLink" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="SMTP用户名" prop="smtpUser">
        <el-input v-model="dataForm.smtpUser" placeholder="请输入SMTP用户名" clearable />
      </el-form-item>
      <el-form-item label="SMTP密码" prop="smtpPassword">
        <el-input v-model="dataForm.smtpPassword" placeholder="请输入SMTP密码" clearable show-password>
          <el-button slot="append" :disabled="btnLoading" @click="sendTest()">测试
          </el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sortCode">
        <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
          controls-position="right" />
      </el-form-item>
      <el-form-item label="状态" prop="enabledMark">
        <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="说明" prop="description">
        <el-input v-model="dataForm.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <!-- <el-button type="primary" :disabled="btnLoading" @click="sendTest()">
        {{'测试'}}</el-button> -->
      <el-button @click="visible = false">{{$t('common.cancelBtn')}}</el-button>
      <el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
        {{$t('common.confirmBtn')}}</el-button>
    </span>
    <TestForm v-if="TestFormVisible" ref="TestForm" />
  </el-dialog>

</template>

<script>
import {
  createConfig,
  updateConfig,
  getConfigDetail
} from '@/api/extn/accountConfig'
import TestForm from './SendTestForm'
export default {
  components: {
    TestForm
  },
  data() {
    return {
      TestFormVisible: false,
      visible: false,
      formLoading: false,
      btnLoading: false,
      dataForm: {
        fullName: '',
        enCode: '',
        addressorName: '',
        smtpServer: '',
        smtpPort: '25',
        sslLink: 0,
        smtpUser: '',
        smtpPassword: '',
        sortCode: 0,
        enabledMark: 1,
        description: ''
      },
      dataRule: {
        fullName: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { max: 50, message: '名称最多为50个字符！', trigger: 'blur' }
        ],
        enCode: [
          { required: true, message: '请输入编码', trigger: 'blur' },
          { max: 50, message: '编码最多为50个字符！', trigger: 'blur' },
          { validator: this.formValidate('enCode'), trigger: 'blur' },
        ],
        addressorName: [
          { required: true, message: '请输入发件人昵称', trigger: 'blur' }
        ],
        smtpServer: [
          { required: true, message: '请输入SMTP服务器', trigger: 'blur' }
        ],
        smtpPort: [
          { required: true, message: '请输入SMTP端口', trigger: 'blur' }
        ],
        smtpUser: [
          { required: true, message: '请输入SMTP用户名', trigger: 'blur' }
        ],
        smtpPassword: [
          { required: true, message: '请输入SMTP密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init(id) {
      this.dataForm.id = id || ''
      this.visible = true
      this.formLoading = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          getConfigDetail(this.dataForm.id).then(res => {
            this.dataForm = res.data
          })
        }
      })
      this.formLoading = false
    },
    sendTest() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let query = {
            ...this.dataForm,
            type: 2
          }
          this.TestFormVisible = true
          this.$nextTick(() => {
            this.$refs.TestForm.init(query)
          })
        }
      })

    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let query = {
            ...this.dataForm,
            type: 2
          }
          this.btnLoading = true
          const formMethod = query.id ? updateConfig : createConfig
          formMethod(query).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.btnLoading = false
                this.$emit('refreshDataList')
              }
            })
          }).catch(() => {
            this.btnLoading = false
          })
        }
      })
    }
  }
}
</script>
