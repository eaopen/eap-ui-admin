<template>
  <div class="OBPM-common-layout">
    <div class="OBPM-common-layout-center">
      <el-row class="OBPM-common-search-box" :gutter="16">
        <el-form @submit.native.prevent>
          <el-col :span="6">
            <el-form-item label="关键词">
              <el-input v-model="keyword" placeholder="请输入关键词查询" clearable
                @keyup.enter.native="search()" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="分类">
              <el-select v-model="category" placeholder="请选择分类" clearable filterable>
                <el-option v-for="item in categoryList" :key="item.id" :label="item.fullName"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="类型">
              <el-select v-model="type" placeholder="请选择类型" clearable>
                <el-option label="配置路径" :value="1" />
                <el-option label="门户设计" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <template v-if="showAll">
            <el-col :span="6">
              <el-form-item label="锁定">
                <el-select v-model="enabledLock" placeholder="请选择锁定类型" clearable>
                  <el-option label="是" :value="1" />
                  <el-option label="否" :value="0" />
                </el-select>
              </el-form-item>
            </el-col>
          </template>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="search()">
                {{$t('common.search')}}</el-button>
              <el-button icon="el-icon-refresh-right" @click="reset()">{{$t('common.reset')}}
              </el-button>
              <el-button type="text" icon="el-icon-arrow-down" @click="showAll=true"
                v-if="!showAll">展开</el-button>
              <el-button type="text" icon="el-icon-arrow-up" @click="showAll=false" v-else>
                收起</el-button>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div class="OBPM-common-layout-main JNPF-flex-main">
        <div class="OBPM-common-head">
          <topOpts @add="addOrUpdateHandle" addText="新建门户">
            <upload-btn url="/api/visualdev/Portal/Model/Actions/ImportData" accept=".vp"
              @on-success="initData" />
          </topOpts>
          <div class="OBPM-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="list">
          <el-table-column prop="fullName" label="名称" show-overflow-tooltip min-width="200" />
          <el-table-column prop="enCode" label="编码" width="200" />
          <el-table-column prop="category" label="分类" width="150" />
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template slot-scope="scope">
              <p>{{scope.row.type==1?'配置路径':'门户设计'}}</p>
            </template>
          </el-table-column>
          <el-table-column prop="enabledLock" label="锁定" width="70" align="center">
            <template slot-scope="scope">
              <p>{{scope.row.type==1?'':scope.row.enabledLock==1?'是':'否'}}</p>
            </template>
          </el-table-column>
          <el-table-column prop="creatorUser" label="创建人" width="120" />
          <el-table-column prop="creatorTime" label="创建时间" :formatter="obpm.tableDateFormat"
            width="120" />
          <el-table-column prop="lastModifyTime" label="最后修改时间" :formatter="obpm.tableDateFormat"
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
              <tableOpts @edit="addOrUpdateHandle(scope.row.id)" @del="handleDel(scope.row.id)">
                <el-dropdown>
                  <span class="el-dropdown-link">
                    <el-button type="text" size="mini">{{$t('common.moreBtn')}}<i
                        class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="openReleaseDialog(scope.row)">
                      发布
                    </el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.type==0" @click.native="design(scope.row)">设计
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="preview(scope.row.id,2)">预览</el-dropdown-item>
                    <el-dropdown-item @click.native="copy(scope.row.id)">复制</el-dropdown-item>
                    <el-dropdown-item @click.native="exportTemplate(scope.row.id)">导出
                    </el-dropdown-item>
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
    <Form v-if="formVisible" ref="form" @close="closeForm" @initPortalDesign="design" />
    <PortalDesign v-if="portalDesignVisible" ref="portalDesign" @close="closeForm1" />
    <Preview :visible.sync="previewVisible" :id="currId" />
    <ReleaseDialog :visible.sync="releaseDialog" ref="release" @release="search()" />
    <previewDialog :visible.sync="previewTypeVisible" :id="currId" :previewType="previewType"
      type="portal" @previewPc='previewPc' />
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
        pageSize: 20,
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
      showAll: false,
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
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      this.initData()
    },
    getDictionaryData() {
      this.$store.dispatch('base/getDictionaryData', { sort: 'portalDesigner' }).then((res) => {
        this.categoryList = res
      })
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
        this.$refs.form.init(this.categoryList, id)
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