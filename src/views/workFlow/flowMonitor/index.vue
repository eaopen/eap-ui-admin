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
            <el-form-item label="日期">
              <el-date-picker v-model="pickerVal" type="daterange" start-placeholder="开始日期"
                end-placeholder="结束日期" :picker-options="pickerOptions" value-format="timestamp"
                clearable :editable="false">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="分类">
              <el-select v-model="flowCategory" placeholder="选择分类" clearable filterable>
                <el-option v-for="item in categoryList" :key="item.id" :label="item.fullName"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <template v-if="showAll">
            <el-col :span="6">
              <el-form-item label="所属流程">
                <el-select v-model="templateId" placeholder="选择所属流程" clearable
                  @change="onTemplateIdChange" filterable>
                  <el-option-group v-for="group in flowEngineList" :key="group.id"
                    :label="group.fullName+'【'+group.num+'】'">
                    <el-option v-for="item in group.children" :key="item.id" :label="item.fullName"
                      :value="item.id">
                    </el-option>
                  </el-option-group>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="所属名称">
                <el-select v-model="flowId" placeholder="选择所属名称" clearable
                  @visible-change="visibleFlowChange" filterable>
                  <el-option v-for="item in flowOptions" :key="item.id" :label="item.fullName"
                    :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="发起人员">
                <user-select v-model="creatorUserId" placeholder="选择发起人员" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="流程状态">
                <el-select v-model="status" placeholder="选择流程状态" clearable filterable>
                  <el-option v-for="(item,i) in statusList" :key="i" :label="item.fullName"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="紧急程度">
                <el-select v-model="urgent" placeholder="选择紧急程度" clearable filterable>
                  <el-option v-for="(item,i) in urgentList" :key="i" :label="item.fullName"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </template>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="search()">
                {{$t('common.search')}}</el-button>
              <el-button icon="el-icon-refresh-right" @click="refresh()">{{$t('common.reset')}}
              </el-button>
              <el-button type="text" icon="el-icon-arrow-down" @click="showAll=true"
                v-if="!showAll">展开</el-button>
              <el-button type="text" icon="el-icon-arrow-up" @click="showAll=false" v-else>
                收起</el-button>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div>
            <el-button type="danger" @click="handleDel" icon="el-icon-delete">删除</el-button>
          </div>
          <div class="JNPF-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="list" hasC @selection-change="handleChange">
          <el-table-column prop="fullName" label="流程标题" show-overflow-tooltip min-width="150" />
          <el-table-column prop="flowName" label="所属流程" width="130" />
          <el-table-column prop="startTime" label="发起时间" width="130"
            :formatter="jnpf.tableDateFormat" />
          <el-table-column prop="userName" label="发起人员" width="130" />
          <el-table-column prop="thisStep" label="审批节点" width="130" />
          <el-table-column prop="flowUrgent" label="紧急程度" width="100" align="center">
            <template slot-scope="scope">
              {{ scope.row.flowUrgent | urgentText() }}
            </template>
          </el-table-column>
          <el-table-column prop="flowVersion" label="版本号" width="70" align="center">
            <template slot-scope="scope">
              <el-tag type="primary">V:{{scope.row.flowVersion}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="流程状态" width="130" align="center">
            <template slot-scope="scope">
              <el-tag type="primary" v-if="scope.row.status==1">等待审核</el-tag>
              <el-tag type="success" v-else-if="scope.row.status==2">审核通过</el-tag>
              <el-tag type="danger" v-else-if="scope.row.status==3">审核退回</el-tag>
              <el-tag type="info" v-else-if="scope.row.status==4">流程撤回</el-tag>
              <el-tag type="info" v-else-if="scope.row.status==5">审核终止</el-tag>
              <el-tag type="danger" v-else-if="scope.row.status==6">已被挂起</el-tag>
              <el-tag v-else type="warning">等待提交</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="completion" label="流程进度" width="150">
            <template slot-scope="scope">
              <p class="text-grey" v-if="scope.row.status==5 || scope.row.completion == 0">----</p>
              <p v-else-if=" scope.row.completion == 100">已完成</p>
              <el-progress :percentage="scope.row.completion" v-else></el-progress>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="50" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="toDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage"
          :limit.sync="listQuery.pageSize" @pagination="initData" />
      </div>
    </div>
    <FlowBox v-if="formVisible" ref="FlowBox" @close="closeForm" />
  </div>
</template>

<script>
import { FlowMonitorList, DeleteList } from '@/api/workFlow/FlowMonitor'
import { FlowEngineListAll, getFlowList } from '@/api/workFlow/FlowEngine'
import FlowBox from '../components/FlowBox'
export default {
  name: 'workFlow-flowMonitor',
  components: { FlowBox },
  data() {
    return {
      list: [],
      total: 0,
      showAll: false,
      listLoading: true,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      formVisible: false,
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
      statusList: [{
        id: 0,
        fullName: '等待提交'
      }, {
        id: 1,
        fullName: '等待审核'
      }, {
        id: 2,
        fullName: '审核通过'
      }, {
        id: 3,
        fullName: '审核退回'
      }, {
        id: 4,
        fullName: '流程撤回'
      }, {
        id: 5,
        fullName: '审核终止'
      }, {
        id: 6,
        fullName: '已被挂起'
      }],
      urgent: '',
      urgentList: [
        {
          id: 1,
          fullName: '普通'
        }, {
          id: 2,
          fullName: '重要'
        }, {
          id: 3,
          fullName: '紧急'
        }
      ],
      keyword: '',
      pickerVal: [],
      startTime: '',
      endTime: '',
      templateId: '',
      flowId: '',
      status: '',
      flowCategory: '',
      creatorUserId: '',
      categoryList: [],
      flowEngineList: [],
      multipleSelection: [],
      flowOptions: []
    }
  },
  filters: {
    getCategoryText(id, categoryList) {
      let item = categoryList.filter(o => o.enCode == id)[0]
      return item && item.fullName ? item.fullName : ''
    }
  },
  created() {
    this.getDictionaryData()
    this.getFlowEngineList()
    this.initData()
  },
  methods: {
    search() {
      if (this.pickerVal && this.pickerVal.length) {
        this.startTime = this.pickerVal[0]
        this.endTime = this.pickerVal[1]
      } else {
        this.startTime = ''
        this.endTime = ''
      }
      this.listQuery = {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      this.initData()
    },
    getFlowEngineList() {
      FlowEngineListAll().then((res) => {
        this.flowEngineList = res.data.list
      })
    },
    getDictionaryData() {
      this.$store.dispatch('base/getDictionaryData', { sort: 'WorkFlowCategory' }).then((res) => {
        this.categoryList = res
      })
    },
    initData() {
      this.listLoading = true
      let query = {
        ...this.listQuery,
        keyword: this.keyword,
        startTime: this.startTime,
        endTime: this.endTime,
        templateId: this.templateId,
        flowId: this.flowId,
        status: this.status,
        flowUrgent: this.urgent,
        flowCategory: this.flowCategory,
        creatorUserId: this.creatorUserId
      }
      FlowMonitorList(query).then(async res => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      })
    },
    toDetail(item) {
      let data = {
        flowId: item.flowId,
        id: item.processId,
        taskId: item.id,
        status: item.status,
        opType: 4,
        hasCancel: true,
        readonly: true
      }
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.FlowBox.init(data)
      })
    },
    handleChange(val) {
      this.multipleSelection = val.map(item => item.id)
    },
    handleDel() {
      if (!this.multipleSelection.length) {
        this.$message({ type: 'error', message: '请选择一条数据' });
        return
      }
      let data = { ids: this.multipleSelection.join(',') }
      this.$confirm('您确定要删除这些数据吗, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        DeleteList(data).then(res => {
          this.$message({
            type: 'success',
            message: res.msg
          });
          this.refresh();
        })
      }).catch(() => { });
    },
    closeForm(isRefresh) {
      this.formVisible = false
      if (isRefresh) this.refresh()
    },
    refresh() {
      this.pickerVal = ''
      this.startTime = ''
      this.endTime = ''
      this.keyword = ''
      this.templateId = ''
      this.flowId = ''
      this.status = ''
      this.urgent = ''
      this.flowCategory = ''
      this.creatorUserId = ''
      this.flowOptions = []
      this.listQuery = {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      this.initData()
    },
    onTemplateIdChange(val) {
      this.flowId = ''
      this.flowOptions = []
      if (!val) return
      this.getFlowList()
    },
    getFlowList() {
      getFlowList(this.templateId).then(res => {
        this.flowOptions = res.data
      })
    },
    visibleFlowChange(val) {
      if (!val) return
      if (!this.templateId) this.$message.warning('请先选择所属流程')
    },
  }
}
</script>
