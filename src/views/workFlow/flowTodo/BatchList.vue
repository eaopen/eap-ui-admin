<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack" content="批量审批" />
        <div class="options">
          <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
        </div>
      </div>
      <div class="main">
        <el-row class="JNPF-common-search-box" :gutter="16">
          <el-form @submit.native.prevent>
            <el-col :span="6">
              <el-form-item label="关键词">
                <el-input v-model="listQuery.keyword" placeholder="请输入关键词查询" clearable
                  @keyup.enter.native="search()" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="所属流程">
                <el-select v-model="listQuery.templateId" placeholder="选择所属流程" clearable
                  @change="onTemplateIdChange" filterable>
                  <el-option v-for="item in templateOptions" :key="item.id" :label="item.fullName"
                    :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="所属名称">
                <el-select v-model="listQuery.flowId" placeholder="选择所属名称" clearable
                  @change="onFlowChange" @visible-change="visibleFlowChange" filterable>
                  <el-option v-for="item in flowOptions" :key="item.id" :label="item.fullName"
                    :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <template v-if="showAll">
              <el-col :span="6">
                <el-form-item label="所属节点">
                  <el-select v-model="listQuery.nodeCode" placeholder="选择所属节点" clearable
                    @visible-change="visibleChange" filterable>
                    <el-option v-for="item in nodeOptions" :key="item.id" :label="item.fullName"
                      :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="日期">
                  <el-date-picker v-model="pickerVal" type="daterange" start-placeholder="开始日期"
                    end-placeholder="结束日期" :picker-options="pickerOptions" value-format="timestamp"
                    clearable :editable="false">
                  </el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="分类">
                  <el-select v-model="listQuery.flowCategory" placeholder="选择分类" clearable
                    filterable>
                    <el-option v-for="item in categoryList" :key="item.id" :label="item.fullName"
                      :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="发起人员">
                  <user-select v-model="listQuery.creatorUserId" placeholder="选择发起人员" />
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
        <div class="JNPF-common-head">
          <div>
            <el-button type="warning" @click="handleBatch(2)" :disabled="!listQuery.nodeCode">
              批量转审</el-button>
            <el-button type="primary" @click="handleBatch(0)" :disabled="!listQuery.nodeCode"
              :loading="btnLoading">批量通过</el-button>
            <el-button type="danger" @click="handleBatch(1)" :disabled="!listQuery.nodeCode">批量退回
            </el-button>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="list" has-c @selection-change="handleChange">
          <el-table-column prop="fullName" label="流程标题" show-overflow-tooltip min-width="150" />
          <el-table-column prop="flowName" label="所属流程" width="130" />
          <el-table-column prop="flowVersion" label="流程版本" width="130" align="center">
            <template slot-scope="scope">
              <el-tag>V:{{scope.row.flowVersion}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="发起时间" width="130"
            :formatter="jnpf.tableDateFormat" />
          <el-table-column prop="userName" label="发起人员" width="130" />
          <el-table-column prop="thisStep" label="审批节点" width="130" />
          <el-table-column prop="flowUrgent" label="紧急程度" width="100" align="center">
            <template slot-scope="scope">
              {{ scope.row.flowUrgent | urgentText() }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="流程状态" width="130" align="center">
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.status==2">审核通过</el-tag>
              <el-tag type="danger" v-else-if="scope.row.status==3">审核退回</el-tag>
              <el-tag type="info" v-else-if="scope.row.status==4">流程撤回</el-tag>
              <el-tag type="info" v-else-if="scope.row.status==5">审核终止</el-tag>
              <el-tag type="primary" v-else>等待审核</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creatorTime" label="接收时间" width="130">
            <template slot-scope="scope">
              {{scope.row.creatorTime | toDate() }}
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage"
          :limit.sync="listQuery.pageSize" @pagination="initData" />
      </div>
      <approve-dialog v-if="approveVisible" ref="approveDialog" @submit="batchOperation" />
      <error-form :visible.sync="errorVisible" :nodeList="errorNodeList" @submit="handleError" />
      <actionDialog v-if="userBoxVisible" ref="userBox" title="审批人" @submit="handleTransfer" />
    </div>
  </transition>
</template>

<script>
import { FlowBeforeList, getBatchFlowSelector, getBatchFlowJsonList, getNodeSelector, BatchCandidate, BatchOperation, RejectList } from '@/api/workFlow/FlowBefore'
import ApproveDialog from '@/views/workFlow/components/ApproveDialog'
import ActionDialog from '@/views/workFlow/components/ActionDialog'
import ErrorForm from '../components/ErrorForm'
export default {
  components: { ApproveDialog, ErrorForm, ActionDialog },
  props: ['categoryList'],
  data() {
    return {
      id: '',
      title: '',
      list: [],
      total: 0,
      listLoading: false,
      btnLoading: false,
      listQuery: {
        keyword: '',
        templateId: '',
        flowId: '',
        nodeCode: '',
        flowCategory: '',
        creatorUserId: '',
        startTime: '',
        endTime: '',
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      templateOptions: [],
      flowOptions: [],
      nodeOptions: [],
      multipleSelection: [],
      currentBatchType: null,
      candidateType: 1,
      userBoxVisible: false,
      approveVisible: false,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      pickerVal: [],
      showAll: false,
      errorVisible: false,
      errorNodeList: [],
      batchOperationData: {},
    }
  },
  watch: {
    'listQuery.nodeCode': function (val) {
      this.search()
    }
  },
  methods: {
    goBack() {
      this.$emit('close')
    },
    init() {
      this.reset()
      this.getBatchFlowSelector()
    },
    initData() {
      this.listLoading = true
      FlowBeforeList(4, this.listQuery).then(res => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      })
    },
    getBatchFlowSelector() {
      getBatchFlowSelector().then(res => {
        this.templateOptions = res.data
      })
    },
    getBatchFlowJsonList() {
      getBatchFlowJsonList(this.listQuery.templateId).then(res => {
        this.flowOptions = res.data
      })
    },
    getNodeSelector() {
      getNodeSelector(this.listQuery.flowId).then(res => {
        this.nodeOptions = res.data
      })
    },
    onTemplateIdChange(val) {
      this.listQuery.flowId = ''
      this.listQuery.nodeCode = ''
      this.flowOptions = []
      this.nodeOptions = []
      if (!val) return
      this.getBatchFlowJsonList()
    },
    onFlowChange(val) {
      this.listQuery.nodeCode = ''
      if (!val) return this.nodeOptions = []
      this.getNodeSelector()
    },
    visibleFlowChange(val) {
      if (!val) return
      if (!this.listQuery.templateId) this.$message.warning('请先选择所属流程')
    },
    visibleChange(val) {
      if (!val) return
      if (!this.listQuery.flowId) this.$message.warning('请先选择所属名称')
    },
    handleChange(val) {
      this.multipleSelection = val
    },
    handleBatch(batchType) {
      // batchType 0-通过 1-退回 2-转审
      if (!this.multipleSelection.length) return this.$message.error('请先选择数据')
      let isDiffer = this.multipleSelection.some(o => o.flowVersion !== this.multipleSelection[0].flowVersion)
      if (isDiffer) return this.$message.error('请选择相同的版本审批单')
      this.currentBatchType = batchType
      const item = this.multipleSelection[0]
      const properties = item.approversProperties ? JSON.parse(item.approversProperties) : {}
      if (batchType === 0) {
        if (!properties.hasAuditBtn) return this.$message.error('当前审批节点无通过权限')
        this.btnLoading = true
        const query = {
          flowId: item.flowId,
          taskOperatorId: item.id
        }
        BatchCandidate(query).then(res => {
          let data = res.data
          this.btnLoading = false
          this.candidateType = data.type
          let branchList = []
          let candidateList = []
          if (data.type == 1) {
            branchList = data.list
            this.approveVisible = true
            this.$nextTick(() => {
              this.$refs.approveDialog.init(properties, item.id, 'audit', branchList, candidateList, item.flowId)
            })
          }
          if (data.type == 2) {
            let list = data.list.filter(o => o.isCandidates)
            candidateList = list.map(o => ({
              ...o,
              label: '审批人',
              value: [],
              rules: [{ required: true, message: `审批人不能为空`, trigger: 'click' }]
            }))
            this.approveVisible = true
            this.$nextTick(() => {
              this.$refs.approveDialog.init(properties, item.id, 'audit', branchList, candidateList, item.flowId)
            })
          } else {
            if (!properties.hasSign && !properties.hasOpinion && !properties.hasFreeApprover && !properties.isCustomCopy) {
              this.$confirm('此操作将通过该审批单，是否继续？', '提示', {
                type: 'warning'
              }).then(() => {
                this.batchOperation()
              }).catch(() => { });
              return
            }
            this.approveVisible = true
            this.$nextTick(() => {
              this.$refs.approveDialog.init(properties, item.id, 'audit', branchList, candidateList, item.flowId)
            })
          }

        }).catch(() => {
          this.btnLoading = false
        })
        return
      }
      if (batchType === 1) {
        if (!properties.hasRejectBtn) return this.$message.error('当前审批节点无退回权限')
        RejectList(item.id).then(res => {
          properties.showReject = res.data.isLastAppro
          properties.rejectList = res.data.list || []
          properties.nodeCode = properties.rejectList[0].nodeCode
          if (!properties.hasSign && !properties.hasOpinion && !properties.showReject) {
            this.$confirm('此操作将退回该审批单，是否继续？', '提示', {
              type: 'warning'
            }).then(() => {
              this.batchOperation()
            }).catch(() => { });
            return
          }
          this.approveVisible = true
          this.$nextTick(() => {
            this.$refs.approveDialog.init(properties, item.id, 'reject', [], [], item.flowId)
          })
        }).catch({})
        return
      }
      if (batchType === 2) {
        if (!properties.hasTransferBtn) return this.$message.error('当前审批节点无转审权限')
        this.userBoxVisible = true
        this.$nextTick(() => {
          this.$refs.userBox.init(properties, 'transfer')
        })
      }
    },
    handleTransfer(data) {
      this.batchOperation(data)
    },
    batchOperation(data) {
      if (!data) {
        data = {
          branchList: [],
          copyIds: "",
          freeApproverUserId: "",
          handleOpinion: "",
          signImg: "",
        }
      }
      const ids = this.multipleSelection.map(o => o.id)
      const query = {
        ...data,
        enCode: this.multipleSelection[0].flowCode,
        batchType: this.currentBatchType,
        candidateType: this.candidateType,
        ids
      }
      BatchOperation(query).then(res => {
        const errorData = res.data
        if (errorData && Array.isArray(errorData) && errorData.length) {
          this.errorNodeList = errorData
          this.errorVisible = true
          this.batchOperationData = data
        } else {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1000,
            onClose: () => {
              this.initData()
              this.errorVisible = false
              this.$refs.approveDialog && this.$refs.approveDialog.closeDialog()
              this.$refs.userBox && this.$refs.userBox.closeDialog()
            }
          })
        }
      }).catch(() => {
        this.$refs.approveDialog && (this.$refs.approveDialog.btnLoading = false)
        this.$refs.userBox && this.$refs.userBox.closeDialog()
        this.errorVisible = false
      })
    },
    handleError(data) {
      this.batchOperationData.errorRuleUserList = data
      this.batchOperation(this.batchOperationData)
    },
    reset() {
      this.list = []
      this.nodeOptions = []
      this.flowOptions = []
      this.pickerVal = []
      this.listQuery = {
        keyword: '',
        templateId: '',
        flowId: '',
        nodeCode: '',
        flowCategory: '',
        creatorUserId: '',
        startTime: '',
        endTime: '',
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      this.initData()
    },
    search() {
      if (this.pickerVal && this.pickerVal.length) {
        this.listQuery.startTime = this.pickerVal[0]
        this.listQuery.endTime = this.pickerVal[1]
      } else {
        this.listQuery.startTime = ''
        this.listQuery.endTime = ''
      }
      this.listQuery.currentPage = 1
      this.listQuery.pageSize = 20
      this.initData()
    }
  }
}
</script>
<style lang="scss" scoped>
.main {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 0 10px;
  .JNPF-common-search-box {
    border-bottom: 1px solid #dcdfe6;
  }
  >>> .el-table {
    flex: 1;
    border-top: none;
  }
}
</style>