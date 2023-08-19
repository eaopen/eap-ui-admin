<template>
  <div class="columnDesign-container">
    <div class="main-board">
      <div class="search-box">
        <h4 class="cap">查询字段</h4>
        <el-table :data="columnData.searchList" class="JNPF-common-table" ref="dragTableSearch"
          :row-key="row=>row.prop">
          <el-table-column align="center" label="拖动" width="50">
            <template>
              <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
                title='点击拖动' />
            </template>
          </el-table-column>
          <el-table-column prop="label" label="列名" v-if="webType!=4" />
          <el-table-column prop="label" label="列名" v-else>
            <template slot-scope="scope">
              <el-input v-model="scope.row.label" placeholder="列名" />
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="字段" />
          <el-table-column prop="searchType" label="类型">
            <template slot-scope="scope">
              <el-select v-model="scope.row.searchType" placeholder="请选择"
                :disabled="scope.row.jnpfKey!=='comInput'&&scope.row.jnpfKey!=='textarea'">
                <el-option label="等于查询" :value="1"></el-option>
                <el-option label="模糊查询" :value="2"></el-option>
                <el-option label="范围查询" :value="3"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop='searchMultiple' label="是否多选" align="center">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.searchMultiple"
                v-if="['select','depSelect','roleSelect','userSelect','usersSelect','comSelect','posSelect','groupSelect'].includes(scope.row.jnpfKey)">
              </el-checkbox>
              <el-checkbox v-else disabled></el-checkbox>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-divider></el-divider>
      <div class="sort-box">
        <h4 class="cap">排序字段</h4>
        <el-table :data="columnData.sortList" class="JNPF-common-table" ref="dragTableSort"
          :row-key="row=>row.prop">
          <el-table-column align="center" label="拖动" width="50">
            <template>
              <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
                title='点击拖动' />
            </template>
          </el-table-column>
          <el-table-column prop="label" label="列名" v-if="webType!=4" />
          <el-table-column prop="label" label="列名" v-else>
            <template slot-scope="scope">
              <el-input v-model="scope.row.label" placeholder="列名" />
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="字段" />
        </el-table>
      </div>
      <el-divider></el-divider>
      <div class="column-box">
        <h4 class="cap">列表字段</h4>
        <el-table :data="columnData.columnList" class="JNPF-common-table" ref="dragTable"
          :row-key="row=>row.prop">
          <el-table-column align="center" label="拖动" width="50">
            <template>
              <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
                title='点击拖动' />
            </template>
          </el-table-column>
          <el-table-column prop="label" label="列名" v-if="webType!=4" />
          <el-table-column prop="label" label="列名" v-else>
            <template slot-scope="scope">
              <el-input v-model="scope.row.label" placeholder="列名" />
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="字段" />
        </el-table>
      </div>
    </div>
    <div class="right-board">
      <el-tabs v-model="currentTab" class="top-tabs top-tabs_app">
        <el-tab-pane label="查询字段" name="search" />
        <el-tab-pane label="排序字段" name="sort" />
        <el-tab-pane label="列表字段" name="column" />
        <el-tab-pane label="列表属性" name="attr" />
      </el-tabs>
      <div class="field-box">
        <div class="columnList" v-if="currentTab==='sort'">
          <el-table :data="sortOptions" class="JNPF-common-table" height="100%"
            @selection-change="sortSelectionChange" ref="sortTable">
            <el-table-column prop="label" label="排序字段" v-if="webType!=4" />
            <el-table-column prop="prop" label="排序字段" v-else />
            <el-table-column type="selection" width="55" align="center" />
          </el-table>
        </div>
        <div class="columnList" v-if="currentTab==='search'">
          <el-table :data="searchOptions" class="JNPF-common-table" height="100%"
            @selection-change="searchSelectionChange" ref="searchTable">
            <el-table-column prop="label" label="查询字段" v-if="webType!=4" />
            <el-table-column prop="prop" label="查询字段" v-else />
            <el-table-column type="selection" width="55" align="center" />
          </el-table>
        </div>
        <div class="columnList" v-if="currentTab==='column'">
          <el-table :data="columnOptions" class="JNPF-common-table" height="100%"
            @selection-change="columnSelectionChange" ref="columnTable">
            <el-table-column prop="label" label="列表字段" v-if="webType!=4" />
            <el-table-column prop="prop" label="列表字段" v-else />
            <el-table-column type="selection" width="55" align="center" />
          </el-table>
        </div>
        <el-scrollbar class="right-scrollbar" v-show="currentTab==='attr'">
          <div class="setting-box">
            <el-form :model="columnData" label-width="80px" label-position="left">
              <el-divider>表格配置</el-divider>
              <el-form-item label="数据过滤" v-if="webType != 4">
                <el-button style="width: 100%;" @click="filterPanelShow">
                  {{ this.columnData.ruleListApp && this.columnData.ruleListApp.length > 0 ? '编辑过滤条件' : '添加过滤条件' }}
                </el-button>
              </el-form-item>
              <Condition ref="conditionpane" :modelType="modelType" :columnData="columnData"
                @ruleConfig="ruleConfig">
              </Condition>
              <el-form-item label="排序类型">
                <el-select v-model="columnData.sort" placeholder="请选择排序类型">
                  <el-option label="升序" value="asc"></el-option>
                  <el-option label="降序" value="desc"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="排序字段">
                <el-select v-model="columnData.defaultSidx" placeholder="请选择排序字段" clearable
                  filterable>
                  <el-option :label="item.__config__.label" :value="item.__vModel__"
                    v-for="(item, i) in groupFieldOptions" :key="i"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="分页设置">
                <el-switch v-model="columnData.hasPage"></el-switch>
              </el-form-item>
              <el-form-item label="分页条数" v-if="columnData.hasPage">
                <el-radio-group v-model="columnData.pageSize">
                  <el-radio-button :label="20">20条</el-radio-button>
                  <el-radio-button :label="50">50条</el-radio-button>
                  <el-radio-button :label="100">100条</el-radio-button>
                  <el-radio-button :label="500">500条</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-divider>按钮配置</el-divider>
              <el-checkbox-group v-model="btnsList" class="btnsList" v-if="webType!=4">
                <el-checkbox :label="item.value" v-for="item in btnsOption" :key="item.value">
                  <span class="btn-label">{{ item.value | btnText }}</span>
                  <el-input v-model="item.label" />
                </el-checkbox>
              </el-checkbox-group>
              <el-checkbox-group v-model="columnBtnsList" class="btnsList columnBtnList"
                v-if="webType!=4">
                <el-checkbox :label="item.value" v-for="item in columnBtnsOption" :key="item.value">
                  <span class="btn-label">{{ item.value | btnText }}</span>
                  <el-input v-model="item.label" />
                </el-checkbox>
              </el-checkbox-group>
              <template v-if="modelType==1">
                <p class="btn-cap mt-10 mb-10">自定义按钮区</p>
                <div class="custom-btns-list">
                  <draggable :list="columnData.customBtnsList" :animation="340" group="customItem"
                    handle=".option-drag">
                    <div v-for="(item, index) in columnData.customBtnsList" :key="index"
                      class="custom-item">
                      <div class="custom-line-icon option-drag">
                        <i class="icon-ym icon-ym-darg" />
                      </div>
                      <p class="custom-line-value">{{item.value}}</p>
                      <el-input v-model="item.label" placeholder="按钮名称" size="small">
                        <template slot="append">
                          <el-button type="primary" @click="editFunc(item)" class="custom-btn">事件
                          </el-button>
                        </template>
                      </el-input>
                      <div class="close-btn custom-line-icon"
                        @click="columnData.customBtnsList.splice(index, 1)">
                        <i class="el-icon-remove-outline" />
                      </div>
                    </div>
                  </draggable>
                </div>
                <div>
                  <el-button type="text" icon="el-icon-plus" @click="addCustomBtn">添加按钮</el-button>
                </div>
              </template>
              <template v-if="webType!=4">
                <el-divider>权限设置</el-divider>
                <el-form-item label="按钮权限">
                  <el-switch v-model="columnData.useBtnPermission"></el-switch>
                </el-form-item>
                <el-form-item label="列表权限">
                  <el-switch v-model="columnData.useColumnPermission"></el-switch>
                </el-form-item>
                <el-form-item label="表单权限">
                  <el-switch v-model="columnData.useFormPermission"></el-switch>
                </el-form-item>
                <el-form-item label="数据权限">
                  <el-switch v-model="columnData.useDataPermission"></el-switch>
                </el-form-item>
              </template>
              <template v-if="modelType==1">
                <el-divider>脚本事件</el-divider>
                <el-form-item label="表格事件">
                  <el-button style="width: 100%;"
                    @click="addFunc(columnData.funcs.afterOnload,'afterOnload',true)">脚本编写
                  </el-button>
                </el-form-item>
              </template>
            </el-form>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <form-script v-if="formScriptVisible" ref="formScript" :value="activeItem.func"
      :type="activeItem.type" @updateScript="updateScript" @closeDialog="formScriptVisible=false" />
    <custom-btn v-if="customBtnVisible" :activeItem="activeItem" ref="customBtn"
      @updateCustomBtn="updateCustomBtn" @closeDialog="customBtnVisible=false" />
  </div>
