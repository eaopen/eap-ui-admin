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
            <el-form-item label="消息类型">
              <el-select v-model="msgType" placeholder="请选择消息类型" clearable filterable>
                <el-option v-for="item in msgTypeList" :key="item.enCode" :label="item.fullName"
                  :value="item.enCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="发送时间">
              <el-date-picker v-model="pickerVal" type="daterange" start-placeholder="开始日期"
                end-placeholder="结束日期" :picker-options="pickerOptions" value-format="timestamp"
                clearable :editable="false">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <template v-if="showAll">
            <el-col :span="6">
              <el-form-item label="消息来源">
                <el-select v-model="messageSource" placeholder="请选择消息来源" clearable filterable>
                  <el-option v-for="(item,index) in messageSourceList" :key="index"
                    :label="item.fullName" :value="item.enCode">
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
      <div class="OBPM-common-layout-main JNPF-flex-main">
        <div class="OBPM-common-head">
          <div>
            <el-button type="danger" @click="handleDel" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="text" class="OBPM-table-delBtn" @click="handleDelAll">一键清空
            </el-button>
          </div>
          <div class="OBPM-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="list" hasC @selection-change="handleChange">
          <el-table-column prop="messageType" label="消息类型" width="100" />
          <el-table-column prop="messageSource" label="消息来源" width="100" />
          <el-table-column prop="title" label="消息标题" min-width="230" />
          <el-table-column prop="sendTime" label="发送时间" width="120"
            :formatter="jnpf.tableDateFormat" />
          <el-table-column label="操作" width="50" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="toDetail(scope.row.id)">查看</el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage"
          :limit.sync="listQuery.pageSize" @pagination="initData" />
      </div>
    </div>
    <Detail v-if="detailVisible" ref="DetailBox" @close="closeForm" />
  </div>
</template>
<script>
import { getMsgMonitorList, delMsgMonitor, emptyMsgMonitor } from '@/api/extn/msgMonitor'
import { getMsgTypeList } from '@/api/extn/msgTemplate'
import Detail from './Detail'
export default {
  name: 'system-mesCenter-msgMonitor',
  components: { Detail },
  data() {
    return {
      showAll: false,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
      },
      detailVisible: false,
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
      keyword: '',
      pickerVal: [],
      startTime: '',
      endTime: '',
      msgType: '',
      msgTypeList: [],
      messageSource: '',
      messageSourceList: [],
      multipleSelection: []
    }
  },
  created() {
    this.initData()
    this.getConfig()
  },
  methods: {
    initData() {
      this.listLoading = true
      let query = {
        ...this.listQuery,
        keyword: this.keyword,
        startTime: this.startTime,
        endTime: this.endTime,
        messageType: this.msgType,
        messageSource: this.messageSource,
      }
      getMsgMonitorList(query).then(async res => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      })
    },
    getConfig() {
      this.$store.dispatch('extnBase/getMsgTypeList').then((res) => {
        this.msgTypeList = res
      })
      getMsgTypeList(4).then(res => {
        this.messageSourceList = res.data
      })
    },
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
      }
      this.initData()
    },
    toDetail(id) {
      this.detailVisible = true
      this.$nextTick(() => {
        this.$refs.DetailBox.init(id)
      })
    },
    handleDel() {
      if (!this.multipleSelection.length) {
        this.$message({ type: 'error', message: '请选择一条数据' });
        return
      }
      const query = { ids: this.multipleSelection }
      this.$confirm('您确定要删除这些数据吗, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        delMsgMonitor(query).then(res => {
          this.$message({
            type: 'success',
            message: res.msg
          });
          this.refresh();
        })
      }).catch(() => { });
    },
    handleDelAll() {
      this.$confirm('您确定要清空全部数据吗, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        emptyMsgMonitor().then(res => {
          this.$message({
            type: 'success',
            message: res.msg
          });
          this.refresh();
        })
      })
    },
    handleChange(val) {
      this.multipleSelection = val.map(item => item.id)
    },
    closeForm(isRefresh) {
      this.detailVisible = false
      if (isRefresh) this.refresh()
    },
    refresh() {
      this.pickerVal = ''
      this.startTime = ''
      this.endTime = ''
      this.keyword = ''
      this.msgType = ''
      this.messageSource = ''
      this.listQuery = {
        currentPage: 1,
        pageSize: 20,
      }
      this.initData()
    }
  }
}
</script>