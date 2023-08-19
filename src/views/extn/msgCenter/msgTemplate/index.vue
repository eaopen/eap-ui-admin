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
            <el-form-item label="消息来源">
              <el-select v-model="messageSource" placeholder="请选择消息来源" clearable filterable>
                <el-option v-for="(item,index) in messageSourceList" :key="index"
                  :label="item.fullName" :value="item.enCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="消息类型">
              <el-select v-model="msgType" placeholder="请选择消息类型" clearable filterable>
                <el-option v-for="(item,index) in msgTypeList" :key="index" :label="item.fullName"
                  :value="item.enCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <template v-if="showAll">
            <el-col :span="6">
              <el-form-item label="模板类型">
                <el-select v-model="templateType" placeholder="请选择模板类型" clearable filterable>
                  <el-option v-for="(item,index) in templateTypeList" :key="index"
                    :label="item.fullName" :value="item.enCode">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="enabledMarkLabel">
                <el-select v-model="enabledMark" placeholder="请选择状态" clearable filterable>
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
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <topOpts @add="addEditTemplate()"></topOpts>
          <div class="JNPF-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="list">
          <el-table-column prop="fullName" label="名称" show-overflow-tooltip min-width="200" />
          <el-table-column prop="enCode" label="编码" width="180" />
          <el-table-column prop="messageSource" label="消息来源" width="100" />
          <el-table-column prop="messageType" label="消息类型" width="100" />
          <el-table-column prop="category" label="模板类型" width="100">
            <template slot-scope="scope">
              {{scope.row.templateType=='1'?'系统模板':'自定义模板'}}
            </template>
          </el-table-column>
          <el-table-column prop="creatorUser" label="创建人" width="120" />
          <el-table-column prop="creatorTime" label="创建时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="lastModifyTime" label="最后修改时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="sortCode" label="排序" width="70" align="center" />
          <el-table-column prop="enabledMark" label="状态" width="70" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.enabledMark == 1 ? 'success' : 'danger'" disable-transitions>
                {{scope.row.enabledMark==1?'启用':'禁用'}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <tableOpts @edit="addEditTemplate(scope.row.id)"
                @del="handleDel(scope.$index,scope.row.id)"
                :editDisabled="scope.row.templateType == '1'"
                :delDisabled="scope.row.templateType == '1'">
                <el-dropdown>
                  <el-button type="text" size="mini">
                    {{$t('common.moreBtn')}}<i class="el-icon-arrow-down el-icon--right" />
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="handleCopy(scope.row.id)">
                      复制</el-dropdown-item>
                    <el-dropdown-item @click.native="handleView(scope.row.id)">
                      详情</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </tableOpts>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage"
          :limit.sync="listQuery.pageSize" @pagination="initData" />
        <Form v-if="formVisible" ref="Form" @close="closeForm" />
        <Detail v-if="viewVisible" ref="View" @close="closeViewForm" />
      </div>
    </div>
  </div>
</template>
<script>
import { getMsgTemplateList, delMsgTemplate, copyMsgTemplate, getMsgTypeList } from '@/api/extn/msgTemplate'
import Form from './Form'
import Detail from './Detail'
export default {
  name: 'system-mesCenter-msgTemplate',
  components: { Form, Detail },
  data() {
    return {
      keyword: '',
      templateType: "",
      templateTypeList: [
        { fullName: "系统模板", enCode: '1' },
        { fullName: "自定义模板", enCode: '0' }
      ],
      enabledMark: "",
      enabledMarkList: [
        { fullName: "启用", enCode: '1' },
        { fullName: "禁用", enCode: '0' },
      ],
      msgType: "",
      msgTypeList: [],
      messageSource: "",
      messageSourceList: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
      },
      formVisible: false,
      viewVisible: false,
      showAll: false,
      enabledMarkLabel: '状\u3000态'
    }
  },
  created() {
    this.initData()
    this.getMsgTypeList()
  },
  methods: {
    initData() {
      this.listLoading = true
      let query = {
        ...this.listQuery,
        keyword: this.keyword
      }
      getMsgTemplateList(query).then(res => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      })
    },
    getMsgTypeList() {
      this.$store.dispatch('base/getMsgTypeList').then((res) => {
        this.msgTypeList = res
      })
      getMsgTypeList(4).then(res => {
        this.messageSourceList = res.data
      })
    },
    search() {
      this.listQuery = {
        currentPage: 1,
        pageSize: 20,
        templateType: this.templateType,
        messageType: this.msgType,
        enabledMark: this.enabledMark,
        messageSource: this.messageSource,
      }
      this.initData()
    },
    reset() {
      this.keyword = ''
      this.templateType = ""
      this.messageSource = ""
      this.msgType = ""
      this.enabledMark = ""
      this.search()
    },
    handleDel(index, id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        delMsgTemplate(id).then(res => {
          this.list.splice(index, 1)
          this.total--
          this.$message({
            type: 'success',
            message: res.msg
          })
        })
      }).catch(() => { });
    },
    handleCopy(id) {
      this.$confirm('您确定要复制该数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        copyMsgTemplate(id).then(res => {
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
    handleView(id) {
      this.viewVisible = true
      this.$nextTick(() => {
        this.$refs.View.init(id, this.msgTypeList)
      })
    },
    /**
     * 新增/修改 打开弹窗
     * @param {*} id  编辑id
     */
    addEditTemplate(id) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(id)
      })
    },
    closeForm(isRefresh) {
      this.formVisible = false
      if (isRefresh) this.initData()
    },
    closeViewForm() {
      this.viewVisible = false
    }
  }
}
</script>