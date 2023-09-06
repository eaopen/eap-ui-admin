<template>
  <transition name="el-zoom-in-center">
    <div class="OBPM-preview-main flow-form-main">
      <div class="OBPM-common-page-header">
        <el-page-header @back="goBack" :content="!dataForm.id ? '新建消息模板' : '编辑消息模板'" />
        <div class="options">
          <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
            {{$t('common.confirmButton')}}</el-button>
          <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
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
                <el-option v-for="(item,index) in messageSourceList" :key="index"
                  :label="item.fullName" :value="item.enCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息类型" prop="messageType">
              <el-select v-model="dataForm.messageType" placeholder="请选择消息类型" clearable
                :disabled="this.dataForm.id?true:false" @change="onMsgTypeChange" filterable>
                <el-option v-for="(item,index) in messageTypeList" :key="index"
                  :label="item.fullName" :value="item.enCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="enabledMark">
              <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortCode">
              <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
                controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="说明" prop="description">
              <el-input v-model="dataForm.description" placeholder="请输入说明" type="textarea"
                :rows="3" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="parameter-box">
              <div class="left-pane">
                <div class="left-pane-list">
                  <div class="list">
                    <div class="header">
                      <span>参数名称</span>
                      <span>参数说明</span>
                      <span class="operation">操作</span>
                    </div>
                    <el-input v-model="keyword" placeholder="请输入关键字" suffix-icon="el-icon-search"
                      clearable @input='searchParameter' />
                    <el-table :data="parameterList" :showHeader="false" ref="dragTable" row-key="id"
                      size='mini' height="100%">
                      <el-table-column prop="field" label="参数名称">
                        <template slot-scope="scope">
                          <p @click="addContent(scope.row)" style="cursor:pointer">
                            {{scope.row.field}}
                          </p>
                        </template>
                      </el-table-column>
                      <el-table-column prop="fieldName" label="参数说明">
                        <template slot-scope="scope">
                          <p @click="addContent(scope.row)" style="cursor:pointer;line-height:36px">
                            {{scope.row.fieldName}}
                          </p>
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="70">
                        <template slot-scope="scope" v-if="!getIsSystem(scope.row.field)">
                          <el-button type="text" @click="addEditParameter(scope.row,scope.$index)"
                            icon="el-icon-edit-outline"></el-button>
                          <el-button type="text" class="OBPM-table-delBtn" icon="el-icon-delete"
                            @click="removeParameter(scope.$index)"></el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div class="table-actions" @click="addEditParameter()"
                    v-if="dataForm.messageSource==='2'">
                    <el-button type="text" icon="el-icon-plus">添加参数</el-button>
                  </div>
                </div>
              </div>
              <div class="right-pane" v-if="dataForm.messageType != 3&&dataForm.messageType != 7">
                <jnpf-form-tip-item label="消息标题" prop="title" :tipLabel="getTipLabel()">
                  <el-input v-model="dataForm.title" placeholder="请输入消息标题" clearable></el-input>
                </jnpf-form-tip-item>
                <jnpf-form-tip-item label="消息内容" prop="content" v-if="dataForm.messageType == 2"
                  :tipLabel="getTipLabel()">
                  <JNPFQuill v-model="dataForm.content" ref="myQuillEditor" placeholder="请输入消息内容" />
                </jnpf-form-tip-item>
                <jnpf-form-tip-item label="消息内容" prop="content"
                  v-else-if="dataForm.messageType != 1" :tipLabel="getTipLabel()">
                  <el-input v-model="dataForm.content" placeholder="请输入消息内容" type="textarea"
                    :rows="19" />
                </jnpf-form-tip-item>
              </div>
              <div class="right-pane" v-else>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <jnpf-form-tip-item label="模版编号" prop="templateCode"
                      :tipLabel="dataForm.messageType==3?'阿里云：请在【阿里云管理后台-模板管理】⻚⾯查看模板CODE<br/>腾讯云：请在【腾讯云管理后台-正⽂模板管理】⻚⾯查看模板ID':'在【微信公众号管理后台-广告与服务-模板消息】⻚⾯查看模板ID'">
                      <el-input v-model="dataForm.templateCode" placeholder="请输入模版编号" />
                    </jnpf-form-tip-item>
                  </el-col>
                  <el-col :span="12" offset="12"></el-col>
                  <el-col :span="12" v-if="dataForm.messageType == 7">
                    <jnpf-form-tip-item label="跳转方式" prop="wxSkip">
                      <el-select v-model="dataForm.wxSkip" placeholder="请选择跳转方式" clearable
                        filterable>
                        <el-option v-for="(item,index) in wxSkipList" :key="index"
                          :label="item.fullName" :value="item.enCode">
                        </el-option>
                      </el-select>
                    </jnpf-form-tip-item>
                  </el-col>
                  <el-col :span="12" v-if="dataForm.messageType == 7&&dataForm.wxSkip == 1">
                    <jnpf-form-tip-item label="关联小程序ID" prop="xcxAppId" label-width="126px"
                      tipLabel="在【微信公众号管理后台-广告与服务-小程序管理】⻚⾯查看小程序ID">
                      <el-input v-model="dataForm.xcxAppId" placeholder="请输入关联小程序ID" clearable />
                    </jnpf-form-tip-item>
                  </el-col>
                </el-row>
                <div class="msg-pane">
                  <div class="list">
                    <el-table :data="smsList" ref="dragTable" row-key="id" size='mini'
                      height="100%">
                      <el-table-column label="序号" type="index" width="50"></el-table-column>
                      <el-table-column prop="name">
                        <template slot="header">
                          <p v-if="dataForm.messageType==3">
                            短信变量
                            <el-tooltip content="内容在第三方平台维护，绑定第三方平台短信变量，如：腾讯云：{1}，阿里云格式：${name}"
                              placement="top">
                              <a class="el-icon-question tooltip-question"></a>
                            </el-tooltip>
                          </p>
                          <p v-else>
                            变量
                            <el-tooltip content="内容在微信公众号管理后台维护，绑定模板变量，如：{first.DATA}。"
                              placement="top">
                              <a class="el-icon-question tooltip-question"></a>
                            </el-tooltip>
                          </p>
                        </template>
                        <template slot-scope="scope">
                          <el-input v-model="scope.row.smsField"
                            :placeholder="dataForm.messageType==3?'请输入短信变量':'请输入变量'"></el-input>
                        </template>
                      </el-table-column>
                      <el-table-column label="参数">
                        <template slot-scope="scope">
                          <el-select v-model="scope.row.field" placeholder="请选择参数" clearable
                            filterable>
                            <el-option v-for="(item,index) in parameterList" :key="index"
                              :label="item.field" :value="item.field">
                            </el-option>
                          </el-select>
                        </template>
                      </el-table-column>
                      <el-table-column label="标题" width="70" v-if="dataForm.messageType==7">
                        <template slot-scope="scope">
                          <el-checkbox v-model="scope.row.isTitle"
                            @change='changeKey($event,scope.row)' :true-label="1"
                            :false-label="0" />
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="70">
                        <template slot-scope="scope">
                          <el-button type="text" class="OBPM-table-delBtn" icon="el-icon-delete"
                            @click="removeSmsData(scope.$index)"></el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div class="table-actions" @click="addSmsData">
                    <el-button type="text" icon="el-icon-plus">添加一行</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-form>
      </el-row>
      <el-dialog :title="isEdit?'编辑参数':'添加参数'" :visible.sync="dialogVisible"
        :close-on-click-modal="false" class="OBPM-dialog JNPF-dialog_center" lock-scroll
        append-to-body width="600px">
        <el-form :model="fieldForm" :rules="fieldRule" ref="fieldForm" label-width="100px">
          <jnpf-form-tip-item label="参数名称" prop="field"
            :tip-label="isEdit?'':'可以使用大小写英文字母、数字、下划线组合，且不能数字、下划线开头。'" placement="top-start">
            <el-input v-model="fieldForm.field" placeholder="请输入参数名称" :disabled="isEdit" />
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="参数说明" prop="fieldName">
            <el-input v-model="fieldForm.fieldName" placeholder="请输入参数说明"></el-input>
          </jnpf-form-tip-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible=false">{{$t('common.cancelButton')}}
          </el-button>
          <el-button type="primary" @click="addParameter()">
            {{$t('common.confirmButton')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </transition>
</template>
<script>
import { getMsgTemplateDetail, addMsgTemplate, editMsgTemplate, getMsgTypeList } from '@/api/extn/msgTemplate'
import { deepClone } from '@/utils'
const defaultParameterList = [
  { field: '@Title', fieldName: '标题' },
  { field: '@CreatorUserName', fieldName: '创建人' },
]
const noticeParameterList = [
  ...defaultParameterList,
  { field: '@Content', fieldName: '内容' },
  { field: '@Remark', fieldName: '摘要' },
]
const flowParameterList = [
  ...defaultParameterList,
  { field: '@FlowLink', fieldName: '流程链接' },
]
const systemParameterList = defaultParameterList
const scheduleParameterList = [
  ...defaultParameterList,
  { field: '@Content', fieldName: '内容' },
  { field: '@StartDate', fieldName: '开始日期' },
  { field: '@StartTime', fieldName: '开始时间' },
  { field: '@EndDate', fieldName: '结束日期' },
  { field: '@EndTime', fieldName: '结束时间' },
]
export default {
  name: 'msgTemplate-Form',
  data() {
    return {
      dataForm: {
        id: '',
        fullName: '',
        enCode: '',
        templateType: 0,
        messageType: '',
        messageSource: '',
        enabledMark: 1,
        sortCode: 0,
        description: '',
        title: '',
        content: '',
        templateCode: '',
        wxSkip: '1',
        xcxAppId: ''
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
        ],
        messageType: [
          { required: true, message: '请选择消息类型', trigger: 'change' },
        ],
        title: [
          { required: true, message: '消息标题不能为空', trigger: 'blur' },
        ],
        content: [
          { required: true, message: '消息内容不能为空', trigger: 'blur' },
        ],
        templateCode: [
          { required: true, message: '模版编号不能为空', trigger: 'blur' },
        ],
        wxSkip: [
          { required: true, message: '跳转方式不能为空', trigger: 'blur' },
        ],
        xcxAppId: [
          { required: true, message: '关联小程序ID不能为空', trigger: 'blur' },
        ],
      },
      fieldRule: {
        field: [
          { required: true, message: '参数名称不能为空', trigger: 'blur' },
          { validator: this.formValidate('filed'), trigger: 'blur' },
        ],
        fieldName: [
          { required: true, message: '参数说明不能为空', trigger: 'blur' },
        ],
      },
      fieldForm: {
        field: '',
        fieldName: ''
      },
      dialogVisible: false,
      btnLoading: false,
      loading: false,
      messageSourceList: [],
      messageTypeList: [],
      isEdit: false,
      keyword: "",
      parameterList: [],
      allParameterList: [],
      smsList: [],
      wxSkipList: [
        { enCode: "1", fullName: '小程序' },
        { enCode: "2", fullName: '页面' }
      ]
    }
  },
  methods: {
    init(id) {
      this.dataForm.id = id || ''
      this.parameterList = []
      this.allParameterList = this.parameterList
      this.getConfig()
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.loading = true
          getMsgTemplateDetail(this.dataForm.id).then(res => {
            this.loading = false
            this.dataForm = res.data
            this.parameterList = res.data.templateParamList
            this.allParameterList = this.parameterList
            this.smsList = res.data.smsFieldList
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },
    getConfig() {
      this.$store.dispatch('extnBase/getMsgTypeList').then((res) => {
        this.messageTypeList = res
        if (this.messageTypeList.length) this.dataForm.messageType = this.messageTypeList[0].enCode
      })
      getMsgTypeList(4).then(res => {
        this.messageSourceList = res.data
      })
    },
    dataFormSubmit() {
      this.dataForm.templateParamList = []
      this.dataForm.smsFieldList = []
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.dataForm.templateParamList = this.parameterList
          this.dataForm.smsFieldList = this.smsList
          this.btnLoading = true
          const formMethod = this.dataForm.id ? editMsgTemplate : addMsgTemplate
          let isOk = true;
          for (let i = 0; i < this.dataForm.smsFieldList.length; i++) {
            let list = this.dataForm.smsFieldList[i]
            let num = this.dataForm.smsFieldList.filter(o => o.smsField == list.smsField)
            if (num.length > 1) {
              this.$message({
                showClose: true,
                message: `第${i + 1}行短信变量'${list.smsField}'已重复`,
                type: 'error',
                duration: 1000
              });
              this.visible = false
              this.btnLoading = false
              isOk = false
              break
            }
          }
          if (isOk) {
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
        }
      })
    },
    addEditParameter(item) {
      this.dialogVisible = true
      this.isEdit = false
      this.$nextTick(() => {
        this.$refs['fieldForm'].resetFields()
        if (item) {
          this.isEdit = true
          this.fieldForm = JSON.parse(JSON.stringify(item))
        }
      })
    },
    removeParameter(index) {
      this.$confirm('此操作删除该参数, 不能恢复，是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        this.parameterList.splice(index, 1)
        this.allParameterList = this.parameterList
      }).catch(() => { });
    },
    /**
     * 查找是否有相同参数，没有则添加
     */
    addParameter() {
      this.$refs['fieldForm'].validate((valid) => {
        if (valid) {
          if (!this.isEdit) {
            let boo = this.parameterList.some(o => o.field === this.fieldForm.field)
            if (boo) {
              this.$message({
                type: 'error',
                message: '参数名重复，请重新输入'
              })
              return
            }
            this.parameterList.push(deepClone(this.fieldForm))
          } else {
            for (let index = 0; index < this.parameterList.length; index++) {
              if (this.fieldForm.field === this.parameterList[index].field) {
                this.$set(this.parameterList, index, deepClone(this.fieldForm))
                break
              }
            }
          }
          this.allParameterList = this.parameterList
          this.dialogVisible = false
        }
      })
    },
    addContent(item) {
      const content = '{' + item.field + '}'
      if (this.dataForm.messageType == 2) {
        this.$refs.myQuillEditor.insertText(content)
      } else {
        this.dataForm.content += content
      }
      this.dataForm.title += content
      this.$refs.dataForm.clearValidate(['title', 'content'])
    },
    searchParameter() {
      this.parameterList = this.allParameterList.filter(item => {
        if (item.field.toLowerCase().includes(this.keyword.toLowerCase()) || item.fieldName.toLowerCase().includes(this.keyword.toLowerCase())) {
          return item
        }
      })
    },
    addSmsData() {
      this.smsList.push({
        smsField: "",
        field: "",
        fieldId: this.jnpf.idGenerator()
      })
    },
    removeSmsData(index) {
      this.smsList.splice(index, 1)
    },
    onMsgTypeChange(e) {
      this.dataForm.content = ''
    },
    goBack() {
      this.$emit('close')
    },
    changeKey(val, row) {
      if (!val) return
      for (let i = 0; i < this.smsList.length; i++) {
        if (row.fieldId != this.smsList[i].fieldId) {
          this.$set(this.smsList[i], 'isTitle', 0)
        }
      }
    },
    onMessageSourceChange(val) {
      if (val == 1) this.parameterList = JSON.parse(JSON.stringify(noticeParameterList))
      if (val == 2) this.parameterList = JSON.parse(JSON.stringify(flowParameterList))
      if (val == 3) this.parameterList = JSON.parse(JSON.stringify(systemParameterList))
      if (val == 4) this.parameterList = JSON.parse(JSON.stringify(scheduleParameterList))
      this.allParameterList = this.parameterList
    },
    getIsSystem(val) {
      return val && val.startsWith('@') ? true : false
    },
    getTipLabel() {
      return this.dataForm.messageSource == '2' ? '系统参数格式：{@系统参数名}；自定义参数格式：{自定义参数名}' : '系统参数格式：{@系统参数名}'
    }
  }
}
</script>
<style lang="scss" scoped>
.text {
  color: #5e6d82;
}
.parameter-box {
  display: flex;
  .left-pane {
    width: 350px;
    height: 433px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 0 10px 18px 20px;

    .left-pane-list {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .table-actions {
        flex-shrink: 0;
        border: unset;
        border-top: #ebeef5 1px dashed;
      }
      .list {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .header {
          background-color: #f5f7fa;
          display: flex;

          span {
            font-size: 12px;
            color: #606266;
            padding: 6px 10px;
            display: inline-block;
            line-height: 23px;
            flex: 1;
          }

          .operation {
            width: 70px;
            flex: unset;
          }
        }

        >>> .el-input {
          width: auto;
          margin: 5px 10px;
        }

        >>> .el-table {
          border-top: unset;
        }
      }
      >>> .el-icon-edit-outline,
      >>> .el-icon-delete {
        font-size: 16px;
      }
    }
  }
  .right-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    .msg-pane {
      margin-left: 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
      .list {
        flex: 1;
      }
      >>> .el-icon-delete {
        font-size: 16px;
      }
    }
    >>> .ql-editor {
      min-height: 300px !important;
    }
  }
}
</style>