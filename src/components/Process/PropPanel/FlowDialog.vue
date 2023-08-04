<template>
  <div class="popupSelect-container">
    <div class="el-select" @click="openDialog">
      <el-input placeholder="请选择子流程" readonly :validate-event="false" v-model="title"
        @mouseenter.native="inputHovering = true" @mouseleave.native="inputHovering = false">
        <template slot="suffix">
          <i v-show="!showClose"
            :class="['el-select__caret', 'el-input__icon', 'el-icon-arrow-up']"></i>
          <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close"
            @click.stop="clear"></i>
        </template>
      </el-input>
    </div>
    <el-dialog title="选择子流程" :close-on-click-modal="false" :visible.sync="visible"
      class="JNPF-dialog JNPF-dialog_center JNPF-dialog-tree-select" lock-scroll append-to-body
      width="800px">
      <div class="JNPF-common-layout">
        <!-- <div class="JNPF-common-layout-left">
          <el-scrollbar class="JNPF-common-el-tree-scrollbar" v-loading="treeLoading">
            <el-tree ref="treeBox" :data="treeData" :props="defaultProps" default-expand-all
              highlight-current :expand-on-click-node="false" node-key="id"
              @node-click="handleNodeClick" class="JNPF-common-el-tree" />
          </el-scrollbar>
        </div> -->
        <div class="JNPF-common-layout-center">
          <el-row class="JNPF-common-search-box" :gutter="16">
            <el-form @submit.native.prevent>
              <el-col :span="8">
                <el-form-item label="关键词">
                  <el-input v-model="keyword" placeholder="请输入关键词查询" clearable
                    @keyup.enter.native="search()" class="search-input" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" @click="search()">查询</el-button>
                  <el-button icon="el-icon-refresh-right" @click="reset()">重置</el-button>
                </el-form-item>
              </el-col>
            </el-form>
            <div class="JNPF-common-search-box-right">
              <el-tooltip effect="dark" content="刷新" placement="top">
                <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                  @click="initData()" />
              </el-tooltip>
            </div>
          </el-row>
          <div class="JNPF-common-layout-main JNPF-flex-main">
            <JNPF-table v-loading="listLoading" :data="list" :border="false" highlight-current-row
              @row-click="rowClick" :hasNO="false">
              <el-table-column width="35">
                <template slot-scope="scope">
                  <el-radio :label="scope.row.id" v-model="checked">&nbsp;</el-radio>
                </template>
              </el-table-column>
              <el-table-column type="index" width="50" label="序号" align="center" />
              <el-table-column prop="fullName" label="流程名称" />
              <!-- <el-table-column prop="enCode" label="流程编码" /> -->
            </JNPF-table>
            <pagination :total="total" :page.sync="listQuery.currentPage"
              :limit.sync="listQuery.pageSize" @pagination="initData" />
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="select()">{{$t('common.confirmButton')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { FlowEnginePageChildList } from '@/api/workFlow/FlowEngine'
export default {
  props: {
    value: {
      default: ''
    },
    title: {
      default: ''
    },
    clearable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    flowType: {
      default: ""
    }
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  data() {
    return {
      list: [],
      innerValue: '',
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      keyword: '',
      total: 0,
      checked: '',
      checkedRow: {},
      listLoading: false,
      defaultProps: {
        id: 'id',
        label: 'fullName',
        enCode: 'enCode'
      },
      query: {
        categoryId: '',
        keyword: '',
        dataType: null,
      },
      treeLoading: false,
      treeData: [],
      inputHovering: false,
      visible: false,
      tableName: '',
      category: ''
    }
  },
  computed: {
    showClose() {
      let hasValue = this.value !== undefined && this.value !== null && this.value !== '';
      let criteria = this.clearable &&
        !this.disabled &&
        this.inputHovering &&
        hasValue;
      return criteria;
    }
  },
  created() {
    // this.$store.dispatch('base/getDictionaryData', { sort: 'WorkFlowCategory' }).then((res) => {
    //   this.treeData = [{ fullName: '全部流程', id: '', enCode: '' }, ...res]
    // })
    this.reset()
  },
  methods: {
    initData() {
      this.listLoading = true
      let query = {
        keyword: this.keyword,
        ...this.listQuery,
        // category: this.category == '' ? '' : this.category,
        flowType: this.flowType
      }
      FlowEnginePageChildList(query).then((res) => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    handleNodeClick(data) {
      if (data.id == this.category) return
      this.category = data.id || ''
      this.reset()
    },
    reset() {
      this.keyword = ''
      this.search()
    },
    search() {
      this.listQuery.currentPage = 1
      this.listQuery.pageSize = 20
      this.listQuery.sort = 'desc'
      this.initData()
    },
    openDialog() {
      if (this.disabled) return
      this.checked = this.value
      this.visible = true
      this.reset()
    },
    clear() {
      this.checked = ''
      this.checkedRow = {}
      this.$emit('input', this.checked)
      this.$emit('change', this.checked, this.checkedRow)
    },
    select() {
      if (!this.checked) return
      this.$emit('input', this.checked)
      this.$emit('change', this.checked, this.checkedRow)
      this.visible = false
    },
    rowClick(row) {
      this.checked = row.id
      this.checkedRow = row
    }
  }
}
</script>