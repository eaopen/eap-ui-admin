<template>
  <el-dialog title="表单外链配置" :visible.sync="dialogVisible" :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center short_link_class" lock-scroll width="800px">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="100px"
      v-loading="loading">
      <el-form-item label="外链填单">
        <el-switch v-model="dataForm.formUse" :active-value="1" :inactive-value="0"></el-switch>
        <span class="short_link_span">开启后，会生成表单填写链接，无需登录即可填写表单。</span>
      </el-form-item>
      <el-form-item label="外链地址" v-if="dataForm.formUse==1">
        <el-row class="form-use-row">
          <el-input v-model="dataForm.formLink" class="form-use-input float-left" readonly>
          </el-input>
          <el-button-group class="btn-left">
            <el-button @click="open(dataForm.formLink)">打开</el-button>
            <el-button type="primary" @click="copy(dataForm.formLink,$event)">复制
            </el-button>
          </el-button-group>
          <el-popover placement="bottom-end" width="180" trigger="hover" class="btn-left">
            <div class="qrcode">
              <p>扫描二维码，分享此链接</p>
              <div id="qrcode" ref="qrCode" style="display: inline-block;margin: 2px 0px;"></div>
            </div>
            <div style="text-align: center; ">
              <el-button icon="icon-ym icon-ym-download" style="width: 100%;" size="mini"
                @click="download(1)">下载</el-button>
            </div>
            <div slot="reference" class="form-use-icon float-left ym-custom ym-custom-qrcode "
              @mouseover="getQRimg"></div>
          </el-popover>
        </el-row>
      </el-form-item>
      <el-form-item label="凭密码填写" v-if="dataForm.formUse==1" class="spacing">
        <el-row class="distance">
          <el-col :span="6">
            <el-switch v-model="dataForm.formPassUse" :active-value="1" :inactive-value="0">
            </el-switch>
          </el-col>
          <el-col :span="18">
            <el-input v-model="dataForm.formPassword" v-if="dataForm.formPassUse==1" type="password"
              placeholder="请输入密码" style="width:200px" show-password maxlength="20">
            </el-input>
          </el-col>
        </el-row>
      </el-form-item>
      <el-divider></el-divider>
      <el-form-item label="公开查询">
        <el-switch v-model="dataForm.columnUse" :active-value="1" :inactive-value="0">
        </el-switch>
        <span class="short_link_span">开启后，无需登录即可查询已有数据。</span>
      </el-form-item>
      <el-form-item label="查询地址" v-if="dataForm.columnUse==1">
        <el-row class="form-use-row">
          <el-input v-model="dataForm.columnLink" class="form-use-input float-left" readonly>
          </el-input>
          <el-button-group class="btn-left">
            <el-button @click="open(dataForm.columnLink)" class="float-left">打开</el-button>
            <el-button type="primary" @click="copy(dataForm.columnLink,$event)"
              class="float-left">复制
            </el-button>
          </el-button-group>
          <el-popover placement="bottom-end" width="180" trigger="hover" class="btn-left">
            <div class="qrcode">
              <p>扫描二维码，分享此链接</p>
              <div id="qrcode2" ref="qrCode2" style="display: inline-block;margin: 2px 0px;">
              </div>
            </div>
            <div style="text-align: center; ">
              <el-button icon="icon-ym icon-ym-download" style="width: 100%;" size="mini"
                @click="download(2)">下载</el-button>
            </div>
            <div slot="reference" class="form-use-icon float-left ym-custom ym-custom-qrcode "
              @mouseover="getQRimg2"></div>
          </el-popover>
        </el-row>
      </el-form-item>
      <template v-if="dataForm.columnUse==1">
        <el-row class="spacing">
          <el-form-item label="查询条件" prop="columnCondition">
            <el-select v-model="columnCondition" placeholder="请选择查询条件" clearable multiple filterable
              @change="columnConditionChange">
              <el-option v-for="item in searchList " :key="item.__vModel__" :label="item.label"
                :value="item.__vModel__">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="显示内容" prop="columnText">
            <el-select v-model="columnText" placeholder="请选择显示内容" clearable multiple filterable
              @change="columnTextChange">
              <el-option v-for="item in listOptions" :key="item.__vModel__" :label="item.label"
                :value="item.__vModel__">
              </el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-form-item label="凭密码填写">
          <el-row class="distance">
            <el-col :span="6">
              <el-switch v-model="dataForm.columnPassUse" :active-value="1" :inactive-value="0">
              </el-switch>
            </el-col>
            <el-col :span="18">
              <el-input v-model="dataForm.columnPassword" v-if="dataForm.columnPassUse==1"
                placeholder="请输入密码" style="width:200px" type="password" show-password
                maxlength="20">
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </template>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
        {{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import QRCode from 'qrcodejs2'
import clipboard from '@/utils/clipboard'
import { getShortLink, save } from '@/api/onlineDev/webDesign'
import { getVisualDevInfo } from '@/api/onlineDev/visualDev'
import ChangeField from '@/components/extn/ChangeField'
import { noColumnShowList, noSearchList } from '@/components/extnGenerator/generator/comConfig'
const getFormDataFields = item => {
  const jnpfKey = item.__config__.jnpfKey
  const fieldsList = ["comInput", "textarea", "numInput", "date", "time", "colorPicker", "rate", "slider", "editor", "link", "JNPFText", "alert"]
  const fieldsSelectList = ["radio", "checkbox", "select", "cascader", "treeSelect"]
  if (fieldsList.includes(jnpfKey) || fieldsSelectList.includes(jnpfKey) && item.__config__.dataType === 'static') return item
}
export default {
  components: { ChangeField },
  data() {
    return {
      previewAppVisible: false,
      changeFieldVisible: false,
      qrCodeText: '',
      dialogVisible: false,
      loading: false,
      btnLoading: false,
      visible: false,
      dataForm: {
        id: '',
        formLink: '',
        formUse: 0,
        formPassUse: 0,
        formPassword: '',
        columnUse: 0,
        columnLink: '',
        columnPassUse: 0,
        columnPassword: '',
        columnCondition: [],
        columnText: [],
      },
      columnCondition: [],
      columnText: [],
      dataRule: {
        formPassword: [
          {
            required: true,
            message: '请输入',
            trigger: 'blur'
          },
          {
            pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^(0-9a-zA-Z)]).{6,16}$/,
            message: '密码必须由数字、字母、特殊字符组合,请输入6-16位',
            trigger: 'blur'
          },
        ],
        columnPassword: [
          {
            required: true,
            message: '请输入',
            trigger: 'blur'
          },
          {
            pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^(0-9a-zA-Z)]).{6,16}$/,
            message: '密码必须由数字、字母、特殊字符组合,请输入6-16位',
            trigger: 'blur'
          },
        ],
      },
      qrcode: '',
      formData: '',
      listOptions: [],
      searchList: [],
      type: ''
    }
  },
  methods: {
    download(type) {
      let qrcode = ''
      if (type == 1) {
        qrcode = document.querySelector('#qrcode')
      } else {
        qrcode = document.querySelector('#qrcode2')
      }
      const canvas = qrcode.querySelector('canvas')
      const imgurl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = imgurl
      a.download = '二维码' // 图片名称
      a.click()
    },
    columnConditionChange(arr) {
      let list = []
      for (let index = 0; index < this.searchList.length; index++) {
        const element = this.searchList[index];
        arr.forEach(o => {
          if (element.__vModel__ == o) {
            list.push(element)
          }
        })
      }
      this.dataForm.columnCondition = list
    },
    columnTextChange(arr) {
      let list = []
      for (let index = 0; index < this.listOptions.length; index++) {
        const element = this.listOptions[index];
        arr.forEach(o => {
          if (element.__vModel__ == o) {
            list.push(element)
          }
        })
      }
      this.dataForm.columnText = list
    },
    init(id) {
      this.btnLoading = false
      this.columnCondition = ''
      this.columnText = ''
      getShortLink(id).then(res => {
        this.dataForm = res.data || {}
        this.dataForm.columnCondition = this.dataForm.columnCondition ? JSON.parse(this.dataForm.columnCondition) : []
        this.dataForm.columnText = this.dataForm.columnText ? JSON.parse(this.dataForm.columnText) : []
        let column = []
        if (this.dataForm.columnCondition.length) {
          this.dataForm.columnCondition.forEach(o => {
            column.push(o.__vModel__)
          })
        }
        this.columnCondition = column
        let text = []
        if (this.dataForm.columnText.length) {
          this.dataForm.columnText.forEach(o => {
            text.push(o.__vModel__)
          })
        }
        this.columnText = text
      })
      getVisualDevInfo(id).then(res => {
        this.formData = res.data.formData && JSON.parse(res.data.formData)
        let list = []
        const loop = (data, parent) => {
          if (!data) return
          if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
            loop(data.__config__.children, data)
          }
          if (Array.isArray(data)) data.forEach(d => loop(d, parent))
          if (data.__config__ && data.__config__.jnpfKey) {
            const visibility = !data.__config__.visibility || (Array.isArray(data.__config__.visibility) && data.__config__.visibility.includes('pc'))
            if (data.__config__.layout === "colFormItem" && data.__vModel__ && visibility) {
              const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table'
              const id = isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__
              const label = isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label
              data.__vModel__ = id
              data.__config__.label = label
              list.push(data)
            }
          }
        }
        loop(this.formData.fields)
        this.listOptions = list
        this.listOptions = list.filter(o => noColumnShowList.indexOf(o.__config__.jnpfKey) < 0 || o.__config__.isStorage == 2)
        this.searchList = list.filter(o => noSearchList.indexOf(o.__config__.jnpfKey) < 0)
        this.listOptions = this.listOptions.filter(o => getFormDataFields(o))
        this.searchList = this.searchList.filter(o => getFormDataFields(o))
        this.searchList = this.searchList.map(o => ({
          label: o.__config__.label,
          prop: o.__vModel__,
          fixed: 'none',
          align: 'left',
          jnpfKey: o.__config__.jnpfKey,
          sortable: false,
          width: null,
          type: 1,
          ...o
        }));
        this.listOptions = this.listOptions.map(o => ({
          label: o.__config__.label,
          prop: o.__vModel__,
          fixed: 'none',
          align: 'left',
          jnpfKey: o.__config__.jnpfKey,
          sortable: false,
          width: null,
          type: 1,
          ...o
        }));
      })
      this.dialogVisible = true
    },
    change(type) {
      this.type = type
      this.changeFieldVisible = true
      this.$nextTick(() => {
        this.$refs.ChangeField.openDialog()
      })
    },
    copy(text, event) {
      clipboard(text, event)
    },
    open(val) {
      window.open(val)
    },
    getQRimg() {
      if (!this.dataForm.formLink) {
        return
      }
      this.$refs.qrCode.innerHTML = "";
      this.qrcode = new QRCode(this.$refs.qrCode, {
        width: 150,
        height: 150, // 高度
        text: this.dataForm.formLink, // 二维码内容
        // render: 'canvas' // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
        // background: '#f0f'
        // foreground: '#ff0'
        correctLevel: QRCode.CorrectLevel.H //容错级别 容错级别有：（1）QRCode.CorrectLevel.L （2）QRCode.CorrectLevel.M （3）QRCode.CorrectLevel.Q （4）QRCode.CorrectLevel.H
      })
    },
    getQRimg2() {
      if (!this.dataForm.columnLink) {
        return
      }
      this.$refs.qrCode2.innerHTML = "";
      this.qrcode = new QRCode(this.$refs.qrCode2, {
        width: 150,
        height: 150, // 高度
        text: this.dataForm.columnLink, // 二维码内容
        // render: 'canvas' // 设置渲染方式（有两种方式 table和canvas，默认是canvas）
        // background: '#f0f'
        // foreground: '#ff0'
        correctLevel: QRCode.CorrectLevel.H //容错级别 容错级别有：（1）QRCode.CorrectLevel.L （2）QRCode.CorrectLevel.M （3）QRCode.CorrectLevel.Q （4）QRCode.CorrectLevel.H
      })
    },
    dataFormSubmit() {
      if (this.dataForm.formPassUse == 0) this.dataForm.formPassword = ''
      if (this.dataForm.columnPassUse == 0) this.dataForm.columnPassword = ''
      if (this.dataForm.formPassUse == 1 && !this.dataForm.formPassword) return this.$message.error('请输入表单凭密码填写')
      if (this.dataForm.columnPassUse == 1 && !this.dataForm.columnPassword) return this.$message.error('请输入列表凭密码填写')
      this.btnLoading = true
      if (typeof this.dataForm.columnCondition !== 'string') this.dataForm.columnCondition = JSON.stringify(this.dataForm.columnCondition)
      if (typeof this.dataForm.columnText !== 'string') this.dataForm.columnText = JSON.stringify(this.dataForm.columnText)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          save(this.dataForm).then(res => {
            this.$message({
              type: 'success',
              message: res.msg,
              duration: 1000,
              onClose: () => {
                this.$nextTick(() => {
                  this.dialogVisible = false
                  this.visible = false
                  this.btnLoading = false
                  this.$emit('close', true)
                })
              }
            })
          })
        } else {
          this.btnLoading = false
        }
      })
    }
  }
}
</script>
<style  lang="scss" scoped>
.short_link_class {
  >>> .el-form-item__label {
    font-weight: bolder;
  }
  >>> .el-dialog__body {
    height: 500px;
  }
  .short_link_span {
    margin-left: 15px;
  }

  .form-use-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
  }
  .form-use-input {
    flex: 1;
  }

  .form-use-icon {
    font-size: 32px;
  }
}
.spacing {
  margin-top: 18px;
}
.distance {
  width: 200px;
}
.qrcode {
  text-align: center;
}
>>> .el-form-item__error {
  margin-left: 50px;
}
.btn-left {
  margin-left: 15px;
}
</style>