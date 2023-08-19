<template >
  <div class="lock-container">
    <div class=" lock-form" v-show="formPassUse==1">
      <el-input placeholder="请输入验证码" show-password v-model="password">
        <el-button slot="append" @click="handleLogin" icon="ace-icon el-icon-unlock"
          :loading="passwordLoading">
        </el-button>
      </el-input>
    </div>
    <div class="JNPF-common-layout" v-show="formPassUse==0">
      <div class="main">
        <div class="form-top">
          <p>{{config.fullName}}</p>
        </div>
        <el-popover placement="bottom-end" width="180" trigger="hover">
          <div class="qrcode">
            <p>扫描二维码，分享此链接</p>
            <div id="qrcode" ref="qrCode" style="display: inline-block;margin: 2px 0px;"></div>
          </div>
          <div slot="reference" class="form-use-icon float-left ym-custom ym-custom-qrcode "
            @mouseover="getQRimg"></div>
        </el-popover>
        <div class="dynamic-form-center">
          <div class="dynamic-form-main" :style="{margin: '0 auto',width:formConf.fullScreenWidth}">
            <parser :form-conf="formConf" @submit="submitForm" :key="key" ref="dynamicForm"
              v-if="!loading " />
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
              {{formConf.confirmButtonText||'确 定'}}</el-button>
            <el-button type="warning" @click="resetForm()">重置</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Parser from '@/components/extnGenerator/parser/Parser'
//import FlowBox from '@/views/extn/workFlow/components/FlowBox'
import { getFlowList } from '@/api/extn/workFlow'
import { getConfig, checkPwd, createModel } from '@/api/onlineDev/webDesign'
import QRCode from 'qrcodejs2'
import md5 from 'js-md5';
const getFormDataFields = item => {
  if (!item.__config__ || !item.__config__.jnpfKey) return true
  const jnpfKey = item.__config__.jnpfKey
  const list = ["comInput", "textarea", "numInput", "switch", "date", "time", "colorPicker", "rate",
    "slider", "editor", "link", "JNPFText", "alert", 'table', "collapse", 'collapseItem', 'tabItem',
    "tab", "row", "card", 'groupTitle', 'divider'
  ]
  const fieldsSelectList = ["radio", "checkbox", "select", "cascader", "treeSelect"]
  if (list.includes(jnpfKey) || (fieldsSelectList.includes(jnpfKey) && item.__config__.dataType ===
    'static')) return true
  return false
}
export default {
  components: { Parser, FlowBox },
  props: ['config', 'modelId', 'isPreview', 'encryption'],
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
      formLink: '',
      formPassUse: 1,
      password: '',
      passwordLoading: false,
      id: ''
    }
  },
  created() {
    getConfig(this.modelId, this.encryption).then(res => {
      this.formLink = res.data.formLink || ''
      this.id = res.data.id || 0
      this.formPassUse = res.data.formPassUse || 0
      if (this.formPassUse == 1) return
      this.init()
    })
  },
  methods: {
    init(flag) {
      if (this.config.enableFlow) {
        this.getFlowList(flag)
      } else {
        this.formConf = JSON.parse(this.config.formData)
        this.formConf.fields = this.recurSiveFilter(this.formConf.fields)
        this.loading = true
        this.$nextTick(() => {
          this.visible = true
          this.loading = false
          this.key = +new Date()
        })
      }
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
    handleLogin() {
      this.passwordLoading = true
      if (!this.password) {
        this.$message({
          message: '请输入验证码',
          type: 'error'
        })
        this.passwordLoading = false
        return
      }
      let param = {
        id: this.id,
        type: 0,
        encryption: this.encryption,
        password: md5(this.password)
      }
      checkPwd(param).then((res) => {
        this.passwordLoading = false
        if (res.code == 200) {
          this.formPassUse = 0
          this.init()
        }
      }).catch(() => {
        this.passwordLoading = false
      })
    },
    recurSiveFilter(getDrawingList) {
      let newColumn = getDrawingList.filter(item => getFormDataFields(item))
      newColumn.forEach(x =>
        x.__config__ && x.__config__.children && Array.isArray(x.__config__.children) && (x
          .__config__.children = this.recurSiveFilter(x.__config__.children))
      )
      return newColumn
    },
    isIncludesTable(data) {
      if ((!data.__config__.layout || data.__config__.layout === 'rowFormItem') && data.__config__.jnpfKey !== 'table') return true
      return data.__config__.jnpfKey == 'table'
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
      createModel(this.modelId, this.dataForm, this.encryption).then(res => {
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
    getQRimg() {
      if (!this.formLink) {
        return
      }
      this.$refs.qrCode.innerHTML = "";
      this.qrcode = new QRCode(this.$refs.qrCode, {
        width: 150,
        height: 150, // 高度
        text: this.formLink, // 二维码内容
        // render: 'canvas' // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
        // background: '#f0f'
        // foreground: '#ff0'
        correctLevel: QRCode.CorrectLevel.H //容错级别 容错级别有：（1）QRCode.CorrectLevel.L （2）QRCode.CorrectLevel.M （3）QRCode.CorrectLevel.Q （4）QRCode.CorrectLevel.H
      })
    },
    dataFormSubmit() {
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据保存', type: 'warning' })
      this.$refs.dynamicForm && this.$refs.dynamicForm.submitForm()
    },
    resetForm() {
      this.formConf = JSON.parse(this.config.formData)
      this.formConf.fields = this.recurSiveFilter(this.formConf.fields)
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
<style lang="scss" scoped>
.main {
  width: 80%;
  height: calc(100% - 50px) !important;
  margin: 0 auto;
  position: relative;
  .form-top {
    height: 60px;
    line-height: 60px;
    text-align: center;
    background-color: rgb(24, 144, 255);
    color: #fff;
  }
}
.dynamic-form-center {
  height: calc(100% - 50px) !important;
  background-color: #fff;
  >>> .dynamic-form-main {
    height: calc(100% - 50px) !important;
    background-color: #fff;
  }
}
>>> .dialog-footer {
  position: absolute;
  right: 10px !important;
  bottom: 0px !important;
}
.form-use-icon {
  font-size: 40px;
  position: absolute;
  right: -40px;
  top: 0px;
}
.lock-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #e6e9f0;

  .lock-form {
    width: 250px;
    text-align: center;
    margin-top: -16%;
  }
}
</style> 