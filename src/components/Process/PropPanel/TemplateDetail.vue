<template>
  <el-dialog title="查看模板" :close-on-click-modal="false" :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body width='1000px'>
    <el-row class="main" v-loading="loading">
      <el-form :model="dataForm" ref="dataForm" label-width="100px" @submit.native.prevent>
        <el-col :span="12">
          <el-form-item label="名称" prop="fullName">
            <p>{{dataForm.fullName}}</p>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="编码" prop="enCode">
            <p>{{dataForm.enCode}}</p>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板类型">
            <p>{{dataForm.templateType=='0'?'自定义模板':'系统模板'}}</p>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="消息来源" prop="messageSource">
            <p>{{dataForm.messageSourceVal}}</p>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="消息类型" prop="messageType">
            <p>{{dataForm.messageTypeVal}}</p>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="enabledMark">
            <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0"
              disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sortCode">
            <p>{{dataForm.sortCode}}</p>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="说明" prop="description">
            <p>{{dataForm.description}}</p>
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
                  </div>
                  <el-input v-model="keyword" placeholder="输入关键字" suffix-icon="el-icon-search"
                    clearable @input='searchParameter' />
                  <el-table :data="parameterList" :showHeader="false" ref="dragTable" row-key="id"
                    size='mini' height="100%">
                    <el-table-column prop="field" label="参数名称">
                      <template slot-scope="scope">
                        <p style="cursor:pointer">
                          {{scope.row.field}}
                        </p>
                      </template>
                    </el-table-column>
                    <el-table-column prop="fieldName" label="参数说明">
                      <template slot-scope="scope">
                        <p style="cursor:pointer;line-height:36px">
                          {{scope.row.fieldName}}
                        </p>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
            <div class="right-pane" v-if="dataForm.messageType != 3&&dataForm.messageType != 7">
              <jnpf-form-tip-item label="消息标题" prop="title" tipLabel='参数格式：{参数名}'>
                <p>{{dataForm.title}}</p>
              </jnpf-form-tip-item>
              <jnpf-form-tip-item label="消息内容" prop="content" v-if="dataForm.messageType == 2"
                tipLabel='参数格式：{参数名}'>
                <p v-html="dataForm.content"></p>
              </jnpf-form-tip-item>
              <jnpf-form-tip-item label="消息内容" prop="content"
                v-else-if="dataForm.messageType != 1||dataForm.messageSource != 1"
                tipLabel='参数格式：{参数名}'>
                <p>{{dataForm.content}}</p>
              </jnpf-form-tip-item>
            </div>
            <div class="right-pane" v-else>
              <el-row :gutter="20">
                <el-col :span="12">
                  <jnpf-form-tip-item label="模版编号" prop="templateCode"
                    :tipLabel="dataForm.messageType==3?'阿里云：请在【阿里云管理后台-模板管理】⻚⾯查看模板CODE<br/>腾讯云：请在【腾讯云管理后台-正⽂模板管理】⻚⾯查看模板ID':'在【微信公众号管理后台-广告与服务-模板消息】⻚⾯查看模板ID'">
                    <p>{{dataForm.templateCode}}</p>
                  </jnpf-form-tip-item>
                </el-col>
                <el-col :span="12" :offset="12"></el-col>
                <el-col :span="12" v-if="dataForm.messageType == 7">
                  <jnpf-form-tip-item label="跳转方式" prop="wxSkip">
                    <p>{{dataForm.wxSkip==1?'小程序':'页面'}}</p>
                  </jnpf-form-tip-item>
                </el-col>
                <el-col :span="12" v-if="dataForm.messageType == 7&&dataForm.wxSkip == 1">
                  <jnpf-form-tip-item label="关联小程序ID" prop="xcxAppId" label-width="126px"
                    tipLabel="在【微信公众号管理后台-广告与服务-小程序管理】⻚⾯查看小程序ID">
                    <p>{{dataForm.xcxAppId}}</p>
                  </jnpf-form-tip-item>
                </el-col>
              </el-row>
              <div class="msg-pane">
                <div class="list">
                  <el-table :data="smsList" ref="dragTable" row-key="id" size='mini' height="100%">
                    <el-table-column label="序号" type="index" width="50"></el-table-column>
                    <el-table-column prop="name">
                      <template slot="header">
                        <p v-if="dataForm.messageType==3">
                          短信变量
                          <el-tooltip content="内容在第三方平台维护，绑定第三方平台短信变量，如：腾讯云：{1}，阿里云格式：${name}"
                            placement="top">
                            <a class="el-icon-warning-outline"></a>
                          </el-tooltip>
                        </p>
                        <p v-else>
                          变量
                          <el-tooltip content="内容在微信公众号管理后台维护，绑定模板变量，如：{first.DATA}。"
                            placement="top">
                            <a class="el-icon-warning-outline"></a>
                          </el-tooltip>
                        </p>
                      </template>
                      <template slot-scope="scope">
                        <p>{{scope.row.smsField}}</p>
                      </template>
                    </el-table-column>
                    <el-table-column label="参数">
                      <template slot-scope="scope">
                        <p style="line-height:36px">{{scope.row.field}}</p>
                      </template>
                    </el-table-column>
                    <el-table-column label="标题" v-if="dataForm.messageType==7">
                      <template slot-scope="scope">
                        <el-checkbox v-model="scope.row.isTitle" disabled
                          @change='changeKey($event,scope.row)' :true-label="1" :false-label="0" />
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-form>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false" size="small">{{$t('common.cancelButton')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getMsgTemplateDetail, getMsgTypeList } from '@/api/msgCenter/msgTemplate'
export default {
  name: 'msgTemplate-Detail',
  data() {
    return {
      dataForm: {
        id: '',
        fullName: '',
        enCode: '',
        templateType: 0,
        messageType: '',
        messageSource: '',
        enabledMark: 0,
        sortCode: '',
        description: '',
        title: '',
        content: '',
        templateCode: '',
      },
      btnLoading: false,
      loading: false,
      messageSourceList: [],
      messageTypeList: [],
      smsList: [],
      visible: false,
      keyword: "",
      parameterList: [],
      allParameterList: [],
    }
  },
  methods: {
    init(id) {
      this.visible = true
      this.dataForm.id = id || ''
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.getConfig()
      })
    },
    getConfig() {
      this.loading = true
      this.$store.dispatch('base/getMsgTypeList').then((res) => {
        this.messageTypeList = res
        getMsgTypeList(4).then(res => {
          this.messageSourceList = res.data
          if (this.dataForm.id) {
            getMsgTemplateDetail(this.dataForm.id).then(res => {
              this.loading = false
              this.dataForm = res.data
              this.parameterList = res.data.templateParamList
              this.allParameterList = this.parameterList
              if (this.dataForm.enabledMark) this.dataForm.enabledMark = Number(this.dataForm.enabledMark)
              this.smsList = res.data.smsFieldList
              const sourceItem = this.messageSourceList.find(item => {
                return item.enCode == this.dataForm.messageSource
              })
              const typeItem = this.messageTypeList.find(item => {
                return item.enCode == this.dataForm.messageType
              })
              if (sourceItem) this.dataForm.messageSourceVal = sourceItem.fullName
              if (typeItem) this.dataForm.messageTypeVal = typeItem.fullName
            }).catch(() => {
              this.loading = false
            })
          }
        }).catch(() => {
          this.loading = false
        })
      }).catch(() => {
        this.loading = false
      })
    },
    goBack() {
      this.$emit('close')
    },
    searchParameter() {
      this.parameterList = this.allParameterList.filter(item => {
        if (item.field.toLowerCase().includes(this.keyword.toLowerCase()) || item.fieldName.toLowerCase().includes(this.keyword.toLowerCase())) {
          return item
        }
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.main {
  margin-top: 20px;
  p {
    color: #606266;
  }
  .parameter-box {
    display: flex;
    .left-pane {
      width: 350px;
      height: 323px;
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
        }
        >>> .el-input {
          width: auto;
          margin: 5px 10px;
        }

        >>> .el-table {
          border-top: unset;
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
}
</style>