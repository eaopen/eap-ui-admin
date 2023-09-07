<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <el-row class="JNPF-common-search-box" :gutter="16">
        <el-form @submit.native.prevent>
          <el-col :span="6">
            <el-form-item label="关键词">
              <el-input v-model="query.keyword" placeholder="请输入关键词查询" clearable
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
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <topOpts @add="dialogVisible=true">
            <upload-btn url="/api/flowForm/Form/Actions/ImportData" accept=".fff"
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
          <el-table-column prop="fullName" label="表单名称" min-width="150" />
          <el-table-column prop="enCode" label="表单编码" width="200" />
          <el-table-column prop="formType" label="表单类型" width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.formType == 2 ? "自定义表单" : "系统表单"}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="creatorUser" label="创建人" width="120" />
          <el-table-column prop="creatorTime" label="创建时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="lastModifyTime" label="最后修改时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="sortCode" label="排序" width="70" align="center" />
          <el-table-column label="状态" width="80" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.enabledMark == 1 ? 'success' : 'info'" disable-transitions>
                {{scope.row.enabledMark==1?'已发布':'未发布'}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="scope">
              <tableOpts @edit="addOrUpdateHandle(scope.row.id,scope.row.formType,0)"
                @del="handleDel(scope.row.id)">
                <el-dropdown>
                  <span class="el-dropdown-link">
                    <el-button type="text" size="mini">{{$t('common.moreBtn')}}<i
                        class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="releaseForm(scope.row.id)">
                      发布表单</el-dropdown-item>
                    <!-- <el-dropdown-item @click.native="rollBackForm(scope.row.id)"
                      v-if="scope.row.enabledMark">
                      回滚表单</el-dropdown-item> -->
                    <el-dropdown-item @click.native="preview(scope.row,'draftJson',0)">
                      设计预览</el-dropdown-item>
                    <el-dropdown-item @click.native="preview(scope.row,'propertyJson',1)"
                      v-if="scope.row.enabledMark == 1">
                      发布预览</el-dropdown-item>
                    <el-dropdown-item @click.native="copy(scope.row.id)">
                      复制表单</el-dropdown-item>
                    <el-dropdown-item @click.native="exportModel(scope.row.id)">
                      导出表单</el-dropdown-item>
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
    <preview v-if="previewVisible" ref="preview" @close="previewVisible=false" />
    <previewDialog :visible.sync="previewDialogVisible" :id="currRow.id" type="flow"
      @previewPc="previewPc" :dataSource="currRow.dataSource" :previewType="previewType" />
    <el-dialog title="新建流程表单" :visible.sync="dialogVisible"
      class="JNPF-dialog JNPF-dialog_center JNPF-dialog-add" lock-scroll width="600px"
      :show-close="false">
      <div class="add-main">
        <div class="add-item add-item-left" @click="addForm(0,2)">
          <i class="add-icon icon-ym icon-ym-launchFlow"></i>
          <div class="add-txt">
            <p class="add-title">自定义表单</p>
            <p class="add-desc">在线可视化流程表单</p>
          </div>
        </div>
        <div class="add-item" @click="addForm(0,1)">
          <i class="add-icon icon-ym icon-ym-funcFlow"></i>
          <div class="add-txt">
            <p class="add-title">系统表单</p>
            <p class="add-desc">代码生成的流程表单</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Form from './Form'
import preview from './Preview'
import previewDialog from '@/components/PreviewDialog'
import { getFormList, release, del, copyForm, exportData } from '@/api/workFlow/FormDesign'
export default {
  name: 'workFlow-flowEngine',
  components: { Form, preview, previewDialog },
  data() {
    return {
      query: { keyword: '' },
      downloadFormVisible: false,
      sort: 'flowForm',
      dialogVisible: false,
      previewVisible: false,
      previewDialogVisible: false,
      list: [],
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      previewType: 0,
      total: 0,
      listLoading: false,
      formVisible: false,
      addVisible: false,
      currRow: {},
      categoryList: []
    }
  },
  created() {
    this.initData()
  },
  methods: {
    search() {
      this.listQuery = {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      this.initData()
    },
    reset() {
      this.query.keyword = ''
      this.search()
    },
    initData() {
      this.listLoading = true
      let query = {
        ...this.listQuery,
        ...this.query
      }
      getFormList(query).then(res => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      })
    },
    handleDel(id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        del(id).then(res => {
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
    copy(id) {
      this.$confirm('您确定要复制该功能表单, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        copyForm(id).then(res => {
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
    exportModel(id) {
      this.$confirm('您确定要导出该功能表单, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        exportData(id).then(res => {
          this.jnpf.downloadFile(res.data.url)
        })
      }).catch(() => { });
    },
    handleAdd(webType) {
      this.addOrUpdateHandle('', webType)
    },
    closeForm(isRefresh) {
      this.formVisible = false
      if (isRefresh) {
        this.initData()
      }
    },
    addForm(flowType, formType) {
      this.dialogVisible = false
      this.addOrUpdateHandle('', flowType, formType)
    },
    // 新增 / 修改
    addOrUpdateHandle(id, flowType, formType) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(id, flowType, formType)
      })
    },
    preview(row, dataSource, type) {
      this.previewType = type
      this.currRow = row
      this.currRow.dataSource = dataSource
      this.$nextTick(() => {
        this.previewDialogVisible = true
      })
    },
    previewPc() {
      let data = {
        enCode: this.currRow.enCode,
        fullName: this.currRow.fullName,
        formType: this.currRow.formType,
        formId: this.currRow.id,
        dataSource: this.currRow.dataSource,
      }
      this.previewVisible = true
      this.$nextTick(() => {
        this.$refs.preview.init(data)
      })
    },
    enabledMark(id, enabledMark) {
      let str = enabledMark === 1 ? "表单停用" : "表单启用"
      this.$confirm(str + '?', '提示', {
        type: 'warning'
      }).then(() => {
        EnabledMark(id).then(res => {
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
    releaseForm(id) {
      this.$confirm('发布表单会覆盖当前线上版本，是否继续？', '发布确认', {
        type: 'warning'
      }).then(() => {
        release(id, 1).then(res => {
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
    rollBackForm(id) {
      this.$confirm('此操作将当前编辑的表单内容回滚为已经发布的表单内容，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        release(id, 0).then(res => {
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
    }
  }
}
</script>