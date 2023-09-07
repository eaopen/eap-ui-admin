<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center  JNPF-flex-main">
      <el-row class="JNPF-common-search-box" :gutter="16">
        <el-form @submit.native.prevent>
          <el-col :span="6">
            <el-form-item :label="$t('common.keyword')">
              <el-input v-model="listQuery.keyword" :placeholder="$t('common.enterKeyword')"
                clearable @keyup.enter.native="search()" />
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
          <el-dropdown>
            <el-button type="primary" icon="el-icon-plus">
              新建<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="addOrUpdateHandle('','company')">新建公司
              </el-dropdown-item>
              <el-dropdown-item @click.native="addOrUpdateHandle()">新建部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <div class="JNPF-common-head-right">
            <el-tooltip effect="dark" content="展开" placement="top">
              <el-link v-show="!expands" type="text"
                icon="icon-ym icon-ym-btn-expand JNPF-common-head-icon" :underline="false"
                @click="toggleExpand()" />
            </el-tooltip>
            <el-tooltip effect="dark" content="折叠" placement="top">
              <el-link v-show="expands" type="text"
                icon="icon-ym icon-ym-btn-collapse JNPF-common-head-icon" :underline="false"
                @click="toggleExpand()" />
            </el-tooltip>
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="treeList" row-key="id" v-if="refreshTable"
          :default-expand-all="expands" :tree-props="{children: 'children', hasChildren: ''}">
          <el-table-column prop="fullName" label="名称">
            <template slot-scope="scope">
              <i :class="'table-icon icon-my '+scope.row.icon"></i>{{scope.row.fullName}}
            </template>
          </el-table-column>
          <el-table-column prop="enCode" label="编码" />
          <el-table-column prop="index" label="层级" width="100" align="center" />
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template slot-scope="scope">
              {{scope.row.type==='company'?'公司':'部门'}}
            </template>
          </el-table-column>
          <el-table-column prop="creatorTime" :formatter="jnpf.tableDateFormat" label="创建时间"
            width="120" />
          <el-table-column prop="sortCode" label="排序" width="70" align="center" />
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <tableOpts @edit="addOrUpdateHandle(scope.row.id,scope.row.type,scope.row.parentId)"
                @del="handleDel(scope.row.id)">
                <el-dropdown>
                  <span class="el-dropdown-link">
                    <el-button type="text" size="mini">{{$t('common.moreBtn')}}<i
                        class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="checkMembers(scope.row.id,scope.row.fullName)">
                      查看成员</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </tableOpts>
            </template>
          </el-table-column>
        </JNPF-table>
      </div>
    </div>

    <Form v-show="formVisible" ref="Form" @close="closeForm" />
    <DepForm v-if="depFormVisible" ref="depForm" @close="closeDepForm" />
    <CheckUser v-if="checkUserFormVisible" ref="checkUserForm"
      @close="checkUserFormVisible=false" />
  </div>
</template>

<script>
import { getOrganizeList, delOrganize } from '@/api/permission/organize'
import Form from './Form'
import DepForm from './depForm'
import CheckUser from './checkUser.vue'
export default {
  name: 'permission-organize',
  components: { Form, DepForm, CheckUser },
  data() {
    return {
      listQuery: {
        keyword: ''
      },
      treeList: [],
      expands: true,
      refreshTable: true,
      btnLoading: false,
      listLoading: true,
      formVisible: false,
      depFormVisible: false,
      checkUserFormVisible: false
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.loading = true
      getOrganizeList(this.listQuery).then(res => {
        this.treeList = res.data.list
        if (this.treeList.length > 0) this.setTableIndex(this.treeList);
        this.listLoading = false
        this.btnLoading = false
      }).catch(() => {
        this.listLoading = false
        this.btnLoading = false
      })
    },
    search() {
      this.initData()
    },
    // 树形列表index层级，实现方法（可复制直接调用）
    setTableIndex(arr, index) {
      arr.forEach((item) => {
        item.index = 1;
        if (index) item.index = index + 1;
        if (item.children) this.setTableIndex(item.children, item.index);
      });
    },
    reset() {
      this.listQuery.keyword = ''
      this.initData()
    },
    addOrUpdateHandle(id, type, parentId) {
      if (type === 'company') {
        this.addOrUpdateOrganize(id, parentId)
      } else {
        this.addOrUpdateDep(id)
      }
    },
    addOrUpdateOrganize(id, parentId) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(id, parentId)
      })
    },
    addOrUpdateDep(id) {
      this.depFormVisible = true
      this.$nextTick(() => {
        this.$refs.depForm.init(id)
      })
    },
    closeForm(isRefresh) {
      this.formVisible = false
      if (isRefresh) {
        this.keyword = ''
        this.initData()
      }
    },
    closeDepForm(isRefresh) {
      this.depFormVisible = false
      if (isRefresh) {
        this.keyword = ''
        this.initData()
      }
    },
    checkMembers(id, name) {
      this.checkUserFormVisible = true
      this.$nextTick(() => {
        this.$refs.checkUserForm.init(id, name)
      })
    },
    checkUser() {

    },
    toggleExpand() {
      this.refreshTable = false;
      this.expands = !this.expands;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    handleDel(id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        delOrganize(id).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1500,
            onClose: () => {
              this.$store.commit('generator/SET_COMPANY_TREE', [])
              this.$store.commit('generator/SET_DEP_TREE', [])
              this.initData()
            }
          })
        })
      }).catch(() => { })
    }
  }
}
</script>
<style lang="scss" scoped>
.table-icon {
  vertical-align: bottom;
  font-size: 16px;
  margin-right: 6px;
  line-height: 23px;
}
</style>