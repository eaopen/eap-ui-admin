<template>
  <div class="main">
    <template v-if="config.popupType==='dialog'">
      <el-dialog :title="config.popupTitle" :close-on-click-modal="false" :visible.sync="visible"
        class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body :width='config.popupWidth'
        @close="$emit('close')">
        <el-row class="JNPF-common-search-box" :gutter="16">
          <el-form @submit.native.prevent>
            <el-col :span="10">
              <el-form-item label="关键词">
                <el-input v-model="listQuery.keyword" placeholder="请输入关键词搜索" clearable
                  @keyup.enter.native="search()" class="search-input" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="search()">
                  {{$t('common.search')}}
                </el-button>
                <el-button icon="el-icon-refresh-right" @click="reset()">{{$t('common.reset')}}
                </el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
        <JNPF-table v-loading="listLoading" :data="list" hasC
          @selection-change="handleSelectionChange">
          <el-table-column :prop="item.value" :label="item.label"
            v-for="(item,i) in config.columnOptions" :key="i" />
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage"
          :limit.sync="listQuery.pageSize" @pagination="initData" v-if="config.hasPage"
          :pager-count="5" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
          <el-button type="primary" @click="select()" :loading="btnLoading">
            {{$t('common.confirmButton')}}</el-button>
        </span>
      </el-dialog>
    </template>
    <template v-if="config.popupType==='drawer'">
      <el-drawer :title="config.popupTitle" :visible.sync="visible" :wrapperClosable="false"
        ref="drawer" :size='config.popupWidth' append-to-body class="JNPF-common-drawer"
        @close="$emit('close')">
        <div class="JNPF-flex-main">
          <el-row class="JNPF-common-search-box" :gutter="16">
            <el-form @submit.native.prevent>
              <el-col :span="10">
                <el-form-item label="关键词">
                  <el-input v-model="listQuery.keyword" placeholder="请输入关键词搜索" clearable
                    @keyup.enter.native="search()" class="search-input" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" @click="search()">
                    {{$t('common.search')}}
                  </el-button>
                  <el-button icon="el-icon-refresh-right" @click="reset()">{{$t('common.reset')}}
                  </el-button>
                </el-form-item>
              </el-col>
            </el-form>
          </el-row>
          <JNPF-table v-loading="listLoading" :data="list" hasC
            @selection-change="handleSelectionChange">
            <el-table-column :prop="item.value" :label="item.label"
              v-for="(item,i) in config.columnOptions" :key="i" />
          </JNPF-table>
          <pagination :total="total" :page.sync="listQuery.currentPage"
            :limit.sync="listQuery.pageSize" @pagination="initData" v-if="config.hasPage" />
          <div class="drawer-footer">
            <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
            <el-button type="primary" @click="select()" :loading="btnLoading">
              {{$t('common.confirmButton')}}</el-button>
          </div>
        </div>
      </el-drawer>
    </template>
  </div>
</template>

<script>
import { getDataInterfaceDataSelect } from '@/api/extn/system'
import { mapGetters } from "vuex"
export default {
  name: 'SelectDialog',
  props: {
    config: {
      type: Object,
      default: () => { }
    },
    formData: Object,
    multiple: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false,
      listLoading: true,
      btnLoading: false,
      listQuery: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      list: [],
      total: 0,
      checked: []
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  methods: {
    init() {
      this.listQuery.keyword = ''
      this.listQuery.pageSize = this.config.hasPage ? this.config.pageSize : 10000
      this.visible = true
      this.btnLoading = false
      this.initData()
    },
    initData() {
      if (!this.config.interfaceId) return
      this.listLoading = true
      const paramList = this.getParamList()
      const columnOptions = this.config.columnOptions.map(o => o.value)
      let query = {
        ...this.listQuery,
        interfaceId: this.config.interfaceId,
        columnOptions: columnOptions.join(','),
        paramList
      }
      getDataInterfaceDataSelect(this.config.interfaceId, query).then(res => {
        this.list = res.data.list
        if (this.config.hasPage) this.total = res.data.pagination.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    getParamList() {
      let templateJson = this.config.templateJson
      for (let i = 0; i < templateJson.length; i++) {
        templateJson[i].defaultValue = this.formData[templateJson[i].relationField] || ''
        if (templateJson[i].jnpfKey === 'createUser') {
          templateJson[i].defaultValue = this.userInfo.userId
        }
        if (templateJson[i].jnpfKey === 'createTime') {
          templateJson[i].defaultValue = new Date().getTime()
        }
        if (templateJson[i].jnpfKey === 'currOrganize') {
          templateJson[i].defaultValue = this.userInfo.organizeId
        }
        if (templateJson[i].jnpfKey === 'currPosition') {
          if (this.userInfo.positionIds && this.userInfo.positionIds.length) {
            let item = this.userInfo.positionIds[0]
            templateJson[i].defaultValue = item.id
          }
        }
      }
      return templateJson
    },
    select() {
      if (!this.checked.length) return
      this.btnLoading = true
      this.visible = false
      let checked = []
      for (let i = 0; i < this.checked.length; i++) {
        const e = this.checked[i]
        let item = {}
        for (let j = 0; j < this.config.relationOptions.length; j++) {
          const row = this.config.relationOptions[j]
          item[row.field] = row.type === 1 ? e[row.value] : row.value
        }
        checked.push(item)
      }
      this.$emit('close')
      this.$emit('select', checked)
    },
    handleSelectionChange(val) {
      this.checked = val
    },
    search() {
      this.listQuery.currentPage = 1
      this.listQuery.pageSize = this.config.hasPage ? this.config.pageSize : 10000
      this.initData()
    },
    reset() {
      this.listQuery.keyword = ''
      this.search()
    },
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  height: 70vh;
  padding: 0 0 10px !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .JNPF-common-search-box {
    margin-bottom: 0;
    .JNPF-common-search-box-right {
      padding: 10px 10px 0 0;
    }
  }
  .el-table {
    border-top: none !important;
  }
}
</style>