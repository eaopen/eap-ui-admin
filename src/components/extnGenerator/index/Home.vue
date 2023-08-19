
<template>
  <div class="container">
    <div class="left-board">
      <el-scrollbar class="left-scrollbar">
        <div class="components-list">
          <div v-for="(item, listIndex) in leftComponents" :key="listIndex" class="components-part">
            <div class="components-title">{{ item.title }}</div>
            <draggable class="components-draggable" :list="item.list"
              :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
              :clone="cloneComponent" draggable=".components-item" filter=".disabled" :sort="false"
              @end="onEnd">
              <div v-for="(element, index) in item.list" :key="index" class="components-item"
                :class="{'disabled':element.__config__.dragDisabled}"
                @click="addComponent(element)">
                <div class="components-body">
                  <i :class="element.__config__.tagIcon" />
                  {{ element.__config__.label }}
                </div>
              </div>
            </draggable>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="center-board">
      <div class="action-bar">
        <div class="action-bar-right">
          <el-button icon="icon-ym icon-ym-pc" :class="{'unActive-btn':showType!='pc'}" type="text"
            @click="showType='pc'" size="medium">桌面端</el-button>
          <el-button icon="icon-ym icon-ym-mobile" :class="{'unActive-btn':showType!='app'}"
            type="text" @click="showType='app'" size="medium">移动端</el-button>
          <el-button class="unActive-btn" icon="el-icon-video-play" type="text" @click="preview"
            size="medium">预览</el-button>
          <!-- <el-button icon="el-icon-view" type="text" @click="showJson" size="medium">
            查看json</el-button> -->
          <el-button class="delete-btn unActive-btn" icon="icon-ym icon-ym-clean" type="text"
            @click="empty" size="medium">清空</el-button>
        </div>
      </div>
      <el-scrollbar class="center-scrollbar" v-show="showType==='pc'">
        <el-row class="center-board-row" :gutter="formConf.gutter">
          <el-form :size="formConf.size" :label-position="formConf.labelPosition"
            :disabled="formConf.disabled" :label-width="formConf.labelWidth + 'px'">
            <draggable class="drawing-board" :list="drawingList" :animation="340"
              group="componentsGroup" @end='onCenterEnd'>
              <draggable-item v-for="(element, index) in drawingList" :key="element.renderKey"
                :drawing-list="drawingList" :element="element" :index="index" :active-id="activeId"
                :form-conf="formConf" :mergeLeftColDisabled="mergeLeftColDisabled"
                :mergeRightColDisabled="mergeRightColDisabled"
                :mergeWholeRowDisabled="mergeWholeRowDisabled"
                :mergeAboveRowDisabled="mergeAboveRowDisabled"
                :mergeBelowRowDisabled="mergeBelowRowDisabled"
                :mergeWholeColDisabled="mergeWholeColDisabled"
                :undoMergeRowDisabled="undoMergeRowDisabled"
                :undoMergeColDisabled="undoMergeColDisabled"
                :deleteWholeColDisabled="deleteWholeColDisabled"
                :deleteWholeRowDisabled="deleteWholeRowDisabled" @activeItem="activeFormItem"
                @copyItem="drawingItemCopy" @deleteItem="drawingItemDelete"
                @addRow="handleTableAddRow" @addCol="handleTableAddCol"
                @handleTableSetting="handleTableSetting" @handleShowMenu="handleShowMenu"
                :put="shouldClone" :end='onTableEnd' />
            </draggable>
            <div v-show="!drawingList.length" class="empty-info">
              <img src="@/assets/images/extn/emptyElement.png" alt="" class="empty-img">
            </div>
          </el-form>
        </el-row>
      </el-scrollbar>
      <div id="ipad" v-show="showType==='app'">
        <div class="outeripad">
          <div class="ipadbody">
            <el-scrollbar class="center-scrollbar">
              <el-row class="center-board-row" :gutter="formConf.gutter">
                <el-form :size="formConf.size" :label-position="formConf.labelPosition"
                  :disabled="formConf.disabled" :label-width="formConf.labelWidth + 'px'">
                  <draggable class="drawing-board" :list="drawingList" :animation="340"
                    group="componentsGroup" @end='onCenterEnd'>
                    <draggable-item-app v-for="(element, index) in drawingList"
                      :key="element.renderKey" :drawing-list="drawingList" :element="element"
                      :index="index" :active-id="activeId" :form-conf="formConf"
                      @activeItem="activeFormItem" @copyItem="drawingItemCopy"
                      @deleteItem="drawingItemDelete" :put="shouldClone" :end='onTableEnd' />
                  </draggable>
                  <div v-show="!drawingList.length" class="empty-info app-empty-info">
                    <img src="@/assets/images/extn/emptyElement.png" alt="" class="empty-img">
                  </div>
                </el-form>
              </el-row>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
    <right-panel :active-data="activeData" :form-conf="formConf" :show-field="!!drawingList.length"
      @tag-change="tagChange" :modelType="modelType" :webType="webType"
      @relationChange="relationChange" :drawingList="drawingList" @setVModel="setVModel" />
    <json-drawer size="550px" :visible.sync="jsonDrawerVisible" :jsonData="formData"
      @refresh="refreshJson" />
    <Preview :visible.sync="previewVisible" :form-data="formData" />
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { debounce } from 'throttle-debounce'
import render from '@/components/extnGenerator/render/render'
import JsonDrawer from './JsonDrawer'
import RightPanel from './RightPanel'
import Preview from '../preview'
import {
  inputComponents, selectComponents, systemComponents, layoutComponents, formConf
} from '@/components/extnGenerator/generator/config'
import { noVModelList, noTableAllowList, calculateItem, onlinePeculiarList } from '@/components/extnGenerator/generator/comConfig'
import {
  exportDefault, beautifierConf, isNumberStr, titleCase, deepClone
} from '@/components/extnGenerator/utils'
import drawingDefalut from '@/components/extnGenerator/generator/drawingDefalut'
import DraggableItem from './DraggableItem'
import DraggableItemApp from './DraggableItemApp'
import {
  getDrawingList, saveDrawingList, getIdGlobal, saveIdGlobal, getFormConf
} from '@/components/extnGenerator/utils/db'
import { validURL } from '@/utils/validate'

