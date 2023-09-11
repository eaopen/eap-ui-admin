<template>
  <div>
    <template v-if="formConf.popupType==='general'&&dialogLoading">
      <el-dialog :title="!dataForm.id?'新建':'编辑'" :close-on-click-modal="false"
        :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center" lock-scroll @close='goBack()'
        :width="formConf.generalWidth">
        <parser :form-conf="formConf" @submit="submitForm" :key="key" ref="dynamicForm"
          v-if="!loading" />
        <span slot="footer" class="dialog-footer">
          <div class="upAndDown-button" v-if="dataForm.id&&showMoreBtn">
            <el-button @click="prev" :disabled='prevDis'>
              {{'上一条'}}
            </el-button>
            <el-button @click="next" :disabled='nextDis'>
              {{'下一条'}}
            </el-button>
          </div>
          <template v-if="formConf.hasPrintBtn && formConf.printId && dataForm.id && false">
            <el-button type="primary" @click="print">
              {{formConf.printButtonText||'打 印'}}
            </el-button>
          </template>
          <el-button @click="goBack">{{formConf.cancelButtonText||'取 消'}}</el-button>
          <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading"
            :disabled='continueBtnLoading'>
            {{formConf.confirmButtonText||'确 定'}}</el-button>
          <el-button type="primary" @click="dataFormSubmit(2)" :loading="continueBtnLoading"
            v-if="!dataForm.id||type!=5" :disabled='btnLoading'>
            {{!dataForm.id ?'确定并新增':'确定并继续'}}</el-button>
        </span>
      </el-dialog>
    </template>
    <template v-if="formConf.popupType==='fullScreen'">
      <transition name="el-zoom-in-center">
        <div class="JNPF-preview-main">
          <div class="JNPF-common-page-header">
            <el-page-header @back="goBack" :content="!dataForm.id ? '新建' : '编辑'" />
            <div class="options">
              <el-dropdown class="dropdown" placement="bottom">
                <el-button style="width:70px" :disabled='continueBtnLoading'>
                  更 多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <template v-if="dataForm.id && showMoreBtn">
                    <el-dropdown-item @click.native="prev" :disabled='prevDis'>
                      {{'上一条'}}
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="next" :disabled='nextDis'>
                      {{'下一条'}}
                    </el-dropdown-item>
                  </template>
                  <el-dropdown-item type="primary" @click.native="dataFormSubmit(2)"
                    v-if="!dataForm.id||type!=5" :loading="continueBtnLoading"
                    :disabled='btnLoading'>
                    {{!dataForm.id ?'确定并新增':'确定并继续'}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <template v-if="formConf.hasPrintBtn && formConf.printId && dataForm.id && false">
                <el-button type="primary" @click="print">
                  {{formConf.printButtonText||'打 印'}}
                </el-button>
              </template>
              <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading"
                :disabled='continueBtnLoading'>
                {{formConf.confirmButtonText||'确 定'}}</el-button>
              <el-button @click="goBack" :disabled='continueBtnLoading'>
                {{formConf.cancelButtonText||'取 消'}}</el-button>
            </div>
          </div>
          <div class="dynamic-form-main" v-if="!loading"
            :style="{margin: '0 auto',width:formConf.fullScreenWidth}">
            <parser :form-conf="formConf" @submit="submitForm" :key="key" ref="dynamicForm" />
          </div>
        </div>
      </transition>
    </template>
    <template v-if="formConf.popupType==='drawer'">
      <el-drawer :title="!dataForm.id ? '新建' : '编辑'" :visible.sync="visible"
        :wrapperClosable="false" :size='formConf.drawerWidth' append-to-body @close='goBack()'
        class="JNPF-common-drawer">
        <div class="JNPF-flex-main">
          <div class="dynamicForm">
            <parser :form-conf="formConf" @submit="submitForm" :key="key" ref="dynamicForm"
              v-if="!loading" />
          </div>
          <div class="drawer-footer">
            <div class="upAndDown-button" v-if="dataForm.id&& showMoreBtn">
              <el-button @click="prev" :disabled='prevDis'>
                {{'上一条'}}
              </el-button>
              <el-button @click="next" :disabled='nextDis'>
                {{'下一条'}}
              </el-button>
            </div>
            <template v-if="formConf.hasPrintBtn && formConf.printId && dataForm.id && false">
              <el-button type="primary" @click="print">
                {{formConf.printButtonText||'打 印'}}
              </el-button>
            </template>
            <el-button @click="goBack()">{{formConf.cancelButtonText||'取 消'}}</el-button>
            <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading"
              :disabled='continueBtnLoading'>
              {{formConf.confirmButtonText||'确 定'}}</el-button>
            <el-button type="primary" @click="dataFormSubmit(2)" v-if="!dataForm.id||type!=5"
              :loading="continueBtnLoading" :disabled='btnLoading'>
              {{!dataForm.id ?'确定并新增':'确定并继续'}}</el-button>
          </div>
        </div>
      </el-drawer>
    </template>
    <PrintDialog v-if="printDialogVisible" ref="printDialog" @change="printBrowseHandle">
    </PrintDialog>

    <print-browse :visible.sync="printBrowseVisible" :id="printId" :formId="dataForm.id" />
  </div>
</template>

<script>
import PrintDialog from '@/components/extn/PrintDialog'
import { createModel, updateModel, getModelInfo } from '@/api/onlineDev/visualDev'
import Parser from '@/components/extnGenerator/parser/Parser'
import PrintBrowse from '@/components/extn/PrintBrowse'
import { deepClone } from '@/utils'
import { mapGetters } from "vuex";

export default {
  components: { Parser, PrintBrowse, PrintDialog },
  data() {
    return {
      printId: '',
      printDialogVisible: false,
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
      printBrowseVisible: false,
      formOperates: [],
      dialogLoading: false,
      continueBtnLoading: false,
      index: 0,
      prevDis: false,
      nextDis: false,
      allList: [],
      showMoreBtn: true,
      type: 1,
      refreshDataList: false
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  methods: {
    goBack() {
      this.destroyStyle()
      this.visible = false
      this.$emit('refreshDataList', this.refreshDataList)
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
        if (this.formConf.printId.length > 1) {
          this.$refs.printDialog.init(this.formConf.printId)
          return
        }
        this.printBrowseHandle(this.formConf.printId)
      })
    },
    init(formConf, modelId, id, isPreview, useFormPermission, allList, type) {
      this.formConf = deepClone(formConf)
      this.modelId = modelId
      this.isPreview = isPreview
      this.useFormPermission = useFormPermission
      this.dataForm.id = id || ''
      this.getFormOperates()
      this.loading = true
      this.dialogLoading = false
      this.prevDis = false
      this.nextDis = false
      this.allList = allList || []
      this.type = type
      if (type == 3 || type == 5) {
        this.showMoreBtn = false
      } else {
        if (this.allList.length) {
          this.index = this.allList.findIndex(item => item.id === id)
          if (this.index == 0) this.prevDis = true
          if (this.index == this.allList.length - 1) this.nextDis = true
        } else {
          this.prevDis = true
          this.nextDis = true
        }
      }

      this.$nextTick(() => {
        if (this.dataForm.id) {
          let extra = {
            modelId,
            id,
            type: 2
          }
          this.$store.commit('generator/SET_DYNAMIC_MODEL_EXTRA', extra)
          getModelInfo(modelId, this.dataForm.id).then(res => {
            this.dataForm = res.data
            if (!this.dataForm.data) return
            this.formData = { ...JSON.parse(this.dataForm.data), id: this.dataForm.id }
            this.fillFormData(this.formConf, this.formData)
            this.dialogLoading = true
            this.$nextTick(() => {
              this.visible = true
              this.loading = false
            })
          })
        } else {
          this.$store.commit('generator/SET_DYNAMIC_MODEL_EXTRA', {})
          this.formData = {}
          this.fillFormData(this.formConf, this.formData, "add")
          this.dialogLoading = true
          this.$nextTick(() => {
            this.visible = true
            this.loading = false
          })
        }
        this.key = +new Date()
      })
    },
    prev() {
      this.index--
      if (this.index === 0) this.prevDis = true
      this.nextDis = false
      this.renewModelInfo()
    },
    next() {
      this.index++
      if (this.index === this.allList.length - 1) this.nextDis = true
      this.prevDis = false
      this.renewModelInfo()
    },
    renewModelInfo() {
      getModelInfo(this.modelId, this.allList[this.index].id).then(res => {
        this.dataForm = res.data
        if (!this.dataForm.data) return
        this.resetForm()
        let formData = { ...JSON.parse(this.dataForm.data), id: this.dataForm.id }
        this.fillFormData(this.formConf, formData)
        this.$nextTick(() => {
          this.key = +new Date()
        })
      })
    },
    getFormOperates() {
      if (this.isPreview || !this.useFormPermission) return
      const permissionList = this.$store.getters.permissionList
      const modelId = this.$route.meta.modelId
      const list = permissionList.filter(o => o.modelId === modelId)
      this.formOperates = list[0] && list[0].form ? list[0].form : []
    },
    fillFormData(form, data, flag) {
      const loop = (list, parent) => {
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          if (item.__vModel__) {
            let val = data.hasOwnProperty(item.__vModel__) ? data[item.__vModel__] : item.__config__.defaultValue
            if (!item.__config__.isSubTable) item.__config__.defaultValue = val
            if (flag == "add" || item.__config__.isSubTable == true) {//新增时候，默认当前
              if (item.__config__.jnpfKey === 'date' && item.__config__.defaultCurrent) {
                let format = item.format
                let dateStr = this.jnpf.toDate(new Date().getTime(), format)
                let time = format === 'yyyy' ? '-01-01 00:00:00' : format === 'yyyy-MM' ? '-01 00:00:00' : format === 'yyyy-MM-dd' ?
                  ' 00:00:00' : ''
                val = new Date(dateStr + time).getTime()
                item.__config__.defaultValue = val
              } else if (item.__config__.jnpfKey === 'comSelect' && item.__config__.defaultCurrent) {
                if (this.userInfo.organizeIdList instanceof Array && this.userInfo.organizeIdList.length > 0) {
                  val = item.multiple == true ? [this.userInfo.organizeIdList] : this.userInfo.organizeIdList
                } else {
                  val = []
                }
                item.__config__.defaultValue = val
              } else if (item.__config__.jnpfKey === 'time' && item.__config__.defaultCurrent) {
                item.__config__.defaultValue = this.jnpf.toDate(new Date(), item.format)
              }
            }
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
      if (type == 2) {
        this.refreshDataList = true
        this.continueBtnLoading = true
      } else {
        this.btnLoading = true
      }
      const formData = { ...this.formData, ...data }
      this.dataForm.data = JSON.stringify(formData)
      const formMethod = this.dataForm.id ? updateModel : createModel
      formMethod(this.modelId, this.dataForm).then(res => {
        if (this.dataForm.id) {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              if (callback && typeof callback === "function") callback()
              this.$nextTick(() => {
                if (type == 2) {
                  getModelInfo(this.modelId, this.dataForm.id).then(res => {
                    this.dataForm = res.data
                    this.continueBtnLoading = false
                    if (!this.dataForm.data) return
                    this.formData = { ...JSON.parse(this.dataForm.data), id: this.dataForm.id }
                    this.fillFormData(this.formConf, this.formData)
                  })
                } else {
                  this.visible = false
                  this.destroyStyle()
                  this.btnLoading = false
                  this.$emit('refreshDataList', true)
                }
              })
            }
          })
        } else {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              if (callback && typeof callback === "function") callback()
              this.$nextTick(() => {
                this.continueBtnLoading = false
                if (type == 2) {
                  this.resetForm()
                  this.$nextTick(() => {
                    this.key = +new Date()
                  })
                  return
                }
                this.visible = false
                this.btnLoading = false
                this.$emit('refreshDataList', true)
              })
            }
          })
        }
      }).catch(() => {
        this.continueBtnLoading = false
        this.btnLoading = false
      })
    },
    dataFormSubmit(type) {
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据保存', type: 'warning' })
      this.$refs.dynamicForm && this.$refs.dynamicForm.submitForm(type)
    },
    destroyStyle() {
      if (document.getElementById('styleId')) {
        document.getElementById('styleId').remove()
      }
    }
  }
}
</script>
