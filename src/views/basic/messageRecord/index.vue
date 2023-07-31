<template>
  <div class="JNPF-common-layout MessageRecord-container">
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
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <el-tabs type="border-card" v-model="activeName" class="messageRecord-tab">
          <el-tab-pane label="全部" name="0"></el-tab-pane>
          <el-tab-pane label="系统" name="3"></el-tab-pane>
          <el-tab-pane label="流程" name="2"></el-tab-pane>
          <el-tab-pane label="公告" name="1"></el-tab-pane>
          <el-tab-pane label="日程" name="4"></el-tab-pane>
          <div class="box">
            <div class="JNPF-common-head">
              <div class="left-btn">
                <el-button type="danger" @click="handleDel" icon="el-icon-delete">删除</el-button>
              </div>
              <div class="JNPF-common-head-right">
                <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
                  <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                    @click="initData()" />
                </el-tooltip>
              </div>
            </div>
            <JNPF-table v-loading="listLoading" :data="list" hasC
              @selection-change="handleSelectionChange">
              <el-table-column prop="title" label="消息标题">
                <template slot-scope="scope">
                  <el-link @click="readInfo(scope.row)" style="font-size:12px">{{ scope.row.title }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="消息类型" width="120">
                <template slot-scope="scope">
                  <span v-if="scope.row.type==1">公告</span>
                  <span v-if="scope.row.type==2">流程</span>
                  <span v-if="scope.row.type==3">系统</span>
                  <span v-if="scope.row.type==4">日程</span>
                </template>
              </el-table-column>
              <el-table-column prop="releaseUser" label="发送人员" width="120">
              </el-table-column>
              <el-table-column prop="releaseTime" label="发送时间" :formatter="jnpf.tableDateFormat"
                width="120" />
              <el-table-column prop="isRead" label="状态" width="100">
                <template slot-scope="scope">
                  <el-tag type="success" v-if="scope.row.isRead=='1'">已读</el-tag>
                  <el-tag type="info" v-else>未读</el-tag>
                </template>
              </el-table-column>
            </JNPF-table>
            <pagination :total="total" :page.sync="listQuery.currentPage"
              :limit.sync="listQuery.pageSize" @pagination="initData" />
          </div>
        </el-tabs>
      </div>
    </div>
    <Form v-if="formVisible" ref="Form" @refreshDataList="initData" />
    <ScheduleView v-if='scheduleVisible' ref="schedule" />
  </div>
</template>

<script>
import { getMessageList, MessageDeleteRecord, ReadInfo } from '@/api/system/message'
import Form from './Form'
import ScheduleView from '@/components/ScheduleView'
export default {
  name: 'messageRecord',
  components: { Form, ScheduleView },
  data() {
    return {
      visible: false,
      formVisible: false,
      keyword: '',
      activeName: "0",
      list: [],
      multipleSelection: [],
      total: 0,
      listLoading: true,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
      },
      scheduleVisible: false,
    }
  },
  watch: {
    activeName(val) {
      this.keyword = ''
      this.search()
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
      }
      this.initData()
    },
    reset() {
      this.keyword = ''
      this.search()
    },
    initData() {
      this.listLoading = true
      let data = {
        ...this.listQuery,
        keyword: this.keyword,
        type: this.activeName == '0' ? '' : this.activeName
      }
      this.list = []
      getMessageList(data).then(res => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      })
    },
    handleDel() {
      if (!this.multipleSelection.length) {
        this.$message({ type: 'error', message: '请选择一条数据' });
        return
      }
      let data = {
        ids: this.multipleSelection.join(',')
      }
      this.$confirm('您确定要删除这些数据吗, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        MessageDeleteRecord(data).then(res => {
          this.$message({
            type: 'success',
            message: res.msg
          });
          this.initData();
        })
      }).catch(() => { });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item.id)
    },
    readInfo(item) {
      ReadInfo(item.id).then(res => {
        this.info = res.data
        this.files = res.data.files ? JSON.parse(res.data.files) : []
        if (item.isRead == '0') {
          item.isRead = '1'
          this.$emit('read')
        }
        if (item.type == 4) {
          let bodyText = JSON.parse(res.data.bodyText)
          if (bodyText.type == 3) return
          this.scheduleVisible = true
          this.$nextTick(() => {
            this.$refs.schedule.init(bodyText.id, '', bodyText.groupId)
          })
          return
        }
        if (item.type == 2 && item.flowType == 2) {
          let bodyText = JSON.parse(res.data.bodyText)
          this.drawer = false
          this.$router.push('/workFlow/entrust?config=' + bodyText.type)
        } else {
          if (item.type == 1 || item.type == 3) {
            this.formVisible = true
            this.$nextTick(() => {
              this.$refs.Form.init(item.id)
            })
          } else {
            if (!res.data.bodyText) return
            this.drawer = false
            const Base64 = require('js-base64').Base64
            this.$router.push('/workFlowDetail?config=' + encodeURIComponent(Base64.encode(res.data.bodyText)))
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.MessageRecord-container {
  .JNPF-common-layout-main {
    padding: 0;
  }
  .messageRecord-tab {
    height: 100%;
    >>> .el-tabs__content {
      padding: 0;
      height: calc(100% - 40px);
      .box {
        flex: 1;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding-bottom: 10px;
      }
    }
  }
}
</style>
