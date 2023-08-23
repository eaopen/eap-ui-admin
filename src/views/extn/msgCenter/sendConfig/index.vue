<template>
  <div class="OBPM-common-layout">
    <div class="OBPM-common-layout-center">
      <el-row class="OBPM-common-search-box" :gutter="16">
        <el-form @submit.native.prevent>
          <el-col :span="6">
            <el-form-item label="关键词">
              <el-input v-model="listQuery.keyword" placeholder="请输入关键词查询" clearable
                @keyup.enter.native="search()" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="消息来源">
              <el-select v-model="listQuery.messageSource" placeholder="请选择消息来源" clearable
                filterable>
                <el-option v-for="(item,index) in messageSourceList" :key="index"
                  :label="item.fullName" :value="item.enCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="模板类型">
              <el-select v-model="listQuery.templateType" placeholder="请选择模板类型" clearable
                filterable>
                <el-option v-for="(item,index) in templateTypeList" :key="index"
                  :label="item.fullName" :value="item.enCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <template v-if="showAll">
            <el-col :span="6">
              <el-form-item label="状态">
                <el-select v-model="listQuery.enabledMark" placeholder="请选择状态" clearable filterable>
                  <el-option v-for="(item,index) in enabledMarkList" :key="index"
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
      <div class="OBPM-common-layout-main JNPF-flex-main">
        <div class="OBPM-common-head">
          <topOpts @add="addEditData()"></topOpts>
          <div class="OBPM-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="list" max-height="100%">
          <el-table-column prop="fullName" label="名称" show-overflow-tooltip min-width="200" />
          <el-table-column prop="enCode" label="编码" width="180" />
          <el-table-column prop="messageSource" label="消息来源" width="100" />
          <el-table-column prop="templateType" label="模板类型" width="100">
            <template slot-scope="scope">
              {{scope.row.templateType=='1'?'系统模板':'自定义模板'}}
            </template>
          </el-table-column>
          <el-table-column prop="messageType" label="消息类型" min-width="380">
            <template slot-scope="scope">
              <span class="my-span-tag" :style="{'background':colorList[item.type]}"
                v-for="(item,index) in scope.row.messageType" :key="index">
                {{item.fullName}}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="creatorUser" label="创建人" width="120" />
          <el-table-column prop="creatorTime" label="创建时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="lastModifyTime" label="最后修改时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="sortCode" label="排序" width="70" align="center" />
          <el-table-column prop="enabledMark" label="状态" width="80" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.enabledMark==1?'success':'danger'" disable-transitions>
                {{ scope.row.enabledMark==1?'启用':'禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <tableOpts @edit="addEditData(scope.row.id)" @del="handleDel(scope.row.id)"
                :editDisabled="scope.row.templateType == '1'"
                :delDisabled="scope.row.templateType == '1'">
                <el-dropdown>
                  <el-button type="text" size="mini">
                    {{$t('common.moreBtn')}}<i class="el-icon-arrow-down el-icon--right" />
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="handleCopy(scope.row.id)">复制</el-dropdown-item>
                    <el-dropdown-item @click.native="handleTestSend(scope.row.id)">测试发送
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="handleView(scope.row.id)">详情</el-dropdown-item>
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
    <Form v-show="formVisible" ref="Form" @close="closeForm" />
    <TestSend v-if="testSendVisible" ref="TestSend" @close="testSendVisible=false" />
    <Detail v-if="viewVisible" ref="Detail" @close="viewVisible=false" />
  </div>
</template>
<script>
import { getSendConfigList, delMsgTemplate, copySendConfig } from '@/api/extn/sendConfig'
import { getMsgTypeList } from '@/api/extn/msgTemplate'
import Form from './Form'
import TestSend from './TestSend'
import Detail from './Detail'

export default {
  name: 'system--mesCenter-sendConfig',
  components: { Form, TestSend, Detail },
  data() {
    return {
      showAll: false,
      list: [],
      total: 0,
      btnLoading: false,
      listLoading: true,
      listQuery: {
        keyword: '',
        enabledMark: '',
        templateType: '',
        messageSource: '',
        currentPage: 1,
        pageSize: 20
      },
      formVisible: false,
      testSendVisible: false,
      viewVisible: false,
      templateTypeList: [
        { fullName: "系统模板", enCode: '1' },
        { fullName: "自定义模板", enCode: '0' }
      ],
      enabledMarkList: [
        { fullName: "启用", enCode: '1' },
        { fullName: "禁用", enCode: '0' },
      ],
      messageSourceList: [],
      colorList: ['', 'rgba(40, 112, 248, 0.1)', 'rgba(109, 224, 131, 0.1)', 'rgba(244, 130, 130, 0.1)',
        'rgba(104, 147, 245, 0.1)', 'rgba(100, 176, 244, 0.1)', 'rgba(255, 150, 178, 0.1)', 'rgba(156, 130, 244, 0.1)']
    }
  },
  created() {
    this.initData()
    this.getMsgTypeList()
  },
  methods: {
    initData() {
      this.listLoading = true
      getSendConfigList(this.listQuery).then(res => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
        this.btnLoading = false
      }).catch(() => {
        this.listLoading = false
        this.btnLoading = false
      })

    },
    getMsgTypeList() {
      getMsgTypeList(4).then(res => {
        this.messageSourceList = res.data
      })
    },
    addEditData(id) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(id)
      })
    },
    handleCopy(id) {
      this.$confirm('您确定要复制该数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        copySendConfig(id).then(res => {
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
    handleTestSend(id) {
      this.testSendVisible = true
      this.$nextTick(() => {
        this.$refs.TestSend.init(id)
      })
    },
    handleView(id) {
      this.viewVisible = true
      this.$nextTick(() => {
        this.$refs.Detail.init(id)
      })
    },
    handleDel(id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        delMsgTemplate(id).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1500,
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
      this.listQuery.templateType = ''
      this.listQuery.enabledMark = ''
      this.listQuery.messageSource = ''
      this.search()
    },
    closeForm(isRefresh) {
      this.formVisible = false
      if (isRefresh) this.initData()
    },
  }
}
</script>
<style lang="scss" scoped>
.my-span-tag {
  margin: 3px 8px 3px 0;
  color: #606266;
  height: 24px;
  padding: 0 8px;
  line-height: 24px;
  border-radius: 4px;
  white-space: nowrap;
  display: inline-block;
  font-size: 12px;
}
</style>