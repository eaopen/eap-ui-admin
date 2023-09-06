<template>
  <div class="lock-container">
    <div class=" lock-form" v-show="columnPassUse==1">
      <el-input placeholder="请输入验证码" show-password v-model="password">
        <el-button slot="append" @click="handleLogin" icon="ace-icon el-icon-unlock"
          :loading="passwordLoading">
        </el-button>
      </el-input>
    </div>
    <div class="OBPM-common-layout" v-show="columnPassUse==0">
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
        <div class="OBPM-common-layout-center">
          <Search ref="Search" :list="searchList" @reset="reset" @search="searchData"
            :initDataJson="listQuery.queryJson" />
          <div class="OBPM-common-layout-main JNPF-flex-main">
            <div class="OBPM-common-head">
              <div></div>
              <div class="OBPM-common-head-right">
                <el-tooltip effect="dark" content="刷新" placement="top">
                  <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                    @click="reset()" />
                </el-tooltip>
              </div>
            </div>
            <JNPF-table v-loading="listLoading" :data="list" row-key="id"
              :default-expand-all="columnData.childTableStyle!==2&&columnData.treeLazyType==0?expandsTable:false"
              :lazy="columnData.type==5&&columnData.treeLazyType==1"
              :tree-props="{children: 'children', hasChildren: columnData.treeLazyType==1?'hasChildren':''}"
              :load="treeLoad" @sort-change="sortChange" :row-style="rowStyle"
              :cell-style="cellStyle" :has-c="hasBatchBtn" @selection-change="handleSelectionChange"
              v-if="refreshTable" :span-method="arraySpanMethod" ref="tableRef"
              :hasNO="!(columnData.childTableStyle==2&&childColumnList.length&&columnData.type != 3)&&columnData.type != 4"
              :hasNOFixed="columnList.some(o=>o.fixed == 'left')">
              <template
                v-if="columnData.childTableStyle==2&&childColumnList.length&&columnData.type ==1&&columnData.type == 2">
                <el-table-column width="0" />
                <el-table-column type="expand" width="40">
                  <template slot-scope="scope">
                    <el-tabs>
                      <el-tab-pane :label="child.label" v-for="(child,cIndex) in childColumnList"
                        :key="cIndex">
                        <el-table :data="scope.row[child.prop]" size='mini'>
                          <el-table-column :prop="childTable.vModel" :label="childTable.childLabel"
                            :align="childTable.align" :width="childTable.width"
                            v-for="(childTable,iii) in child.children" :key="iii" />
                        </el-table>
                      </el-tab-pane>
                    </el-tabs>
                  </template>
                </el-table-column>
                <el-table-column type="index" width="50" label="序号" align="center" />
              </template>
              <template v-for="(item, i) in columnList">
                <template v-if="item.jnpfKey==='table'">
                  <el-table-column :prop="item.prop" :label="item.label" :align="item.align"
                    :key="i" v-if="columnData.childTableStyle!=2||columnData.type == 3">
                    <el-table-column :prop="child.prop" :label="child.childLabel"
                      :align="child.align" :width="child.width" :key="ii"
                      :sortable="child.sortable?'custom':child.sortable"
                      v-for="(child, ii) in item.children" class-name="child-table-box">
                      <template slot-scope="scope">
                        <child-table-column :data="scope.row[item.prop]" :head="item.children"
                          @toggleExpand="toggleExpand(scope.row,`${item.prop}Expand`)"
                          :expand="scope.row[`${item.prop}Expand`]" v-if="!ii" />
                      </template>
                    </el-table-column>
                  </el-table-column>
                </template>
                <el-table-column :prop="item.prop" :label="item.label" :align="item.align"
                  :fixed="columnList.some(o=>o.fixed == 'left')&&i==0&&columnData.groupField&&columnData.type==3?'left':item.fixed!='none'&&columnData.childTableStyle!=2?item.fixed:false"
                  :width="item.width" :key="i" :sortable="item.sortable?'custom':item.sortable"
                  v-else />
              </template>
              <el-table-column label="操作"
                :fixed="columnData.childTableStyle==2&&childColumnList.length?false:'right'"
                :width="operationWidth">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" @click="columnBtnHandel(scope.row)">
                    详情</el-button>
                </template>
              </el-table-column>
            </JNPF-table>
            <template
              v-if="columnData.type !== 3 &&columnData.type !== 5&& columnData.hasPage&&refreshTable">
              <pagination :total="total" :page.sync="listQuery.currentPage"
                :limit.sync="listQuery.pageSize" @pagination="initData" />
            </template>
          </div>
        </div>
      </div>
    </div>
    <Detail v-show="detailVisible" ref="Detail" @close="detailVisible = false" />
    <candidate-form :visible.sync="candidateVisible" :candidateList="candidateList"
      :branchList="branchList" taskId="0" :formData="workFlowFormData"
      @submitCandidate="submitCandidate" :isCustomCopy="isCustomCopy" />
  </div>
