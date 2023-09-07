<template>
  <el-dialog :title="!dataForm.id ? '新建' : '编辑'" :close-on-click-modal="false"
    :visible.sync="visible" class="OBPM-dialog JNPF-dialog_center" lock-scroll width="600px">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" v-loading="formLoading"
      label-width="120px">
      <jnpf-form-tip-item label="名称" prop="fullName">
        <el-input v-model="dataForm.fullName" placeholder="请输入名称" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="编码" prop="enCode">
        <el-input v-model="dataForm.enCode" placeholder="请输入编码" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="原始ID" prop="appKey" tip-label="请在“微信公众号管理后台-设置与开发-公众号设置”页中获得">
        <el-input v-model="dataForm.appKey" placeholder="请输入原始ID" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="AppID" prop="appId" tip-label="请在“微信公众号管理后台-设置与开发-基本配置”页中获得">
        <el-input v-model="dataForm.appId" placeholder="请输入AppID" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="Secret" prop="appSecret" tip-label="请在“微信公众号管理后台-设置与开发-基本配置”页中获得">
        <el-input v-model="dataForm.appSecret" placeholder="请输入Secret" clearable show-password />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="排序" prop="sortCode">
        <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
          controls-position="right" />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="状态" prop="enabledMark">
        <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="说明" prop="description">
        <el-input v-model="dataForm.description" type="textarea" :rows="3" />
      </jnpf-form-tip-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <!-- <el-button type="primary" :loading="testBtnLoading" :disabled="btnLoading"
        @click="sendTest()">测试</el-button> -->
      <el-button @click="visible = false">{{$t('common.cancelBtn')}}</el-button>
      <el-button type="primary" :loading="btnLoading" :disabled="testBtnLoading"
        @click="dataFormSubmit()">
        {{$t('common.confirmBtn')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  createConfig,
  updateConfig,
  getConfigDetail,
  testConfig
} from '@/api/extn/accountConfig'
export default {
  data() {
    return {
      visible: false,
      formLoading: false,
      btnLoading: false,
      testBtnLoading: false,
      dataForm: {
        fullName: '',
        enCode: '',
        appKey: "",
        appId: "",
        appSecret: "",
        sortCode: 0,
        enabledMark: 1,
        description: ''
      },
      categoryList: [],
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
        appKey: [
          { required: true, message: '请输入原始ID', trigger: 'blur' },
        ],
        appId: [
          { required: true, message: '请输入AppID', trigger: 'blur' }
        ],
        appSecret: [
          { required: true, message: '请输入Secret', trigger: 'blur' }
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
          this.testBtnLoading = true
          let query = {
            ...this.dataForm,
            type: 7
          }
          testConfig(query, 'testQyWebChatConnect').then(res => {
            this.$message({
              type: 'success',
              message: res.msg,
              duration: 1000,
              onClose: () => {
                this.testBtnLoading = false
              }
            });
          }).catch(() => {
            this.testBtnLoading = false
          })
        }
      })
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let query = {
            ...this.dataForm,
            type: 7
          }
          this.btnLoading = true
          const formMethod = this.dataForm.id ? updateConfig : createConfig
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
