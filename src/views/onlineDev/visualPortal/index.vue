<template>
  <div class="app-container">
    <el-form @submit.native.prevent ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="关键词" prop="keyword">
        <el-input v-model="keyword" placeholder="请输入关键词" clearable style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="category" placeholder="请选择分类" clearable filterable style="width: 120px">
          <el-option v-for="item in getDictDatas(DICT_TYPE.INFRA_FILE_STORAGE)" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="type" placeholder="请选择类型" clearable>
          <el-option label="配置路径" :value="1" />
          <el-option label="门户设计" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="锁定">
        <el-select v-model="enabledLock" placeholder="请选择锁定类型" clearable>
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="addOrUpdateHandle"
          v-hasPermi="['system:dict:create']">新建门户</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" :loading="listLoading"
          v-hasPermi="['system:dict:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="listLoading" :data="list">
      <el-table-column label="名称" prop="fullName" show-overflow-tooltip min-width="200" />
      <el-table-column label="编码" prop="enCode" width="200" />
      <el-table-column label="分类" prop="category" width="150">
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.type == 1 ? '配置路径' : '门户设计' }}
        </template>
      </el-table-column>
      <el-table-column prop="enabledLock" label="锁定" width="70" align="center">
        <template slot-scope="scope">
          {{ scope.row.type == 1 ? '' : scope.row.enabledLock == 1 ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column prop="creatorUser" label="创建人" width="120" />
      <el-table-column prop="creatorTime" label="创建时间" :formatter="obpm.tableDateFormat" width="130" />
      <el-table-column prop="lastModifyTime" label="最后修改时间" :formatter="obpm.tableDateFormat" width="130" />
      <el-table-column prop="sortCode" label="排序" width="70" align="center" />
      <el-table-column prop="enabledMark" label="状态" width="70" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.enabledMark == 1 ? 'success' : 'danger'" disable-transitions>
            {{ scope.row.enabledMark == 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="design(scope.row)"
            v-hasPermi="['system:dict:update']">设计</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="preview(scope.row)"
            v-hasPermi="['system:dict:delete']">预览</el-button>
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-button type="text" size="mini">{{ $t('common.moreBtn') }}<i
                  class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="openReleaseDialog(scope.row)">
                发布
              </el-dropdown-item>
              <el-dropdown-item v-if="scope.row.type == 0" @click.native="design(scope.row)">设计
              </el-dropdown-item>
              <el-dropdown-item @click.native="preview(scope.row.id, 2)">预览</el-dropdown-item>
              <el-dropdown-item @click.native="copy(scope.row.id)">复制</el-dropdown-item>
              <el-dropdown-item @click.native="exportTemplate(scope.row.id)">导出
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize"
      @pagination="initData" />
    <Form v-if="formVisible" ref="form" @close="closeForm" @initPortalDesign="design" />
    <PortalDesign v-if="portalDesignVisible" ref="portalDesign" @close="closeForm1" />
    <Preview :visible.sync="previewVisible" :id="currId" />
    <ReleaseDialog :visible.sync="releaseDialog" ref="release" @release="search()" />
    <previewDialog :visible.sync="previewTypeVisible" :id="currId" :previewType="previewType" type="portal"
      @previewPc='previewPc' />
  </div>
</template>

<script>
import { getPortalList, Delete, Copy, exportTemplate } from '@/api/onlineDev/portal'
import Form from './Form'
import PortalDesign from '@/components/VisualPortal/PortalDesign'
import previewDialog from '@/components/extn/PreviewDialog'
import Preview from './IndexPreview'
import ReleaseDialog from './releaseDialog'
export default {
  name: 'onlineDev-visualPortal',
  components: { Form, PortalDesign, previewDialog, Preview, ReleaseDialog },
  data() {
    return {
      list: [],
      keyword: '',
      category: '',
      type: '',
      enabledLock: '',
      listQuery: {
        currentPage: 1,
        pageSize: 10,
        sort: 'desc',
        sidx: ''
      },
      total: 0,
      currId: '',
      transferId: '',
      dialogVisible: false,
      previewVisible: false,
      previewTypeVisible: false,
      listLoading: false,
      formVisible: false,
      portalDesignVisible: false,
      categoryList: [],
      showSearch: true,
      previewType: '',
      releaseDialog: false
    }
  },
  created() {
    // this.getDictionaryData()
    this.initData()
  },
  methods: {
    reset() {
      this.keyword = ''
      this.category = ''
      this.type = ''
      this.enabledLock = ''
      this.search()
    },
    search() {
      this.listQuery = {
        currentPage: 1,
        pageSize: 10,
        sort: 'desc',
        sidx: ''
      }
      this.initData()
    },
    getDictionaryData() {
      this.$store.dispatch('dict/getDictionaryData').then((res) => {
        this.categoryList = res
      })
    },
    getList() {
      this.initData()
    },
    initData() {
      this.listLoading = true
      let query = {
        ...this.listQuery,
        keyword: this.keyword,
        type: this.type,
        category: this.category,
        enabledLock: this.enabledLock
      }
      getPortalList(query).then(res => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      })
    },
    handleDel(id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        Delete(id).then(res => {
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
      this.$confirm('您确定要复制该门户, 是否继续?', '提示', {
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
    preview(id, type) {
      if (!id) return
      this.currId = id
      this.previewType = type
      this.$nextTick(() => {
        this.previewTypeVisible = true
      })
    },
    openReleaseDialog(row) {
      this.$nextTick(() => {
        this.releaseDialog = true
        this.$refs.release.openRelease(row)
      })
    },
    previewPc() {
      this.previewVisible = true
    },
    exportTemplate(id) {
      this.$confirm('您确定要导出该门户, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        exportTemplate(id).then(res => {
          this.obpm.downloadFile(res.data.url)
        })
      }).catch(() => { });
    },
    design(row) {
      this.dialogVisible = false
      this.portalDesignVisible = true
      this.$nextTick(() => {
        this.$refs.portalDesign.init(row)
      })
    },
    addOrUpdateHandle(id) {
      this.dialogVisible = false
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.form.init(id)
      })
    },
    closeForm(isRefresh) {
      this.formVisible = false
      if (isRefresh) this.initData()
    },
    closeForm1(isRefresh) {
      this.form1Visible = false
      if (isRefresh) this.initData()
    }
  }
}
</script>