</template>

<script>
import { getModelSubList, deleteModel, batchDelete, exportModel, createModel, updateModel, getConfigData } from '@/api/onlineDev/visualDev'
import { Create, Update } from '@/api/extn/workFlow'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'
import { getColumnsByModuleId } from '@/api/extn/common'
import { dyOptionsList, systemComponentsList } from '@/components/extnGenerator/generator/comConfig'
import { Candidates } from '@/api/extn/workFlow'
import request from '@/utils/request'
import Form from './Form.vue'
//import FlowBox from '@/views/extn/workFlow/components/FlowBox'
import Detail from './detail/index.vue'
import ExportBox from '@/components/extn/ExportBox'
import Search from './Search.vue'
import ChildTableColumn from './child-table-column.vue'
import SuperQuery from '@/components/extn/SuperQuery'
import CandidateForm from '@/views/extn/workFlow/components/CandidateForm'
import CustomBox from '@/components/extn/JNPFCustom'
import { getModelListLink, getConfig, checkPwd } from '@/api/onlineDev/webDesign'
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
  name: 'dynamicModel',
  components: { Form, ExportBox, Search, Detail, ChildTableColumn, SuperQuery, CandidateForm, CustomBox },
  props: ['config', 'modelId', 'isPreview', 'encryption'],
  data() {
    return {
      systemComponentsList,
      keyword: '',
      treeProps: {
        children: 'children',
        label: 'fullName',
        value: 'id',
        isLeaf: 'isLeaf'
      },
      list: [],
      cacheList: [],
      total: 0,
      listLoading: false,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: '',
        menuId: '',
        queryJson: '',
        superQueryJson: ''
      },
      defaultListQuery: {
        pageSize: 20,
        sort: 'desc',
        sidx: '',
      },
      flowVisible: false,
      formVisible: false,
      detailVisible: false,
      importBoxVisible: false,
      exportBoxVisible: false,
      uploadBoxVisible: false,
      customBoxVisible: false,
      superQueryVisible: false,
      treeData: [],
      expandsTree: true,
      treeActiveId: '',
      columnData: {
        columnBtnsList: []
      },
      formData: {},
      columnList: [],
      childColumnList: [],
      columnOptions: [],
      exportList: [],
      columnBtnsList: [],
      customBtnsList: [],
      hasBatchBtn: false,
      refreshTable: false,
      expandsTable: true,
      multipleSelection: [],
      settingsColumnList: [],
      mergeList: [],
      expandObj: {},
      flowTemplateJson: {},
      isCustomCopy: false,
      candidateVisible: false,
      candidateType: 1,
      branchList: [],
      candidateList: [],
      currRow: {},
      workFlowFormData: {},
      rowStyle: null,
      cellStyle: null,
      refreshTree: true,
      searchList: [],
      dataList: [],
      formLink: '',
      columnPassUse: 1,
      password: '',
      passwordLoading: false,
      id: ''
    }
  },
  computed: {
    operationWidth() {
      const customWidth = this.customBtnsList.length ? 50 : 0
      return this.columnBtnsList.length * 50 + customWidth
    }
  },
  watch: {
    keyword(val) {
      if (this.columnData.treeMethod == 1) this.$refs.treeBox.filter(val)
    }
  },
  created() {
    getConfig(this.modelId, this.encryption).then(res => {
      this.searchList = res.data.columnCondition ? JSON.parse(res.data.columnCondition) : []
      this.dataList = res.data.columnText ? JSON.parse(res.data.columnText) : []
      this.formLink = res.data.formLink || ''
      this.id = res.data.id || 0
      this.columnPassUse = res.data.columnPassUse || 0
      if (this.columnPassUse == 1) return
      this.init()
    })

  },
  methods: {
    async init() {
      this.listLoading = true
      this.listQuery.menuId = this.modelId
      this.refreshTable = false
      if (!this.config.columnData || !this.config.formData) return
      this.columnData = JSON.parse(this.config.columnData)
      this.columnData.type = 1
      this.columnData.searchList = this.searchList
      if (this.columnData.type === 3) {
        this.columnData.columnList = this.columnData.columnList.filter(o => o.prop != this.columnData.groupField)
      }
      if (this.config.enableFlow == 1) {
        this.flowTemplateJson = this.config.flowTemplateJson ? JSON.parse(this.config.flowTemplateJson) : {}
        this.isCustomCopy = this.flowTemplateJson.properties && this.flowTemplateJson.properties.isCustomCopy
      }
      this.hasBatchBtn = this.columnData.btnsList.some(o => o.value == 'batchRemove')
      this.formData = JSON.parse(this.config.formData)
      this.formData.fields = this.recurSiveFilter(this.formData.fields)
      this.listLoading = true
      if (this.isPreview) this.listQuery.menuId = "270579315303777093"
      this.rowStyle = this.jnpf.getScriptFunc.call(this, this.columnData.funcs && this.columnData.funcs.rowStyle && this.columnData.funcs.rowStyle.func)
      this.cellStyle = this.jnpf.getScriptFunc.call(this, this.columnData.funcs && this.columnData.funcs.cellStyle && this.columnData.funcs.cellStyle.func)
      this.getColumnList()
      this.$nextTick(() => {
        this.refreshTable = true
      })
      if (this.columnData.type === 4) this.buildOptions()
      if (this.isPreview) return this.listLoading = false
      this.listQuery.pageSize = this.columnData.pageSize
      this.listQuery.sort = this.columnData.sort
      this.listQuery.sidx = this.columnData.defaultSidx
      this.defaultListQuery.pageSize = this.columnData.pageSize
      this.defaultListQuery.sort = this.columnData.sort
      this.defaultListQuery.sidx = this.columnData.defaultSidx
      if (this.columnData.type === 3 || !this.columnData.hasPage) this.listQuery.pageSize = 10000
      this.initData()
    },
    recurSiveFilter(getDrawingList) {
      let newColumn = getDrawingList.filter(item => getFormDataFields(item))
      newColumn.forEach(x =>
        x.__config__ && x.__config__.children && Array.isArray(x.__config__.children) && (x
          .__config__.children = this.recurSiveFilter(x.__config__.children))
      )
      return newColumn
    },
    initDefaultSearchData() {
      let searchList = this.columnData.searchList
      //处理搜索条件中的默认值
      if (searchList != null && searchList.length > 0) {
        let initQueryJson = {}
        for (let i = 0, len = searchList.length; i < len; i++) {
          if (searchList[i].jnpfKey === 'date' && searchList[i].__config__.defaultCurrent == true) {
            //日期
            let startDateTime = new Date()
            startDateTime.setHours(0, 0, 0, 0)
            let endDateTime = new Date()
            endDateTime.setHours(23, 59, 59, 999)
            initQueryJson[searchList[i].__vModel__] = [startDateTime.getTime(), endDateTime.getTime()]
          } else if (searchList[i].jnpfKey === 'comSelect' && searchList[i].__config__.defaultCurrent == true) {
            //组织机构
            if (this.userInfo.organizeIdList instanceof Array && this.userInfo.organizeIdList.length > 0) {
              initQueryJson[searchList[i].__vModel__] = searchList[i].searchMultiple == true ? [this.userInfo.organizeIdList] : this.userInfo.organizeIdList;
            } else {
              initQueryJson[searchList[i].__vModel__] = []
            }
          } else if (searchList[i].jnpfKey === 'depSelect' && searchList[i].__config__.defaultCurrent == true && this.userInfo.departmentId != null && this.userInfo.departmentId != '') {
            if (searchList[i].__config__.defaultValue != null) {
              initQueryJson[searchList[i].__vModel__] = searchList[i].__config__.defaultValue
            }
          } else if (searchList[i].__config__.jnpfKey === 'userSelect' && searchList[i].__config__.defaultCurrent == true) {
            if (searchList[i].__config__.defaultValue != null) {
              initQueryJson[searchList[i].__vModel__] = searchList[i].__config__.defaultValue
            }
          }
        }
        if (Object.keys(initQueryJson).length > 0) {
          this.listQuery.queryJson = JSON.stringify(initQueryJson)
        }
      }
    },
    initData() {
      if (this.isPreview) return
      this.listLoading = true
      getModelListLink(this.modelId, this.listQuery, this.encryption).then(res => {
        this.list = res.data.list
        if (this.columnData.type !== 3 && this.columnData.hasPage) this.total = res.data.pagination.total
        this.listLoading = false
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
        type: 1,
        encryption: this.encryption,
        password: md5(this.password)
      }
      checkPwd(param).then((res) => {
        this.passwordLoading = false
        if (res.code == 200) {
          this.columnPassUse = 0
          this.init()
        }
      }).catch(() => {
        this.passwordLoading = false
      })
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
    toDetail(item, defaultValue) {
      if (!defaultValue) return
      this.mainLoading = true
      getConfigData(item.modelId).then(res => {
        this.mainLoading = false
        if (!res.data) return
        if (!res.data.formData) return
        let formData = JSON.parse(res.data.formData)
        formData.popupType = this.formData.popupType
        this.detailVisible = true
        this.$nextTick(() => {
          this.$refs.Detail.init(formData, item.modelId, defaultValue)
        })
      }).catch(() => { this.mainLoading = false })
    },
    getTreeView() {
      if (this.columnData.treeDataSource === "dictionary") {
        if (!this.columnData.treeDictionary) return
        getDictionaryDataSelector(this.columnData.treeDictionary).then(res => {
          this.treeData = res.data.list
          this.initData()
        })
      }
      if (this.columnData.treeDataSource === "organize") {
        this.$store.dispatch('extnGenerator/getDepTree').then(res => {
          this.treeData = res
          this.initData()
        })
      }
      if (this.columnData.treeDataSource === "department") {
        this.$store.dispatch('extnGenerator/getDepTree').then(res => {
          this.treeData = res
          this.initData()
        })
      }
      if (this.columnData.treeDataSource === "api") {
        if (!this.columnData.treePropsUrl) return
        getDataInterfaceRes(this.columnData.treePropsUrl).then(res => {
          let data = res.data
          if (Array.isArray(data)) {
            this.treeData = data
          } else {
            this.treeData = []
          }
          this.initData()
        })
      }
    },
    getColumnList() {
      this.columnList = this.transformColumnList(this.dataList)
    },
    transformColumnList(columnList) {
      let list = []
      for (let i = 0; i < columnList.length; i++) {
        const e = columnList[i];
        if (!e.prop.includes('-')) {
          list.push(e)
        } else {
          let prop = e.prop.split('-')[0]
          let vModel = e.prop.split('-')[1]
          let label = e.label.split('-')[0]
          let childLabel = e.label.replace(label + '-', '');
          let newItem = {
            align: "center",
            jnpfKey: "table",
            prop,
            label,
            children: []
          }
          e.vModel = vModel
          e.childLabel = childLabel
          if (!this.expandObj.hasOwnProperty(`${prop}Expand`)) this.$set(this.expandObj, `${prop}Expand`, false)
          if (!list.some(o => o.prop === prop)) list.push(newItem)
          for (let i = 0; i < list.length; i++) {
            if (list[i].prop === prop) {
              list[i].children.push(e)
              break
            }
          }
        }
      }
      this.getMergeList(list)
      this.getExportList(list)
      this.childColumnList = list.filter(o => o.jnpfKey === 'table')
      return list
    },
    getExportList(list) {
      let exportList = []
      for (let i = 0; i < list.length; i++) {
        if (list[i].jnpfKey === 'table') {
          for (let j = 0; j < list[i].children.length; j++) {
            exportList.push(list[i].children[j])
          }
        } else {
          exportList.push(list[i])
        }
      }
      this.exportList = exportList
    },
    getMergeList(list) {
      list.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.children.forEach((child, index) => {
            if (index == 0) {
              this.mergeList.push({
                prop: child.prop,
                rowspan: 1,
                colspan: item.children.length
              })
            } else {
              this.mergeList.push({
                prop: child.prop,
                rowspan: 0,
                colspan: 0
              })
            }
          })
        } else {
          this.mergeList.push({
            prop: item.prop,
            rowspan: 1,
            colspan: 1
          })
        }
      })
    },
    arraySpanMethod({ column }) {
      for (let i = 0; i < this.mergeList.length; i++) {
        if (column.property == this.mergeList[i].prop) {
          return [this.mergeList[i].rowspan, this.mergeList[i].colspan]
        }
      }
    },
    toggleExpand(row, field) {
      row[field] = !row[field]
    },
    getNodePath(node) {
      let fullPath = []
      const loop = (node) => {
        if (node.level) fullPath.unshift(node.data)
        if (node.parent) loop(node.parent)
      }
      loop(node)
      return fullPath
    },
    handleNodeClick(data, node) {
      if (this.treeActiveId == data[this.treeProps.value]) return
      this.treeActiveId = data[this.treeProps.value]
      this.$refs.Search.treeReset()
      let queryJson = {}
      if (this.columnData.treeDataSource === "organize") {
        const nodePath = this.getNodePath(node)
        const currValue = nodePath.map(o => o[this.treeProps.value])
        queryJson = { [this.columnData.treeRelation]: currValue }
        this.treeActiveId = currValue
      } else {
        queryJson = { [this.columnData.treeRelation]: data[this.treeProps.value] }
      }
      this.search(JSON.stringify(queryJson))
    },
    handleDel(id, index) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        if (id) {
          deleteModel(this.modelId, id).then(res => {
            this.$message({
              type: 'success',
              message: res.msg,
              duration: 1000,
              onClose: () => { this.initData() }
            });
          })
        } else {
          this.list.splice(index, 1)
        }
      }).catch(() => { });
    },
    saveForRowEdit(row, status, candidateData) {
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据保存', type: 'warning' })
      if (this.config.enableFlow == 1) {
        let query = {
          id: row.id,
          status: status || "1",
          candidateType: this.candidateType,
          formData: row,
          flowId: this.config.flowId,
          flowUrgent: 1
        }
        if (candidateData) query = { ...query, ...candidateData }
        const formMethod = query.id ? Update : Create
        formMethod(query).then(res => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.candidateVisible = false
              this.initData()
            }
          })
        })
      } else {
        let query = {
          id: row.id,
          data: JSON.stringify(row)
        }
        const formMethod = query.id ? updateModel : createModel
        formMethod(this.modelId, query).then(res => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.candidateVisible = false
              this.initData()
            }
          })
        })
      }
    },
    submitForRowEdit(row) {
      this.currRow = row
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据保存', type: 'warning' })
      this.workFlowFormData = {
        id: row.id,
        formData: row,
        flowId: this.config.flowId
      }
      Candidates(0, this.workFlowFormData).then(res => {
        let data = res.data
        this.candidateType = data.type
        if (data.type == 1) {
          this.branchList = res.data.list.filter(o => o.isBranchFlow)
          this.candidateList = res.data.list.filter(o => !o.isBranchFlow && o.isCandidates)
          this.candidateVisible = true
        } else if (data.type == 2) {
          this.branchList = []
          this.candidateList = res.data.list.filter(o => o.isCandidates)
          this.candidateVisible = true
        } else {
          if (this.isCustomCopy) {
            this.branchList = []
            this.candidateList = []
            this.candidateVisible = true
            return
          }
          this.$confirm('您确定要提交当前流程吗, 是否继续?', '提示', {
            type: 'warning'
          }).then(() => {
            this.saveForRowEdit(row, '0')
          }).catch(() => { })
        }
      }).catch(() => { })
    },
    submitCandidate(data) {
      this.saveForRowEdit(this.currRow, '0', data)
    },
    cancelRowEdit(row, index) {
      if (!row.id) return this.list.splice(index, 1)
      row.rowEdit = false
      let item = JSON.parse(JSON.stringify(this.cacheList[index]))
      this.$set(this.list, index, item)
    },
    addHandleForRowEdit() {
      let item = {
        rowEdit: true
      }
      for (let i = 0; i < this.columnData.columnList.length; i++) {
        let e = this.columnData.columnList[i]
        item[e.__vModel__] = e.__config__.defaultValue
      }
      this.list.unshift(item)
    },
    addOrUpdateHandle(id) {
      if (this.config.enableFlow == 1) {
        let data = {
          id: id || '',
          enCode: this.config.flowEnCode,
          flowId: this.config.flowId,
          formType: 2,
          type: 1,
          opType: '-1',
          modelId: this.modelId,
          isPreview: this.isPreview,
          formConf: JSON.stringify(this.formData)
        }
        this.flowVisible = true
        this.$nextTick(() => {
          //this.$refs.FlowBox.init(data)
        })
      } else {
        this.formVisible = true
        this.$nextTick(() => {
          this.$refs.Form.init(this.formData, this.modelId, id, this.isPreview, this.columnData.useFormPermission)
        })
      }
    },
    headBtnsHandel(key) {
      if (key === 'add') {
        if (this.columnData.type === 4) {
          this.addHandleForRowEdit()
        } else {
          this.addOrUpdateHandle()
        }
      }
      if (key == 'download') {
        this.exportBoxVisible = true
        this.$nextTick(() => {
          this.$refs.ExportBox.init(this.exportList)
        })
      }
      if (key == 'upload') {
        this.uploadBoxVisible = true
        this.$nextTick(() => {
          this.$refs.UploadBox.init(this.modelId)
        })
      }
      if (this.isPreview) return
      if (key === 'batchRemove') {
        this.batchRemove()
      }
    },
    handleSelectionChange(val) {
      const res = val.map(item => item.id)
      this.multipleSelection = res
    },
    batchRemove() {
      if (!this.multipleSelection.length) {
        this.$message({
          type: 'error',
          message: '请选择一条数据',
          duration: 1500,
        })
        return
      }
      this.$confirm('您确定要删除这些数据吗, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        batchDelete(this.modelId, this.multipleSelection).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1500,
            onClose: () => {
              this.initData()
            }
          })
        })
      }).catch(() => { })
    },
    download(data) {
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据导出', type: 'warning' })
      let query = { ...this.listQuery, ...data }
      exportModel(this.modelId, query).then(res => {
        if (!res.data.url) return
        this.jnpf.downloadFile(res.data.url)
        this.$refs.ExportBox.visible = false
        this.exportBoxVisible = false
      })
    },
    columnBtnHandel(row) {
      this.goDetail(row.id, row)
    },
    goDetail(id, row) {
      this.detailVisible = true
      this.$nextTick(() => {
        this.$refs.Detail.init(this.formData, this.modelId, id, this.encryption)
      })
    },
    sortChange({ column, prop, order }) {
      this.listQuery.sort = order == 'ascending' ? 'asc' : 'desc'
      this.listQuery.sidx = !order ? '' : prop
      this.initData()
    },
    refresh(isRefresh) {
      this.formVisible = false
      if (isRefresh) this.initData()
    },
    closeFlow(isRefresh) {
      this.flowVisible = false
      if (isRefresh) this.initData()
    },
    reset() {
      this.listQuery.sort = this.defaultListQuery.sort
      this.listQuery.sidx = this.defaultListQuery.sidx
      this.search('')
    },
    searchData(queryJson) {
      this.search(queryJson)
    },
    search(queryJson) {
      // if (this.isPreview) return
      // if (!queryJson) this.$refs.treeBox && this.$refs.treeBox.setCurrentKey(null);
      this.listQuery.queryJson = queryJson
      this.listQuery.currentPage = 1
      this.initData()
    },
    openSuperQuery() {
      this.superQueryVisible = true
      this.$nextTick(() => {
        this.$refs.SuperQuery.init()
      })
    },
    superQuery(queryJson) {
      if (this.isPreview) return
      this.listQuery.superQueryJson = queryJson
      this.listQuery.currentPage = 1
      this.initData()
    },
    customBtnsHandel(item, row, index) {
      if (item.btnType == 1) this.handlePopup(item, row, index)
      if (item.btnType == 2) this.handleScriptFunc(item, row, index)
      if (item.btnType == 3) this.handleInterface(item, row, index)

    },
    handlePopup(item, row, index) {
      this.customBoxVisible = true
      this.$nextTick(() => {
        this.$refs.CustomBox.init(item, this.modelId, row.id, this.isPreview)
      })
    },
    handleScriptFunc(item, row, index) {
      const parameter = {
        data: row,
        index,
        request: this.request,
        toast: this.$message,
        refresh: this.initData
      }
      const func = this.jnpf.getScriptFunc.call(this, item.func)
      if (!func) return
      func.call(this, parameter)
    },
    handleInterface(item, row, index) {
      const handlerInterface = () => {
        if (item.templateJson && item.templateJson.length) {
          item.templateJson.forEach((ele) => {
            ele.defaultValue = row[ele.relationField] || ""
          })
        }
        let query = {
          paramList: item.templateJson || [],
        }
        getDataInterfaceRes(item.interfaceId, query).then(res => {
          this.$message({ message: res.msg, type: 'success' });
        })
      }
      if (!item.useConfirm) return handlerInterface()
      this.$confirm(item.confirmTitle || '确认执行此操作', '提示', { type: 'warning' }).then(() => {
        handlerInterface()
      }).catch(() => { })
    },
    request(url, method, data) {
      if (!url) return
      return request({
        url: url,
        method: method || 'GET',
        data: data || {}
      })
    },
    setTableLoadFunc() {
      const JNPFTable = this.$refs.tableRef.$refs.JNPFTable
      const parameter = {
        data: this.list,
        attributes: JNPFTable._props,
        events: JNPFTable._events,
        methods: JNPFTable,
        tableRef: JNPFTable,
        request: this.request,
      }
      const func = this.jnpf.getScriptFunc.call(this, this.columnData.funcs.afterOnload.func)
      if (!func) return
      func.call(this, parameter)
    },
    buildOptions() {
      this.columnData.columnList.forEach(cur => {
        const config = cur.__config__
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          let isTreeSelect = config.jnpfKey === 'treeSelect' || config.jnpfKey === 'cascader'
          if (config.dataType === 'dictionary') {
            if (!config.dictionaryType) return
            getDictionaryDataSelector(config.dictionaryType).then(res => {
              isTreeSelect ? cur.options = res.data.list : cur.__slot__.options = res.data.list
            })
          }
          if (config.dataType === 'dynamic') {
            if (!config.propsUrl) return
            let query = {
              paramList: config.templateJson || [],
            }
            getDataInterfaceRes(config.propsUrl, query).then(res => {
              let data = res.data
              if (Array.isArray(data)) {
                isTreeSelect ? cur.options = data : cur.__slot__.options = data
              } else {
                isTreeSelect ? cur.options = [] : cur.__slot__.options = []
              }
            })
          }
        }
      })
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.treeProps.label].indexOf(value) !== -1;
    },
    toggleTreeExpand(expands) {
      this.refreshTree = false
      this.expandsTree = expands
      this.$nextTick(() => {
        this.refreshTree = true
        this.$nextTick(() => {
          this.$refs.treeBox.setCurrentKey(null)
        })
      })
    },
    toggleExpandList() {
      this.refreshTable = false;
      this.expandsTable = !this.expandsTable;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    loadNode(node, resolve) {
      const nodeData = node.data
      const config = this.columnData
      if (config.treeInterfaceId) {
        if (config.treeTemplateJson && config.treeTemplateJson.length) {
          for (let i = 0; i < config.treeTemplateJson.length; i++) {
            const element = config.treeTemplateJson[i];
            element.defaultValue = nodeData[element.relationField] || ''
          }
        }
        let query = {
          paramList: config.treeTemplateJson || [],
        }
        getDataInterfaceRes(config.treeInterfaceId, query).then(res => {
          let data = res.data
          if (Array.isArray(data)) {
            resolve(data);
          } else {
            resolve([]);
          }
        })
      }
    },
    treeLoad(tree, treeNode, resolve) {
      getModelSubList(this.modelId, tree.id, this.listQuery).then(res => {
        if (res.data.list && Array.isArray(res.data.list)) {
          const list = res.data.list.map(o => ({
            ...o,
            ...this.expandObj,
            hasChildren: true
          }))
          resolve(list);
        } else {
          resolve([]);
        }
      })
    }
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
  right: 200px;
  bottom: 50px;
}
.form-use-icon {
  font-size: 40px;
  position: absolute;
  right: -40px;
  top: 0px;
}
.lock-container {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  background: #e6e9f0;
  .lock-form {
    width: 250px;
    text-align: center;
    margin-top: -16%;
  }
}
</style>
