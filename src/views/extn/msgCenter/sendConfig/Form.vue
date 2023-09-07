<template>
  <transition name="el-zoom-in-center">
    <div class="OBPM-preview-main flow-form-main">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack" :content="!dataForm.id ? '新建发送配置' : '编辑发送配置'" />
        <div class="options">
          <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
            {{$t('common.confirmBtn')}}</el-button>
          <el-button @click="goBack()">{{$t('common.cancelBtn')}}</el-button>
        </div>
      </div>
      <el-row class="main" v-loading="loading">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="100px"
          @submit.native.prevent>
          <el-col :span="12">
            <el-form-item label="名称" prop="fullName">
              <el-input v-model="dataForm.fullName" placeholder="请输入名称" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="编码" prop="enCode">
              <el-input v-model="dataForm.enCode" placeholder="请输入编码" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板类型">
              <el-input value="自定义模板" disabled clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息来源" prop="messageSource">
              <el-select v-model="dataForm.messageSource" placeholder="请选择消息来源" clearable
                :disabled="this.dataForm.id?true:false" filterable @change="onMessageSourceChange">
                <el-option v-for="(item,index) in msgSourceList" :key="index" :label="item.fullName"
                  :value="item.enCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortCode">
              <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
                controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="enabledMark">
              <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="说明" prop="description">
              <el-input v-model="dataForm.description" placeholder="请输入说明" type="textarea"
                :rows="3" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="msg-pane">
              <div class="list">
                <el-table :data="dataForm.sendConfigTemplateList" ref="dragTable" row-key="id">
                  <el-table-column label="序号" type="index" width="50"></el-table-column>
                  <el-table-column prop="messageType" label="消息类型" width="150">
                    <template slot-scope="scope">
                      {{getMsgTypeTitle(scope.row.messageType)}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="templateCode" label="模板编码" width="150"></el-table-column>
                  <el-table-column prop="templateName" label="模板名称"></el-table-column>
                  <el-table-column prop="accountCode" label="账号编码" width="150"></el-table-column>
                  <el-table-column prop="accountName" label="账号名称"></el-table-column>
                  <el-table-column prop="enabledMark" label="状态" width="100">
                    <template slot-scope="scope">
                      <el-switch v-model="scope.row.enabledMark" :active-value="1"
                        :inactive-value="0" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                      <tableOpts @edit="addTemplateData(scope.row,scope.$index)"
                        @del="handleDel(scope.$index)">
                        <el-dropdown>
                          <el-button type="text" size="mini">
                            {{$t('common.moreBtn')}}<i class="el-icon-arrow-down el-icon--right" />
                          </el-button>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="handleView(scope.row.templateId)">查看模板
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                      </tableOpts>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div class="table-actions" @click="addTemplateData()">
                <el-button type="text" icon="el-icon-plus">添加模板</el-button>
              </div>
            </div>
          </el-col>
        </el-form>
      </el-row>
      <TemplateForm v-if="templateVisible" ref="TemplateRef" @close="templateVisible=false"
        @submit="addEditTemplate" />
      <Detail v-if="viewVisible" ref="View" @close="closeViewForm" />
    </div>
  </transition>
</template>

<script>
import { getSendConfigDetail, editMsgTemplate, addMsgTemplate } from '@/api/extn/sendConfig'
import { getMsgTypeList } from '@/api/extn/msgTemplate'
import TemplateForm from './TemplateForm'
import Detail from '../msgTemplate/Detail'

export default {
  components: { Detail, TemplateForm },
  name: 'sendConfig-Form',
  data() {
    return {
      dataForm: {
        id: '',
        fullName: '',
        enCode: '',
        description: '',
        enabledMark: 1,
        sortCode: 0,
        messageSource: '',
        templateType: 0,
        sendConfigTemplateList: []
      },
      dataRule: {
        fullName: [
          { required: true, message: '模板名称不能为空', trigger: 'blur' },
        ],
        enCode: [
          { required: true, message: '模板编码不能为空', trigger: 'blur' },
          { validator: this.formValidate('enCode'), trigger: 'blur' },
        ],
        messageSource: [
          { required: true, message: '请选择消息来源', trigger: 'change' },
        ]
      },
      msgSourceList: [],
      btnLoading: false,
      loading: false,
      templateVisible: false,
      messageTypeList: [],
      viewVisible: false,
    }
  },
  methods: {
    init(id) {
      this.dataForm.id = id || ''
      this.getConfig()
      this.$nextTick(() => {
        this.dataForm.sendConfigTemplateList = []
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.loading = true
          getSendConfigDetail(this.dataForm.id).then(res => {
            this.dataForm = res.data
            this.dataForm.enabledMark = Number(this.dataForm.enabledMark)
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },
    getConfig() {
      this.$store.dispatch('extnBase/getMsgTypeList').then((res) => {
        this.messageTypeList = res
      })
      getMsgTypeList(4).then(res => {
        this.msgSourceList = res.data
      })
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          const formMethod = this.dataForm.id ? editMsgTemplate : addMsgTemplate
          formMethod(this.dataForm).then((res) => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.btnLoading = false
                this.$emit('close', true)
              }
            })
          }).catch(() => { this.btnLoading = false })
        }
      })
    },
    addTemplateData(row, index) {
      if (!this.dataForm.messageSource) return this.$message({ message: '请选择消息来源', type: 'error' })
      this.templateVisible = true
      this.$nextTick(() => {
        this.$refs.TemplateRef.init(row, index, this.dataForm.messageSource)
      })
    },
    addEditTemplate(e, index) {
      if (!index && index != 0) {
        this.dataForm.sendConfigTemplateList.push(e)
      } else {
        this.$set(this.dataForm.sendConfigTemplateList, index, e)
      }
    },
    handleDel(index) {
      this.$confirm('删除记录，不可恢复?', '提示', {
        type: 'warning'
      }).then(() => {
        this.dataForm.sendConfigTemplateList.splice(index, 1)
      }).catch(() => { });
    },
    goBack() {
      this.$emit('close')
    },
    getMsgTypeTitle(messageType) {
      const item = this.messageTypeList.find((res) => {
        return messageType == res.enCode
      })
      return item.fullName
    },
    closeViewForm() {
      this.viewVisible = false
    },
    handleView(id) {
      this.viewVisible = true
      this.$nextTick(() => {
        this.$refs.View.init(id, this.messageTypeList)
      })
    },
    onMessageSourceChange() {
      this.dataForm.sendConfigTemplateList = []
    }
  }
}
</script>
