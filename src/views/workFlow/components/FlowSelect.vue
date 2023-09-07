<template>
  <div class="popupSelect-container">
    <div class="el-select" @click.stop="flowSelect">
      <div class="el-select__tags" v-if="multiple" ref="tags"
        :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%',cursor:'pointer' }">
        <transition-group @after-leave="resetInputHeight" v-if="!collapseTags">
          <el-tag v-for="(item,i) in tagsList" :key="item.id" :size="collapseTagSize"
            :closable="!selectDisabled" type="info" @close="deleteTag($event, i)"
            disable-transitions>
            <span
              class="el-select__tags-text">{{item.fullName.length>20?item.fullName.substring(0,19)+'...':item.fullName}}/{{item.enCode.length>30?item.enCode.substring(0,30)+'...':item.enCode}}</span>
          </el-tag>
        </transition-group>
      </div>
      <el-input ref="reference" v-model="innerValue" type="text" :placeholder="currentPlaceholder"
        :disabled="selectDisabled" readonly :validate-event="false"
        :tabindex="(multiple) ? '-1' : null" @mouseenter.native="inputHovering = true"
        @mouseleave.native="inputHovering = false">
        <template slot="suffix">
          <i v-show="!showClose"
            :class="['el-select__caret', 'el-input__icon', 'el-icon-arrow-up']"></i>
          <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close"
            @click="handleClearClick"></i>
        </template>
      </el-input>
    </div>
    <el-dialog title="委托流程" :visible.sync="visible" :before-close="cancelConfirm"
      class="JNPF-dialog JNPF-dialog_center JNPF-dialog-tree-select" lock-scroll append-to-body
      width="1000px">
      <div class="JNPF-common-layout">
        <div class="JNPF-common-layout-left" style="width: 150px;">
          <el-scrollbar class="JNPF-common-el-tree-scrollbar " v-loading="treeLoading">
            <el-tree ref="treeBox" :data="categoryList" default-expand-all :current-node-key="0"
              highlight-current :expand-on-click-node="false" node-key="id" lock-scroll
              @node-click="handleNodeClick" class="JNPF-common-el-tree">
              <span class="custom-tree-node" slot-scope="{ data }" :title="data.fullName">
                <span class="text" :title="data.fullName" style="margin-left:20px">
                  {{data.fullName}}
                </span>
              </span>
            </el-tree>
          </el-scrollbar>
        </div>
        <div class="JNPF-common-layout-center">
          <el-row class="JNPF-common-search-box" :gutter="16">
            <el-form @submit.native.prevent>
              <el-col :span="8">
                <el-form-item label="关键词">
                  <el-input v-model="keyword" placeholder="请输入关键词查询" clearable
                    @keyup.enter.native="search()" class="search-input" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" @click="search()">查询</el-button>
                  <el-button icon="el-icon-refresh-right" @click="reset()">重置</el-button>
                </el-form-item>
              </el-col>
            </el-form>
            <div class="JNPF-common-search-box-right">
              <el-tooltip effect="dark" content="刷新" placement="top">
                <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                  @click="initData()" />
              </el-tooltip>
            </div>
          </el-row>
          <div class="JNPF-common-layout-main JNPF-flex-main">

            <JNPF-table v-loading="listLoading" :data="tableData" :border="false"
              highlight-current-row ref="multipleTable" @select="handleSelection"
              @select-all="handleSelectionAll" :hasNO="false" has-c>
              <el-table-column prop="fullName" label="流程名称" />
              <el-table-column prop="enCode" label="流程编码" />
              <el-table-column prop="type" label="流程类型" width="120">
                <template slot-scope="scope">
                  <span>{{ scope.row.type == 0? "发起流程" : "功能流程" }}</span>
                </template>
              </el-table-column>
            </JNPF-table>
            <pagination :total="total" :page.sync="listQuery.currentPage"
              :limit.sync="listQuery.pageSize" @pagination="initData" />
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelConfirm()">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="confirm()">{{$t('common.confirmButton')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
import { FlowEngineAll, FlowEngineListByIds } from '@/api/workFlow/FlowEngine'
export default {
  name: 'flowSelect',
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  props: {
    value: {
      type: Array,
      default: []
    },
    name: {
      type: String,
      default: ''
    },
    clearable: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    collapseTags: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '全部流程'
    },
  },
  data() {
    return {
      tableData: [],
      innerValue: '',
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
      },
      keyword: '',
      total: 0,
      listLoading: false,
      query: {
        categoryId: '',
        keyword: '',
      },
      treeLoading: false,
      visible: false,
      multipleSelection: '',
      categoryList: [],
      selectedData: [],
      tagsList: [],
      inputWidth: 0,
    }
  },
  watch: {
    value(val) {
      this.setDefault()
    },
    selectDisabled() {
      this.$nextTick(() => {
        this.resetInputHeight();
      });
    },

  },
  computed: {
    showClose() {
      let hasValue = this.multiple
        ? Array.isArray(this.value) && this.value.length > 0
        : this.value !== undefined && this.value !== null && this.value !== '';
      let criteria = this.clearable &&
        !this.selectDisabled &&
        this.inputHovering &&
        hasValue;
      return criteria;
    },
    currentPlaceholder() {
      if (this.multiple && Array.isArray(this.value) && this.value.length) {
        return ''
      } else {
        return this.placeholder
      }
    },
    selectDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },
    selectSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    },
    collapseTagSize() {
      return ['small', 'mini'].indexOf(this.selectSize) > -1
        ? 'mini'
        : 'small';
    },
  },
  created() {
    this.getDictionaryData()
    this.setDefault()
  },
  mounted() {
    addResizeListener(this.$el, this.handleResize);
    const reference = this.$refs.reference;
    if (reference && reference.$el) {
      const sizeMap = {
        medium: 36,
        small: 32,
        mini: 28
      };
      const input = reference.$el.querySelector('input');
      this.initialInputHeight = input.getBoundingClientRect().height || sizeMap[this.selectSize];
    }
    if (this.multiple) {
      this.resetInputHeight();
    }
    this.$nextTick(() => {
      if (reference && reference.$el) {
        this.inputWidth = reference.$el.getBoundingClientRect().width;
      }
    });
    this.setDefault()
  },
  beforeDestroy() {
    if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize);
  },
  methods: {
    initData() {
      this.listLoading = true
      this.tableData = []
      let query = {
        ...this.listQuery,
        keyword: this.keyword,
        category: this.categoryId ? this.categoryId : ""
      }
      FlowEngineAll(query).then((res) => {
        this.tableData = res.data.list
        this.total = res.data.pagination.total
        if (this.tableData.length && this.selectedData.length) {
          let arr = []
          this.$nextTick(() => {
            this.tableData.forEach(row => {  // 循环嵌套
              this.selectedData.forEach(item => {
                if (row.id === item.id) { // 判断哪些数据是需要回显的
                  arr.push(row)
                  this.$refs.multipleTable.$refs.JNPFTable.toggleRowSelection(row, true)
                }
              })
            })
          })
        }
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    setDefault() {
      if (!this.value || !this.value.length) {
        this.innerValue = ''
        this.selectedData = []
        this.tagsList = []
        return
      }
      const arr = this.multiple ? this.value : [this.value]
      FlowEngineListByIds(arr).then((res) => {
        this.selectedData = res.data
        if (this.multiple) {
          this.innerValue = ''
          this.tagsList = JSON.parse(JSON.stringify(this.selectedData))
        } else {
          this.innerValue = this.selectedData.length ? this.selectedData[0].fullName : ''
        }
        this.$nextTick(() => {
          if (this.multiple) {
            this.resetInputHeight();
          }
        })

      })
    },

    flowSelect() {
      this.visible = true
      this.reset()
    },
    getDictionaryData() {
      this.$store.dispatch('base/getDictionaryData', { sort: 'WorkFlowCategory' }).then((res) => {
        this.categoryList.push({
          id: 0,
          encode: "all",
          fullName: "全部流程",
        })

        this.categoryList.push(...res)
      })
      this.categoryId = 0
    },
    handleNodeClick(data) {
      this.categoryId = data.id ? data.id : 0
      this.initData()

    },
    reset() {
      this.keyword = ''
      this.search()
    },
    search() {
      this.listQuery.currentPage = 1
      this.listQuery.pageSize = 20
      this.listQuery.sort = 'desc'
      this.initData()
    },
    handleSelection(selection, val) {
      const index = this.selectedData.findIndex((item) => {
        return item.id == val.id
      })
      if (index == -1) {
        this.selectedData.push(val)
      } else {
        this.selectedData.splice(index, 1)
      }
      this.selectedData = [...new Set(this.selectedData)]
    },

    handleSelectionAll(selection) {
      if (selection.length) {
        if (this.selectedData.length) {
          this.selectedData.forEach((item, index) => {
            selection.forEach(it => {
              if (item.id != it.id) {
                this.selectedData.push(it)
              }
            });
          });
        } else {
          this.selectedData.push(...selection)
        }
      } else {
        if (this.selectedData.length && this.tableData.length) {
          this.tableData.forEach(item => {
            const index = this.selectedData.findIndex((it) => {
              return item.id == it.id
            })
            if (index != -1) {
              this.selectedData.splice(index, 1)
            }
          });
        }
      }
      const map = new Map()
      this.selectedData = this.selectedData.filter(key => !map.has(key.id) && map.set(key.id))
    },
    //确定
    confirm() {
      if (this.multiple) {
        this.innerValue = ''
        this.tagsList = JSON.parse(JSON.stringify(this.selectedData))
        let selectedIds = this.selectedData.map(o => o.id)
        this.$emit('input', selectedIds)
        this.$emit('changeName', this.tagsList)
      } else {
        if (!this.selectedData.length) {
          this.innerValue = ''
          this.$emit('input', '')
          this.$emit('changeName', '', {})
          this.visible = false
          return
        }
        this.innerValue = this.selectedData[0].fullName
        let selectedIds = this.selectedData.map(o => o.id)
        this.$emit('input', selectedIds[0])
        this.$emit('changeName', this.tagsList)
      }
      this.visible = false
    },
    cancelConfirm() {
      this.setDefault()
      this.visible = false
    },

    removeAll() {
      this.selectedData = []
    },
    removeData(index) {
      this.selectedData.splice(index, 1)
    },
    deleteTag(event, index) {
      this.selectedData.splice(index, 1)
      this.confirm()
      event.stopPropagation();
    },
    handleClearClick(event) {
      this.selectedData = []
      this.confirm()
      event.stopPropagation();
    },
    resetInputWidth() {
      this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
    },
    handleResize() {
      this.resetInputWidth();
      if (this.multiple) this.resetInputHeight();
    },
    resetInputHeight() {
      if (this.collapseTags) return;
      this.$nextTick(() => {
        if (!this.$refs.reference) return;
        let inputChildNodes = this.$refs.reference.$el.childNodes;
        let input = [].filter.call(inputChildNodes, item => item.tagName === 'INPUT')[0];
        const tags = this.$refs.tags;
        const tagsHeight = tags ? Math.round(tags.getBoundingClientRect().height) : 0;
        const sizeInMap = this.initialInputHeight || 40;
        input.style.height = this.selectedData.length === 0
          ? sizeInMap + 'px'
          : Math.max(
            tags ? (tagsHeight + (tagsHeight > sizeInMap ? 6 : 0)) : 0,
            sizeInMap
          ) + 'px';
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.flow_category {
  height: 30px;
  width: 100%;
  line-height: 30px;
  text-align: center;
  border-bottom: 1px solid #dcdfe6;
}
</style>