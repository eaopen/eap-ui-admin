<template>
  <div class="JNPF-preview-main">
    <div class="JNPF-common-page-header">
      <el-page-header @back="goBack()" content="接口认证" />
      <div class="options">
        <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
          {{$t('common.confirmButton')}}</el-button>
        <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
      </div>
    </div>
    <el-row class="main">
      <el-col :span="14" :offset="5" class="mt-20">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" class="mt-20" label-width="120px" @submit.native.prevent>
          <jnpf-form-tip-item label="appId" prop="appId">
            <el-input v-model="dataForm.appId" placeholder="输入appId" maxlength="100">
            </el-input>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="appSecret" prop="appSecret">
            <el-input v-model="dataForm.appSecret" placeholder="输入appSecret" show-password readOnly>
              <el-button slot="append" @click="getAppSecret">获取秘钥</el-button>
            </el-input>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="应用名称" prop="appName">
            <el-input v-model="dataForm.appName" placeholder="输入应用名称"></el-input>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="验证签名" prop="verifySignature">
            <el-row>
              <el-col :span="12">
                <el-switch v-model="dataForm.verifySignature" :active-value="1" :inactive-value="0">
                </el-switch>
              </el-col>
              <el-col :span="12" align="right">
                <el-link :underline="false" @click="showVerify()">验证签名使用说明</el-link>
              </el-col>
            </el-row>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="使用期限" prop="usefulLife">
            <el-date-picker v-model="dataForm.usefulLife" type="date" placeholder="请选择" style="width:100%" format="yyyy-MM-dd" value-format="timestamp"></el-date-picker>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="白名单" prop="whiteList">
            <el-input v-model="dataForm.whiteList" placeholder="" type="textarea" :rows="5" />
            <span style="color:#C0C4CC">多个IP设置，用英文符号隔开，如192.168.0.1,192.168.0.2</span>
          </jnpf-form-tip-item>
          <!-- <jnpf-form-tip-item label="黑名单" prop="blackList">
            <el-input v-model="dataForm.blackList" placeholder="" type="textarea" :rows="5" />
            <span style="color:#C0C4CC">多个IP设置，用英文符号隔开，如192.168.0.1,192.168.0.2</span>
          </jnpf-form-tip-item> -->
          <jnpf-form-tip-item label="排序" prop="sortCode">
            <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode" controls-position="right" />
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="状态" prop="enabledMark">
            <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0">
            </el-switch>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="说明" prop="description">
            <el-input v-model="dataForm.description" placeholder="" type="textarea" :rows="5" />
          </jnpf-form-tip-item>
        </el-form>
      </el-col>
    </el-row>
    <VerifySignatureInfo v-if="verifySignatureVisible" ref="VerifySignatureInfo" @close="verifySignatureVisible=false" />
  </div>
</template>

<script>
import VerifySignatureInfo from './VerifySignatureInfo'
import { create, update, getAppSecret, getInfo } from '@/api/extn/interfaceOauth.js'

export default {
  components: { VerifySignatureInfo },
  data() {
    return {
      verifySignatureVisible: false,
      btnLoading: false,
      dataForm: {
        appSecret: '',
        sortCode: 0,
        enabledMark: 1,
      },
      dataRule: {
        appId: [
          {
            required: true,
            message: '名称不能为空',
            trigger: 'blur'
          }
        ],
        appName: [
          {
            required: true,
            message: '应用名称不能为空',
            trigger: 'blur'
          }
        ],
        appSecret: [
          {
            required: true,
            message: 'appSecret不能为空',
            trigger: 'change'
          }
        ],
      }
    }
  },
  methods: {
    goBack(isRefresh) {
      this.$emit('close', isRefresh)
    },
    init(id) {
      if (id) {
        getInfo(id).then(res => {
          this.initData(res.data)
        }).catch(() => { })
      }
    },
    initData(data) {
      this.dataForm = data
    },
    getAppSecret() {
      getAppSecret().then(res => {
        this.dataForm.appSecret = res.data
      }).catch(() => { })
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          const formMethod = this.dataForm.id ? update : create
          formMethod(this.dataForm).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1000,
              onClose: () => {
                this.btnLoading = false
                this.$emit('close', true)
              }
            })
          }).catch(() => {
            this.btnLoading = false
          })
        }
      })
    },
    showVerify() {
      this.verifySignatureVisible = true
      this.$nextTick(() => {
        this.$refs.VerifySignatureInfo.init()
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.main {
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 0 0 10px;
  >>> .el-table {
    flex: 1;
    border-top: none;
  }
}
</style>