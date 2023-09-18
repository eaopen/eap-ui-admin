<template>
  <el-dialog :close-on-click-modal="false" class="JNPF-dialog JNPF-dialog_center form-script-dialog"
    lock-scroll append-to-body v-bind="$attrs" width="800px" :modal-append-to-body="false"
    v-on="$listeners" destroy-on-close :visible.sync="visible">
    <span slot="title" class="dialog-title">
      <span>按钮事件配置
        <el-tooltip content="小程序不支持在线JS脚本" placement="top-start">
          <a class="el-icon-question tooltip-question"></a>
        </el-tooltip>
      </span>
    </span>
    <el-form class="form-script-dialog-body" ref="dataForm" :model="dataForm" :rules="dataRule"
      label-width="90px" label-position="left" :hide-required-asterisk="true">
      <el-form-item label="类型选择" prop="btnType">
        <el-radio-group v-model="dataForm.btnType" @change="onBtnTypeChange">
          <el-radio :label="1">弹窗配置</el-radio>
          <el-radio :label="2">JS脚本</el-radio>
          <el-radio :label="3">接口配置</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="dataForm.btnType==1">
        <el-form-item label="选择表单" prop="modelId">
          <JNPF-TreeSelect :options="treeData" v-model="dataForm.modelId" placeholder="请选择表单"
            lastLevel clearable @change="onModeIdChange" />
        </el-form-item>
        <el-form-item label="弹窗标题" prop="popupTitle">
          <el-input v-model="dataForm.popupTitle" placeholder="请输入弹窗标题" clearable />
        </el-form-item>
        <el-form-item label="弹窗类型" v-show="showType==='pc'">
          <el-select v-model="dataForm.popupType" placeholder="请选择弹窗类型">
            <el-option label="居中弹窗" value="dialog"></el-option>
            <el-option label="右侧弹窗" value="drawer"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="弹窗宽度" v-show="showType==='pc'">
          <el-select v-model="dataForm.popupWidth" placeholder="请选择弹窗宽度" filterable>
            <el-option v-for="item in popupWidthOptions" :label="item" :value="item" :key="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="赋值规则" style="margin-bottom: 0;"></el-form-item>
        <el-table :data="dataForm.formOptions">
          <el-table-column type="index" width="50" label="序号" align="center" />
          <el-table-column prop="field" label="当前表单值">
            <template slot-scope="scope">
              <el-select v-model="scope.row.currentField" placeholder="请选择" filterable>
                <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                  :label="item.__config__.label" :value="item.__vModel__">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="field" label="赋值给" width="80" align="center">
            <template>赋值给</template>
          </el-table-column>
          <el-table-column prop="value" label="弹窗表单值">
            <template slot-scope="scope">
              <el-select v-model="scope.row.field" placeholder="请选择" filterable
                @visible-change="visibleChange">
                <el-option v-for="item in fieldOptions" :key="item.vmodel" :label="item.label"
                  :value="item.vmodel">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="50">
            <template slot-scope="scope">
              <el-button size="mini" type="text" class="OBPM-table-delBtn"
                @click="handleDel(scope.$index)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="table-actions" @click="addRelationOption" style="margin-bottom: 18px;">
          <el-button type="text" icon="el-icon-plus">新增</el-button>
        </div>
        <el-form-item label="自定义按钮事件" label-width="110px">
          <el-switch v-model="dataForm.customBtn"></el-switch><span
            class="tips">（开启后，弹窗中按钮事件失效，调用接口事件。）</span>
        </el-form-item>
        <template v-if="dataForm.customBtn">
          <el-form-item label="数据接口" prop="interfaceId">
            <interface-dialog :value="dataForm.interfaceId" :title="dataForm.interfaceName"
              @change="onInterfaceChange" />
          </el-form-item>
          <el-form-item label="参数设置" style="margin-bottom: 0;"></el-form-item>
          <el-table :data="dataForm.templateJson" style="margin-bottom: 18px;">
            <el-table-column type="index" width="50" label="序号" align="center" />
            <el-table-column prop="field" label="参数名称" width="200">
              <template slot-scope="scope">
                <span class="required-sign">{{scope.row.required?'*':''}}</span>
                {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
              </template>
            </el-table-column>
            <el-table-column prop="value" label="弹窗表单值">
              <template slot-scope="scope">
                <el-select v-model="scope.row.relationField" placeholder="请选择弹窗表单值" clearable
                  filterable @visible-change="visibleChange">
                  <el-option v-for="item in fieldOptions" :key="item.vmodel" :label="item.label"
                    :value="item.vmodel">
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </template>
      <template v-else-if="dataForm.btnType==2">
        <div class="right-main">
          <div class="codeEditor">
            <JNPFCodeEditor v-model="dataForm.func" :options="options" ref="CodeEditor" />
          </div>
          <div class="tips">
            <p>支持JavaScript的脚本，参考编写脚本API</p>
            <p>data--列表当前行数据，index--列表当前行下标，request--异步请求(url,method,data)</p>
            <p>toast--消息提示，refresh--刷新页面</p>
          </div>
        </div>
      </template>
      <template v-else>
        <el-form-item label="数据接口" prop="interfaceId">
          <interface-dialog :value="dataForm.interfaceId" :title="dataForm.interfaceName"
            @change="onInterfaceChange" />
        </el-form-item>
        <el-form-item label="参数设置" style="margin-bottom: 0;"></el-form-item>
        <el-table :data="dataForm.templateJson" style="margin-bottom: 18px;">
          <el-table-column type="index" width="50" label="序号" align="center" />
          <el-table-column prop="field" label="参数名称" width="200">
            <template slot-scope="scope">
              <span class="required-sign">{{scope.row.required?'*':''}}</span>
              {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
            </template>
          </el-table-column>
          <el-table-column prop="value" label="当前表单值">
            <template slot-scope="scope">
              <el-select v-model="scope.row.relationField" placeholder="请选择" clearable filterable>
                <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                  :label="item.__config__.label" :value="item.__vModel__">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
        <el-form-item label="启用确认框">
          <el-switch v-model="dataForm.useConfirm"></el-switch>
        </el-form-item>
        <el-form-item label-width="0" prop="confirmTitle" v-if="dataForm.useConfirm">
          <el-input v-model="dataForm.confirmTitle" placeholder="请输入确认框提示语" clearable />
        </el-form-item>
      </template>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelBtn')}}</el-button>
      <el-button type="primary" @click="confirm">
        {{$t('common.confirmBtn')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getDrawingList } from '@/components/extnGenerator/utils/db'
import { getFeatureSelector, getFormDataFields } from '@/api/onlineDev/visualDev'
import JNPFCodeEditor from '@/components/extn/JNPFEditor/monaco'
import InterfaceDialog from '@/components/extnProcess/PropPanel/InterfaceDialog'
const defaultFunc = '({ data, index, request, toast, refresh }) => {\r\n   \r\n}'
export default {
  components: { JNPFCodeEditor, InterfaceDialog },
  data() {
    return {
      visible: false,
      popupWidthOptions: ['600px', '800px', '1000px', '40%', '50%', '60%', '70%', '80%'],
      treeData: [],
      fieldOptions: [],
      showType: 'pc',
      modelId: '',
      options: {
        language: 'javascript'
      },
      dataForm: {
        btnType: 1,
        modelId: "",
        popupTitle: "自定义操作",
        popupType: "dialog",
        popupWidth: "800px",
        formOptions: [],
        customBtn: false,
        func: "",
        interfaceId: "",
        interfaceName: "",
        templateJson: [],
        useConfirm: false,
        confirmTitle: "此操作将通过接口处理"
      },
      dataRule: {
        btnType: [
          { required: true, message: '类型不能为空', trigger: 'change' }
        ],
        modelId: [
          { required: true, message: '表单不能为空', trigger: 'click' }
        ],
        popupTitle: [
          { required: true, message: '弹窗标题不能为空', trigger: 'input' }
        ],
        interfaceId: [
          { required: true, message: '数据接口不能为空', trigger: 'change' }
        ],
        confirmTitle: [
          { required: true, message: '确认框不能为空', trigger: 'input' }
        ],
      },
      webType: "",
      columnOptions: []
    }
  },
  computed: {
    formFieldsOptions() {
      if (this.webType == 4) return this.columnOptions
      const noAllowList = ['table', 'uploadImg', 'uploadFz', 'billRule', 'relationForm', 'popupSelect', 'createUser', 'createTime', 'modifyUser', 'modifyTime']
      let list = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__config__ && data.__config__.jnpfKey !== 'table' && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__vModel__ && !noAllowList.includes(data.__config__.jnpfKey)) list.push(data)
      }
      loop(getDrawingList())
      return list
    }
  },
  methods: {
    init(showType, activeItem, webType, columnOptions) {
      this.webType = webType
      this.columnOptions = columnOptions || []
      this.showType = showType || 'pc'
      this.visible = true
      this.$nextTick(() => {
        this.resetData()
        this.dataForm = Object.assign(this.dataForm, JSON.parse(JSON.stringify(activeItem)))
        this.getFeatureSelector()
        if (this.dataForm.btnType == 2) this.initEditor()
        if (this.dataForm.modelId) this.getFieldOptions()
      })
    },
    initEditor() {
      this.$nextTick(() => {
        this.$refs.CodeEditor.changeEditor({
          value: this.dataForm.func,
          options: this.options
        })
      });
    },
    getFeatureSelector() {
      getFeatureSelector({ type: 1, webType: '1,2', enableFlow: 0, isRelease: 1 }).then(res => {
        this.treeData = res.data.list
      })
    },
    onModeIdChange(val) {
      this.dataForm.relationField = ''
      if (!val) {
        this.fieldOptions = []
        return
      }
      if (this.modelId != val && this.dataForm.formOptions.length) {
        this.dataForm.formOptions.forEach(ele => {
          ele.field = ''
        })
      }
      this.getFieldOptions()
      this.modelId = val
    },
    getFieldOptions() {
      if (!this.dataForm.modelId) return
      getFormDataFields(this.dataForm.modelId, 1).then(res => {
        this.fieldOptions = res.data.list
      })
    },
    onInterfaceChange(id, row) {
      if (!id) {
        this.dataForm.interfaceId = ''
        this.dataForm.interfaceName = ''
        this.dataForm.templateJson = []
        return
      }
      if (this.dataForm.interfaceId === id) return
      this.dataForm.interfaceId = id
      this.dataForm.interfaceName = row.fullName
      this.dataForm.templateJson = row.templateJson ? row.templateJson.map(o => ({
        ...o,
        relationField: ''
      })) : []
    },
    addRelationOption() {
      this.dataForm.formOptions.push({
        currentField: '',
        field: '',
      })
    },
    handleDel(index) {
      this.dataForm.formOptions.splice(index, 1)
    },
    confirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dataForm.btnType == 1) {
            if (!this.dataForm.formOptions.length) return this.$message({ message: '赋值规则不能为空', type: 'warning' });
            if (this.dataForm.formOptions.length) {
              for (let i = 0; i < this.dataForm.formOptions.length; i++) {
                const element = this.dataForm.formOptions[i];
                if (!element.currentField) return this.$message({ message: `赋值规则第${i + 1}行当前表单值不能为空`, type: 'warning' });
                if (!element.field) return this.$message({ message: `赋值规则第${i + 1}行弹窗表单值不能为空`, type: 'warning' });
              }
            }
          }
          this.$emit('updateCustomBtn', this.dataForm)
          this.closeDialog()
        }
      });
    },
    closeDialog() {
      this.$emit('closeDialog')
      this.visible = false
    },
    resetData() {
      this.dataForm.modelId = ""
      this.dataForm.popupTitle = "自定义操作"
      this.dataForm.popupType = "dialog"
      this.dataForm.popupWidth = "800px"
      this.dataForm.formOptions = []
      this.dataForm.customBtn = false
      this.dataForm.func = defaultFunc
      this.dataForm.interfaceId = ""
      this.dataForm.interfaceName = ""
      this.dataForm.templateJson = []
      this.dataForm.useConfirm = false
      this.dataForm.confirmTitle = "此操作将通过接口处理"
      this.fieldOptions = []
    },
    onBtnTypeChange(val) {
      this.$refs['dataForm'].clearValidate()
      this.resetData()
      if (val == 2) this.initEditor()
    },
    visibleChange(val) {
      if (!val) return
      if (!this.dataForm.modelId) this.$message.warning('请先选择表单')
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  height: 70vh;
  padding: 20px 50px 2px !important;
  .form-script-dialog-body {
    display: unset !important;
    .right-main {
      height: 550px !important;
    }
    .tips {
      color: #909399;
      padding-left: 8px;
    }
  }
}
</style>