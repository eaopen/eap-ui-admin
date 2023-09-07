<template>
  <el-dialog :title="dataForm.id?'编辑模板':'添加模板'" :close-on-click-modal="false"
    :visible.sync="visible" class="OBPM-dialog JNPF-dialog_center" lock-scroll append-to-body
    width='600px'>
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="100px">
      <el-form-item label="消息类型" prop="messageType">
        <el-select v-model="dataForm.messageType" placeholder="请选择消息类型" clearable filterable
          @change="onMessageTypeChange">
          <el-option v-for="(item,index) in msgTypeList" :key="index" :label="item.fullName"
            :value="item.enCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模板名称" prop="templateName">
        <template-dialog :value="dataForm.templateId" :title="dataForm.templateName"
          :messageType="dataForm.messageType" :messageSource="messageSource"
          @change="onTemplateChange" />
      </el-form-item>
      <el-form-item label="模板编码" prop="templateCode">
        <el-input v-model="dataForm.templateCode" placeholder="请输入模板编码" disabled
          clearable></el-input>
      </el-form-item>
      <el-form-item label="账号名称" prop="accountName" v-if="dataForm.messageType!=1">
        <template-dialog v-model="dataForm.accountConfigId" :title="dataForm.accountName"
          :messageType="dataForm.messageType" :type=2 @change="onAccountChange" />
      </el-form-item>
      <el-form-item label="账号编码" prop="accountCode" v-if="dataForm.messageType!=1">
        <el-input v-model="dataForm.accountCode" placeholder="请输入账号编码" disabled
          clearable></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sortCode">
        <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
          controls-position="right" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="说明" prop="description">
        <el-input v-model="dataForm.description" placeholder="请输入说明" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false" size="small">{{$t('common.cancelBtn')}}</el-button>
      <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
        {{$t('common.confirmBtn')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import TemplateDialog from './TemplateDialog'
import { deepClone } from '@/utils'
export default {
  components: { TemplateDialog },
  name: 'sendConfig-TemplateForm',
  data() {
    return {
      dataForm: {
        id: "",
        enabledMark: 1,
        sortCode: 0,
        description: "",
        messageType: "",
        templateName: '',
        accountName: ''
      },
      dataRule: {
        messageType: [
          { required: true, message: '消息类型不能为空', trigger: 'blur' },
        ],
        templateName: [
          { required: true, message: '模板名称不能为空', trigger: 'change' },
        ],
        accountName: [
          { required: true, message: '账号名称不能为空', trigger: 'change' },
        ],
      },
      msgTypeList: [],
      visible: false,
      btnLoading: false,
      editIndex: '',
      messageSource: ''
    }
  },
  methods: {
    init(row, index, messageSource) {
      this.editIndex = index
      this.messageSource = messageSource
      this.getConfig()
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.dataForm = { ...this.dataForm, ...row }
      })
    },
    getConfig() {
      this.$store.dispatch('extnBase/getMsgTypeList').then((res) => {
        this.msgTypeList = res
      })
    },
    onTemplateChange(id, item) {
      this.dataForm.templateName = item.fullName
      this.dataForm.templateId = id
      this.dataForm.templateCode = item.enCode
    },
    onAccountChange(id, item) {
      this.dataForm.accountName = item.fullName
      this.dataForm.accountConfigId = id
      this.dataForm.accountCode = item.enCode
    },
    onMessageTypeChange(e) {
      this.$set(this.dataForm, 'accountName', '')
      this.$set(this.dataForm, 'accountConfigId', '')
      this.$set(this.dataForm, 'accountCode', '')
      this.$set(this.dataForm, 'templateId', '')
      this.$set(this.dataForm, 'templateName', '')
      this.$set(this.dataForm, 'templateCode', '')
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const item = deepClone(this.dataForm)
          this.$emit('submit', item, this.editIndex)
          this.visible = false
        }
      })
    }
  }
}
</script>