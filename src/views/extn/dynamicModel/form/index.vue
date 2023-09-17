<template >
  <div class="JNPF-common-layout">
    <template v-if="config.enableFlow">
      <FlowBox v-if="flowVisible" ref="FlowBox" @close="closeFlow" />
      <el-dialog title="请选择流程" :close-on-click-modal="false" append-to-body
        :visible.sync="flowListVisible" class="JNPF-dialog template-dialog JNPF-dialog_center"
        lock-scroll width="400px">
        <el-scrollbar class="template-list">
          <div class="template-item" v-for="item in flowList" :key="item.id"
            @click="selectFlow(item)">{{item.fullName}}
          </div>
        </el-scrollbar>
      </el-dialog>
    </template>
    <div class="JNPF-preview-main" v-else>
      <div class="JNPF-common-page-header">
        <p>{{config.fullName}}</p>
        <div class="options">
          <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
            {{formConf.confirmButtonText||'确 定'}}</el-button>
          <el-button type="warning" @click="resetForm()">重置</el-button>
        </div>
      </div>
      <div class="dynamic-form-main" :style="{margin: '0 auto',width:formConf.fullScreenWidth}">
        <parser :form-conf="formConf" @submit="submitForm" :key="key" ref="dynamicForm"
          v-if="!loading" />
      </div>
    </div>
  </div>
</template>
<script>
import { createModel } from '@/api/onlineDev/visualDev'
import Parser from '@/components/extnGenerator/parser/Parser'
import FlowBox from '@/views/simpleflow/components/FlowBox'
import { getFlowList } from '@/api/bpm/simpleflow/FlowEngine'
import { mapGetters } from "vuex";
export default {
  components: { Parser, FlowBox },
  props: ['config', 'modelId', 'isPreview'],
  data() {
    return {
      visible: false,
      dataForm: {
        data: ''
      },
      btnLoading: false,
      loading: true,
      key: +new Date(),
      formConf: {},
      flowVisible: false,
      flowListVisible: false,
      flowList: [],
      flowItem: {},
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created() {
    this.init()
  },
  methods: {
    init(flag) {
      if (this.config.enableFlow) {
        this.getFlowList(flag)
      } else {
        this.formConf = JSON.parse(this.config.formData)
        this.fillFormData(this.formConf, {})
        this.loading = true
        this.$nextTick(() => {
          this.visible = true
          this.loading = false
          this.key = +new Date()
        })
      }
    },
    fillFormData(form, data, flag) {
      const loop = (list, parent) => {
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          if (item.__vModel__) {
            if (item.__config__.jnpfKey === 'date' && item.__config__.defaultCurrent) {
              let format = item.format
              let dateStr = this.jnpf.toDate(new Date().getTime(), format)
              let time = format === 'yyyy' ? '-01-01 00:00:00' : format === 'yyyy-MM' ? '-01 00:00:00' : format === 'yyyy-MM-dd' ?
                ' 00:00:00' : ''
              let value = new Date(dateStr + time).getTime()
              item.__config__.defaultValue = value
            } else if (item.__config__.jnpfKey === 'comSelect' && item.__config__.defaultCurrent) {
              if (this.userInfo.organizeIdList instanceof Array && this.userInfo.organizeIdList.length > 0) {
                item.__config__.defaultValue = item.multiple == true ? [this.userInfo.organizeIdList] : this.userInfo.organizeIdList
              } else {
                item.__config__.defaultValue = []
              }
            }
            else if (item.__config__.jnpfKey === 'time' && item.__config__.defaultCurrent) {
              item.__config__.defaultValue = this.jnpf.toDate(new Date(), item.format)
            }
          }
          if (item.__config__ && item.__config__.children && Array.isArray(item.__config__.children)) {
            loop(item.__config__.children, item)
          }
        }
      }
      loop(form.fields)
      form.formData = data
    },
    getFlowList(flag) {
      getFlowList(this.config.flowId, '1').then(res => {
        this.flowList = res.data
        if (flag && this.flowItem.id) return this.selectFlow(this.flowItem)
        if (!this.flowList.length) return this.$message({ type: 'error', message: '流程不存在' })
        if (this.flowList.length === 1) return this.selectFlow(this.flowList[0])
        this.flowListVisible = true
      })
    },
    selectFlow(item) {
      this.flowItem = item
      let data = {
        id: '',
        enCode: this.config.flowEnCode,
        flowId: item.id,
        formType: 2,
        opType: '-1',
        type: 1,
        modelId: this.modelId,
        isPreview: this.isPreview,
        fromForm: 1,
        hideCancelBtn: true
      }
      this.flowListVisible = false
      this.flowVisible = true
      this.$nextTick(() => {
        this.$refs.FlowBox.init(data)
      })
    },
    submitForm(data, callback) {
      if (!data) return
      this.btnLoading = true
      this.dataForm.data = JSON.stringify(data)
      createModel(this.modelId, this.dataForm).then(res => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            if (callback && typeof callback === "function") callback()
            this.btnLoading = false
            this.resetForm()
          }
        })
      }).catch(() => { this.btnLoading = false })
    },
    dataFormSubmit() {
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据保存', type: 'warning' })
      this.$refs.dynamicForm && this.$refs.dynamicForm.submitForm()
    },
    resetForm() {
      this.formConf = JSON.parse(this.config.formData)
      this.fillFormData(this.formConf, {})
      this.$nextTick(() => {
        this.$refs.dynamicForm && this.$refs.dynamicForm.resetForm()
      })
    },
    closeFlow(isRefresh) {
      if (isRefresh) this.init(true)
    },
  }
}
</script>
