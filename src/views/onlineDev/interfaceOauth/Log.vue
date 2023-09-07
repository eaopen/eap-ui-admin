<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack()" :content="title" />
        <div class="options">
          <el-button @click="goBack()">{{$t('common.cancelBtn')}}</el-button>
        </div>
      </div>
      <div class="main">
        <el-row class="JNPF-common-search-box" :gutter="16">
          <el-form @submit.native.prevent>
            <el-col :span="6">
              <el-form-item label="关键词">
                <el-input v-model="listQuery.keyword" placeholder="请输入关键词查询" clearable @keyup.enter.native="search()" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="时间">
                <el-date-picker v-model="pickerVal" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" value-format="timestamp" clearable :editable="false" />
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
        <JNPF-table v-loading="listLoading" :data="list">
          <el-table-column prop="fullName" label="接口名称" width="150" show-overflow-tooltip />
          <el-table-column prop="enCode" label="接口编码" width="150" show-overflow-tooltip />
          <el-table-column prop="url" label="请求地址" width="300" show-overflow-tooltip />
          <el-table-column prop="invokTime" label="请求时间" :formatter="jnpf.tableDateFormat" width="120" />
          <!-- <el-table-column prop="userId" label="请求用户" width="120" /> -->
          <el-table-column prop="invokIp" label="请求IP" width="120" />
          <el-table-column prop="invokType" label="请求类型" width="80" align="center">
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.invokType=='GET'">GET</el-tag>
              <el-tag v-if="scope.row.invokType=='POST'">POST</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="invokWasteTime" label="耗时(毫秒)" width="80" />
          <el-table-column prop="invokDevice" label="请求设备" min-width="120" show-overflow-tooltip />
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="initData" />
      </div>
    </div>
  </transition>
</template>

<script>
import { dataInterfaceLog } from '@/api/extn/interfaceOauth'

export default {
  data() {
    return {
      id: '',
      title: '',
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        keyword: '',
        startTime: '',
        endTime: '',
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const start = new Date()
            const end = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const start = new Date()
            const end = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const start = new Date()
            const end = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      pickerVal: []
    }
  },
  methods: {
    goBack() {
      this.$emit('close')
    },
    init(data) {
      if (!data) return this.$emit('close')
      this.id = data.id
      this.title = data.appName
      this.initData()
    },
    initData() {
      this.listLoading = true
      if (this.id) {
        dataInterfaceLog(this.id, this.listQuery).then(res => {
          if (res.data) {
            res.data.list.forEach(item => {
              item.url = `${this.define.comUrl}/api/system/DataInterface/${item.id}/Actions/Response` + (item.tenantId ? '?tenantId=' + item.tenantId : '')
            })
            this.list = res.data.list
            this.total = res.data.pagination.total
          }

        })
      }
      this.listLoading = false
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
      this.listQuery.sort = 'desc'
      this.initData()
    },
    reset() {
      this.pickerVal = []
      this.listQuery.keyword = ''
      this.search()
    },
  }
}
</script>
<style lang="scss" scoped>
.main {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 0 10px;
  >>> .el-table {
    flex: 1;
    border-top: none;
  }
}
</style>