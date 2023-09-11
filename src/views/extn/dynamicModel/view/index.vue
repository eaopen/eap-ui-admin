
<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <Search ref="Search" :list="columnData.searchList" @reset="reset" @search="searchData" />
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div v-if="isPreview || !columnData.useBtnPermission">
            <el-button :type="i==0?'primary':'text'" :icon="item.icon"
              @click="headBtnsHandel(item.value)" v-for="(item, i) in columnData.btnsList" :key="i">
              {{item.label}}</el-button>
          </div>
          <div v-else>
            <el-button :type="i==0?'primary':'text'" :icon="item.icon" v-has="'btn_'+item.value"
              @click="headBtnsHandel(item.value)" v-for="(item, i) in columnData.btnsList" :key="i">
              {{item.label}}</el-button>
          </div>
          <div class="JNPF-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="list" row-key="id"
          :default-expand-all="columnData.childTableStyle!==2?expandsTable:false"
          :tree-props="{children: 'children', hasChildren: ''}" :load="treeLoad"
          @sort-change="sortChange" :row-style="rowStyle" :cell-style="cellStyle"
          :has-c="hasBatchBtn" @selection-change="handleSelectionChange" v-if="refreshTable"
          custom-column :span-method="arraySpanMethod" ref="tableRef"
          :hasNO="!(columnData.childTableStyle==2&&childColumnList.length&&columnData.type != 3&&columnData.type != 4)"
          :hasNOFixed="columnList.some(o=>o.fixed == 'left')"
          :show-summary='columnData.showSummary && !(columnData.type==3 ||columnData.type==5)'
          :summary-method="getTableSummaries">
          <template>
            <template v-for="(item, i) in columnList">
              <el-table-column :prop="item.prop" :label="item.label" :align="item.align"
                :fixed="getFixed(item,i)" :width="item.width" :key="i"
                :sortable="item.sortable?'custom':item.sortable" />
            </template>
          </template>
          <el-table-column label="操作"
            :fixed="columnData.childTableStyle==2&&childColumnList.length?false:'right'" :width="80"
            v-if="columnBtnsList.length || customBtnsList.length">
            <template slot-scope="scope" v-if="!scope.row.top">
              <template v-if="customBtnsList.length">
                <el-dropdown hide-on-click>
                  <span class="el-dropdown-link">
                    <el-button type="text" size="mini">
                      {{$t('common.moreBtn')}}<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item, i) in customBtnsList" :key="i"
                      @click.native="customBtnsHandel(item,scope.row,scope.$index)">{{item.label}}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
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
    <ExportBox v-if="exportBoxVisible" ref="ExportBox" @download="download" />
    <CustomBox v-if="customBoxVisible" ref="CustomBox" @close="customBoxVisible= false" />
  </div>
</template>

<script>
import { getModelList, getModelSubList, deleteModel, batchDelete, exportModel, createModel, updateModel, getConfigData } from '@/api/onlineDev/visualDev'
import { Create, Update } from '@/api/workFlow/workFlowForm'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'
import { getColumnsByModuleId } from '@/api/extn/common'
import { Candidates } from '@/api/workFlow/FlowBefore'
import request from '@/utils/request'
import Search from '../list/Search'
import ExportBox from '@/components/extn/ExportBox'
import CustomBox from '@/components/extn/JNPFCustom'

