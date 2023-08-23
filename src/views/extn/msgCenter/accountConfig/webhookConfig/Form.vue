<template>
  <el-dialog :title="!dataForm.id ? '新建' : '编辑'" :close-on-click-modal="false"
    :visible.sync="visible" class="OBPM-dialog JNPF-dialog_center" lock-scroll width="600px">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" v-loading="formLoading"
      label-width="130px">
      <jnpf-form-tip-item label="名称" prop="fullName">
        <el-input v-model="dataForm.fullName" placeholder="请输入名称" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="编码" prop="enCode">
        <el-input v-model="dataForm.enCode" placeholder="请输入编码" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="类型" prop="webhookType">
        <el-select v-model="dataForm.webhookType" placeholder="请选择类型" clearable @change="change"
          filterable>
          <el-option v-for="item in webhookList" :label="item.fullName" :value="item.enCode"
            :key="item.enCode" />
        </el-select>
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="WebHook地址" prop="webhookAddress">
        <el-input v-model="dataForm.webhookAddress" placeholder="请输入WebHook地址" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="认证类型" prop="approveType">
        <el-select v-model="dataForm.approveType" placeholder="请选择认证类型" clearable
          :disabled="dataForm.webhookType ==2 ? true : false" filterable>
          <el-option v-for="item in approveTypeList" :label="item.fullName" :value="item.enCode"
            :key="item.enCode" />
        </el-select>
      </jnpf-form-tip-item>
      <template v-if="dataForm.approveType == 2">
        <jnpf-form-tip-item label="Bearer令牌" prop="bearer" tip-label="密钥">
          <el-input v-model="dataForm.bearer" placeholder="请输入Bearer令牌" clearable />
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
      visible: false,
      formLoading: false,
      btnLoading: false,
      dataForm: {
        fullName: '',
        enCode: '',
        webhookType: '',
        webhookAddress: "",
        approveType: '1',
        bearer: "",
        userName: '',
        password: '',
        sortCode: 0,
        enabledMark: 1,
        description: ''
      },
      webhookList: [],
      approveTypeList: [{ fullName: '无需认证', enCode: '1' }, { fullName: 'bearer令牌', enCode: '2' }],
      dataRule: {
        fullName: [
          { required: true, message: '请输入业务名称', trigger: 'blur' },
          { max: 50, message: '业务名称最多为50个字符！', trigger: 'blur' }
        ],
        enCode: [
          { required: true, message: '请输入业务编码', trigger: 'blur' },
          { max: 50, message: '业务编码最多为50个字符！', trigger: 'blur' },
          { validator: this.formValidate('enCode'), trigger: 'blur' },
        ],
        webhookType: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        approveType: [
          { required: true, message: '请选择认证类型', trigger: 'change' }
        ],
        webhookAddress: [{ required: true, message: '请输入WebHook地址', trigger: 'blur' }],
        bearer: [{ required: true, message: '请输Bearer令牌', trigger: 'blur' }]
      }
    }
  },
  methods: {
    init(id, webhookList) {
      this.dataForm.id = id || ''
      this.webhookList = webhookList
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
    change(e) {
      if (e == 2) {
        this.dataForm.approveType = '1';
        this.dataForm.bearer = ''
      }
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          let query = {
            ...this.dataForm,
            type: 6
          }
          if (query.approveType == 1) {
            query.bearer = "";
            query.userName = '';
            query.password = '';
          } else if (query.approveType == 2) {
            query.userName = '';
            query.password = '';
          } else {
            query.bearer = "";
          }
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
