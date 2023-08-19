<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main flow-form-main">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack" content="测试发送" />
        <div class="options">
          <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
            {{$t('common.confirmButton')}}</el-button>
          <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
        </div>
      </div>
      <el-alert title="注意：测试发送的消息通知链接不支持跳转" type="warning" :closable="false" show-icon />
      <JNPF-table class="main-table" :data="testSendData" height="100%" v-loading="loading">
        <el-table-column prop="msgTemplateName" label="模板名称" width="150">
          <template slot-scope="scope">
            <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="messageType" label="模板类型" width="150"></el-table-column>
        <el-table-column prop="toUser" label="接收人" min-width="200">
          <template slot-scope="scope" v-if="scope.row.messageType != 'webhook'">
            <userSelect v-model="scope.row.toUser" placeholder="请选择接收人" :value='scope.row.toUser'
              multiple clearable />
          </template>
        </el-table-column>
        <el-table-column prop="parameterData" label="参数名称" min-width="200">
          <template slot-scope="scope">
            <div class="parameter-box" v-for="(item,index) in scope.row.paramJson" :key="index">
              {{item.field}}({{item.fieldName}})
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="parameterData" label="变量" min-width="200">
          <template slot-scope="scope">
            <div class="variable-box" v-for="(item,index) in scope.row.paramJson" :key="index">
              <el-input v-model="item.value" placeholder="请输入变量"></el-input>
            </div>
          </template>
        </el-table-column>
      </JNPF-table>
      <SendResults v-if="resultsVisible" ref="ResultsDialog" />
      <Detail v-if="viewVisible" ref="View" @close="viewVisible = false" />
    </div>
  </transition>
</template>
<script>
import { testSendConfigInfo, testSendConfig } from '@/api/extn/sendConfig'
import userSelect from '@/components/extn/userSelect'
import SendResults from './SendResults'
import Detail from '@/components/extnProcess/PropPanel/TemplateDetail'
import { deepClone } from '@/utils'

export default {
  components: { userSelect, SendResults, Detail },
  name: 'sendConfig-TestSend',
  data() {
    return {
      btnLoading: false,
      loading: false,
      resultsVisible: false,
      viewVisible: false,
      resultData: [],
      testSendData: [],
      resultList: []
    }
  },
  methods: {
    goBack() {
      this.$emit('close')
    },
    init(id) {
      this.$nextTick(() => {
        if (id) {
          this.loading = true
          testSendConfigInfo(id).then(res => {
            this.testSendData = res.data
            for (let index = 0; index < this.testSendData.length; index++) {
              const item = this.testSendData[index]
              item.paramJson = item.paramJson || []
              item.toUser = item.toUser || []
            }
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },
    dataFormSubmit() {
      for (let i = 0; i < this.testSendData.length; i++) {
        const item = this.testSendData[i]
        if (item.toUser && !item.toUser.length && item.messageType != 'webhook') {
          return this.$message.error(`${item.msgTemplateName}的接收人为空！`)
        }
        if (item.paramJson && item.paramJson.length) {
          for (let j = 0; j < item.paramJson.length; j++) {
            const cur = item.paramJson[j];
            if (!cur.value) {
              return this.$message.error(`${item.msgTemplateName}参数对应的变量为空！`)
            }
          }
        }
      }
      let data = deepClone(this.testSendData)
      this.btnLoading = true
      testSendConfig(data).then(res => {
        this.btnLoading = false
        this.resultList = res.data
        this.showSendResults()
      }).catch(() => {
        this.btnLoading = false
      })
    },
    showSendResults() {
      this.resultsVisible = true
      this.$nextTick(() => {
        this.$refs.ResultsDialog && this.$refs.ResultsDialog.init(this.resultList)
      })
    },
    goDetail(id) {
      this.viewVisible = true
      this.$nextTick(() => {
        this.$refs.View.init(id)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.main-table {
  .parameter-box {
    height: 30px;
    line-height: 30px;
    margin-bottom: 8px;
  }
  .variable-box {
    margin-bottom: 8px;
  }
}
</style>