export default {
  name: 'dynamicModel',
  props: ['config', 'modelId', 'isPreview'],
  components: { Search, ExportBox, CustomBox },
  data() {
    return {
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
      exportBoxVisible: false,
      customBoxVisible: false,
    }
  },
  watch: {
    keyword(val) {
      if (this.columnData.treeMethod == 1) this.$refs.treeBox.filter(val)
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.listLoading = true
      this.listQuery.menuId = this.$route.meta.modelId
      this.refreshTable = false
      if (!this.config.columnData) return
      this.columnData = JSON.parse(this.config.columnData)
      if (this.config.webType == 4) {
        for (let i = 0; i < this.columnData.searchList.length; i++) {
          const element = this.columnData.searchList[i];
          element.__config__.jnpfKey = 'comInput'
        }
      }
      if (this.columnData.type === 3) {
        this.columnData.columnList = this.columnData.columnList.filter(o => o.prop != this.columnData.groupField)
      }
      if (this.config.enableFlow == 1) {
        this.flowTemplateJson = this.config.flowTemplateJson ? JSON.parse(this.config.flowTemplateJson) : {}
        this.isCustomCopy = this.flowTemplateJson.properties && this.flowTemplateJson.properties.isCustomCopy
      }
      this.customBtnsList = this.columnData.customBtnsList || []
      this.columnBtnsList = this.columnData.columnBtnsList || []
      this.listLoading = true
      if (this.isPreview) this.listQuery.menuId = "270579315303777093"
      let res = await getColumnsByModuleId(this.listQuery.menuId)
      this.settingsColumnList = res.data || []
      this.rowStyle = this.jnpf.getScriptFunc.call(this, this.columnData.funcs && this.columnData.funcs.rowStyle && this.columnData.funcs.rowStyle.func)
      this.cellStyle = this.jnpf.getScriptFunc.call(this, this.columnData.funcs && this.columnData.funcs.cellStyle && this.columnData.funcs.cellStyle.func)
      this.getColumnList()
      this.$nextTick(() => {
        this.refreshTable = true
      })
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
    initData() {
      if (this.isPreview) return
      this.listLoading = true
      getModelList(this.modelId, this.listQuery).then(res => {
        if (this.columnData.type === 4) {
          this.list = res.data.list.map(o => ({
            ...o,
            ...this.expandObj,
            rowEdit: false
          }))
          this.cacheList = JSON.parse(JSON.stringify(this.list))
        } else {
          this.list = res.data.list.map(o => ({
            ...o,
            ...this.expandObj,
            hasChildren: true
          }))
        }
        if (this.columnData.type !== 3 && this.columnData.hasPage) this.total = res.data.pagination.total
        this.listLoading = false
        this.$nextTick(() => {
          if (this.columnData.funcs && this.columnData.funcs.afterOnload && this.columnData.funcs.afterOnload.func) this.setTableLoadFunc()
        })
      }).catch(() => {
        this.listLoading = false
      })
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
        this.$store.dispatch('generator/getDepTree').then(res => {
          this.treeData = res
          this.initData()
        })
      }
      if (this.columnData.treeDataSource === "department") {
        this.$store.dispatch('generator/getDepTree').then(res => {
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
    /**
    * 对表格进行合计
    */
    getTableSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计';
          return;
        } else if (this.columnData.summaryField.includes(column.property)) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0).toFixed(2);
          } else {
            sums[index] = '';
          }
        }
      })
      return sums;
    },
    getColumnList() {
      if (this.isPreview) {
        const columnList = this.columnData.columnList
        this.columnList = this.transformColumnList(columnList)
        return
      }
      let columnPermissionList = []
      if (!this.columnData.useColumnPermission) {
        columnPermissionList = this.columnData.columnList
      } else {
        const permissionList = this.$store.getters.permissionList
        const modelId = this.$route.meta.modelId
        const list = permissionList.filter(o => o.modelId === modelId)
        const columnList = list[0] && list[0].column ? list[0].column : []
        for (let i = 0; i < this.columnData.columnList.length; i++) {
          inner: for (let j = 0; j < columnList.length; j++) {
            if (this.columnData.columnList[i].prop === columnList[j].enCode) {
              columnPermissionList.push(this.columnData.columnList[i])
              break inner
            }
          }
        }
      }
      this.columnList = this.transformColumnList(columnPermissionList)
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
    handleSelectionChange(val) {
      const res = val.map(item => item.id)
      this.multipleSelection = res
    },
    sortChange({ column, prop, order }) {
      this.listQuery.sort = order == 'ascending' ? 'asc' : 'desc'
      this.listQuery.sidx = !order ? '' : prop
      this.initData()
    },
    reset() {
      this.listQuery.sort = this.defaultListQuery.sort
      this.listQuery.sidx = this.defaultListQuery.sidx
      if (this.columnData.type === 2) {
        let obj = { [this.columnData.treeRelation]: this.treeActiveId }
        let queryJson = this.treeActiveId ? JSON.stringify(obj) : ''
        this.search(queryJson)
      } else {
        this.search('')
      }
    },
    searchData(queryJson) {
      if (this.columnData.type === 2 && this.treeActiveId) {
        queryJson = JSON.parse(queryJson)
        queryJson = { [this.columnData.treeRelation]: this.treeActiveId, ...queryJson }
        queryJson = JSON.stringify(queryJson)
      }
      this.search(queryJson)
    },
    search(queryJson) {
      if (this.isPreview) return
      if (!queryJson) this.$refs.treeBox && this.$refs.treeBox.setCurrentKey(null);
      this.listQuery.queryJson = queryJson
      this.listQuery.currentPage = 1
      this.initData()
    },
    superQuery(queryJson) {
      if (this.isPreview) return
      this.listQuery.superQueryJson = queryJson
      this.listQuery.currentPage = 1
      this.initData()
    },
    customBtnsHandel(item, row, index) {
      if (item.event.btnType == 1) this.handlePopup(item.event, row, index)
      if (item.event.btnType == 2) this.handleScriptFunc(item.event, row, index)
      if (item.event.btnType == 3) this.handleInterface(item.event, row, index)
    },
    handlePopup(item, row, index) {
      this.customBoxVisible = true
      this.$nextTick(() => {
        this.$refs.CustomBox.init(item, this.modelId, '', this.isPreview, row)
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
    },
    headBtnsHandel(key) {
      if (key == 'download') {
        this.exportBoxVisible = true
        this.$nextTick(() => {
          this.$refs.ExportBox.init(this.exportList)
        })
      }
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
    getFixed(item, i) {
      if (i == 0 && this.columnData.groupField && this.columnData.type == 3) {
        if (this.columnList.some(o => o.fixed == 'left')) return 'left'
        return false
      } else if (this.columnData.childTableStyle != 2) {
        return item.fixed == 'none' ? false : item.fixed
      } else {
        return false
      }
    }
  }
}
</script>