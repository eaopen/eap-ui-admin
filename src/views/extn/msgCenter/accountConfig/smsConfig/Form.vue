<template>
  <el-dialog :title="!dataForm.id ? '新建' : '编辑'" :close-on-click-modal="false"
    :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center" lock-scroll width="600px">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" v-loading="formLoading"
      label-width="160px">
      <jnpf-form-tip-item label="名称" prop="fullName">
        <el-input v-model="dataForm.fullName" placeholder="请输入名称" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="编码" prop="enCode">
        <el-input v-model="dataForm.enCode" placeholder="请输入编码" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="渠道" prop="channel">
        <el-select v-model="dataForm.channel" placeholder="请选择渠道" clearable @change="channelVal"
          filterable>
          <el-option v-for="item in channelList" :label="item.fullName" :value="item.id"
            :key="item.value" />
        </el-select>
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="短信签名" prop="smsSignature" tip-label="选择国内消息或国际/港澳台消息，在“签名管理”⻚中获取">
        <el-input v-model="dataForm.smsSignature" placeholder="请输入短信签名" clearable />
      </jnpf-form-tip-item>
      <template v-if="dataForm.channel == 1">
        <jnpf-form-tip-item label="AccessKey ID" prop="appId"
          tip-label="请在“阿里云的AccessKey管理-安全信息管理”页中获得">
          <el-input v-model="dataForm.appId" placeholder="请输入AccessKey ID" clearable />
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="AccessKey Secret" prop="appSecret"
          tip-label="请在”阿里云的AccessKey管理-安全信息管理”页中获得">
          <el-input v-model="dataForm.appSecret" placeholder="请输入AccessKey Secret" show-password
            clearable />
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="EndPoint" prop="endPoint"
          tip-label="请在“阿里云的短信服务-OpenAPI Explorer-Region&Endpoint”页中获得">
          <el-input v-model="dataForm.endPoint" placeholder="请输入EndPoint" clearable />
        </jnpf-form-tip-item>
      </template>
      <template v-if="dataForm.channel == 2">
        <jnpf-form-tip-item label="SecretId" prop="secretId"
          tip-label="请在”腾讯云的访问管理-访问密钥- API密钥管理”⻚中获得">
          <el-input v-model.number="dataForm.secretId" placeholder="请输入SecretId" clearable />
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="SecretKey" prop="secretKey"
          tip-label="请在“腾讯云的访问管理-访问密钥- API密钥管理”⻚中获得">
          <el-input v-model="dataForm.secretKey" placeholder="请输入SecretKey" clearable
            show-password />
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="SDK AppID" prop="sdkAppId" tip-label="请在”腾讯云的应⽤管理-应⽤列表”⻚中获得">
          <el-input v-model="dataForm.sdkAppId" placeholder="请输入SDK AppID" clearable
            show-password />
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="App Key" prop="appKey" tip-label="请在”腾讯云的应⽤管理-应⽤列表”⻚中获得">
          <el-input v-model="dataForm.appKey" placeholder="App Key" clearable show-password />
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="地域域名" prop="zoneName" tip-label="默认是国内地域域名,也⽀持指定其它地域域名">
          <el-input v-model="dataForm.zoneName" placeholder="请输入地域域名" clearable />
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="地域参数" prop="zoneParam" tip-label="默认是国内地域参数,也⽀持指定其它地域参数">
          <el-input v-model="dataForm.zoneParam" placeholder="请输入地域参数" clearable />
        </jnpf-form-tip-item>
      </template>
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
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
        {{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  createConfig,
  updateConfig,
  getConfigDetail
} from '@/api/extn/accountConfig'
export default {
  data() {
    return {
      channelList: [],
      visible: false,
      formLoading: false,
      btnLoading: false,
      dataForm: {
        fullName: '',
        enCode: '',
        channel: 1,
        appId: '',
        appSecret: '',
        sdkAppId: '',
        appKey: '',
        zoneName: '',
        zoneParam: '',
        endPoint: '',
        sortCode: 0,
        enabledMark: 1,
        description: '',
        secretId: '',
        secretKey: '',
        smsSignature: '',
        selectIndex: 1
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
        channel: [
          { required: true, message: '请选择渠道', trigger: 'change' },
        ],
        appId: [
          { required: true, message: '请输入AccessKey ID', trigger: 'blur' }
        ],
        appSecret: [
          { required: true, message: '请输入AccessKey Secret', trigger: 'blur' }
        ],
        endPoint: [
          { required: true, message: '请输入EndPoint', trigger: 'blur' }
        ],
        smsSignature: [
          { required: true, message: '请输入短信签名', trigger: 'blur' },
        ],
        secretId: [
          { required: true, message: '请输入SecretId', trigger: 'blur' }
        ],
        secretKey: [
          { required: true, message: '请输入SecretKey', trigger: 'blur' }
        ],
        sdkAppId: [
          { required: true, message: '请输入SDK AppID', trigger: 'blur' }
        ],
        appKey: [
          { required: true, message: '请输入App Key', trigger: 'blur' }
        ],
        zoneName: [
          { required: true, message: '请输入地域域名', trigger: 'blur' }
        ],
        zoneParam: [
          { required: true, message: '请输入地域参数', trigger: 'blur' }
        ],
      }
    }
  },
  methods: {
    init(id, data) {
      this.dataForm.id = id || ''
      this.visible = true
      this.formLoading = true
      this.channelList = data
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.dataForm.appId = "";
        this.dataForm.appSecret = "";
        this.dataForm.endPoint = "";
        this.dataForm.secretId = "";
        this.dataForm.secretKey = "";
        this.dataForm.appKey = "";
        this.dataForm.sdkAppId = "";
        this.dataForm.zoneName = 'sms.tencentcloudapi.com';
        this.dataForm.zoneParam = 'ap-beijing';
        if (this.dataForm.id) {
          getConfigDetail(this.dataForm.id).then(res => {
            this.dataForm = res.data
            this.selectIndex = this.dataForm.channel
            if (this.dataForm.channel == 2) {
              this.$set(this.dataForm, 'secretId', this.dataForm.appId)
              this.$set(this.dataForm, 'secretKey', this.dataForm.appSecret)
            } else {
              this.$set(this.dataForm, 'secretId', "")
              this.$set(this.dataForm, 'secretKey', "")
            }
          })
        }
      })
      this.formLoading = false
    },
    channelVal() {
      this.$refs['dataForm'].clearValidate()
      this.dataForm.appId = "";
      this.dataForm.appSecret = "";
      this.dataForm.endPoint = "";
      this.dataForm.secretId = "";
      this.dataForm.secretKey = "";
      this.dataForm.appKey = "";
      this.dataForm.sdkAppId = "";
      this.dataForm.zoneName = 'sms.tencentcloudapi.com';
      this.dataForm.zoneParam = 'ap-beijing';
      this.dataForm.smsSignature = "";
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dataForm.channel == 2) {
            this.dataForm.appId = this.dataForm.secretId
            this.dataForm.appSecret = this.dataForm.secretKey
          }
          let query = {
            ...this.dataForm,
            type: 3
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
