<template>
  <transition name="el-zoom-in-center">
    <div class="OBPM-preview-main flow-form-main">
      <div class="OBPM-common-page-header">
        <el-page-header @back="goBack" content="查看发送配置" />
        <div class="options">
          <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
        </div>
      </div>
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
            <el-form-item label="消息来源">
              <p>{{dataForm.messageSourceName}}</p>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortCode">
              <p>{{dataForm.sortCode}}</p>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="enabledMark">
              <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0"
                :disabled="false" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="说明" prop="description">
              <p>{{dataForm.description}}</p>
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
                        :inactive-value="0" :disabled="false" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                      <tableOpts :editDisabled="true" :delDisabled="true">
                        <el-dropdown>
                          <el-button type="text" size="mini">
                            {{$t('common.moreButton')}}<i class="el-icon-arrow-down el-icon--right" />
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
            </div>
          </el-col>
        </el-form>
      </el-row>
      <Detail v-if="viewVisible" ref="View" @close="closeViewForm" />
    </div>
  </transition>
</template>
<script>
import { getSendConfigDetail } from '@/api/extn/sendConfig'
import Detail from '../msgTemplate/Detail'

export default {
  components: { Detail },
  name: 'sendConfig-Detail',
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
  }
}
</script>
<style lang="scss" scoped>
.main {
  p {
    color: #999;
  }
}
</style>