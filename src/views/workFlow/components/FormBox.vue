<template>
  <el-dialog :title="setting.title" :close-on-click-modal="false" :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body width='1000px'
    destroy-on-close>
    <div class="main" v-loading="loading">
      <component :is="currentView" ref="form" @setLoad="setLoad"
        @setCandidateLoad="setCandidateLoad" @setPageLoad="setPageLoad" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { FlowBeforeInfo } from '@/api/workFlow/FlowBefore'
export default {
  data() {
    return {
      currentView: '',
      setting: {},
      flowFormInfo: {},
      flowTaskInfo: {},
      visible: false,
      loading: false,
      btnLoading: false,
    }
  },
  methods: {
    init(data) {
      this.loading = true
      this.setting = data
      this.visible = true
      this.getBeforeInfo(data)
    },
    getBeforeInfo(data) {
      FlowBeforeInfo(data.id, { taskNodeId: data.taskNodeId, flowId: data.flowId }).then(res => {
        this.flowFormInfo = res.data.flowFormInfo
        this.flowTaskInfo = res.data.flowTaskInfo
        data.fullName = this.flowTaskInfo.fullName
        this.flowUrgent = this.flowTaskInfo.flowUrgent || 1
        data.type = this.flowTaskInfo.type
        data.formData = res.data.formData || {}
        data.draftData = res.data.draftData || null
        const formUrl = this.flowFormInfo.formType == 2 ? 'workFlow/workFlowForm/dynamicForm' : this.flowFormInfo.urlAddress ? this.flowFormInfo.urlAddress.replace(/\s*/g, "") : `workFlow/workFlowForm/${this.flowFormInfo.enCode}`
        this.currentView = (resolve) => require([`@/views/${formUrl}`], resolve)
        data.formConf = res.data.flowFormInfo.propertyJson
        if (data.opType != 1) data.readonly = true
        data.formOperates = res.data.formOperates || []
        if (data.opType == 0) {
          for (let i = 0; i < data.formOperates.length; i++) {
            data.formOperates[i].write = false
          }
        }
        setTimeout(() => {
          this.$nextTick(() => {
            this.$refs.form && this.$refs.form.init(data)
          })
        }, 500)
      }).catch(() => { this.loading = false })
    },
    setPageLoad(val) {
      this.loading = !!val
    },
    setCandidateLoad(val) {
      this.candidateLoading = !!val
    },
    setLoad(val) {
      this.btnLoading = !!val
    }
  }
}
</script>
<style lang="scss" scoped>
.JNPF-dialog {
  .main {
    min-height: 50px;
  }
}
</style>
