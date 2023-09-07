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
            <el-form-item label="分类">
              <el-select v-model="category" placeholder="请选择分类" clearable filterable>
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
          <topOpts @add="openAddBox()">
            <upload-btn url="/api/visualdev/OnlineDev/Model/Actions/ImportData" accept=".vdd"
              @on-success="initData" />
          </topOpts>
          <div class="JNPF-common-head-right">
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
          <el-table-column prop="webType" label="类型" width="100" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.webType == 4">数据视图</span>
              <span v-else-if="scope.row.enableFlow">流程表单</span>
              <span v-else>普通表单</span>
            </template>
          </el-table-column>
          <el-table-column prop="creatorUser" label="创建人" width="120" />
          <el-table-column prop="creatorTime" label="创建时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="lastModifyTime" label="最后修改时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="sortCode" label="排序" width="70" align="center" />
          <el-table-column prop="state" label="状态" width="80" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.isRelease == 1 ? 'success' : 'info'" disable-transitions>
                {{scope.row.isRelease==1?'已发布':'未发布'}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="150">
            <template slot-scope="scope">
              <tableOpts @edit="addOrUpdateHandle(scope.row.id,scope.row.webType)"
                @del="handleDel(scope.row.id)">
                <el-dropdown>
                  <span class="el-dropdown-link">
                    <el-button type="text" size="mini">{{$t('common.moreBtn')}}<i
                        class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="handleEngine(scope.row.id)"
                      v-if="scope.row.enableFlow">
                      流程设计
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="showManage(scope.row.id,scope.row.fullName)"
                      v-if="scope.row.enableFlow">流程版本
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="preview(scope.row.id,0)">设计预览
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="openReleaseDialog(scope.row)">发布表单
                    </el-dropdown-item>
                    <el-dropdown-item v-if="scope.row.isRelease==1"
                      @click.native="preview(scope.row.id,1)">发布预览
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="copy(scope.row.id)">复制表单</el-dropdown-item>
                    <el-dropdown-item @click.native="exportModel(scope.row.id)">导出表单
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="handleLink(scope.row.id)"
                      v-if="scope.row.webType!=4&&!scope.row.enableFlow">外链设置
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
    <ViewForm v-if="viewFormVisible" ref="ViewForm" @close="closeForm" />
    <AddBox :visible.sync="addVisible" :webType="currWebType" @add="handleAdd" />
    <el-dialog title="同步菜单" :visible.sync="releaseDialogVisible"
      class="OBPM-dialog JNPF-dialog_center release-dialog" lock-scroll width="600px">
      <el-alert title="将该功能的按钮、列表、表单及数据权限同步至系统菜单" type="warning" :closable="false" show-icon />
      <div class="dialog-main">
        <div class="item" :class="{'active':releaseQuery.pc===1}" @click="selectToggle('pc')">
          <i class="item-icon icon-ym icon-ym-pc"></i>
          <p class="item-title">同步Web端菜单</p>
          <div class="icon-checked">
            <i class="el-icon-check"></i>
          </div>
        </div>
        <div class="item" :class="{'active':releaseQuery.app===1}" @click="selectToggle('app')">
          <i class="item-icon icon-ym icon-ym-mobile"></i>
          <p class="item-title">同步APP端菜单</p>
          <div class="icon-checked">
            <i class="el-icon-check"></i>
          </div>
        </div>
      </div>
      <el-form class="dialog-form-main" :model="releaseQuery" :rules="releaseQueryRule"
        label-position="right" label-width="50px" ref="releaseForm">
        <template v-if="!currRow.pcIsRelease">
          <el-form-item label="上级" prop="pcModuleParentId" v-if="releaseQuery.pc">
            <JNPF-TreeSelect v-model="releaseQuery.pcModuleParentId" :options="treeData"
              placeholder="选择上级菜单" @change="treeSelectChange(arguments,'pc')" />
          </el-form-item>
        </template>
        <template v-if="!currRow.appIsRelease">
          <el-form-item label="" v-if="(!releaseQuery.pc||currRow.pcIsRelease) && releaseQuery.app">
          </el-form-item>
          <el-form-item label="上级" prop="appModuleParentId" v-if="releaseQuery.app">
            <JNPF-TreeSelect v-model="releaseQuery.appModuleParentId" :options="appTreeData"
              placeholder="选择上级菜单" @change="treeSelectChange(arguments,'app')" />
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="releaseDialogVisible = false">{{$t('common.cancelBtn')}}</el-button>
        <el-button type="primary" :loading="releaseBtnLoading" @click="releaseModel">
          {{$t('common.confirmBtn')}}</el-button>
      </span>
    </el-dialog>
    <previewDialog :visible.sync="previewDialogVisible" :id="currId" :previewType="previewType"
      type="webDesign" />
<!--    <EngineForm v-if="engineFormVisible" ref="engineForm" />-->
<!--    <FlowManage v-if="manageVisible" ref="FlowManage" @close="manageVisible=false" />-->
    <LinkDialog v-if="linkVisible" ref="LinkDialog" @close="linkVisible=false" />
  </div>
</template>

<script>
import Form from './Form'
import ViewForm from './ViewForm'
import LinkDialog from './ShortLinkDialog'
import AddBox from '@/views/extn/generator/AddBox'
import mixin from '@/mixins/extn-generator/index'
import previewDialog from '@/components/extn/PreviewDialog'
import { Release } from '@/api/onlineDev/visualDev'
import { getMenuSelector } from '@/api/system/menu'
//import EngineForm from '@/views/extn/workFlow/flowEngine/Form'
//import FlowManage from '@/views/extn/workFlow/flowEngine/FlowManagement'
import { getFormById } from '@/api/extn/workFlow'
import { getFlowList } from '@/api/extn/workFlow'
export default {
  name: 'onlineDev-webDesign',
  mixins: [mixin],
  components: { Form, ViewForm, AddBox, previewDialog, LinkDialog },
  data() {
    return {
      query: { keyword: '', type: 1 },
      sort: 'webDesign',
      previewDialogVisible: false,
      releaseDialogVisible: false,
      releaseBtnLoading: false,
      currRow: {},
      releaseQuery: {
        pc: 1,
        app: 1,
        pcModuleParentId: '',
        appModuleParentId: '',
        systemId: ''
      },
      releaseQueryRule: {
        pcModuleParentId: [
          { required: true, message: '上级菜单不能为空', trigger: 'change' }
        ],
        appModuleParentId: [
          { required: true, message: '上级菜单不能为空', trigger: 'change' }
        ],
      },
      treeData: [],
      appTreeData: [],
      pcSystemId: "",
      appSystemId: "",
      previewType: "",
      enginCategoryList: [],
      engineFormVisible: false,
      manageVisible: false,
      linkVisible: false,
      viewFormVisible: false,
    }
  },
  created() {
    this.getEnginCategoryList()
  },
  methods: {
    preview(id, type) {
      this.currId = id
      this.previewType = type
      this.$nextTick(() => {
        this.previewDialogVisible = true
      })
    },
    releaseModel() {
      this.$refs['releaseForm'].validate((valid) => {
        if (!valid) return
        this.$confirm('发布模板会覆盖当前线上版本且进行菜单同步，是否继续？', '提示', {
          type: 'warning'
        }).then(() => {
          setTimeout(() => {
            this.release()
          }, 200)
        })
      })
    },
    openReleaseDialog(row) {
      this.currRow = row
      this.releaseDialogVisible = true
      this.pcSystemId = ""
      this.appSystemId = ""
      this.releaseQuery = {
        pc: 1,
        app: 1,
        pcModuleParentId: '',
        appModuleParentId: '',
      }
      this.$nextTick(() => {
        this.$refs['releaseForm'] && this.$refs['releaseForm'].resetFields()
      })
      this.getMenuSelector()
      this.getAPPMenuSelector()
    },
    selectToggle(key) {
      this.releaseQuery[key] = this.releaseQuery[key] === 1 ? 0 : 1
      const type = key == 'pc' ? 'pcModuleParentId' : 'appModuleParentId'
      this.$refs.releaseForm.clearValidate(type)
    },
    treeSelectChange(data, type) {
      const systemId = data[1].systemId
      if (type == 'pc') this.pcSystemId = systemId
      if (type == 'app') this.appSystemId = systemId
    },
    // 发布菜单
    release() {
      if (!this.releaseQuery.pc && !this.releaseQuery.app) return this.$message.error('请至少选择一种菜单同步方式')
      this.releaseBtnLoading = true
      this.releaseQuery.pcSystemId = this.pcSystemId
      this.releaseQuery.appSystemId = this.appSystemId
      Release(this.currRow.id, this.releaseQuery).then(res => {
        this.releaseBtnLoading = false
        this.releaseDialogVisible = false
        this.initData()
        this.$message({
          type: 'success',
          message: res.msg,
          duration: 1000,
        });
      }).catch(() => { this.releaseBtnLoading = false })
    },
    getMenuSelector() {
      getMenuSelector({ category: 'Web' }, 0).then(res => {
        this.treeData = res.data.list
      })
    },
    getAPPMenuSelector() {
      getMenuSelector({ category: 'App' }, 0).then(res => {
        this.appTreeData = res.data.list || []
        for (let index = 0; index < this.appTreeData.length; index++) {
          const item = this.appTreeData[index];
          if (item.type == 0) {
            item.disabled = true
          }
        }
      })
    },
    getEnginCategoryList() {
      this.$store.dispatch('dict/getDictionaryData', { sort: 'WorkFlowCategory' }).then((res) => {
        this.enginCategoryList = res
      })
    },
    showManage(id, fullName) {
      this.manageVisible = true
      this.$nextTick(() => {
        this.$refs.FlowManage.init(id, fullName)
      })
    },
    handleEngine(id) {
      getFormById(id).then(res1 => {
        let flowId = res1.data && res1.data.id
        this.engineFormVisible = true
        this.$nextTick(() => {
          //this.$refs.engineForm.init(this.enginCategoryList, flowId, 1)
        })
      })

    },
    handleLink(id) {
      this.linkVisible = true
      this.$nextTick(() => {
        this.$refs.LinkDialog.init(id)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.release-dialog {
  >>> .el-dialog {
    .el-dialog__body {
      padding: 12px 55px;
    }
  }
  .dialog-form-main {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    >>> .el-form-item {
      width: 215px;
    }
  }
  .dialog-main {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    .item {
      position: relative;
      width: 215px;
      height: 127px;
      cursor: pointer;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      text-align: center;
      padding-top: 20px;
      color: #606266;
      &.active {
        border-color: #1890ff;
        color: #1890ff;
        box-shadow: 0 0 6px rgba(6, 58, 108, 0.1);
        .item-icon {
          border-color: #1890ff;
        }
        .icon-checked {
          display: block;
        }
      }
      .item-icon {
        display: inline-block;
        width: 44px;
        height: 44px;
        margin-bottom: 16px;
        border: 2px solid #606266;
        line-height: 40px;
        font-size: 24px;
        text-align: center;
        border-radius: 50%;
      }
      .item-title {
        font-size: 16px;
        font-weight: 400;
      }
      .icon-checked {
        display: none;
        width: 18px;
        height: 18px;
        border: 18px solid #1890ff;
        border-left: 18px solid transparent;
        border-top: 18px solid transparent;
        border-bottom-right-radius: 4px;
        position: absolute;
        right: 0px;
        bottom: 0px;

        i {
          font-size: 16px;
          position: absolute;
          top: 0;
          left: -2px;
          color: #fff;
        }
      }
    }
  }
}
</style>