</template>
<script>
import Sortable from 'sortablejs'
import Condition from './FlowCondition'
import draggable from 'vuedraggable'
import FormScript from './FormScript'
import CustomBtn from './CustomBtn'
import { getDrawingList } from '@/components/extnGenerator/utils/db'
import { noColumnShowList, noSearchList, useInputList, useDateList } from '@/components/extnGenerator/generator/comConfig'
import { getFields } from '@/api/onlineDev/visualDev'
const getSearchMultiple = item => {
  const jnpfKey = item.__config__.jnpfKey
  const searchMultipleList = ['select', 'depSelect', 'roleSelect', 'userSelect', 'usersSelect', 'comSelect', 'posSelect', 'groupSelect']
  if (searchMultipleList.includes(jnpfKey)) return true
  return false
}
const getSearchType = item => {
  const jnpfKey = item.__config__.jnpfKey
  // 等于-1  模糊-2  范围-3
  const fuzzyList = [...useInputList]
  const RangeList = [...useDateList, 'time', 'date', 'numInput', 'calculate']
  if (RangeList.includes(jnpfKey)) return 3
  if (fuzzyList.includes(jnpfKey)) return 2
  return 1
}
const defaultFunc = '({ data, index, request, toast, refresh }) => {\r\n   \r\n}'
const defaultFuncs = '({ data, tableRef, request }) => {\r\n   \r\n}'

