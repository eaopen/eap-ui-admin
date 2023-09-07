<template >
  <div class="flow-form" :style="{margin: '0 auto',width:formConf.fullScreenWidth}">
    <parser :form-conf="formConf" @submit="submitForm" :key="key" ref="dynamicForm"
      v-if="!loading" />
    <candidate-form :visible.sync="candidateVisible" :candidateList="this.candidateList"
      :branchList="branchList" @submitCandidate="selfHandleRequest" :formData="dataForm"
      :isCustomCopy="isCustomCopy" />
    <error-form :visible.sync="errorVisible" :nodeList="errorNodeList" @submit="handleError" />
  </div>
</template>
<script>
import { createModel, updateModel, getModelInfo } from '@/api/onlineDev/visualDev'
import { Candidates } from '@/api/workFlow/FlowBefore'
import Parser from '@/components/Generator/parser/Parser'
import CandidateForm from '@/views/workFlow/components/CandidateForm'
import ErrorForm from '@/views/workFlow/components/ErrorForm'
import { mapGetters } from "vuex";
export default {
  components: { Parser, CandidateForm, ErrorForm },
  data() {
    return {
      setting: {},
      formData: {},
      loading: true,
      eventType: '',
      flowUrgent: 1,
      key: +new Date(),
      formConf: {},
      isCustomCopy: false,
      candidateVisible: false,
      candidateList: [],
      candidateType: 1,
      branchList: [],
      errorVisible: false,
      errorNodeList: [],
      isAdd: false,
      dataForm: {
        id: '',
        formData: {},
        flowId: ''
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  methods: {
    init(data) {
      this.setting = data
      this.formConf = data.formConf ? JSON.parse(data.formConf) : {}
      this.formData = {}
      this.dataForm.id = data.id || ''
      this.isCustomCopy = this.setting.flowTemplateJson && this.setting.flowTemplateJson.properties && this.setting.flowTemplateJson.properties.isCustomCopy
      this.loading = true
      this.$nextTick(() => {
        let extra = {}
        if (data.id) {
          this.isAdd = false;
          extra = {
            modelId: data.flowId,
            id: data.id,
            type: data.type,
            flowId: data.flowId,
            processId: data.id,
            taskId: data.taskId,
            opType: data.opType
          }
          const formData = data.draftData || data.formData
          this.formData = { ...formData, flowId: data.flowId }
        } else {
          this.isAdd = true;
        }
        this.$store.commit('generator/SET_DYNAMIC_MODEL_EXTRA', extra)
        this.fillFormData(this.formConf, this.formData)
        this.$nextTick(() => {
          this.loading = false
          this.$emit('setPageLoad')
        })
        this.dataForm.flowId = data.flowId
        this.key = +new Date()
      })
    },
    fillFormData(form, data) {
      form.disabled = this.setting.readonly
      const loop = (list, parent) => {
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          if (item.__vModel__) {
            let val = data.hasOwnProperty(item.__vModel__) ? data[item.__vModel__] : ((this.isAdd) ? item.__config__.defaultValue : undefined)
            if (!item.__config__.isSubTable) item.__config__.defaultValue = val
            if ((this.isAdd || (!this.isAdd && item.__config__.isSubTable == true)) && item.__config__.jnpfKey === 'date' && item.__config__.defaultCurrent) {
              let format = item.format
              let dateStr = this.jnpf.toDate(new Date().getTime(), format)
              let time = format === 'yyyy' ? '-01-01 00:00:00' : format === 'yyyy-MM' ? '-01 00:00:00' : format === 'yyyy-MM-dd' ?
                ' 00:00:00' : ''
              let value = new Date(dateStr + time).getTime()
              item.__config__.defaultValue = value
            } else if ((this.isAdd || (!this.isAdd && item.__config__.isSubTable == true)) && item.__config__.jnpfKey === 'comSelect' && item.__config__.defaultCurrent) {
              if (this.userInfo.organizeIdList instanceof Array && this.userInfo.organizeIdList.length > 0) {
                val = item.multiple == true ? [this.userInfo.organizeIdList] : this.userInfo.organizeIdList
              } else {
                val = []
              }
              item.__config__.defaultValue = val
            } else if ((this.isAdd || (!this.isAdd && item.__config__.isSubTable == true)) && item.__config__.jnpfKey === 'time' && item.__config__.defaultCurrent) {
              val = this.jnpf.toDate(new Date(), item.format)
              item.__config__.defaultValue = val
            }
            let noShow = false, isDisabled = false, required = item.__config__.required || false
            if (this.setting.formOperates && this.setting.formOperates.length) {
              let id = item.__config__.isSubTable ? parent.__vModel__ + '-' + item.__vModel__ : item.__vModel__
              let arr = this.setting.formOperates.filter(o => o.id === id) || []
              if (arr.length) {
                let obj = arr[0]
                noShow = !obj.read
                isDisabled = !obj.write
                required = obj.required ? obj.required : item.__config__.required
              }
            }
            isDisabled = item.disabled ? item.disabled : isDisabled
            noShow = item.__config__.noShow ? item.__config__.noShow : noShow
            if (this.setting.readonly) isDisabled = true
            this.$set(item, 'disabled', isDisabled)
            this.$set(item.__config__, 'noShow', noShow)
            this.$set(item.__config__, 'required', required || false)
          }
          if (item.__config__ && item.__config__.children && Array.isArray(item.__config__.children)) {
            loop(item.__config__.children, item)
          }
        }
      }
      loop(form.fields)
      form.formData = data
    },
    submitForm(data, callback) {
      if (!data) return
      const formData = { ...this.formData, ...data }
      this.dataForm.formData = formData
      if (callback && typeof callback === "function") callback()
      this.$emit('eventReceiver', this.dataForm, this.eventType)
    },
    selfSubmit() {
      this.dataForm.status = this.eventType === 'submit' ? 0 : 1
      this.dataForm.flowId = this.setting.flowId
      this.dataForm.flowUrgent = this.flowUrgent || 1
      if (this.eventType === 'save') return this.selfHandleRequest()
      this.$emit('setCandidateLoad', true)
      Candidates(0, this.dataForm).then(res => {
        let data = res.data
        this.$emit('setCandidateLoad', false)
        this.candidateType = data.type
        if (data.type == 1) {
          this.branchList = res.data.list.filter(o => o.isBranchFlow)
          this.candidateList = res.data.list.filter(o => !o.isBranchFlow && o.isCandidates)
          this.candidateVisible = true
        } else if (data.type == 2) {
          this.branchList = []
          this.candidateList = res.data.list.filter(o => o.isCandidates)
          this.candidateVisible = true
        } else {
          if (this.isCustomCopy) {
            this.branchList = []
            this.candidateList = []
            this.candidateVisible = true
            return
          }
          this.$confirm('您确定要提交当前流程吗, 是否继续?', '提示', {
            type: 'warning'
          }).then(() => {
            this.selfHandleRequest()
          }).catch(() => { });
        }
      }).catch(() => {
        this.$emit('setCandidateLoad', false)
      })
    },
    selfHandleRequest(candidateData) {
      if (candidateData) this.dataForm = { ...this.dataForm, ...candidateData }
      this.dataForm.candidateType = this.candidateType
      if (!this.dataForm.id) delete (this.dataForm.id)
      if (this.eventType === 'save') this.$emit('setLoad', true)
      const formMethod = this.dataForm.id ? updateModel : createModel
      this.$emit('setCandidateLoad', true)
      formMethod(this.setting.flowId, this.dataForm).then(res => {
        const errorData = res.data
        if (errorData && Array.isArray(errorData) && errorData.length) {
          this.errorNodeList = errorData
          this.errorVisible = true
          this.$emit('setCandidateLoad', false)
        } else {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1000,
            onClose: () => {
              if (this.eventType === 'save') this.$emit('setLoad', false)
              this.candidateVisible = false
              this.errorVisible = false
              this.$emit('setCandidateLoad', false)
              this.$emit('close', true)
            }
          })
        }
      }).catch(() => {
        if (this.eventType === 'save') this.$emit('setLoad', false)
        this.$emit('setCandidateLoad', false)
      })
    },
    handleError(data) {
      if (this.eventType === 'submit') {
        this.dataForm.errorRuleUserList = data
        this.selfHandleRequest()
        return
      }
    },
    dataFormSubmit(eventType, flowUrgent) {
      if (this.setting.isPreview) return this.$message({ message: '功能预览不支持数据保存', type: 'warning' })
      this.eventType = eventType
      this.flowUrgent = flowUrgent
      this.$refs.dynamicForm && this.$refs.dynamicForm.submitForm()
    }
  }
}
</script>
