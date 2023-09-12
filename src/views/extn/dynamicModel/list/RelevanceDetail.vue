<template>
  <div>
    <el-dialog title="详情" :close-on-click-modal="false" :visible.sync="visible"
      class="JNPF-dialog JNPF-dialog_center" lock-scroll :width="formData.generalWidth"
      append-to-body>
      <div class="dynamicDetail" v-loading="loading || mainLoading">
        <Parser :formConf="formData" :relationData="relationData" @toDetail="toDetail"
          v-if="!loading" :formValue="formValue" />
      </div>
      <span slot="footer" class="dialog-footer">
        <template v-if="formData.hasPrintBtn && formData.printId">
          <el-button type="primary" @click="print">
            {{formData.printButtonText||'打 印'}}
          </el-button>
        </template>
        <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      </span>
    </el-dialog>
    <print-browse :visible.sync="printBrowseVisible" :id="printId" :formId="dataForm.id" />
    <PrintDialog v-if="printDialogVisible" ref="printDialog" @change="printBrowseHandle">
    </PrintDialog>
  </div>
</template>

<script>
import PrintDialog from '@/components/extn/PrintDialog'
import { getDataChange, getConfigData } from '@/api/onlineDev/visualDev'
import { getDataInterfaceDataInfoByIds } from '@/api/extn/dataInterface'
import { deepClone } from '@/utils'
import Parser from './detail/Parser'
import PrintBrowse from '@/components/extn/PrintBrowse'
export default {
  name: 'RelevanceDetail',
  components: { Parser, PrintBrowse, PrintDialog },
  data() {
    return {
      printId: '',
      printDialogVisible: false,
      visible: false,
      dataForm: {
        id: '',
        data: ''
      },
      modelId: '',
      formData: {},
      formValue: {},
      loading: true,
      mainLoading: false,
      detailVisible: false,
      relationData: {},
      useFormPermission: false,
      printBrowseVisible: false,
      formOperates: []
    }
  },
  methods: {
    goBack() {
      this.$emit('close')
    },
    printBrowseHandle(id) {
      this.printDialogVisible = false
      this.printId = id;
      this.printBrowseVisible = true;
    },
    print() {
      if (this.isPreview) return this.$message({ message: '功能预览不支持打印', type: 'warning' })
      this.printDialogVisible = true
      this.$nextTick(() => {
        if (this.formData.printId.length == 1) {
          this.printBrowseHandle(this.formData.printId[0])
          return
        }
        this.$refs.printDialog.init(this.formData.printId)
      })
    },
    init(formData, modelId, id, useFormPermission) {
      this.formData = deepClone(formData)
      this.modelId = modelId
      this.useFormPermission = useFormPermission
      this.dataForm.id = id || ''
      this.getFormOperates()
      this.loading = true
      this.relationData = {}
      this.$nextTick(() => {
        if (this.dataForm.id) {
          let extra = {
            modelId,
            id,
            type: 2
          }
          this.$store.commit('extnGenerator/SET_DYNAMIC_MODEL_EXTRA', extra)
          getDataChange(modelId, this.dataForm.id).then(res => {
            this.dataForm = res.data
            if (!this.dataForm.data) return
            this.formValue = JSON.parse(this.dataForm.data)
            this.fillFormData(this.formData, this.formValue)
            this.initRelationForm(this.formData.fields)
            this.visible = true
          })
        } else {
          this.formValue = {}
          this.loading = false
          this.visible = false
          this.$emit('close')
        }
      })
    },
    initRelationForm(componentList) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (config.jnpfKey == 'relationFormAttr' || config.jnpfKey == 'popupAttr') {
          const relationKey = cur.relationField.split("_jnpfTable_")[0]
          componentList.forEach(item => {
            const noVisibility = Array.isArray(item.__config__.visibility) && !item.__config__.visibility.includes('pc')
            if ((relationKey == item.__vModel__) && (noVisibility || !!item.__config__.noShow)) {
              cur.__config__.noShow = true
            }
          })
        }
        if (cur.__config__.children && cur.__config__.children.length) this.initRelationForm(cur.__config__.children)
      })
    },
    unique(arr, attrName) {
      const res = new Map()
      // 根据对象的某个属性值去重
      return arr.filter(o => !res.has(o[attrName]) && res.set(o[attrName], 1))
    },
    handleAttrList(list) {
      let realList = this.unique(list, 'relationField')
      for (let i = 0; i < realList.length; i++) {
        const item = realList[i];
        let modelId = '', id = "", field = "", jnpfKey = '', activeItem = {}
        let prop = item.relationField.split('_jnpfTable_')[0]
        const loop = list => {
          for (let i = 0; i < list.length; i++) {
            if (prop === list[i].__vModel__) {
              jnpfKey = list[i].__config__.jnpfKey
              modelId = list[i].__config__.jnpfKey === 'relationForm' ? list[i].modelId : list[i].interfaceId
              id = list[i].__config__.defaultValue
              field = list[i].__config__.tableName ? list[i].__vModel__ + '_jnpfTable_' + list[i].__config__.tableName + (list[i].__config__.isSubTable ? '0' : "1") : list[i].__vModel__
              activeItem = list[i]
              break
            }
            if (list[i].__config__ && list[i].__config__.jnpfKey !== 'table' && list[i].__config__.children && Array.isArray(list[i].__config__.children)) {
              loop(list[i].__config__.children)
            }
          }
        }
        loop(this.formData.fields)
        if (!id) {
          this.$set(this.relationData, field, "")
          continue
        }
        if (jnpfKey === 'relationForm') {
          getDataChange(modelId, id).then(res => {
            if (!res.data || !res.data.data) {
              this.$set(this.relationData, field, "")
              return
            }
            let data = JSON.parse(res.data.data)
            this.$set(this.relationData, field, data)
          }).catch(() => { this.$set(this.relationData, field, "") })
        }
        if (jnpfKey === 'popupSelect') {
          const paramList = this.getParamList(activeItem)
          let query = {
            ids: [id],
            interfaceId: modelId,
            propsValue: activeItem.propsValue,
            relationField: activeItem.relationField,
            paramList
          }
          getDataInterfaceDataInfoByIds(modelId, query).then(res => {
            if (!res.data) return this.$set(this.relationData, field, "")
            this.$set(this.relationData, field, res.data && res.data.length ? res.data[0] : {})
          }).catch(() => { this.$set(this.relationData, field, "") })
        }
      }
    },
    getParamList(activeItem) {
      let templateJson = activeItem.templateJson
      if (!this.formValue) return templateJson
      for (let i = 0; i < templateJson.length; i++) {
        if (templateJson[i].relationField) {
          if (templateJson[i].relationField.includes('-')) {
            let tableVModel = templateJson[i].relationField.split('-')[0]
            let childVModel = templateJson[i].relationField.split('-')[1]
            templateJson[i].defaultValue = this.formValue[tableVModel] && this.formValue[tableVModel][this.rowIndex] && this.formValue[tableVModel][this.rowIndex][childVModel] || ''
          } else {
            templateJson[i].defaultValue = this.formValue[templateJson[i].relationField] || ''
          }
        }
      }
      return templateJson
    },
    toDetail(item) {
      if (!item.__config__.defaultValue) return
      this.mainLoading = true
      getConfigData(item.modelId).then(res => {
        this.mainLoading = false
        if (!res.data) return
        if (!res.data.formData) return
        let formData = JSON.parse(res.data.formData)
        formData.popupType = this.formData.popupType
        this.detailVisible = true
        this.$nextTick(() => {
          this.$refs.Detail.init(formData, item.modelId, item.__config__.defaultValue)
        })
      }).catch(() => { this.mainLoading = false })
    },
    getFormOperates() {
      if (!this.useFormPermission) return
      const permissionList = this.$store.getters.permissionList
      const modelId = this.$route.meta.modelId
      const list = permissionList.filter(o => o.modelId === modelId)
      this.formOperates = list[0] && list[0].form ? list[0].form : []
    },
    fillFormData(form, data) {
      let relationFormAttrList = []
      const loop = (list, parent) => {
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          if (item.__vModel__) {
            if (item.__config__.jnpfKey === 'relationForm' || item.__config__.jnpfKey === 'popupSelect') {
              item.__config__.defaultValue = data[item.__vModel__ + '_id']
              this.$set(item, 'name', data[item.__vModel__] || '')
            } else {
              const val = data.hasOwnProperty(item.__vModel__) ? data[item.__vModel__] : item.__config__.defaultValue
              item.__config__.defaultValue = val
            }
            if (this.useFormPermission) {
              let id = item.__config__.isSubTable ? parent.__vModel__ + '-' + item.__vModel__ : item.__vModel__
              let noShow = true
              if (this.formOperates && this.formOperates.length) {
                noShow = !this.formOperates.some(o => o.enCode === id)
              }
              noShow = item.__config__.noShow ? item.__config__.noShow : noShow
              this.$set(item.__config__, 'noShow', noShow)
            }
          }
          if (['relationFormAttr', 'popupAttr'].includes(item.__config__.jnpfKey)) relationFormAttrList.push(item)
          if (item.__config__ && item.__config__.children && Array.isArray(item.__config__.children)) {
            loop(item.__config__.children, item)
          }
        }
      }
      loop(form.fields)
      this.handleAttrList(relationFormAttrList)
      this.loading = false
    }
  }
}
</script>