const defaultColumnData = {
  ruleListApp: [], // 过滤规则
  searchList: [], // 查询字段
  hasSuperQuery: false, // 高级查询
  columnList: [], // 字段列表
  columnOptions: [],
  defaultColumnList: [], // 所有可选择字段列表
  sortList: [], // 排序列表
  // type: 1, //列表类型
  defaultSidx: '', // 默认排序字段
  sort: 'desc',   // 排序类型
  hasPage: true,  // 列表分页
  pageSize: 20,  // 分页条数
  useColumnPermission: false,
  useFormPermission: false,
  useBtnPermission: false,
  useDataPermission: false,
  customBtnsList: [],
  thousands: false,
  thousandsField: [],
  btnsList: [
    { value: 'add', icon: 'el-icon-plus', label: '新增' }
  ],  // 按钮
  columnBtnsList: [
    { value: 'edit', icon: 'el-icon-edit', label: '编辑' },
    { value: 'remove', icon: 'el-icon-delete', label: '删除' }
  ], // 列按钮
  funcs: {
    afterOnload: {
      func: "",
      name: "脚本事件"
    }
  }
}
export default {
  name: 'columnDesign',
  props: {
    conf: {
      type: Object,
      default: () => { },
    },
    webType: '',
    modelType: '',
    interfaceId: '',
    templateJson: {
      type: Array,
      default: () => []
    },
  },
  components: { draggable, FormScript, CustomBtn, Condition },
  data() {
    return {
      currentTab: 'attr',
      alignOptions: ['left', 'center', 'right'],
      list: [],
      columnData: JSON.parse(JSON.stringify(defaultColumnData)),
      btnsOption: [
        { value: 'add', icon: 'el-icon-plus', label: '新增' }
      ],
      columnBtnsOption: [
        { value: 'edit', icon: 'el-icon-edit', label: '编辑' },
        { value: 'remove', icon: 'el-icon-delete', label: '删除' },
        { value: 'detail', icon: 'el-icon-tickets', label: '详情' }
      ],
      columnOptions: [],
      searchOptions: [],
      groupFieldOptions: [],
      sortOptions: [],
      sortList: [],
      btnsList: [],
      columnBtnsList: [],
      formScriptVisible: false,
      customBtnVisible: false,
      activeItem: {},
      thousandsOptions: []
    }
  },
  filters: {
    btnText(key) {
      let text = ''
      switch (key) {
        case 'edit':
          text = '编辑'
          break;
        case 'remove':
          text = '删除'
          break;
        case 'detail':
          text = '详情'
          break;
        default:
          text = '新增'
          break;
      }
      return text
    }
  },
  watch: {
    btnsList(val) {
      let list = []
      outer: for (let i = 0; i < this.btnsOption.length; i++) {
        inter: for (let ii = 0; ii < val.length; ii++) {
          if (val[ii] === this.btnsOption[i].value) {
            list.push(this.btnsOption[i])
            break inter;
          }
        }
      }
      this.columnData.btnsList = list
    },
    columnBtnsList(val) {
      let list = []
      outer: for (let i = 0; i < this.columnBtnsOption.length; i++) {
        inter: for (let ii = 0; ii < val.length; ii++) {
          if (val[ii] === this.columnBtnsOption[i].value) {
            list.push(this.columnBtnsOption[i])
            break inter;
          }
        }
      }
      this.columnData.columnBtnsList = list
    },
    currentTab(val) {
      const list = this.columnData[val + 'List']
      this.$nextTick(() => {
        if (this.$refs[val + 'Table']) {
          list.forEach(row => {
            this.$refs[val + 'Table'].toggleRowSelection(row, true)
          })
        }
      })
    },
  },
  created() {
    if (typeof this.conf === 'object' && this.conf !== null) {
      this.columnData = Object.assign({}, defaultColumnData, this.conf)
    }
    if (this.webType != 4) {
      let list = []
      let list1 = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__config__ && data.__config__.jnpfKey) {
          const visibility = !data.__config__.visibility || (Array.isArray(data.__config__.visibility) && data.__config__.visibility.includes('app'))
          if (data.__config__.layout === "colFormItem" && data.__vModel__ && visibility) {
            const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table'
            const id = isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__
            const label = isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label
            data.__vModel__ = id
            data.__config__.label = label
            list.push(data)
            if (data.__vModel__.indexOf('_jnpf_') < 0) list1.push(data)
          }
        }
      }
      loop(getDrawingList())
      this.list = list
      let options = list.filter(o => noColumnShowList.indexOf(o.__config__.jnpfKey) < 0 || o.__config__.isStorage == 2)
      let searchOptions = list.filter(o => noSearchList.indexOf(o.__config__.jnpfKey) < 0)
      this.thousandsOptions = list.filter(o => noSearchList.indexOf(o.__config__.jnpfKey) < 0 && (o.__config__.jnpfKey == 'numInput' || o.__config__.jnpfKey == 'calculate'))
      let sortOptions = list1.filter(o => noColumnShowList.indexOf(o.__config__.jnpfKey) < 0 || o.__config__.isStorage == 2)
      sortOptions = sortOptions.filter(o => o.__vModel__.indexOf('-') < 0)
      this.groupFieldOptions = list.filter(o => o.__vModel__.indexOf('-') < 0)
      this.columnOptions = options.map(o => ({
        label: o.__config__.label,
        prop: o.__vModel__,
        align: 'left',
        jnpfKey: o.__config__.jnpfKey,
        sortable: false,
        width: null,
        ...o
      }));

      this.searchOptions = searchOptions.map(o => ({
        label: o.__config__.label,
        prop: o.__vModel__,
        jnpfKey: o.__config__.jnpfKey,
        value: '',
        searchType: getSearchType(o),
        searchMultiple: getSearchMultiple(o),
        ...o
      }));
      this.sortOptions = sortOptions.map(o => ({
        label: o.__config__.label,
        prop: o.__vModel__,
        jnpfKey: o.__config__.jnpfKey,
        ...o
      }));
      this.columnData.columnOptions = options
      if (!this.columnOptions.length) this.columnData.columnList = []
      if (!this.searchOptions.length) this.columnData.searchList = []
      if (!this.sortOptions.length) this.columnData.sortList = []
      this.setBtnValue(this.columnData.btnsList, this.btnsOption)
      this.setBtnValue(this.columnData.columnBtnsList, this.columnBtnsOption)
    } else {
      if (!this.interfaceId) return
      const query = {
        paramList: this.templateJson || []
      }
      getFields(this.interfaceId, query).then(res => {
        let fieldsList = res.data
        this.columnOptions = fieldsList.map(o => ({
          label: "",
          prop: o,
          fixed: 'none',
          align: 'left',
          jnpfKey: 'comInput',
          sortable: false,
          width: null,
          __vModel__: o,
          __config__: {
            jnpfKey: 'comInput',
          }
        }));
        this.searchOptions = fieldsList.map(o => ({
          label: "",
          prop: o,
          jnpfKey: 'comInput',
          value: '',
          searchType: 1,
          __vModel__: o,
          searchMultiple: false,
          __config__: {
            label: "",
            jnpfKey: 'comInput',
          }
        }));
        this.sortOptions = fieldsList.map(o => ({
          label: '',
          prop: o,
          jnpfKey: o,
        }));
        this.groupFieldOptions = fieldsList.map(o => ({
          label: o,
          prop: o,
          jnpfKey: 'comInput',
          __vModel__: o,
          __config__: {
            label: o,
            jnpfKey: 'comInput',
          }
        }));
        if (!this.columnOptions.length) this.columnData.columnList = []
        if (!this.searchOptions.length) this.columnData.searchList = []
        this.$nextTick(() => {
          this.columnData.columnList = this.setListValue(this.columnData.columnList, this.columnOptions, 'column')
          this.columnData.searchList = this.setListValue(this.columnData.searchList, this.searchOptions, "search")
          this.columnData.sortList = this.setListValue(this.columnData.sortList, this.sortOptions, 'sort')
        })
      })
    }


    this.btnsList = this.columnData.btnsList.map(o => o.value)
    this.columnBtnsList = this.columnData.columnBtnsList.map(o => o.value)
  },
  mounted() {
    this.setSort()
    this.$nextTick(() => {
      this.columnData.columnList = this.setListValue(this.columnData.columnList, this.columnOptions, 'column')
      this.columnData.searchList = this.setListValue(this.columnData.searchList, this.searchOptions, 'search')
      this.columnData.sortList = this.setListValue(this.columnData.sortList, this.sortOptions, 'sort')
    })
  },
  methods: {
    filterPanelShow() {
      this.$refs.conditionpane.show(this.columnData.ruleListApp)
    },
    ruleConfig(data) {
      this.columnData.ruleListApp = data
    },
    setBtnValue(replacedData, data, key) {
      key = key ? key : 'value'
      outer: for (let i = 0; i < replacedData.length; i++) {
        inter: for (let ii = 0; ii < data.length; ii++) {
          if (replacedData[i][key] === data[ii][key]) {
            data[ii] = replacedData[i]
            break inter
          }
        }
      }
    },
    setListValue(replacedData, data, type) {
      const key = 'prop'
      let res = []
      outer: for (let i = 0; i < replacedData.length; i++) {
        inter: for (let ii = 0; ii < data.length; ii++) {
          if (replacedData[i][key] === data[ii][key]) {
            if (type === 'search') {
              data[ii].searchType = replacedData[i].searchType
              data[ii].searchMultiple = replacedData[i].searchMultiple
            }
            if (this.webType == 4) data[ii].label = replacedData[i].label
            res.push(data[ii])
            break inter
          }
        }
      }
      return res
    },
    /**
      * 供父组件使用 获取列表JSON
    */
    getData() {
      this.columnData.defaultColumnList = this.columnOptions.map(o => ({
        ...o,
        checked: this.columnData.columnList.some(i => i.prop === o.prop)
      }))
      return this.columnData
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.columnData.columnList.splice(evt.oldIndex, 1)[0]
          this.columnData.columnList.splice(evt.newIndex, 0, targetRow)
        },
        handle: '.drag-handler',
      })
      const el1 = this.$refs.dragTableSort.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      Sortable.create(el1, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.columnData.sortList.splice(evt.oldIndex, 1)[0]
          this.columnData.sortList.splice(evt.newIndex, 0, targetRow)
        },
        handle: '.drag-handler',
      })
      const el2 = this.$refs.dragTableSearch.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      Sortable.create(el2, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.columnData.searchList.splice(evt.oldIndex, 1)[0]
          this.columnData.searchList.splice(evt.newIndex, 0, targetRow)
        },
        handle: '.drag-handler',
      })
    },
    sortSelectionChange(val) {
      this.$set(this.columnData, 'sortList', val)
    },
    searchSelectionChange(val) {
      this.$set(this.columnData, 'searchList', val)
    },
    columnSelectionChange(val) {
      this.$set(this.columnData, 'columnList', val)
    },
    addCustomBtn() {
      const id = this.jnpf.idGenerator()
      this.columnData.customBtnsList.push({
        value: 'btn_' + id,
        label: '按钮' + id,
        event: {
          func: ''
        }
      })
    },
    editFunc(item) {
      if (!item.event.func) item.event.func = defaultFunc
      this.activeItem = item
      this.customBtnVisible = true
      this.$nextTick(() => {
        this.$refs.customBtn.init('app', item.event, this.webType, this.columnOptions)
      })
    },
    updateScript(func) {
      this.activeItem.func = func
    },
    updateCustomBtn(val) {
      this.columnData.customBtnsList.forEach((ele, index) => {
        if (ele.value == this.activeItem.value) this.$set(this.columnData.customBtnsList[index], 'event', val)
      })
    },
    addFunc(item, type) {
      if (!item.func) item.func = defaultFuncs
      this.activeItem = item
      this.activeItem.type = type
      this.formScriptVisible = true
      this.$nextTick(() => {
        this.$refs.formScript.init()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
