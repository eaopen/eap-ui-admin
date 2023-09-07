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
      <jnpf-form-tip-item label="AgentId" prop="agentId" tip-label="请在“钉钉开发者后台-应用开发-应用信息”页中获得">
        <el-input v-model="dataForm.agentId" placeholder="请输入AgentId" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="Appkey" prop="appId" tip-label="请在“钉钉开发者后台-应用开发-应用信息”页中获得">
        <el-input v-model="dataForm.appId" placeholder="请输入Appkey" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="AppSecret" prop="appSecret" tip-label="请在“钉钉开发者后台-应用开发-应用信息”页中获得">
        <el-input v-model="dataForm.appSecret" placeholder="请输入AppSecret" clearable show-password>
          <el-button slot="append" :disabled="btnLoading" @click="sendTest()">测试
          </el-button>
        </el-input>
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="排序" prop="sort">
        <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
          controls-position="right" />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="状态" prop="status">
        <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="说明" prop="remark">
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
        agentId: '',
        appId: '',
        appSecret: '',
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
        agentId: [
          { required: true, message: '请输入AgentId', trigger: 'blur' },
        ],
        appId: [
          { required: true, message: '请输入Appkey', trigger: 'blur' }
        ],
        appSecret: [
          { required: true, message: '请输入AppSecret', trigger: 'blur' }
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
        this.dataForm.sortCode = 0
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
            type: 4
          }
          testConfig(query, 'testDingTalkConnect').then(res => {
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
          this.btnLoading = true
          let query = {
            ...this.dataForm,
            type: 4
          }
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
