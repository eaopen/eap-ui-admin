<template>
  <div class="jnpf-table-box" :class="[config.__config__.type]">
    <div class="JNPF-common-title" v-if="config.__config__.showTitle && config.__config__.label">
      <span slot="label" v-if="config.__config__.tipLabel">{{config.__config__.label}}
        <el-tooltip placement="top" :content=config.__config__.tipLabel>
          <a class='el-icon-question tooltip-question'></a>
        </el-tooltip>
      </span>
      <h2 v-else>{{config.__config__.label}}</h2>
    </div>
    <el-table :data="tableFormData" class="JNPF-common-table" @cell-click="focusInput"
      v-bind="config.tableConf || {}" :show-summary="config['show-summary']"
      :summary-method="getTableSummaries" size="mini" ref="formTable">
      <el-table-column width="50" align="center" label="序号">
        <!-- 序号 -->
        <template slot-scope="scope">
          <div class="row-action">
            <span class="index" :class="{'btn-disabled':disabled}"> {{ scope.$index + 1 }}</span>
            <i class="el-icon-delete delete-btn" @click="removeRow(scope.$index)"></i>
          </div>
        </template>
      </el-table-column>
      <!-- 组件列 -->
      <template v-for="(head, cIndex) in tableData">
        <el-table-column :key="head.__config__.formId" :min-width="head['min-width']"
          :prop="head.__vModel__" :width="head.__config__.columnWidth"
          v-if="!head.__config__.noShow && (!head.__config__.visibility || (Array.isArray(head.__config__.visibility) && head.__config__.visibility.includes('pc')))">
          <template slot="header">
            <span style="color: #f56c6c;" v-if="head.__config__.required">*</span>
            <span slot="label"
              v-if="head.__config__.tipLabel &&head.__config__.label">{{head.__config__['label']}}
              <el-tooltip placement="top" :content=head.__config__.tipLabel>
                <a class='el-icon-question tooltip-question'></a>
              </el-tooltip>
            </span>
            <span v-if="!head.__config__['tipLabel']">{{ head.__config__['label'] }}</span>
          </template>
          <template slot-scope="scope">
            <!-- 单选框组 多选框组 都替换成下拉 并添加options -->
            <template v-if="['select', 'checkbox','radio'].includes(head.__config__.jnpfKey)">
              <el-select v-model="tableFormData[scope.$index][cIndex].value" filterable
                v-bind="getConfById(head.__config__.formId,scope.$index)" :rowIndex="scope.$index"
                @blur="onFormBlur(scope.$index, cIndex, 'el-select')"
                @change="onFormDataChange(scope.$index, cIndex, 'el-select',arguments)">
                <el-option v-for="(opt,oIndex) in tableFormData[scope.$index][cIndex].options"
                  :key="oIndex" :label="opt[head.props.props.label]"
                  :value="opt[head.props.props.value]">
                </el-option>
              </el-select>
            </template>
            <!-- 单行输入 -->
            <template v-else-if="head.__config__.jnpfKey==='comInput'">
              <el-input v-model="tableFormData[scope.$index][cIndex].value"
                v-bind="getConfById(head.__config__.formId,scope.$index)" :rowIndex="scope.$index"
                @blur="onFormBlur(scope.$index, cIndex, 'el-input')"
                @change="onFormDataChange(scope.$index, cIndex, 'el-input',arguments)">
                <template v-if="head.__slot__">
                  <template slot="prepend" v-if="head.__slot__.prepend">
                    {{ head.__slot__.prepend }}
                  </template>
                  <template slot="append" v-if="head.__slot__.append">
                    {{ head.__slot__.append }}
                  </template>
                </template>
              </el-input>
            </template>
            <!-- 下拉树形 -->
            <template v-else-if="head.__config__.jnpfKey==='treeSelect'">
              <JNPF-TreeSelect v-model="tableFormData[scope.$index][cIndex].value"
                :options="tableFormData[scope.$index][cIndex].options" :props="head.props.props"
                :placeholder="head.placeholder" :clearable="head.clearable"
                :multiple="head.multiple" :filterable="head.filterable" :disabled="head.disabled" />
            </template>
            <!-- 级联选择 -->
            <template v-else-if="head.__config__.jnpfKey==='cascader'">
              <el-cascader v-model="tableFormData[scope.$index][cIndex].value"
                :options="tableFormData[scope.$index][cIndex].options" :props="head.props.props"
                :placeholder="head.placeholder" :clearable="head.clearable"
                :show-all-levels="head['show-all-levels']" :separator="head.separator"
                :filterable="head.filterable" :disabled="head.disabled" />
            </template>
            <!-- 其他 -->
            <component v-else :is="head.__config__.tag" :rowIndex="scope.$index"
              :tableVModel="config.__vModel__" :componentVModel="head.__vModel__"
              v-model="tableFormData[scope.$index][cIndex].value"
              v-bind="getConfById(head.__config__.formId,scope.$index)" :formData="formData"
              @blur="onFormBlur(scope.$index, cIndex, head.__config__.tag)"
              @change="onFormDataChange(scope.$index, cIndex, head.__config__.tag,arguments)">
            </component>
            <div class="error-tip" v-show="!tableFormData[scope.$index][cIndex].valid">
              不能为空
            </div>
            <div class="error-tip"
              v-show="tableFormData[scope.$index][cIndex].valid && !tableFormData[scope.$index][cIndex].regValid">
              {{ tableFormData[scope.$index][cIndex].regErrorText }}
            </div>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <div class="table-actions" @click="addItem()" v-if="!disabled">
      <el-button type="text" icon="el-icon-plus"> {{ config.actionText }}</el-button>
    </div>
    <SelectDialog v-if="selectDialogVisible" :config="config.addTableConf" :formData="formData"
      ref="selectDialog" @select="addForSelect" />
  </div>
