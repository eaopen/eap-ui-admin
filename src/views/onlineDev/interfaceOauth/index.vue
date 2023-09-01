<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <el-row class="JNPF-common-search-box" :gutter="16">
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
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <topOpts @add="addOrUpdateHandle()" addText="新建"></topOpts>
          <div class="JNPF-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="reset()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="tableList">
          <el-table-column prop="appId" label="appId" width="250" />
          <el-table-column prop="appName" label="应用名称" min-width="200" />
          <el-table-column prop="usefulLife" label="使用期限" width="120"
            :formatter="jnpf.tableDateFormat">
            <template slot-scope="scope">
              <span type="danger"
                v-if="scope.row.usefulLife">{{scope.row.usefulLife | toDate('yyyy-MM-dd')}}</span>
              <span type="success" v-else>永久</span>
            </template>
          </el-table-column>
          <el-table-column prop="creatorUser" label="创建人" width="120" />
          <el-table-column prop="creatorTime" label="创建时间" width="120"
            :formatter="jnpf.tableDateFormat" />
          <el-table-column prop="lastModifyTime" label="最后修改时间" width="120"
            :formatter="jnpf.tableDateFormat" />
          <el-table-column prop="sortCode" label="排序" width="70" align="center" />
          <el-table-column prop="enabledMark" label="状态" width="70" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.enabledMark == 1 ? 'success' : 'danger'" disable-transitions>
                {{scope.row.enabledMark==1?'启用':'禁用'}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <tableOpts @edit="addOrUpdateHandle(scope.row.id)" @del="handleDel(scope.row.id)">
                <el-dropdown hide-on-click>
                  <span class="el-dropdown-link">
                    <el-button type="text" size="mini">{{$t('common.moreBtn')}}<i
                        class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="toDetail(scope.row.id)">
                      详情
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="viewLog(scope.row)">
                      日志
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="viewEmpower(scope.row)">
                      授权
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
    <Form v-if="formVisible" ref="Form" @close="closeForm" />
    <Preview v-if="previewVisible" ref="Preview" @close="closeOtherWind" />
    <Log v-if="logVisible" ref="Log" @close="closeOtherWind" />
    <Empower v-if="empowerVisible" ref="Empower" @close="closeOtherWind" multiple />
  </div>
</template>

<script>
import Form from './Form'
import Preview from './Preview'
import Log from './Log'
import Empower from './Empower'
import { getInterfaceOauthList, deleteInterfaceIdent } from '@/api/extn/interfaceOauth.js'

export default {
  name: 'systemData-interfaceOauth',
  components: { Form, Preview, Log, Empower },
  data() {
    return {
      tableList: [],
      listQuery: {
        keyword: '',
        currentPage: 1,
        pageSize: 20,
        categoryId: '',
        sort: 'desc'
      },
      total: 0,
      listLoading: false,
      formVisible: false,
      previewVisible: false,
      logVisible: false,
      empowerVisible: false
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.listLoading = true
      getInterfaceOauthList(this.listQuery).then(res => {
        this.tableList = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    addOrUpdateHandle(data) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(data)
      })
    },
    toDetail(data) {
      this.previewVisible = true
      this.$nextTick(() => {
        this.$refs.Preview.init(data)
      })
    },
    viewLog(data) {
      this.logVisible = true
      this.$nextTick(() => {
        this.$refs.Log.init(data)
      })
    },
    handleDel(id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        deleteInterfaceIdent(id).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1000,
            onClose: () => {
              this.initData()
            }
          })
        })
      }).catch(() => { })
    },
    search() {
      this.listQuery.currentPage = 1
      this.listQuery.pageSize = 20
      this.listQuery.sort = 'desc'
      this.initData()
    },
    reset() {
      this.listQuery.keyword = ''
      this.search()
    },
    closeForm(isRefresh) {
      this.formVisible = false
      if (isRefresh) {
        this.listQuery = {
          keyword: '',
          currentPage: 1,
          pageSize: 20,
          sort: 'desc'
        }
        this.initData()
      }
    },
    closeOtherWind() {
      this.formVisible = false
      this.previewVisible = false
      this.logVisible = false
      this.empowerVisible = false
    },
    viewEmpower(data) {
      this.empowerVisible = true
      this.$nextTick(() => {
        this.$refs.Empower.init(data)
      })
    },
  }
}
</script>