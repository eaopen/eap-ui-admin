<template>
  <div>
    <template v-if="dialogLoading">
      <el-dialog :title="!dataForm.id?'新建':'编辑'" :close-on-click-modal="false"
        :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center" lock-scroll @close='goBack()'
        width="600px">
        <parser :form-conf="formConf" @submit="submitForm" :key="key" ref="dynamicForm"
          v-if="!loading" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="goBack">{{formConf.cancelBtnText||'取 消'}}</el-button>
          <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
            {{formConf.confirmButtonText||'确 定'}}</el-button>
        </span>
      </el-dialog>
    </template>
  </div>
</template>

<script>
import { createModel, updateModel, getModelInfo } from '@/api/onlineDev/visualDev'
import Parser from '@/components/extnGenerator/parser/Parser'
import { deepClone } from '@/utils'
import { mapGetters } from "vuex";
export default {
  components: { Parser },
  data() {
    return {
      visible: false,
      key: +new Date(),
      formConf: {},
      dataForm: {
        id: '',
        data: ''
      },
      modelId: '',
      formData: {},
      btnLoading: false,
      loading: true,
      isPreview: false,
      useFormPermission: false,
      formOperates: [],
      dialogLoading: false,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  methods: {
    goBack() {
      this.visible = false
    },
    init(formConf, modelId, isPreview, useFormPermission, formData) {
      this.formConf = deepClone(formConf)
      this.modelId = modelId
      this.isPreview = isPreview
      this.useFormPermission = useFormPermission
      this.getFormOperates()
      this.loading = true
      this.dialogLoading = false
      this.$nextTick(() => {
        this.$store.commit('extnGenerator/SET_DYNAMIC_MODEL_EXTRA', {})
        this.formData = {}
        if (formData) {
          this.formData = formData
          this.dataForm.id = formData.id || ''
          this.showMoreBtn = false
        }
        this.fillFormData(this.formConf, this.formData)
        this.dialogLoading = true
        this.$nextTick(() => {
          this.visible = true
          this.loading = false
        })
        this.key = +new Date()
      })
    },
    getFormOperates() {
      if (this.isPreview || !this.useFormPermission) return
      const permissionList = this.$store.getters.permissionList
      const modelId = this.$route.meta.modelId
      const list = permissionList.filter(o => o.modelId === modelId)
      this.formOperates = list[0] && list[0].form ? list[0].form : []
    },
    fillFormData(form, data) {
      const loop = (list, parent) => {
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          if (item.__vModel__) {
            if (item.__config__.jnpfKey === 'date' && item.__config__.defaultCurrent) {
              item.__config__.defaultValue = new Date().getTime()
            } else if (item.__config__.jnpfKey === 'comSelect' && item.__config__.defaultCurrent) {
              if (this.userInfo.organizeIdList instanceof Array && this.userInfo.organizeIdList.length > 0) {
                item.__config__.defaultValue = item.multiple == true ? [this.userInfo.organizeIdList] : this.userInfo.organizeIdList
              } else {
                item.__config__.defaultValue = []
              }
            } else if (item.__config__.jnpfKey === 'time' && item.__config__.defaultCurrent) {
              item.__config__.defaultValue = this.jnpf.toDate(new Date(), item.format)
            }
            let val = data.hasOwnProperty(item.__vModel__) ? data[item.__vModel__] : item.__config__.defaultValue
            if (!item.__config__.isSubTable) item.__config__.defaultValue = val
            if (!this.isPreview && this.useFormPermission) {
              let id = item.__config__.isSubTable ? parent.__vModel__ + '-' + item.__vModel__ : item.__vModel__
              let noShow = true
              if (this.formOperates && this.formOperates.length) {
                noShow = !this.formOperates.some(o => o.enCode === id)
              }
              noShow = item.__config__.noShow ? item.__config__.noShow : noShow
              this.$set(item.__config__, 'noShow', noShow)
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
    resetForm() {
      this.$nextTick(() => {
        this.$refs.dynamicForm && this.$refs.dynamicForm.resetForm()
      })
    },
    submitForm(data, callback, type) {
      if (!data) return
      this.btnLoading = true
      const formData = { ...this.formData, ...data }
      this.dataForm.data = JSON.stringify(formData)
      const formMethod = this.dataForm.id ? updateModel : createModel
      formMethod(this.modelId, this.dataForm).then(res => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            if (callback && typeof callback === "function") callback()
            this.$nextTick(() => {
              this.visible = false
              this.btnLoading = false
              this.$emit('refreshDataList', true)
            })
          }
        })
      }).catch(() => {
        this.btnLoading = false
      })
    },
    dataFormSubmit(type) {
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据保存', type: 'warning' })
      this.$refs.dynamicForm && this.$refs.dynamicForm.submitForm(type)
    }
  }
}
</script>