</template>
<script>
import { dyOptionsList } from '@/components/extnGenerator/generator/comConfig'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'
import SelectDialog from '@/components/SelectDialog/index'
import { thousandsFormat } from "@/components/extnGenerator/utils/index"
export default {
  name: 'input-table',
  components: { SelectDialog },
  inject: ['parameter'],
  props: {
    config: {
      type: Object,
      default: () => { }
    },
    value: {
      type: Array,
      default: () => ([])
    },
    formData: Object,
    relations: Object,
    vModel: String,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableFormData: [],
      tableData: [],
      activeRowIndex: 0,
      selectDialogVisible: false,
      isAddRow: true // list类型下 添加行数据 number类型组件会进行校验 产生不需要的结果 在这里进行添加行数据判断 hack
    }
  },
  created() {
    this.tableData = this.config.__config__.children
    this.buildOptions()
    if (this.value && this.value.length) {
      this.value.forEach(t => this.addRow(t))
    } else {
      // this.addRow()
    }
  },
  computed: {
    childRelations() {
      let obj = {}
      for (let key in this.relations) {
        if (key.includes('-')) {
          let tableVModel = key.split('-')[0]
          if (tableVModel === this.vModel) {
            let newKey = key.split('-')[1]
            obj[newKey] = this.relations[key]
          }
        }
      }
      return obj
    }
  },
  methods: {
    buildOptions() {
      this.tableData.forEach(cur => {
        const config = cur.__config__
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          let isTreeSelect = config.jnpfKey === 'treeSelect' || config.jnpfKey === 'cascader'
          if (config.dataType === 'dictionary') {
            if (!config.dictionaryType) return
            getDictionaryDataSelector(config.dictionaryType).then(res => {
              cur.options = res.data.list
            })
          }
          if (config.dataType === 'dynamic') {
            if (!config.propsUrl) return
            let query = {
              paramList: config.templateJson ? this.getDefaultParamList(config.templateJson, this.formData) : [],
            }
            getDataInterfaceRes(config.propsUrl, query).then(res => {
              let realData = res.data
              if (Array.isArray(realData)) {
                cur.options = realData
              } else {
                cur.options = []
              }
            })
          }
        }
      })
    },
    handleRelationForParent(e, defaultValue, notSetDefault) {
      if (!this.tableFormData.length) return
      for (let i = 0; i < this.tableFormData.length; i++) {
        let row = this.tableFormData[i];
        for (let j = 0; j < row.length; j++) {
          let item = row[j];
          const vModel = item.jnpfKey === 'popupSelect' ? item.__vModel__.substring(0, item.__vModel__.indexOf('_jnpfRelation_')) : item.__vModel__
          if (e.__vModel__ === vModel) {
            if (!notSetDefault) item.value = defaultValue
            if (e.opType === 'setOptions') {
              item.options = []
              let query = {
                paramList: this.getParamList(e.__config__.templateJson, this.formData, i)
              }
              getDataInterfaceRes(e.__config__.propsUrl, query).then(res => {
                let realData = res.data
                item.options = Array.isArray(realData) ? realData : []
              })
            }
            if (e.opType === 'setUserOptions') {
              let value = this.formData[e.relationField] || []
              item.config.ableRelationIds = Array.isArray(value) ? value : [value]
            }
            if (e.opType === 'setPopupOptions') { }
            if (e.opType === 'setDate') {
              let startTime = 0
              let endTime = 0
              if (e.__config__.startRelationField && e.__config__.startTimeType == 2) {
                startTime = this.formData[e.__config__.startRelationField] || 0
              } else {
                startTime = e.startTime
              }
              if (e.__config__.endRelationField && e.__config__.endTimeType == 2) {
                endTime = this.formData[e.__config__.endRelationField] || 0
              } else {
                endTime = e.endTime
              }
              item.config.startTime = startTime
              item.config.endTime = endTime
            }
            if (e.opType === 'setTime') {
              let startTime = ''
              let endTime = ''
              if (e.__config__.startRelationField && e.__config__.startTimeType == 2) {
                startTime = this.formData[e.__config__.startRelationField] || '00:00:00'
                startTime = startTime + ':00'
                if (startTime.split(':').length == 3) {
                  startTime = startTime
                } else {
                  startTime = startTime + ':00'
                }
              } else {
                startTime = e.startTime || '00:00:00'
              }
              if (e.__config__.endRelationField && e.__config__.endTimeType == 2) {
                endTime = this.formData[e.__config__.endRelationField] || '23:59:59'
                if (endTime.split(':').length == 3) {
                  endTime = endTime
                } else {
                  endTime = endTime + ':00'
                }
              } else {
                endTime = e.endTime || '23:59:59'
              }
              item.config.startTime = startTime
              item.config.endTime = endTime
            }
          }
        }
      }
      this.updateParentData()
    },
    handleRelation(data, rowIndex) {
      const currRelations = this.childRelations
      for (let key in currRelations) {
        if (key === data.__vModel__) {
          for (let i = 0; i < currRelations[key].length; i++) {
            const e = currRelations[key][i];
            const config = e.__config__
            const jnpfKey = config.jnpfKey
            let defaultValue = null
            if (['checkbox', 'cascader'].includes(jnpfKey) || (['select', 'treeSelect', 'popupSelect', 'popupTableSelect', 'userSelect'].includes(jnpfKey) && e.multiple)) {
              defaultValue = []
            }
            let row = this.tableFormData[rowIndex];
            for (let j = 0; j < row.length; j++) {
              let item = row[j];
              const vModel = item.jnpfKey === 'popupSelect' ? item.__vModel__.substring(0, item.__vModel__.indexOf('_jnpfRelation_')) : item.__vModel__
              if (e.__vModel__ === vModel) {

                if (e.opType === 'setOptions') {
                  item.options = []
                  let query = {
                    paramList: this.getParamList(e.__config__.templateJson, this.formData, rowIndex)
                  }
                  getDataInterfaceRes(e.__config__.propsUrl, query).then(res => {
                    let realData = res.data
                    item.options = Array.isArray(realData) ? realData : []
                  })
                }
                if (e.opType === 'setUserOptions') {
                  let value = this.getFieldVal(e.relationField, rowIndex) || []
                  item.config.ableRelationIds = Array.isArray(value) ? value : [value]
                }
                if (e.opType === 'setPopupOptions') { }
                if (e.opType === 'setDate') {
                  let startTime = 0
                  let endTime = 0
                  if (e.__config__.startRelationField && e.__config__.startTimeType == 2) {
                    startTime = this.getFieldVal(e.__config__.startRelationField, rowIndex) || 0
                  } else {
                    startTime = e.startTime
                  }
                  if (e.__config__.endRelationField && e.__config__.endTimeType == 2) {
                    endTime = this.getFieldVal(e.__config__.endRelationField, rowIndex) || 0
                  } else {
                    endTime = e.endTime
                  }
                  item.config.startTime = startTime
                  item.config.endTime = endTime
                }
                if (e.opType === 'setTime') {
                  let startTime = 0
                  let endTime = 0
                  if (e.__config__.startRelationField && e.__config__.startTimeType == 2) {
                    startTime = this.getFieldVal(e.__config__.startRelationField, rowIndex) || '00:00:00'
                    if (startTime.split(':').length == 3) {
                      startTime = startTime
                    } else {
                      startTime = startTime + ':00'
                    }
                  } else {
                    startTime = e.startTime
                  }
                  if (e.__config__.endRelationField && e.__config__.endTimeType == 2) {
                    endTime = this.getFieldVal(e.__config__.endRelationField, rowIndex) || '23:59:59'
                    if (endTime.split(':').length == 3) {
                      endTime = endTime
                    } else {
                      endTime = endTime + ':00'
                    }
                  } else {
                    endTime = e.endTime
                  }
                  item.config.startTime = startTime
                  item.config.endTime = endTime
                }
                if (item.value != defaultValue) {
                  item.value = defaultValue
                  this.$nextTick(() => this.handleRelation(item, rowIndex));
                }
              }
            }
          }
        }
      }
      this.updateParentData()
    },
    buildRowAttr(rowIndex) {
      let row = this.tableFormData[rowIndex];
      for (let i = 0; i < row.length; i++) {
        let item = row[i];
        const cur = row[i].config
        const config = cur.__config__
        for (let key in this.value[rowIndex]) {
          if (key === item.__vModel__) {
            item.value = this.value[rowIndex][key]
          }
        }
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          if (config.dataType === 'dynamic') {
            if (!config.propsUrl || !config.templateJson || !config.templateJson.length) return
            let query = {
              paramList: config.templateJson ? this.getParamList(config.templateJson, this.formData, rowIndex) : [],
            }
            getDataInterfaceRes(config.propsUrl, query).then(res => {
              let realData = res.data
              item.options = Array.isArray(realData) ? realData : []
            })
          }
        }
        if (config.jnpfKey === 'userSelect' && cur.relationField && cur.selectType !== 'all' && cur.selectType !== 'custom') {
          let value = this.getFieldVal(cur.relationField, rowIndex) || []
          cur.ableRelationIds = Array.isArray(value) ? value : [value]
        }
        if (config.jnpfKey === 'date') {
          let startTime = 0
          let endTime = 0
          if (cur.__config__.startRelationField && cur.__config__.startTimeType == 2) {
            startTime = this.getFieldVal(cur.__config__.startRelationField, rowIndex) || 0
          } else {
            startTime = cur.startTime
          }
          if (cur.__config__.endRelationField && cur.__config__.endTimeType == 2) {
            endTime = this.getFieldVal(cur.__config__.endRelationField, rowIndex) || 0
          } else {
            endTime = cur.endTime
          }
          item.config.startTime = startTime
          item.config.endTime = endTime
        }
        if (config.jnpfKey === 'time') {
          let startTime = 0
          let endTime = 0
          if (cur.__config__.startRelationField && cur.__config__.startTimeType == 2) {
            startTime = this.getFieldVal(cur.__config__.startRelationField, rowIndex) || '00:00:00'
            if (startTime && (startTime.split(':').length == 3)) {
              startTime = startTime
            } else {
              startTime = startTime + ':00'
            }
          } else {
            startTime = cur.startTime
          }
          if (cur.__config__.endRelationField && cur.__config__.endTimeType == 2) {
            endTime = this.getFieldVal(cur.__config__.endRelationField, rowIndex) || '23:59:59'
            if (startTime.split(':').length == 3) {
              endTime = endTime
            } else {
              endTime = endTime + ':00'
            }
          } else {
            endTime = cur.endTime
          }
          item.config.startTime = startTime
          item.config.endTime = endTime
        }
      }
    },
    getParamList(templateJson, formData, index) {
      for (let i = 0; i < templateJson.length; i++) {
        if (templateJson[i].relationField) {
          if (templateJson[i].relationField.includes('-')) {
            let childVModel = templateJson[i].relationField.split('-')[1]
            let list = this.tableFormData[index].filter(o => o.__vModel__ === childVModel)
            if (!list.length) {
              templateJson[i].defaultValue = ''
            } else {
              let item = list[0]
              templateJson[i].defaultValue = item.value
            }
          } else {
            templateJson[i].defaultValue = formData[templateJson[i].relationField] || ''
          }
        }
      }
      return templateJson
    },
    getDefaultParamList(templateJson, formData) {
      for (let i = 0; i < templateJson.length; i++) {
        if (templateJson[i].relationField) {
          if (templateJson[i].relationField.includes('-')) {
            let childVModel = templateJson[i].relationField.split('-')[1]
            let list = this.tableData.filter(o => o.__vModel__ === childVModel)
            templateJson[i].defaultValue = ''
            if (list.length) templateJson[i].defaultValue = list[0].__config__.defaultValue
          } else {
            templateJson[i].defaultValue = formData[templateJson[i].relationField] || ''
          }
        }
      }
      return templateJson
    },
    getFieldVal(field, rowIndex) {
      let val = ''
      if (field.includes('-')) {
        let childVModel = field.split('-')[1]
        let list = this.tableFormData[rowIndex].filter(o => o.__vModel__ === childVModel)
        if (!list.length) {
          val = ''
        } else {
          let item = list[0]
          val = item.value
        }
      } else {
        val = this.formData[field] || ''
      }
      return val
    },
    clearAddRowFlag() {
      this.$nextTick(() => {
        this.isAddRow = false
      })
    },
    /**
     * @event cell-click Table 单元格点击事件
     * 点击单元格 聚焦单元格中的input
     */
    focusInput(row, column, cell, event) {
      const child = cell.querySelector('.cell').firstElementChild
      const input = child && child.querySelector('input')
      input && input.focus()
    },
    setTableFormData(prop, value) {
      let activeRow = this.tableFormData[this.activeRowIndex]
      for (let i = 0; i < activeRow.length; i++) {
        let vModel = activeRow[i].__vModel__
        if (activeRow[i].__vModel__.indexOf('_jnpfRelation_') >= 0) {
          vModel = activeRow[i].__vModel__.substring(0, activeRow[i].__vModel__.indexOf('_jnpfRelation_'))
        }
        if (vModel === prop) {
          activeRow[i].value = value
          this.handleRelation(activeRow[i], this.activeRowIndex)
          break
        }
      }
    },
    getTableFieldOptions(prop) {
      let res = []
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].__vModel__ === prop) {
          let item = this.tableData[i]
          res = item.options || []
          break
        }
      }
      return res
    },
    setTableShowOrHide(prop, value) {
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].__vModel__ === prop) {
          this.tableData[i].__config__.noShow = value
          break
        }
      }
    },
    onFormBlur(rowIndex, colIndex, tag) {
      const data = this.tableFormData[rowIndex][colIndex]
      if (data && data.on && data.on.blur) {
        const func = this.jnpf.getScriptFunc.call(this, data.on.blur)
        if (!func) return
        func.call(this, {
          data: null,
          ...this.parameter
        })
      }
    },
    onFormDataChange(rowIndex, colIndex, tag, params) {
      if (this.isAddRow) return
      const data = this.tableFormData[rowIndex][colIndex]
      this.activeRowIndex = rowIndex
      if (data && data.on && data.on.change) {
        const func = this.jnpf.getScriptFunc.call(this, data.on.change)
        if (!func) return
        let value = ''
        if (['select', 'radio', 'checkbox'].includes(data.jnpfKey)) {
          const options = data.options
          if (data.config.multiple || data.jnpfKey === 'checkbox') {
            let _value = []
            outer: for (let i = 0; i < params[0].length; i++) {
              inner: for (let j = 0; j < options.length; j++) {
                if (params[0][i] === options[j][data.config.props.props.value]) {
                  _value.push(options[j])
                  break inner
                }
              }
            }
            value = _value
          } else {
            let _value = {}
            for (let i = 0; i < options.length; i++) {
              if (params[0] === options[i][data.config.props.props.value]) {
                _value = options[i]
                break
              }
            }
            value = _value
          }
        } else if (data.jnpfKey === 'numInput') {
          value = params[0]
        } else {
          value = params.length > 1 ? params[1] : params[0]
        }
        func.call(this, {
          data: value,
          ...this.parameter
        })
      }
      data.required && (data.valid = this.checkData(data))
      data.regList && data.regList.length && (data.regValid = this.checkRegData(data))
      // if (['el-input-number', 'calculate'].includes(tag)) this.updateParentData()
      this.updateParentData()
      this.handleRelation(data, rowIndex)
    },
    /**
     * 校验单个表单数据
     * @param {CmpConfig} 组件配置对象
     */
    checkData({ tag, value }) {
      if ([null, undefined, ''].includes(value)) return false
      // if (tag === 'org-select') return this.checkOrgData(value)
      if (Array.isArray(value)) return value.length > 0
      return true
    },
    /**
     * 对组织机构部门控数据单独校验
     */
    checkOrgData(data) {
      const isArray = Array.isArray
      if (typeof data !== 'object' || isArray(data)) return false
      let count = 0
      for (let key in data) {
        count += isArray(data[key]) ? data[key].length : 0
      }
      return count > 0
    },
    checkRegData(col) {
      let res = true
      for (let i = 0; i < col.regList.length; i++) {
        const item = col.regList[i]
        if (item.pattern) {
          let pattern = eval(item.pattern)
          if (col.value && !pattern.test(col.value)) {
            res = false
            col.regErrorText = item.message
            break
          }
        }
      }
      return res
    },
    /**
     * 校验表格数据必填项
     */
    submit() {
      let res = true
      const checkCol = col => {
        col.required && !this.checkData(col) && (res = col.valid = false)
        col.regList && col.regList.length && !this.checkRegData(col) && (res = col.regValid = false)
      }
      this.tableFormData.forEach(row => row.forEach(checkCol))
      return res ? this.getTableValue() : false
    },
    /**
     * 根据formId获取完整组件配置
     */
    getConfById(formId, rowIndex) {
      let item = this.tableFormData[rowIndex].find(t => t.formId === formId).config
      let itemConfig = item.__config__
      let newObj = {}
      for (const key in item) {
        if (!['__config__', '__slot__', '__vModel__', 'props', 'on'].includes(key)) {
          newObj[key] = item[key]
        }
        if (key === 'props') {
          newObj[key] = item[key][key]
        }
        if (key === 'disabled') {
          newObj[key] = this.disabled || item[key]
        }
      }
      if (['relationForm', 'popupSelect'].includes(itemConfig.jnpfKey)) {
        newObj['field'] = item.__vModel__ + '_jnpfRelation_' + rowIndex
      }
      if (['relationFormAttr', 'popupAttr'].includes(itemConfig.jnpfKey)) {
        let prop = newObj['relationField'].split('_jnpfTable_')[0]
        newObj['relationField'] = prop + '_jnpfRelation_' + rowIndex
        newObj['isStorage'] = itemConfig.isStorage
      }
      return newObj
    },
    /**
     * 获取默认行数据
     */
    getEmptyRow(val, rowIndex) {
      return this.tableData.map((t, index) => {
        let options = []
        if (dyOptionsList.indexOf(t.__config__.jnpfKey) > -1) {
          options = t.options
        }
        if (t.__config__.jnpfKey === 'date' && t.__config__.defaultCurrent) {
          let format = t.format
          let dateStr = this.jnpf.toDate(new Date().getTime(), format)
          let time = format === 'yyyy' ? '-01-01 00:00:00' : format === 'yyyy-MM' ? '-01 00:00:00' : format === 'yyyy-MM-dd' ?
            ' 00:00:00' : ''
          t.__config__.defaultValue = new Date(dateStr + time).getTime()
        }
        if (t.__config__.jnpfKey === 'time' && t.__config__.defaultCurrent) {
          t.__config__.defaultValue = this.jnpf.toDate(new Date(), t.format)
        }
        let res = {
          tag: t.__config__.tag,
          formId: t.__config__.formId,
          value: val && val[t.__vModel__] || t.__config__.defaultValue,
          options,
          valid: true,
          regValid: true,
          regErrorText: '',
          on: t.on || {},
          jnpfKey: t.__config__.jnpfKey,
          __vModel__: ['relationForm', 'popupSelect'].includes(t.__config__.jnpfKey) ? t.__vModel__ + '_jnpfRelation_' + rowIndex : t.__vModel__,
          regList: t.__config__.regList || [],
          required: t.__config__.required,
          rowData: val || {},
          config: t
        }
        return res
      })
    },
    // 获取表格数据
    getTableValue() {
      return this.tableFormData.map(row => row.reduce((p, c) => {
        let str = c.__vModel__
        if (c.__vModel__ && c.__vModel__.indexOf('_jnpfRelation_') >= 0) {
          str = c.__vModel__.substring(0, c.__vModel__.indexOf('_jnpfRelation_'))
        }
        p[str] = c.value
        if (c.rowData) p = { ...c.rowData, ...p }
        return p
      }, {}))
    },
    // 更新父级数据 触发计算公式更新
    updateParentData() {
      const newVal = this.getTableValue()
      this.$emit('input', newVal)
    },
    removeRow(index) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        this.tableFormData.splice(index, 1)
        this.updateParentData()
      }).catch(() => {
      });
    },
    addRow(val) {
      this.isAddRow = true
      if (!Array.isArray(this.tableFormData)) this.tableFormData = []
      const rowIndex = this.tableFormData.length
      this.tableFormData.push(JSON.parse(JSON.stringify(this.getEmptyRow(val, rowIndex))))
      this.buildRowAttr(rowIndex)
      this.clearAddRowFlag()
      this.updateParentData()
    },
    addItem() {
      if (this.config.addType == 1) {
        this.openSelectDialog()
      } else {
        this.addRow()
      }
    },
    openSelectDialog() {
      this.selectDialogVisible = true
      this.$nextTick(() => {
        this.$refs.selectDialog.init()
      })
    },
    addForSelect(data) {
      data.forEach(t => this.addRow(t))
    },
    getCmpValOfRow(row, key) {
      // 获取数字相关组件的输入值
      // const isNumCmp = tag => ['fc-amount', 'el-input-number', 'el-slider'].includes(tag)
      if (!this.config.summaryField.length) return NaN
      const isSummary = key => this.config.summaryField.includes(key)
      const target = row.find(t => t.__vModel__ === key)
      if (!target) return NaN
      let data = isNaN(target.value) ? 0 : Number(target.value)
      if (isSummary(key)) return data || 0
      return NaN
    },
    /**
     * 对表格进行合计 目前只支持数字，金额，滑块
     */
    getTableSummaries(param) {
      const { columns, data } = param
      const sums = []
      const thousandsField = []
      let tableData = this.tableData.filter(o => !o.__config__.noShow)
      tableData.forEach(res => {
        if (res.thousands) thousandsField.push(res.__vModel__)
      })
      if (tableData.length + 1 !== columns.length) return []  // 防止多次加载
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        const sumVal = data.reduce((sum, d) => sum + this.getCmpValOfRow(d, column.property), 0)
        sums[index] = Number.isNaN(sumVal) ? '' : sumVal
        if (sums[index] && !Number.isInteger(sums[index])) sums[index] = sums[index].toFixed(2)
        if (thousandsField.includes(column.property)) sums[index] = thousandsFormat(sums[index])
      })
      return sums
    },
    resetTable() {
      this.tableData = this.config.__config__.children
      this.tableFormData = []
      // this.addRow()
    },
    reset() {
      this.tableData.map((t) => {
        let index = this.tableFormData[0].findIndex(c => c.vModel === t.vModel)
        if (index === -1) return
        for (let i = 0; i < this.tableFormData.length; i++) {
          this.tableFormData[i][index].value = t.defaultValue
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.jnpf-table-box {
  margin-bottom: 0px;
  .row-action {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 32px;

    .el-icon-delete {
      position: absolute;
      opacity: 0;
      z-index: -1;
      transform: translate(-50%, -50%);
      cursor: pointer;
      line-height: 3px;
      margin-left: 10px;
    }
  }
  .actions {
    text-align: center;
    border: 1px solid #ebeef5;
    border-top: none;
    .list-summary {
      line-height: 24px;
      overflow: hidden;
      border: 1px solid #e5e5e5;
      border-top: none;
    }
  }

  &.list {
    .list-row {
      padding: 18px 0 10px;
      text-align: left;
      border-bottom: 1px solid #e5e5e5;
      position: relative;
      &:hover .delete-btn {
        display: block;
      }
      .delete-btn {
        position: absolute;
        right: 10px;
        top: 20px;
        z-index: 999;
        cursor: pointer;
        display: none;
        &:hover {
          color: #000;
        }
      }
      .row-item {
        margin-bottom: 18px;
        position: relative;
        &.error {
          .error-tip {
            top: 74%;
            z-index: 1;
          }
          >>> .el-input__inner {
            border-color: #f56c6c;
          }
        }
        > div {
          &:first-child {
            text-align: right;
            vertical-align: middle;
            float: left;
            font-size: 14px;
            color: #606266;
            line-height: 32px;
            padding: 0 12px 0 0;
            box-sizing: border-box;
          }
        }
      }
    }
    .error-tip {
      font-size: 12px;
      padding-left: 6px;
      color: #f56c6c;
      position: absolute;
      left: 100px;
      top: 0;
      z-index: -1;
      transition: bottom 0.3s;
      min-height: auto;
    }
  }
}

.jnpf-table-box.table {
  // 索引和删除按钮切换
  >>> .el-table__row:hover {
    .index {
      display: none;
      &.btn-disabled {
        display: block;
        & + .el-icon-delete {
          opacity: 0;
          z-index: -1;
        }
      }
    }
    .el-icon-delete {
      z-index: 9;
      opacity: 1;
    }
  }
  >>> .el-input-number {
    width: 100%;
    min-width: 120px;
  }
  >>> .el-table__header th {
    line-height: 1;
  }

  >>> .el-table .el-table__body {
    td {
      padding: 2px 0;
      background: #fff !important;
      vertical-align: top;
      .error-tip {
        font-size: 12px;
        padding-left: 6px;
        color: #f56c6c;
      }
      .cell {
        position: relative;
      }
    }

    td:not(:first-child) {
      // vertical-align: top;
      &::after,
      &::before {
        content: '';
        width: 10px;
        height: 10px;
        background: white;
        position: absolute;
        border: 2px solid transparent;
        transition: border-color 0.3s;
      }

      &::after {
        border-top: none;
        border-right: none;
        left: 0;
        bottom: 0;
      }

      &::before {
        border-bottom: none;
        border-left: none;
        right: 0;
        top: 0;
      }

      &:hover {
        &::after,
        &::before {
          border-color: red;
        }
      }
    }
  }
}
</style>