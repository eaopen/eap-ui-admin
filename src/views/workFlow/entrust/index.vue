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
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="search()">
                {{$t('common.search')}}</el-button>
              <el-button icon="el-icon-refresh-right" @click="reset()">{{$t('common.reset')}}
              </el-button>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <el-tabs v-model="activeName" type="border-card" class="JNPF-el_tabs"
        @tab-click="activeClick">
        <el-tab-pane label="委托发起">
          <div class="JNPF-common-layout-main JNPF-flex-main">
            <div class="JNPF-common-head">
              <topOpts @add="dialogVisible=true" addText="新建流程"></topOpts>
              <div class="JNPF-common-head-right">
                <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
                  <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                    @click="initFlowList()" />
                </el-tooltip>
              </div>
            </div>
            <JNPF-table v-loading="flowListLoading" :data="flowList">
              <el-table-column prop="fullName" label="流程标题" show-overflow-tooltip min-width="150" />
              <el-table-column prop="flowName" label="所属流程" width="130" show-overflow-tooltip />
              <el-table-column prop="startTime" label="发起时间" width="130"
                :formatter="jnpf.tableDateFormat" />
              <el-table-column prop="thisStep" label="审批节点" width="150" />
              <el-table-column prop="flowUrgent" label="紧急程度" width="100" align="center">
                <template slot-scope="scope">
                  {{ scope.row.flowUrgent | urgentText() }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="流程状态" width="130" align="center">
                <template slot-scope="scope">
                  <el-tag type="primary" v-if="scope.row.status==1">等待审核</el-tag>
                  <el-tag type="success" v-else-if="scope.row.status==2">审核通过</el-tag>
                  <el-tag type="danger" v-else-if="scope.row.status==3">审核退回</el-tag>
                  <el-tag type="info" v-else-if="scope.row.status==4">流程撤回</el-tag>
                  <el-tag type="info" v-else-if="scope.row.status==5">审核终止</el-tag>
                  <el-tag type="warning" v-else>等待提交</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="completion" label="流程进度" width="150">
                <template slot-scope="scope">
                  <p class="text-grey" v-if="scope.row.status==5 || scope.row.completion == 0">----
                  </p>
                  <p v-else-if=" scope.row.completion == 100">已完成</p>
                  <el-progress :percentage="scope.row.completion" v-else></el-progress>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" @click="toDetail(scope.row,'-1')"
                    :disabled="[1,2,4,5].indexOf(scope.row.status)>-1">编辑
                  </el-button>
                  <el-button size="mini" type="text" class="JNPF-table-delBtn"
                    @click="handleDelFlow(scope.$index,scope.row.id)"
                    :disabled="[1,2,3,5].indexOf(scope.row.status)>-1">删除
                  </el-button>
                  <el-button size="mini" type="text" @click="toDetail(scope.row,0)"
                    :disabled="!scope.row.status">详情
                  </el-button>
                </template>
              </el-table-column>
            </JNPF-table>
            <pagination :total="total" :page.sync="listQuery.currentPage"
              :limit.sync="listQuery.pageSize" @pagination="initFlowList" />
          </div>
        </el-tab-pane>
        <template v-for="item in delagateTypeList">
          <el-tab-pane :label="item.label" :key="item.key">
            <div class="JNPF-common-layout-main JNPF-flex-main">
              <div class="JNPF-common-head">
                <topOpts @add="addOrUpdateHandle()" addText="新建委托" v-if="item.key=='1'">
                </topOpts>
                <div style="height:33px" v-else></div>
                <div class="JNPF-common-head-right">
                  <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
                    <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                      @click="initData()" />
                  </el-tooltip>
                </div>
              </div>
              <JNPF-table v-loading="listLoading" :data="list">
                <el-table-column prop="userName" label="委托人" width="150" v-if="item.key=='2'" />
                <el-table-column prop="toUserName" label="受委托人" width="150" />
                <el-table-column prop="type" label="委托类型" width="150">
                  <template slot-scope="scope">
                    <span v-if='scope.row.type==0'>发起委托</span>
                    <span v-else>审批委托</span>
                  </template>
                </el-table-column>
                <el-table-column prop="flowName" label="委托流程" width="250" show-overflow-tooltip />
                <el-table-column prop="startTime" label="开始时间" width="120"
                  :formatter="jnpf.tableDateFormat">
                </el-table-column>
                <el-table-column prop="endTime" label="结束时间" width="120"
                  :formatter="jnpf.tableDateFormat">
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template slot-scope="scope">
                    <el-tag type="info" v-if='scope.row.status==1'>未开始</el-tag>
                    <el-tag type="danger" v-else-if='scope.row.status==2'>已失效</el-tag>
                    <el-tag type="primary" v-else>委托中</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="委托说明" />
                <el-table-column label="操作" fixed="right" width="150" v-if="item.key=='1'">
                  <template slot-scope="scope">
                    <tableOpts @edit="addOrUpdateHandle(scope.row.id)"
                      @del="handleDel(scope.$index,scope.row.id)"
                      :editDisabled="scope.row.status==2">
                      <template v-if='scope.row.status!=2'>
                        <el-dropdown>
                          <span class="el-dropdown-link">
                            <el-button type="text" size="mini">{{$t('common.moreBtn')}}<i
                                class="el-icon-arrow-down el-icon--right"></i>
                            </el-button>
                          </span>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="delegation(scope.row.id)">
                              结束委托</el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                      </template>
                    </tableOpts>
                  </template>
                </el-table-column>
              </JNPF-table>
              <pagination :total="total" :page.sync="listQuery.currentPage"
                :limit.sync="listQuery.pageSize" @pagination="initData" />
            </div>
          </el-tab-pane>
        </template>
      </el-tabs>
    </div>
    <Form v-if="formVisible" ref="Form" @refreshDataList="reset" />
    <MyEntrust v-if="flowVisible" ref="MyEntrust" @close="flowVisible=false"
      @choiceFlow="choiceFlow" />
    <FlowBox v-if="flowBoxVisible" ref="FlowBox" @close="closeForm" />
    <el-dialog title="发起人员" :close-on-click-modal="false" :visible.sync="visibleUsers"
      class="JNPF-dialog JNPF-dialog_center  JNPF-dialog_fq" lock-scroll width="600px">
      <div class="user-list">
        <el-row v-if="flowUserList.length>1">
          <el-col :span="20" :offset="2" class="user-item" v-for="(item,index) in flowUserList"
            :key="index">
            <div class="user-item-main" :class="{active:checkUserList.includes(item.id)}"
              @click="checkUserChange(item.id)">
              <div class="user-avatar-div">
                <el-avatar class="user-avatar" :size="40" :src="define.comUrl+item.headIcon">
                </el-avatar>
              </div>
              <div>
                <p class="user-name">{{item.fullName}}</p>
                <p class="user-organize" :title="item.organize">{{item.organize}}</p>
              </div>
              <div class="icon-checked">
                <i class="el-icon-check"></i>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visibleUsers = false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="dataFormSubmit()">
          {{$t('common.confirmButton')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog title="新建流程" :visible.sync="dialogVisible"
      class="JNPF-dialog JNPF-dialog_center JNPF-dialog-add" lock-scroll width="600px">
      <div class="add-main">
        <div class="add-item add-item-left" @click="addFlow(0)">
          <i class="add-icon icon-ym icon-ym-launchFlow"></i>
          <div class="add-txt">
            <p class="add-title">发起流程</p>
            <p class="add-desc">发起表单的业务流程</p>
          </div>
        </div>
        <div class="add-item" @click="addFlow(1)">
          <i class="add-icon icon-ym icon-ym-funcFlow"></i>
          <div class="add-txt">
            <p class="add-title">功能流程</p>
            <p class="add-desc">发起功能的赋予流程</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { FlowDelegateList, DeleteDelagate, getUserListByFlowId, Stop } from '@/api/workFlow/FlowDelegate'
import { FlowLaunchList, Delete } from '@/api/workFlow/FlowLaunch'
import Form from './Form'
import MyEntrust from './myEntrust.vue'
import FlowBox from '../components/FlowBox'
import { mapGetters } from "vuex";
export default {
  name: 'workFlow-entrust',
  components: { Form, MyEntrust, FlowBox },
  data() {
    return {
      keyword: '',
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      formVisible: false,
      flowVisible: false,
      flowBoxVisible: false,
      activeName: '0',
      category: '',
      delagateTypeList: [
        { label: "委托设置", key: "1" },
        { label: "委托给我的", key: "2" }
      ],
      flowList: [],
      flowListLoading: false,
      visibleUsers: false,
      flowUserList: [],
      checkUserList: [],
      classObject: { active: true },
      checkFlowItem: {},
      dialogVisible: false,
      config: 0
    }
  },
  filters: {
    getCategoryText(id, categoryList) {
      let item = categoryList.filter(o => o.id == id)[0]
      return item && item.fullName ? item.fullName : ''
    }
  },
  created() {
    this.config = this.$route.query.config
    if (this.config) {
      this.activeName = this.config == 1 ? '1' : '2'
      this.initData()
    } else {
      this.initFlowList()
    }
    this.getDictionaryData()

  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  methods: {
    delegation(id) {
      this.$confirm('结束后，流程不再进行委托！', '结束委托', {
        type: 'warning'
      }).then(() => {
        Stop(id).then(res => {
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
    getDictionaryData() {
      this.$store.dispatch('base/getDictionaryData', { sort: 'WorkFlowCategory' }).then((res) => {
        this.categoryList = res
      })
    },
    search() {
      this.listQuery = {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      if (this.activeName == '0') {
        this.initFlowList()
      } else {
        this.initData()
      }
    },
    reset() {
      this.keyword = ''
      this.search()
    },
    initData() {
      this.listLoading = true
      let query = {
        ...this.listQuery,
        keyword: this.keyword,
        myOrDelagateToMe: this.activeName
      }
      FlowDelegateList(query).then(res => {
        this.list = res.data.list
        let currTime = this.jnpf.toDate(new Date())
        for (let i = 0; i < this.list.length; i++) {
          let e = this.list[i];
          let startTime = this.jnpf.toDate(e.startTime);
          let endTime = this.jnpf.toDate(e.endTime);
          e.startTime = startTime
          e.endTime = endTime
          // 0-委托中 1-未开始 2-已失效
          let status = 0
          if (startTime > currTime) {
            status = 1
          } else if (endTime <= currTime) {
            status = 2
          } else {
            status = 0
          }
          e.status = status
        }
        this.total = res.data.pagination.total
        this.listLoading = false
      })
    },
    handleDel(index, id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        this.asyncDel(index, id);
      }).catch(() => { });
    },
    asyncDel(index, id) {
      DeleteDelagate(id).then(res => {
        this.initData()
        this.$message({
          type: 'success',
          message: res.msg
        });
      })
    },
    handleDelFlow(index, id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        this.asyncDelFlow(index, id);
      }).catch(() => { });
    },
    asyncDelFlow(index, id) {
      Delete(id).then(res => {
        this.initFlowList()
        this.$message({
          type: 'success',
          message: res.msg
        });
      })
    },
    formatter(row, column) {
      return this.jnpf.dateFormat(row, column)
    },
    addOrUpdateHandle(id) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(id)
      })
    },
    addFlow(type) {
      this.dialogVisible = false
      this.flowVisible = true
      this.$nextTick(() => {
        this.$refs.MyEntrust.init(type)
      })
    },
    choiceFlow(item) {
      this.checkUserList = []
      getUserListByFlowId({ flowId: item.id }).then(res => {
        this.flowUserList = res.data.list
        if (res.data.list.length > 1) {
          this.visibleUsers = true
          this.checkFlowItem = item
        } else {
          let data = {
            id: '',
            enCode: item.enCode,
            flowId: item.id,
            opType: '-1',
            delegateUserList: [res.data.list[0].id],
          }
          this.flowBoxVisible = true
          this.$nextTick(() => {
            this.$refs.FlowBox.init(data)
            this.flowVisible = false
          })
        }
      })
    },
    dataFormSubmit() {
      if (!this.checkUserList.length) return this.$message.warning('请选择发起人员')
      this.visibleUsers = false
      let data = {
        id: '',
        enCode: this.checkFlowItem.enCode,
        flowId: this.checkFlowItem.id,
        opType: '-1',
        delegateUserList: this.checkUserList,
      }
      this.flowBoxVisible = true
      this.$nextTick(() => {
        this.$refs.FlowBox.init(data)
        this.flowVisible = false
      })
    },
    closeForm(isRefresh) {
      this.flowBoxVisible = false
      if (isRefresh) this.search()
    },
    activeClick(tab, event) {
      this.activeName = tab.paneName
      this.keyword = ''
      if (tab.paneName == '0') this.initFlowList()
      if (tab.paneName == '1') this.search()
      if (tab.paneName == '2') this.search()
    },
    initFlowList() {
      this.flowListLoading = true
      let query = {
        ...this.listQuery,
        keyword: this.keyword,
        delegateType: true,
      }
      FlowLaunchList(query).then(res => {
        this.flowList = res.data.list
        this.total = res.data.pagination.total
        this.flowListLoading = false
      })
    },
    checkUserChange(data) {
      let index = this.checkUserList.findIndex(item => {
        if (item == data) {
          return true
        }
      })
      if (index > -1) {
        this.checkUserList.splice(index, 1)
      } else {
        this.checkUserList.push(data)
      }
    },
    toDetail(item, opType) {
      let data = {
        id: item.id,
        enCode: item.flowCode,
        flowId: item.flowId,
        opType,
        status: item.status
      }
      this.flowBoxVisible = true
      this.$nextTick(() => {
        this.$refs.FlowBox.init(data)
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.JNPF-common-head {
  padding-top: 0px;
}
.JNPF-el_tabs {
  >>> .el-tabs__item {
    text-align: center;
  }
  >>> .el-tabs__content {
    padding: 15px 0 15px;
  }
}
.childrenTab {
  >>> .el-tabs__nav-scroll {
    margin-left: -15px;
  }
  >>> .el-tabs__item {
    width: 120px;
    text-align: right;
  }
  >>> .el-tabs__content {
    height: 100%;
    padding-top: 0px;
    .el-tab-pane {
      height: 100%;
    }
  }
}
.JNPF-dialog_fq >>> .el-dialog__body {
  height: 400px;
  overflow: scroll;
}
.user-list {
  width: 100%;

  .user-item {
    margin-bottom: 15px;
    .user-item-main {
      height: 70px;
      position: relative;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      display: flex;
      align-items: center;
      padding: 0 20px;
      cursor: pointer;
      color: #303133;
      &.active {
        border: 1px solid #1890ff;
        box-shadow: 0 0 6px rgba(6, 58, 108, 0.26);
        .icon-checked {
          display: block;
        }
      }
      .user-avatar {
        margin-right: 20px;
      }
      .user-name {
        line-height: 24px;
        font-size: 14px;
      }
      .user-organize {
        width: 330px;
        line-height: 24px;
        font-size: 12px;
        color: #999999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-all;
      }
      .icon-checked {
        display: none;
        width: 20px;
        height: 20px;
        border: 20px solid #1890ff;
        border-left: 20px solid transparent;
        border-top: 20px solid transparent;
        border-bottom-right-radius: 2px;
        position: absolute;
        transform: scale(0.9);
        right: -2px;
        bottom: -2px;
        i {
          position: absolute;
          top: -2px;
          left: -3px;
          font-size: 20px;
          color: #fff;
        }
      }
    }
  }
}
</style>
