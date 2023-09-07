<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack" :content="!flowVisible?title+'的版本管理':'流程图'" />
        <div class="options">
          <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
        </div>
      </div>
      <div class="main" v-if="!flowVisible">
        <el-row class="JNPF-common-search-box" :gutter="16">
          <el-form @submit.native.prevent>
            <el-col :span="6">
              <el-form-item label="关键词">
                <el-input v-model="keyword" placeholder="请输入关键词查询" clearable
                  @keyup.enter.native="search()" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="创建时间">
                <el-date-picker v-model="pickerVal" type="daterange" start-placeholder="开始日期"
                  end-placeholder="结束日期" :picker-options="pickerOptions" value-format="timestamp"
                  clearable :editable="false">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="所属流程">
                <el-select v-model="flowId" placeholder="选择所属流程" filterable>
                  <el-option v-for="item in templateList" :key="item.id" :label="item.fullName"
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
        <JNPF-table v-loading="listLoading" :data="list">
          <el-table-column prop="version" label="版本号" align="center">
            <template slot-scope="scope">
              <el-tag>V:{{scope.row.version}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="enabledMark" label="主版本" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.enabledMark==1?'是':'否'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="creatorUser" label="创建人" />
          <el-table-column prop="creatorTime" label="创建时间" :formatter="jnpf.tableDateFormat" />
          <el-table-column prop="lastModifyTime" label="最后修改时间" :formatter="jnpf.tableDateFormat" />
          <el-table-column label="操作" fixed="right" width="200">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click.native="updateRelease(scope.row)"
                :disabled="scope.row.enabledMark==1">设为主版本
              </el-button>
              <el-button type="text" v-if="scope.row.enabledMark==1" size="mini"
                @click.native="del(scope.row)" :disabled="scope.row.enabledMark==1">
                删除
              </el-button>
              <el-button type="text" v-else size="mini" @click.native="del(scope.row)"
                style="color:red">
                删除
              </el-button>
              <el-dropdown>
                <span class="el-dropdown-link">
                  <el-button type="text" size="mini">{{$t('common.moreBtn')}}<i
                      class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="flowInfo(scope.row)"> 流程图</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage"
          :limit.sync="listQuery.pageSize" @pagination="initData" />
      </div>
      <div class="main" v-else>
        <Process :conf="flowTemplateJson" />
      </div>
    </div>
  </transition>
</template>

<script>
import Process from '@/components/Process/Preview'
import { getFormById } from '@/api/workFlow/FormDesign'
import { flowJsonList, mainVersion, delVersion, getFlowList } from '@/api/workFlow/FlowEngine'
export default {
  components: { Process },
  props: [],
  data() {
    return {
      flowVisible: false,
      id: '',
      title: '',
      list: [],
      total: 0,
      listLoading: false,
      btnLoading: false,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      startTime: '',
      endTime: '',
      keyword: '',
      flowId: '',
      enCode: '',
      pickerVal: '',
      flowTemplateJson: {},
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
      templateList: []
    }
  },
  methods: {
    updateRelease(item) {
      this.$confirm('启用后，新发起的流程将按此版本流转。未审批完的流程，按原来的版本流转。', '系统提示', {
        type: 'warning'
      }).then(() => {
        mainVersion(item.id).then(res => {
          if (res.code == 200) {
            this.$message({
              type: 'success',
              message: res.msg
            });
            this.initData()
          }
        })
      }).catch(() => { });
    },
    del(item) {
      this.$confirm('此操作将永久删除该数据，是否继续？', '系统提示', {
        type: 'warning'
      }).then(() => {
        delVersion(item.id).then(res => {
          if (res.code == 200) {
            this.$message({
              type: 'success',
              message: res.msg
            });
            this.initData()
          }
        })
      })
    },
    flowInfo(item) {
      this.flowVisible = true
      this.flowTemplateJson = item.flowTemplateJson ? JSON.parse(item.flowTemplateJson) : null
    },
    goBack() {
      if (this.flowVisible) {
        return this.flowVisible = false
      }
      this.$emit('close', true)
    },
    init(id, fullName, type) {
      this.title = fullName
      this.listLoading = true
      if (type) {
        this.id = id
        getFlowList(this.id).then(res => {
          this.templateList = res.data
          if (!this.templateList.length) {
            this.$message({
              type: 'error',
              message: '流程未设计，请先设计流程'
            });
            return this.listLoading = false
          }
          this.flowId = this.templateList[0].id
          this.initData()
        }).catch(() => { this.listLoading = false });
      } else {
        getFormById(id).then(data => {
          this.id = data.data && data.data.id
          getFlowList(this.id).then(res => {
            this.templateList = res.data
            if (!this.templateList.length) {
              this.$message({
                type: 'error',
                message: '流程未设计，请先设计流程'
              });
              return this.listLoading = false
            }
            this.flowId = this.templateList[0].id
            this.initData()
          }).catch(() => { this.listLoading = false });
        }).catch(() => { this.listLoading = false });
      }
    },
    reset() {
      this.pickerVal = ''
      this.startTime = ''
      this.endTime = ''
      this.keyword = ''
      this.listQuery = {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      this.search()
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
        sort: 'desc',
        sidx: ''
      }
      this.initData()
    },
    initData() {
      this.listLoading = true
      let query = {
        ...this.listQuery,
        startTime: this.startTime,
        endTime: this.endTime,
        keyword: this.keyword,
        templateId: this.id,
        flowId: this.flowId
      }
      flowJsonList(this.id, query).then((res) => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      })
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
  .JNPF-common-search-box {
    border-bottom: 1px solid #dcdfe6;
  }
  >>> .el-table {
    flex: 1;
    border-top: none;
  }
  >>> .tips-item {
    display: none;
  }
  >>> .flow-container {
    display: inline-block;
    background: #fff;
    width: 100%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-align: center;
    overflow: auto;
    margin-top: 30px;
  }
  >>> .tips {
    position: absolute;
    left: 9px;
    top: -1px;
    z-index: 199;
    text-align: left;
  }
  >>> .scale-slider {
    position: fixed;
    right: 10px;
    z-index: 199;
    margin-top: -20px;
  }
}
.flow-text {
  font-size: 18px;
}
</style>
