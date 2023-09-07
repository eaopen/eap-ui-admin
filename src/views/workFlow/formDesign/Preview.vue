<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main flow-form-main">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack" :content="'预览表单【'+setting.fullName+'】'" />
        <div class="options">
          <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
        </div>
      </div>
      <div class="main">
        <component :is="currentView" @close="goBack" ref="form"></component>
      </div>
    </div>
  </transition>
</template>

<script>
import { getFormInfo } from '@/api/workFlow/FormDesign'
export default {
  data() {
    return {
      currentView: '',
      setting: {}
    }
  },
  methods: {
    goBack(isRefresh) {
      this.$emit('close', isRefresh)
    },
    init(data) {
      this.setting = data
      getFormInfo(data.formId).then(res => {
        const dataSource = data.dataSource === "propertyJson" ? "propertyJson" : "draftJson"
        if (!res.data || !res.data[dataSource]) return
        data.formConf = res.data[dataSource]
        data.type = res.data.type
        data.formOperates = []
        const formUrl = data.formType == 2 ? 'workFlow/workFlowForm/dynamicForm' : res.data.urlAddress ? res.data.urlAddress.replace(/\s*/g, "") : `workFlow/workFlowForm/${data.enCode}`
        this.currentView = (resolve) => require([`@/views/${formUrl}`], resolve)
        setTimeout(() => {
          this.$nextTick(() => {
            this.$refs.form && this.$refs.form.init(data)
          })
        }, 300)
      })
    },
  }
}
</script>