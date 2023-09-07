import { mapGetters } from "vuex"
import { BillNumber } from '@/api/system/billRule'
const includeList = ['crmOrder', 'salesOrder', 'leaveApply']
export default {
  computed: {
    ...mapGetters(['userInfo']),
    formOperates() {
      return this.setting.formOperates
    }
  },
  data() {
    return {
      flowUrgentOptions: [{ value: 1, label: '普通' }, { value: 2, label: '重要' }, { value: 3, label: '紧急' }],
      fileList: [],
      setting: {},
      eventType: '',
      loading: false,
      tableRequiredData: {},
      formRef: 'dataForm',
    }
  },
  methods: {
    init(data) {
      this.dataForm.id = data.id || ''
      if (this.dataForm.id) this.loading = true
      this.setting = data
      this.updateDataRule()
      this.$nextTick(() => {
        this.$refs[this.formRef].resetFields()
        if (this.beforeInit && typeof this.beforeInit === "function") this.beforeInit()
        if (data.id) {
          let dataForm = data.draftData || data.formData
          if (this.selfGetInfo && typeof this.selfGetInfo === "function") {
            this.selfGetInfo(dataForm)
          } else {
            this.dataForm = dataForm
          }
          if (includeList.includes(data.formEnCode)) {
            this.fileList = JSON.parse(this.dataForm.fileJson)
          }
          this.loading = false
          this.$emit('setPageLoad')
          return
        } else {
          this.dataForm.flowId = data.flowId
          if (this.selfInit) this.selfInit(data)
          if (!this.billEnCode) return this.$emit('setPageLoad')
          BillNumber(this.billEnCode).then(res => {
            if (this.billEnCode === 'OrderNumber') {
              this.dataForm.orderCode = res.data
            } else {
              this.dataForm.billNo = res.data
            }
            this.$emit('setPageLoad')
          })
        }
      })
    },
    getPaymentMethodOptions() {
      this.$store.dispatch('base/getDictionaryData', { sort: 'WFSettlementMethod' }).then((res) => {
        this.paymentMethodOptions = res
      })
    },
    dataFormSubmit(eventType, flowUrgent) {
      this.eventType = eventType
      this.$refs[this.formRef].validate((valid) => {
        if (valid) {
          if (this.exist && !this.exist()) return
          if (this.selfExist && !this.selfExist()) return
          let dataForm = {}
          if (this.beforeSubmit && typeof this.beforeSubmit === "function") {
            dataForm = this.beforeSubmit()
          } else {
            dataForm = this.dataForm
          }
          if (includeList.includes(this.setting.formEnCode)) {
            dataForm.fileJson = JSON.stringify(this.fileList)
          }
          if (eventType === 'save' || eventType === 'submit') {
            if (this.selfSubmit && typeof this.selfSubmit === "function") {
              this.selfSubmit(dataForm, flowUrgent)
              return
            }
          }
          this.$emit('eventReceiver', { formData: dataForm }, eventType)
        }
      })
    },
    updateDataRule() {
      if (!this.setting.formOperates || !this.setting.formOperates.length) return this.dataRule = {}
      let newRules = {}
      for (let i = 0; i < this.setting.formOperates.length; i++) {
        const item = this.setting.formOperates[i]
        if (!item.id.includes('-')) {
          const newRulesItem = {
            required: item.required || false,
            message: item.name + '不能为空',
            trigger: item.trigger || 'blur'
          }
          if (!this.dataRule.hasOwnProperty(item.id)) {
            if (item.required) this.$set(newRules, item.id, [newRulesItem])
          } else {
            let withoutRequiredItem = true
            for (let i = 0; i < this.dataRule[item.id].length; i++) {
              if (this.dataRule[item.id][i].hasOwnProperty('required')) {
                this.dataRule[item.id][i].required = item.required || false
                withoutRequiredItem = false
              }
            }
            if (withoutRequiredItem && item.required) this.dataRule[item.id].push(newRulesItem)
          }
        } else {
          let key = item.id.split('-')[0]
          let newId = item.id.split('-')[1]
          let newItem = {
            ...item,
            id: newId
          }
          if (!this.tableRequiredData.hasOwnProperty(key)) {
            this.$set(this.tableRequiredData, key, [newItem])
          } else {
            this.tableRequiredData[key].push(newItem)
          }
        }
      }
      this.dataRule = { ...this.dataRule, ...newRules }
    },
    exist() {
      let isOk = true
      for (let key in this.tableRequiredData) {
        if (this.dataForm[key] && Array.isArray(this.dataForm[key])) {
          for (let i = 0; i < this.dataForm[key].length; i++) {
            let item = this.dataForm[key][i]
            inner: for (let id in item) {
              let arr = this.tableRequiredData[key].filter(o => o.id === id) || []
              if (!arr.length) continue inner
              if (arr[0].required) {
                let msg = `${arr[0].name}不能为空`
                let boo = true
                if (arr[0].dataType === 'array') {
                  boo = !this.jnpf.isEmptyArray(item[id])
                } else {
                  boo = !this.jnpf.isEmpty(item[id])
                }
                if (!boo) {
                  this.$message({
                    message: msg,
                    type: 'error',
                    duration: 1000
                  })
                  isOk = false
                  break
                }
              }
            }
          }
        }
      }
      return isOk
    },
    judgeRequired(id) {
      if (!this.formOperates || !this.formOperates.length) return false
      let arr = this.formOperates.filter(o => o.id === id) || []
      if (!arr.length) return false
      let item = arr[0]
      return item.required
    },
    judgeShow(id) {
      if (this.setting.opType == 4) return true
      if (!this.setting.formOperates || !this.setting.formOperates.length) return true
      let arr = this.setting.formOperates.filter(o => o.id === id) || []
      if (!arr.length) return true
      let item = arr[0]
      return item.read
    },
    judgeWrite(id) {
      if (this.setting.readonly) return true
      if (!this.setting.formOperates || !this.setting.formOperates.length) return false
      let arr = this.setting.formOperates.filter(o => o.id === id) || []
      if (!arr.length) return true
      let item = arr[0]
      return !item.write
    }
  }
}