<template>
  <div class="OBPM-common-layout">
    <div class="OBPM-common-layout-left">
      <div class="OBPM-common-title">
        <h2>字典分类</h2>
        <el-dropdown>
          <el-link icon="icon-ym icon-ym-mpMenu" :underline="false" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="initData()">刷新数据</el-dropdown-item>
            <el-dropdown-item @click.native="toggleTreeExpand(true)">展开全部</el-dropdown-item>
            <el-dropdown-item @click.native="toggleTreeExpand(false)">折叠全部</el-dropdown-item>
            <el-dropdown-item @click.native="handleTypeManage">分类管理</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="OBPM-common-tree-search-box">
        <el-input placeholder="输入关键字" v-model="filterText" suffix-icon="el-icon-search" clearable />
      </div>
      <el-scrollbar class="OBPM-common-el-tree-scrollbar" v-loading="treeLoading">
        <el-tree ref="treeBox" :data="treeData" :props="defaultProps"
          :default-expand-all="expandsTree" highlight-current :expand-on-click-node="false"
          node-key="id" @node-click="handleNodeClick" class="OBPM-common-el-tree"
          :filter-node-method="filterNode" v-if="refreshTree">
          <span class="custom-tree-node" slot-scope="{ node }">
            <i class="el-icon-notebook-2" />
            <span class="text">{{node.label}}</span>
          </span>
        </el-tree>
      </el-scrollbar>
    </div>
    <div class="OBPM-common-layout-center">
      <el-row class="OBPM-common-search-box" :gutter="16">
        <el-form @submit.native.prevent>
          <el-col :span="6">
            <el-form-item label="关键词">
              <el-input v-model="listQuery.keyword" placeholder="请输入关键词查询" clearable
                @keyup.enter.native="search()" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="search()">
                {{$t('common.search')}}</el-button>
              <el-button icon="el-icon-refresh-right" @click="reset()">{{$t('common.reset')}}
              </el-button>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div class="OBPM-common-layout-main JNPF-flex-main">
        <div class="OBPM-common-head">
          <topOpts @add="addOrUpdateHandle()" />
          <div class="OBPM-common-head-right">
            <el-tooltip effect="dark" content="展开" placement="top"
              v-if="tableData.length&&tableData.every((item)=>{return item.hasChildren})">
              <el-link v-show="!expands" type="text"
                icon="icon-ym icon-ym-btn-expand JNPF-common-head-icon" :underline="false"
                @click="toggleExpand()" />
            </el-tooltip>
            <el-tooltip effect="dark" content="折叠" placement="top"
              v-if="tableData.length&&tableData.every((item)=>{return item.hasChildren})">
              <el-link v-show="expands" type="text"
                icon="icon-ym icon-ym-btn-collapse JNPF-common-head-icon" :underline="false"
                @click="toggleExpand()" />
            </el-tooltip>
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="getDictionaryList()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="tableData" row-key="id"
          :default-expand-all="expands" v-if="refreshTable"
          :tree-props="{children: 'children', hasChildren: ''}">
          <el-table-column prop="fullName" label="名称" />
          <el-table-column prop="enCode" label="编码" />
          <el-table-column prop="sortCode" label="排序" width="70" align="center" />
          <el-table-column prop="enabledMark" label="状态" width="70" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.enabledMark == 1 ? 'success' : 'danger'" disable-transitions>
                {{scope.row.enabledMark==1?'启用':'禁用'}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <tableOpts @edit="addOrUpdateHandle(scope.row.id)" @del="handleDel(scope.row.id)" />
            </template>
          </el-table-column>
        </JNPF-table>
      </div>
    </div>
    <Form v-if="formVisible" ref="Form" @refreshDataList="getDictionaryList" />
    <TypeList v-if="drawer" ref="TypeList" @refreshDataList="initData" />
  </div>
</template>

<script>
import {
  getDictionaryType,
  getDictionaryDataList,
  delDictionaryData,
  updateDictionaryState
} from '@/api/extn/dictionary'
import Form from './Form'
import TypeList from './components/index'

export default {
  name: 'systemData-dictionary',
  components: {
    Form,
    TypeList
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'fullName'
      },
      listQuery: {
        keyword: '',
        isTree: 0
      },
      typeId: '',
      drawer: false,
      formVisible: false,
      treeLoading: false,
      listLoading: false,
      treeData: [],
      tableData: [],
      expands: true,
      expandsTree: true,
      refreshTable: true,
      refreshTree: true,
      filterText: '',
    }
  },
  watch: {
    filterText(val) {
      this.$refs.treeBox.filter(val)
    }
  },
  created() {
    this.initData(true)
  },
  methods: {
    search() {
      this.getDictionaryList()
    },
    reset() {
      this.listQuery.keyword = ''
      this.getDictionaryList()
    },
    initData(isInit) {
      this.filterText = ''
      this.treeLoading = true
      getDictionaryType().then(res => {
        this.treeData = res.data.list
        this.$nextTick(() => {
          if (isInit) this.typeId = this.treeData[0].id
          this.listQuery.isTree = this.treeData[0].isTree
          this.$refs.treeBox.setCurrentKey(this.typeId)
          this.treeLoading = false
          if (isInit) this.typeId && this.getDictionaryList()
        })
      }).catch(() => {
        this.treeLoading = false
      })
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.fullName.indexOf(value) !== -1;
    },
    toggleExpand() {
      this.refreshTable = false;
      this.expands = !this.expands;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    toggleTreeExpand(expands) {
      this.filterText = ''
      this.refreshTree = false
      this.expandsTree = expands
      this.$nextTick(() => {
        this.refreshTree = true
        this.$nextTick(() => {
          this.$refs.treeBox.setCurrentKey(this.typeId)
        })
      })
    },
    getDictionaryList() {
      this.listLoading = true
      getDictionaryDataList(this.typeId, this.listQuery).then(res => {
        this.tableData = res.data.list
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 分类管理
    handleTypeManage() {
      this.drawer = true
      this.$nextTick(() => {
        this.$refs.TypeList.init()
      })
    },
    handleNodeClick(data) {
      if (this.typeId === data.id) return
      this.typeId = data.id
      this.listQuery.isTree = data.isTree
      this.reset()
    },
    handleUpdateState(row) {
      const txt = row.enabledMark ? '禁用' : '开启'
      this.$confirm(`您确定要${txt}当前数据吗, 是否继续?`, '提示', {
        type: 'warning'
      }).then(() => {
        updateDictionaryState(row.id).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1000,
            onClose: () => {
              this.$store.commit('base/SET_DICTIONARY_LIST', [])
              row.enabledMark = row.enabledMark ? 0 : 1
            }
          })
        })
      }).catch(() => { })
    },
    addOrUpdateHandle(id) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(id, this.typeId, this.listQuery.isTree)
      })
    },
    handleDel(id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        delDictionaryData(id).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1500,
            onClose: () => {
              this.$store.commit('base/SET_DICTIONARY_LIST', [])
              this.getDictionaryList()
            }
          })
        })
      }).catch(() => { })
    }
  }
}
</script>