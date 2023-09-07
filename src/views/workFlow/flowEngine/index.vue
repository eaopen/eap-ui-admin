<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <el-row class="JNPF-common-search-box" :gutter="16">
        <el-form @submit.native.prevent>
          <el-col :span="6">
            <el-form-item label="关键词">
              <el-input v-model="keyword" placeholder="请输入关键词查询" clearable
                @keyup.enter.native="search()" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="流程分类">
              <el-select v-model="category" placeholder="请选择流程分类" clearable filterable>
                <el-option v-for="item in categoryList" :key="item.id" :label="item.fullName"
                  :value="item.id">
                </el-option>
              </el-select>
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
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <topOpts @add="dialogVisible=true">
            <upload-btn url="/api/workflow/Engine/flowTemplate/Actions/ImportData" accept=".ffe"
              @on-success="reset()" />
          </topOpts>
          <div class="JNPF-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="list">
          <el-table-column prop="fullName" label="流程名称" min-width="150" />
          <el-table-column prop="enCode" label="流程编码" width="200" />
          <el-table-column prop="category" label="流程分类" width="150" />
          <el-table-column prop="type" label="流程类型" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.type == 0? "发起流程" : "功能流程" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="creatorUser" label="创建人" width="120" />
          <el-table-column prop="creatorTime" label="创建时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="sortCode" label="排序" width="70" align="center" />
          <el-table-column prop="enabledMark" label="状态" width="70" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.enabledMark == 1 ? 'success' : 'danger'" disable-transitions>
                {{scope.row.enabledMark==1?'启用':'禁用'}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="scope">
              <tableOpts @edit="addOrUpdateHandle(scope.row.id,scope.row.type)"
                @del="handleDel(scope.row.id)">
                <el-dropdown>
                  <span class="el-dropdown-link">
                    <el-button type="text" size="mini">{{$t('common.moreBtn')}}
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="scope.row.enabledMark!=1"
                      @click.native="handleUpdate(scope.row)">
                      启用流程</el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.enabledMark==1"
                      @click.native="handleUpdate(scope.row)">
                      禁用流程</el-dropdown-item>
                    <el-dropdown-item @click.native="showManage(scope.row.id,scope.row.fullName)">
                      版本管理</el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.hasAssistBtn==1"
                      @click.native="management(scope.row.id)">
                      协管流程</el-dropdown-item>
                    <el-dropdown-item @click.native="copy(scope.row.id)">
                      复制流程</el-dropdown-item>
                    <el-dropdown-item @click.native="handleExport(scope.row.id)">
                      导出流程</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </tableOpts>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage"
          :limit.sync="listQuery.pageSize" @pagination="initData" />
      </div>
    </div>
    <Form v-if="formVisible" ref="Form" @close="closeForm" />
    <FlowManage v-if="manageVisible" ref="FlowManage" @close="closeManage" />
    <el-dialog title="新建流程" :visible.sync="dialogVisible"
      class="JNPF-dialog JNPF-dialog_center JNPF-dialog-add" :close-on-click-modal="false"
      lock-scroll width="600px">
      <div class="add-main">
        <div class="add-item add-item-left" @click="addFlow(0)">
          <i class="add-icon icon-ym icon-ym-launchFlow"></i>
          <div class="add-txt">
            <p class="add-title">发起流程</p>
            <p class="add-desc">用于协同办公的业务流程</p>
          </div>
        </div>
        <div class="add-item" @click="addFlow(1)">
          <i class="add-icon icon-ym icon-ym-funcFlow"></i>
          <div class="add-txt">
            <p class="add-title">功能流程</p>
            <p class="add-desc">用于业务系统的功能流程</p>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog title='协管流程' :close-on-click-modal="false" :visible.sync="managementVisible"
      class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body width='600px'>
      <el-form ref="dataForm" label-width="100px">
        <el-form-item label="设置协管员">
          <users-select multiple v-model="managementUserId" placeholder="请选择该流程协管人员" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="managementVisible = false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="handleApproval()" :loading="btnLoading">
          {{$t('common.confirmButton')}}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { FlowEngineList, Delete, Release, Stop, Copy, exportData, assist, assistList } from '@/api/workFlow/FlowEngine'
import Form from './Form'
import FlowManage from './FlowManagement'

export default {
  name: 'workFlow-flowEngine',
  components: { Form, FlowManage },
  data() {
    return {
      keyword: '',
      category: '',
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      total: 0,
      list: [],
      btnLoading: false,
      listLoading: true,
      dialogVisible: false,
      formVisible: false,
      manageVisible: false,
      categoryList: [],
      managementVisible: false,
      managementUserId: [],
      templateId: ''
    }
  },
  created() {
    this.getDictionaryData()
    this.initData()
  },
  methods: {
    reset() {
      this.keyword = ''
      this.category = ''
      this.search()
    },
    search() {
      this.listQuery = {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      this.initData()
    },
    initData() {
      this.listLoading = true
      let query = {
        ...this.listQuery,
        keyword: this.keyword,
        category: this.category
      }
      FlowEngineList(query).then((res) => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      })
    },
    getDictionaryData() {
      this.$store.dispatch('base/getDictionaryData', { sort: 'WorkFlowCategory' }).then((res) => {
        this.categoryList = res
      })
    },
    handleDel(id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        Delete(id).then(res => {
          this.initData()
          this.$message({
            type: 'success',
            message: res.msg
          });
        })
      }).catch(() => { });
    },
    addFlow(type) {
      this.dialogVisible = false
      this.addOrUpdateHandle('', type)
    },
    // 新增 / 修改
    addOrUpdateHandle(id, type) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(this.categoryList, id, type)
      })
    },
    copy(id) {
      this.$confirm('您确定要复制该流程, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        Copy(id).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1000,
            onClose: () => {
              this.initData()
            }
          });
        })
      }).catch(() => { });
    },
    handleExport(id) {
      this.$confirm('您确定要导出该流程, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        exportData(id).then(res => {
          this.jnpf.downloadFile(res.data.url)
        })
      }).catch(() => { });
    },
    closeForm(isRefresh) {
      this.formVisible = false
      if (isRefresh) {
        this.initData()
      }
    },
    showManage(id, fullName) {
      this.manageVisible = true
      this.$nextTick(() => {
        this.$refs.FlowManage.init(id, fullName, 1)
      })
    },
    closeManage(isRefresh) {
      this.manageVisible = false
      if (isRefresh) {
        this.initData()
      }
    },
    handleApproval() {
      let query = {
        list: this.managementUserId,
        templateId: this.templateId
      }
      assist(query).then(res => {
        this.$message({
          type: 'success',
          message: res.msg
        });
        this.managementVisible = false
        this.initData()
      })
    },
    management(id) {
      this.managementVisible = true
      this.templateId = id
      assistList(id).then(res => {
        this.managementUserId = res.data.list || []
      })
    },
    handleUpdate(row) {
      if (row.enabledMark) {
        this.$confirm('此操作将禁用该流程，是否继续？', '提示', {
          type: 'warning'
        }).then(() => {
          Stop(row.id).then(res => {
            row.enabledMark = 0
            this.$message({
              type: 'success',
              message: res.msg
            });
          })
        }).catch(() => { });
      } else {
        this.$confirm('此操作将启用该流程，是否继续？', '提示', {
          type: 'warning'
        }).then(() => {
          Release(row.id).then(res => {
            row.enabledMark = 1
            this.$message({
              type: 'success',
              message: res.msg
            });
          })
        }).catch(() => { });
      }
    },

  }
}
</script>