const emptyActiveData = { style: {}, autosize: {} }
let oldActiveId
let tempActiveData
const idGlobal = getIdGlobal()

export default {
  components: {
    draggable,
    render,
    JsonDrawer,
    RightPanel,
    DraggableItem,
    DraggableItemApp,
    Preview
  },
  props: ['conf', 'modelType', 'webType', 'dbType'],
  data() {
    return {
      idGlobal: 100,
      formConf: deepClone(formConf),
      inputComponents,
      selectComponents,
      systemComponents,
      layoutComponents,
      labelWidth: 100,
      drawingList: [],
      drawingData: {},
      activeId: null,
      drawerVisible: false,
      previewVisible: false,
      formData: {},
      dialogVisible: false,
      jsonDrawerVisible: false,
      generateConf: null,
      showFileName: false,
      activeData: {},
      saveDrawingListDebounce: debounce(340, saveDrawingList),
      saveIdGlobalDebounce: debounce(340, saveIdGlobal),
      isDrawingListChange: true,
      showTip: true,
      activeItem: {},
      activeTableItem: {},
      showType: 'pc',
      leftComponents: [
        {
          title: '基础控件',
          list: inputComponents
        },
        {
          title: '高级控件',
          list: selectComponents
        },
        {
          title: '系统控件',
          list: systemComponents
        },
        {
          title: '布局控件',
          list: layoutComponents
        }
      ],
      rowIndex: 0,
      colIndex: 0,
      rowData: [],
      colData: [],
      selectCell: {
        __config__: {
          rowspan: 1,
          colspan: 1
        }
      }
    }
  },
  provide() {
    return {
      getShowType: () => this.showType
    }
  },
  computed: {
    mergeLeftColDisabled() {
      if (!this.colData.length) return true
      return (this.colIndex <= 0) || (this.colData[this.colIndex - 1].__config__.rowspan !== this.selectCell.__config__.rowspan)
    },
    mergeRightColDisabled() {
      if (!this.colData.length) return true
      let rightColIndex = this.colIndex + this.selectCell.__config__.colspan
      return (this.colIndex >= this.colData.length - 1) || (rightColIndex > this.colData.length - 1)
        || (this.colData[rightColIndex].__config__.rowspan !== this.selectCell.__config__.rowspan)
    },
    mergeWholeRowDisabled() {
      if (!this.selectCell.__config__ || !this.rowData.length) return true
      let rowDataChildren = this.rowData[this.rowIndex].__config__.children
      let startRowspan = rowDataChildren[0].__config__.rowspan
      let unmatchedFlag = false
      for (let i = 1; i < rowDataChildren.length; i++) {
        if (rowDataChildren[i].__config__.rowspan !== startRowspan) {
          unmatchedFlag = true
          break;
        }
      }
      if (unmatchedFlag) return true
      return (this.colData.length <= 1) || (this.colData.length === this.selectCell.__config__.colspan)
    },
    mergeAboveRowDisabled() {
      if (!this.rowData.length || this.rowIndex <= 0) return true
      return (this.rowData[this.rowIndex - 1].__config__.children[this.colIndex].__config__.colspan
        !== this.selectCell.__config__.colspan) || this.rowData[this.rowIndex - 1].__config__.children[this.colIndex].__config__.merged
    },
    mergeBelowRowDisabled() {
      if (!this.rowData.length || (this.rowIndex == this.rowData.length)) return true
      let belowRowIndex = this.rowIndex + this.selectCell.__config__.rowspan
      return (this.rowIndex >= this.rowData.length - 1) || (belowRowIndex > this.rowData.length - 1)
        || (this.rowData[belowRowIndex].__config__.children[this.colIndex].__config__.colspan !== this.selectCell.__config__.colspan)
        || this.rowData[belowRowIndex].__config__.children[this.colIndex].__config__.merged
    },
    mergeWholeColDisabled() {
      if (!this.rowData.length) return true
      let startColspan = this.rowData[0].__config__.children[this.colIndex].__config__.colspan
      let unmatchedFlag = false
      for (let i = 1; i < this.rowData.length; i++) {
        if (this.rowData[i].__config__.children[this.colIndex].__config__.colspan !== startColspan) {
          unmatchedFlag = true
          break;
        }
      }
      if (unmatchedFlag) return true
      return (this.rowData.length <= 1) || (this.rowData.length === this.selectCell.__config__.rowspan)
    },
    undoMergeRowDisabled() {
      return this.selectCell.__config__.merged || (this.selectCell.__config__.colspan <= 1)
    },
    undoMergeColDisabled() {
      return this.selectCell.__config__.merged || (this.selectCell.__config__.rowspan <= 1)
    },
    deleteWholeColDisabled() {
      if (!this.rowData.length) return true
      if (this.rowData[0].__config__.children[0].__config__.colspan === this.rowData[0].__config__.children.length) return true
      let startColspan = this.rowData[0].__config__.children[this.colIndex].__config__.colspan
      let unmatchedFlag = false
      for (let i = 1; i < this.rowData.length; i++) {
        if (this.rowData[i].__config__.children[this.colIndex].__config__.colspan !== startColspan) {
          unmatchedFlag = true
          break;
        }
      }
      if (unmatchedFlag) return true
      return (this.selectCell.__config__.colspan === this.colData.length)
    },
    deleteWholeRowDisabled() {
      if (!this.rowData.length || this.rowData.length <= this.rowIndex) return true
      if (this.rowData[0].__config__.children[0].__config__.rowspan === this.rowData.length) return true
      //整行所有单元格行高不一致不可删除！！
      let startRowspan = this.rowData[this.rowIndex].__config__.children[0].__config__.rowspan
      let unmatchedFlag = false
      for (let i = 1; i < this.rowData[this.rowIndex].__config__.children.length; i++) {
        if (this.rowData[this.rowIndex].__config__.children[i].__config__.rowspan !== startRowspan) {
          unmatchedFlag = true
          break;
        }
      }
      if (unmatchedFlag) return true
      return (this.rowData.length === 1) || (this.selectCell.__config__.rowspan === this.rowData.length)
    }
  },
  watch: {
    // eslint-disable-next-line func-names
    'activeData.__config__.label': function (val, oldVal) {
      // if (
      //   this.activeData.placeholder === undefined
      //   || !this.activeData.__config__.tag
      //   || oldActiveId !== this.activeId
      // ) {
      //   return
      // }
      // this.activeData.placeholder = this.activeData.placeholder.replace(oldVal, '') + val
    },
    activeId: {
      handler(val) {
        oldActiveId = val
      },
      immediate: true
    },
    drawingList: {
      handler(val) {
        this.saveDrawingListDebounce(val)
        if (val.length === 0) {
          this.idGlobal = 100
          this.activeData = {}
        }
        // if (!this.isDrawingListChange) {
        //   this.isDrawingListChange = true
        //   return
        // }
        this.$emit('drawingListChange')
      },
      deep: true
    },
    idGlobal: {
      handler(val) {
        this.formConf.idGlobal = val
        // this.saveIdGlobalDebounce(val)
      },
      immediate: true
    }
  },
  created() {
    if (typeof this.conf === 'object' && this.conf !== null) {
      this.isDrawingListChange = false
      this.drawingList = deepClone(this.conf.fields)
      Object.assign(this.formConf, this.conf)
      this.idGlobal = this.formConf.idGlobal
      if (this.drawingList.length) this.activeFormItem(this.drawingList[0])
    } else {
      this.drawingList = []
      this.idGlobal = 100
    }
    if (this.modelType == 1 || this.modelType == 6) {
      this.leftComponents[1].list = [...this.leftComponents[1].list, calculateItem]
      this.leftComponents[0].list = [...this.leftComponents[0].list, ...onlinePeculiarList]
    }
    if (this.webType != 2 || this.modelType == 3 || this.modelType == 6) this.formConf.popupType = 'fullScreen'
  },
  mounted() {
    // fix: firefox 下 拖拽 会新打卡一个选项卡
    // https://github.com/JakHuang/form-generator/issues/15
    document.body.ondrop = event => {
      event.preventDefault()
      event.stopPropagation()
    }
  },
  methods: {
    // 供父组件使用 获取表单JSON
    getData() {
      return new Promise((resolve, reject) => {
        if (!this.drawingList.length) {
          reject({ msg: '表单不允许为空', target: 1 })
          return
        }
        const loop = list => {
          for (let i = 0; i < list.length; i++) {
            const e = list[i]
            const config = e.__config__
            if (config.layout === "colFormItem" && !noVModelList.includes(config.jnpfKey) && !e.__vModel__) {
              reject({ msg: `${config.label}的控件字段不能为空`, target: 1 })
              break
            }
            if (e.__config__.isStorage == 2 && !e.__vModel__) {
              reject({ msg: `${config.label}的控件字段不能为空`, target: 1 })
              break
            }
            if (config.jnpfKey === 'billRule') {
              if (!config.rule) {
                reject({ msg: '单据组件“单据模板”属性为必填项', target: 1 })
                break
              }
            }
            if (config.jnpfKey === 'relationForm') {
              if (!e.modelId) {
                reject({ msg: '关联表单控件“关联功能”属性为必填项', target: 1 })
                break
              }
              if (!e.relationField) {
                reject({ msg: '关联表单控件“显示字段”属性为必填项', target: 1 })
                break
              }
            }
            if (config.jnpfKey === 'popupSelect') {
              if (!e.interfaceId) {
                reject({ msg: '弹窗选择控件“远端数据”属性为必填项', target: 1 })
                break
              }
              if (!e.propsValue) {
                reject({ msg: '弹窗选择控件“储存字段”属性为必填项', target: 1 })
                break
              }
              if (!e.relationField) {
                reject({ msg: '弹窗选择控件“显示字段”属性为必填项', target: 1 })
                break
              }
            }
            if (config.jnpfKey === 'popupTableSelect') {
              if (!e.interfaceId) {
                reject({ msg: '下拉表格控件“远端数据”属性为必填项', target: 1 })
                break
              }
              if (!e.propsValue) {
                reject({ msg: '下拉表格控件“储存字段”属性为必填项', target: 1 })
                break
              }
              if (!e.relationField) {
                reject({ msg: '下拉表格控件“显示字段”属性为必填项', target: 1 })
                break
              }
            }
            if (config.jnpfKey === 'autoComplete') {
              if (!e.interfaceId) {
                reject({ msg: '下拉补全控件“远端数据”属性为必填项', target: 1 })
                break
              }
              if (!e.relationField) {
                reject({ msg: '下拉补全控件“显示字段”属性为必填项', target: 1 })
                break
              }
            }
            if (config.layout === 'rowFormItem' && !config.children.length) {
              reject({ msg: `您的${config.label}控件中没有组件`, target: 1 })
              break
            }
            if (config && config.children && Array.isArray(config.children)) {
              loop(config.children)
            }
            if (config.jnpfKey === 'uploadFz') {
              if (e.pathType === 'selfPath') {
                if (e.isAccount === 0) {
                  if (!e.folder) {
                    reject({ msg: '请设置自定义路径', target: 1 })
                    break
                  }
                }
              }
            }
            if (config.jnpfKey === 'uploadImg') {
              if (e.pathType === 'selfPath') {
                if (e.isAccount === 0) {
                  if (!e.folder) {
                    reject({ msg: '请设置自定义路径', target: 1 })
                    break
                  }
                }
              }
            }
            if (config.jnpfKey === 'link') {
              if (e.href && !validURL(e.href)) {
                reject({ msg: '请输入正确的链接地址', target: 1 })
                break
              }
            }
          }
        }
        loop(this.drawingList)
        this.AssembleFormData()
        if (this.formData.hasPrintBtn && (!this.formData.printId || !this.formData.printId.length)) {
          reject({ msg: `请选择打印模板`, target: 1 })
        }
        resolve({ formData: this.formData, target: 1 })
      })
    },
    //  阻止表格中嵌套行容器
    shouldClone(to, from, target, event, conf) {
      const targetConf = target._underlying_vm_
      const isRowContainer = conf.__config__.cmpType === 'common' && conf.__config__.rowType === 'layout'
      if (isRowContainer) return true
      if (conf.cmpType === 'custom') return false
      if (conf.__config__.rowType === 'table') {
        if (noTableAllowList.includes(targetConf.__config__.jnpfKey)) {
          // if (this.showTip) {
          //   this.$message.warning(`子表内暂不支持使用该组件`)
          //   this.showTip = false
          // }
          return false
        }
        if (targetConf.__config__.layout === 'rowFormItem') return false
        if (this.$store.getters.hasTable) {
          if (!conf.__config__.tableName) {
            if (this.showTip) {
              this.$message.warning(`子表请先关联数据表`)
              this.showTip = false
            }
            return false
          }
        }
        this.activeItem = targetConf
        this.activeTableItem = conf
      }
      if (conf.__config__.rowType === 'tableGrid') {
        if (targetConf.__config__.jnpfKey === 'tableGrid') return false
      }
      return true
    },
    activeFormItem(element) {
      this.activeData = element
      this.activeId = element.__config__.formId
    },
    onEnd(obj) {
      this.showTip = true
      if (obj.from !== obj.to) {
        this.activeData = tempActiveData
        this.activeId = tempActiveData.__config__.formId
      }
      if (obj.to.className.indexOf('table-wrapper') > -1) {
        this.$set(this.activeItem.__config__, 'isSubTable', true)
        this.$set(this.activeItem.__config__, 'parentVModel', this.activeTableItem.__vModel__)
        if (this.$store.getters.hasTable) {
          this.$set(this.activeItem.__config__, 'relationTable', this.activeTableItem.__config__.tableName)
          this.activeItem.__vModel__ = ''
        }
      }
    },
    onCenterEnd(obj) {
      this.showTip = true
      if (obj.from == obj.to) return
      if (obj.to.className.indexOf('table-wrapper') > -1) {
        this.$set(this.activeItem.__config__, 'isSubTable', true)
        this.$set(this.activeItem.__config__, 'parentVModel', this.activeTableItem.__vModel__)
        if (this.$store.getters.hasTable) {
          this.$set(this.activeItem.__config__, 'relationTable', this.activeTableItem.__config__.tableName)
          this.activeItem.__vModel__ = ''
        }
      }
    },
    onTableEnd(obj, target, conf) {
      if (obj.from == obj.to) return
      if (obj.to.className.indexOf('table-wrapper') < 0) {
        this.$set(this.activeItem.__config__, 'isSubTable', false)
        this.$set(this.activeItem.__config__, 'parentVModel', '')
        if (this.$store.getters.hasTable) this.activeItem.__vModel__ = ''
      } else {
        this.$set(this.activeItem.__config__, 'isSubTable', true)
        this.$set(this.activeItem.__config__, 'parentVModel', this.activeTableItem.__vModel__)
        if (this.$store.getters.hasTable) {
          this.$set(this.activeItem.__config__, 'relationTable', this.activeTableItem.__config__.tableName)
          this.activeItem.__vModel__ = ''
        }
      }
    },
    addComponent(item) {
      if (item.__config__.dragDisabled) return
      const clone = this.cloneComponent(item)
      this.drawingList.push(clone)
      this.activeFormItem(clone)
    },
    cloneComponent(origin) {
      const clone = deepClone(origin)
      const config = clone.__config__
      config.span = this.formConf.span // 生成代码时，会根据span做精简判断
      this.createIdAndKey(clone)
      // clone.placeholder !== undefined && (clone.placeholder += config.label)
      tempActiveData = clone
      return tempActiveData
    },
    createIdAndKey(item, parent) {
      const config = item.__config__
      config.formId = ++this.idGlobal
      config.renderKey = +new Date() // 改变renderKey后可以实现强制更新组件
      if (config.layout === 'colFormItem') {
        if (!this.$store.getters.hasTable) {
          // 分割线和按钮不加vModel
          if (noVModelList.indexOf(config.jnpfKey) < 0 || config.isStorage == 2) {
            item.__vModel__ = this.toggleVmodelCase(`${config.jnpfKey}Field${this.idGlobal}`)
          }
        } else {
          if (noVModelList.indexOf(config.jnpfKey) < 0 || config.isStorage == 2) {
            item.__vModel__ = ""
          }
        }
        if (parent && parent.__vModel__ && parent.__config__.jnpfKey === 'table') {
          item.__config__.parentVModel = parent.__vModel__
        }
      } else if (config.layout === 'rowFormItem') {
        if (config.jnpfKey === 'table') {
          item.__vModel__ = this.toggleVmodelCase(`${config.jnpfKey}Field${this.idGlobal}`);
        }
        config.componentName = `row${this.idGlobal}`
        !Array.isArray(config.children) && (config.children = [])
        // delete config.label // rowFormItem无需配置label属性
      }
      if (Array.isArray(config.children)) {
        config.children = config.children.map(childItem => this.createIdAndKey(childItem, item))
      }
      return item
    },
    setVModel(item) {
      const config = item.__config__
      item.__vModel__ = this.toggleVmodelCase(`${config.jnpfKey}Field${config.formId}`)
    },
    toggleVmodelCase(str) {
      const dbType = this.dbType || ''
      if (dbType.toLowerCase() === 'Oracle'.toLowerCase() || dbType.toLowerCase() === 'DM'.toLowerCase()) {
        return str.toUpperCase()
      }
      if (dbType.toLowerCase() === 'PostgreSQL'.toLowerCase() || dbType.toLowerCase() === 'KingBaseES'.toLowerCase()) {
        return str.toLowerCase()
      }
      return str
    },
    AssembleFormData() {
      this.formData = {
        ...this.formConf,
        fields: deepClone(this.drawingList),
      }
    },
    empty() {
      this.$confirm('确定要清空所有组件吗？', '提示', { type: 'warning' }).then(() => {
        this.drawingList = []
        this.idGlobal = 100
      }).catch(() => { })
    },
    drawingItemCopy(item, parent) {
      let clone = deepClone(item)
      clone = this.createIdAndKey(clone)
      parent.push(clone)
      this.activeFormItem(clone)
    },
    drawingItemDelete(index, parent) {
      parent.splice(index, 1)
      this.$nextTick(() => {
        const len = this.drawingList.length
        if (len) {
          this.activeFormItem(this.drawingList[len - 1])
        }
      })
    },
    preview() {
      this.AssembleFormData()
      this.previewVisible = true
    },
    showJson() {
      this.AssembleFormData()
      this.jsonDrawerVisible = true
    },
    tagChange(newTag) {
      newTag = this.cloneComponent(newTag)
      const config = newTag.__config__
      newTag.__vModel__ = this.activeData.__vModel__
      config.formId = this.activeId
      config.span = this.activeData.__config__.span
      this.activeData.__config__.tag = config.tag
      this.activeData.__config__.tagIcon = config.tagIcon
      this.activeData.__config__.document = config.document
      if (typeof this.activeData.__config__.defaultValue === typeof config.defaultValue) {
        config.defaultValue = this.activeData.__config__.defaultValue
      }
      Object.keys(newTag).forEach(key => {
        if (this.activeData[key] !== undefined) {
          newTag[key] = this.activeData[key]
        }
      })
      this.activeData = newTag
      this.updateDrawingList(newTag, this.drawingList)
    },
    updateDrawingList(newTag, list) {
      const index = list.findIndex(item => item.__config__.formId === this.activeId)
      if (index > -1) {
        list.splice(index, 1, newTag)
      } else {
        list.forEach(item => {
          if (Array.isArray(item.__config__.children)) this.updateDrawingList(newTag, item.__config__.children)
        })
      }
    },
    refreshJson(data) {
      this.drawingList = deepClone(data.fields)
      delete data.fields
      this.formConf = data
    },
    relationChange(vmodel) {
      const loop = list => {
        for (let i = 0; i < list.length; i++) {
          const config = list[i].__config__
          if (list[i].relationField && list[i].relationField === list[i].__vModel__) {
            list[i].showField = ''
          }
          if (config && config.children && Array.isArray(config.children)) {
            loop(config.children)
          }
        }
      }
      loop(this.drawingList)
    },
    handleTableAddRow(element, insertPos, cloneRowIdx) {
      const row = element.__config__.children
      let rowIdx = (insertPos === undefined) ? row.length : insertPos
      let newRow = (cloneRowIdx === undefined) ? deepClone(row[row.length - 1]) : deepClone(row[cloneRowIdx])
      newRow.__config__.children.forEach(col => {
        col.__config__.formId = ++this.idGlobal
        col.__config__.merged = false
        col.__config__.colspan = 1
        col.__config__.rowspan = 1
        col.__config__.children = []
      })
      newRow.__config__.formId = ++this.idGlobal
      newRow.__config__.jnpfKey = "tableGridTr"
      element.__config__.children.splice(rowIdx, 0, newRow)
      let colNo = 0
      while ((rowIdx < element.__config__.children.length - 1) && (colNo < element.__config__.children[0].__config__.children.length)) {  //越界判断
        let rowMerged = element.__config__.children[rowIdx + 1].__config__.children[colNo].__config__.merged  //确定插入位置的单元格是否为合并单元格
        if (!!rowMerged) {
          let rowArray = element.__config__.children
          let unMergedCell = {}
          let startRowIndex = null
          for (let i = rowIdx; i >= 0; i--) {  //查找该行已合并的主单元格
            if (!rowArray[i].__config__.children[colNo].__config__.merged && (rowArray[i].__config__.children[colNo].__config__.rowspan > 1)) {
              startRowIndex = i
              unMergedCell = rowArray[i].__config__.children[colNo]
              break
            }
          }
          let newRowspan = unMergedCell.__config__.rowspan + 1
          this.setPropsOfMergedRows(startRowIndex, unMergedCell.__config__.colspan, newRowspan, colNo)
          colNo += unMergedCell.__config__.colspan
        } else {
          colNo += 1
        }
      }
    },
    handleTableAddCol(element, insertPos, cloneRowIdx) {
      const row = element.__config__.children
      let colIdx = (insertPos === undefined) ? row[0].__config__.children.length : insertPos  //确定插入列位置
      row.forEach(item => {
        let newCol = {
          __config__: {
            jnpfKey: "tableGridTd",
            merged: false,
            colspan: 1,
            rowspan: 1,
            formId: ++this.idGlobal,
            children: []
          }
        }
        item.__config__.children.splice(colIdx, 0, newCol)
      })
    },
    mergeTableCol(element, type) {
      let mergedColIndex = type == 1 ? this.colIndex : this.colIndex + this.colData[this.colIndex].__config__.colspan
      let remainedColIndex = type == 1 ? this.colIndex - this.colData[this.colIndex - 1].__config__.colspan : this.colIndex
      const colChildren = this.colData[mergedColIndex].__config__.children
      const colChildren_ = this.colData[remainedColIndex].__config__.children
      this.colData[remainedColIndex].__config__.children = [...colChildren_, ...deepClone(colChildren)]
      let newColspan = this.colData[mergedColIndex].__config__.colspan * 1 + this.colData[remainedColIndex].__config__.colspan * 1
      this.setPropsOfMergedCols(remainedColIndex, newColspan, this.selectCell.__config__.rowspan)
    },
    mergeWholeCol() {
      let childrenData = this.colData.filter((colItem) => {
        return !colItem.merged && !!colItem.__config__.children && (colItem.__config__.children.length > 0)
      })
      if (childrenData && childrenData.length) {
        childrenData.map((o, i) => {
          if (i != 0) this.colData[0].__config__.children.push(...deepClone(o.__config__.children))
        })
      }
      this.setPropsOfMergedCols(0, this.colData.length, this.colData[this.colIndex].__config__.rowspan)
    },
    mergeTableRow(type) {
      let mergedRowIndex = type == 1 ? this.rowIndex : this.rowIndex + this.selectCell.__config__.rowspan
      let remainedRowIndex = type == 1 ? this.rowIndex - 1 : this.rowIndex
      let childrenData = this.rowData[mergedRowIndex].__config__.children[this.colIndex].__config__.children
      let childrenData_ = this.rowData[remainedRowIndex].__config__.children[this.colIndex].__config__.children
      this.rowData[remainedRowIndex].__config__.children[this.colIndex].__config__.children = [...childrenData_, ...deepClone(childrenData)]
      let newRowspan = this.rowData[mergedRowIndex].__config__.children[this.colIndex].__config__.rowspan * 1 + this.rowData[remainedRowIndex].__config__.children[this.colIndex].__config__.rowspan * 1
      this.setPropsOfMergedRows(remainedRowIndex, this.selectCell.__config__.colspan, newRowspan)
    },
    mergeWholeRow() {
      let childrenData = []
      this.rowData.forEach(o => {
        let tempCell = o.__config__.children[this.colIndex]
        if (!o.__config__.merged && !!o.__config__.children && o.__config__.children.length) {
          childrenData.push(tempCell)
        }
      })
      let firstCellOfCol = this.rowData[0].__config__.children[this.colIndex]
      if (childrenData && childrenData.length) {
        childrenData.map((o, i) => {
          if (i != 0) firstCellOfCol.__config__.children.push(...deepClone(o.__config__.children))
        })
      }
      this.setPropsOfMergedRows(0, firstCellOfCol.__config__.colspan, this.rowData.length)
    },
    undoMergeCol() {
      this.setPropsOfSplitCol(this.colIndex, this.selectCell.__config__.colspan, this.selectCell.__config__.rowspan)
    },
    undoMergeRow() {
      this.setPropsOfSplitRow(this.colIndex, this.selectCell.__config__.colspan, this.selectCell.__config__.rowspan)
    },
    deleteWholeCol() {
      let startColspan = this.rowData[0].__config__.children[this.colIndex].__config__.colspan
      this.rowData.forEach((rItem) => {
        rItem.__config__.children.splice(this.colIndex, startColspan)
      })
    },
    deleteWholeRow() {
      let startRowspan = this.rowData[this.rowIndex].__config__.children[0].__config__.rowspan
      this.rowData.splice(this.rowIndex, startRowspan)
    },
    setPropsOfMergedCols(startColIndex, newColspan, rowspan) {
      for (let i = this.rowIndex; i < this.rowIndex + rowspan; i++) {
        for (let j = startColIndex; j < startColIndex + newColspan; j++) {
          if ((i === this.rowIndex) && (j === startColIndex)) {
            this.rowData[i].__config__.children[j].__config__.colspan = newColspan
            continue
          }
          this.rowData[i].__config__.children[j].__config__.merged = true
          this.rowData[i].__config__.children[j].__config__.colspan = newColspan
          this.rowData[i].__config__.children[j].__config__.children = []
        }
      }
    },
    setPropsOfMergedRows(startRowIndex, colspan, newRowspan, colIndex) {
      if (!colIndex) colIndex = this.colIndex
      for (let i = startRowIndex; i < startRowIndex + newRowspan; i++) {
        for (let j = colIndex; j < colIndex + colspan; j++) {
          if ((i === startRowIndex) && (j === colIndex)) {
            this.rowData[i].__config__.children[j].__config__.rowspan = newRowspan
            continue
          }
          this.rowData[i].__config__.children[j].__config__.merged = true
          this.rowData[i].__config__.children[j].__config__.rowspan = newRowspan
          this.rowData[i].__config__.children[j].__config__.children = []
        }
      }
    },
    setPropsOfSplitCol(startColIndex, colspan, rowspan) {
      for (let i = this.rowIndex; i < this.rowIndex + rowspan; i++) {
        for (let j = startColIndex; j < startColIndex + colspan; j++) {
          this.rowData[i].__config__.children[j].__config__.merged = false;
          this.rowData[i].__config__.children[j].__config__.rowspan = 1
          this.rowData[i].__config__.children[j].__config__.colspan = 1
        }
      }
    },
    setPropsOfSplitRow(startColIndex, colspan, rowspan) {
      for (let i = this.rowIndex; i < this.rowIndex + rowspan; i++) {
        for (let j = startColIndex; j < startColIndex + colspan; j++) {
          this.rowData[i].__config__.children[j].__config__.merged = false;
          this.rowData[i].__config__.children[j].__config__.rowspan = 1
          this.rowData[i].__config__.children[j].__config__.colspan = 1
        }
      }
    },
    handleTableSetting(e, element) {
      switch (e) {
        case '1':
          //插入左侧列
          this.handleTableAddCol(element, this.colIndex)
          break;
        case '2':
          //插入右侧列
          this.handleTableAddCol(element, this.colIndex + 1)
          break;
        case '3':
          //插入上方行
          this.handleTableAddRow(element, this.rowIndex, this.rowIndex)
          break;
        case '4':
          //插入下方行
          this.handleTableAddRow(element, this.rowIndex + 1, this.rowIndex)
          break;
        case '5':
          //向左合并
          this.mergeTableCol(element, 1)
          break;
        case '6':
          //向右合并
          this.mergeTableCol(element)
          break;
        case '7':
          //合并整行
          this.mergeWholeCol(element)
          break;
        case '8':
          //向上合并
          this.mergeTableRow(1)
          break;
        case '9':
          //向下合并
          this.mergeTableRow()
          break;
        case '10':
          //合并整列
          this.mergeWholeRow()
          break;
        case '11':
          //撤销行合并
          this.undoMergeCol()
          break;
        case '12':
          //撤销列合并
          this.undoMergeRow()
          break;
        case '13':
          //删除整列
          this.deleteWholeCol()
          break;
        case '14':
          //删除整行
          this.deleteWholeRow()
          break;
        default:
          break;
      }
      this.resetData()
    },
    resetData() {
      this.rowIndex = 0,
        this.colIndex = 0,
        this.rowData = [],
        this.colData = [],
        this.selectCell = {
          __config__: {
            rowspan: 1,
            colspan: 1
          }
        }
    },
    handleShowMenu(element, rowIndex, colIndex) {
      this.rowIndex = rowIndex
      this.colIndex = colIndex
      this.rowData = element.__config__.children
      this.colData = this.rowData[rowIndex].__config__.children
      this.selectCell = this.colData[colIndex]
    }
  }
}
</script>
<style lang='scss'>
@import '../styles/index';
@import '../styles/home';
</style>