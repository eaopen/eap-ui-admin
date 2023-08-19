<template>
  <div class="popupSelect-container">
    <div class="el-select">
      <el-dialog :title="type==1?'查询条件选择':'显示内容选择'" :close-on-click-modal="false"
        :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center table-dialog" lock-scroll
        append-to-body width="600px" :modal-append-to-body="false" @close="onClose">
        <JNPF-table v-loading="listLoading" :data="list" :border="false" highlight-current-row
          row-key="__vModel__" ref="multipleTable" @selection-change="handleSelectionChange"
          class="table" :hasNO="false" has-c>
          <el-table-column type="index" width="50" label="序号" align="center" />
          <el-table-column label="字段" prop="__vModel__" align="left">
            <template slot-scope="scope">
              {{scope.row.__config__.label?scope.row.__vModel__+'('+scope.row.__config__.label+')':scope.row.__vModel__}}
            </template>
          </el-table-column>
        </JNPF-table>
        <span slot="footer" class="dialog-footer">
          <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
          <el-button type="primary" @click="confirm()">{{$t('common.confirmButton')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    type: {
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: true
    },
    collapseTags: {
      type: Boolean,
      default: false
    },
    selectedList: {
      type: Array,
      default: () => []
    },
    list: {
      type: Array,
      default: () => []
    },
    clearable: {
      type: Boolean,
      default: false
    },
    size: String,
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  data() {
    return {
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      treeData: [],
      allList: [],
      keyword: '',
      innerValue: '',
      visible: false,
      loading: false,
      props: {
        children: 'children',
        label: 'table',
        isLeaf: 'isLeaf'
      },
      listLoading: false,
      keyword: "",
      checked: "",
      checkedList: [],
      selectedData: [],
      tagsList: [],
      inputHovering: false,
      inputWidth: 0,
      initialInputHeight: 0,
      total: 0,
    }
  },
  computed: {
    showClose() {
      let hasValue = this.value !== undefined && this.value !== null && this.value !== '';
      let criteria = this.clearable &&
        !this.disabled &&
        this.inputHovering &&
        hasValue;
      return criteria;
    }
  },
  created() { },
  watch: {
    selectDisabled() {
      this.$nextTick(() => {
        this.resetInputHeight();
      });
    }
  },
  methods: {
    echoTable(rows) {
      rows.forEach(row => {
        this.$refs.multipleTable.$refs.JNPFTable.toggleRowSelection(row, true)
      })
    },
    closeDialog() {
      this.checked = "";
      this.selectedData = [];
      this.$emit("update:visible", false);
    },
    handleSelectionChange(val) {
      this.selectedData = val;
    },
    onClose() { },
    openDialog() {
      if (this.selectDisabled) return
      this.selectedData = this.selectedList
      if (!this.selectedData.length) this.selectedData = []
      this.visible = true
      this.$nextTick(() => {
        if (this.list) {
          this.list.forEach(i => { this.$refs.multipleTable.$refs.JNPFTable.toggleRowSelection(i, false) })
        }
        if (this.list.length && this.selectedList.length) {
          let selData = []
          this.list.forEach(i => {
            // 循环嵌套
            this.selectedList.forEach(item => {
              if (i.__vModel__ == item.__vModel__) { // 判断哪些数据是需要回显的
                selData.push(i)
              }
            })
          })
          this.echoTable(selData) // 调用回显方法
        }
      })
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.props.label].indexOf(value) !== -1;
    },
    confirm() {
      if (this.multiple) {
        this.innerValue = ''
        this.tagsList = JSON.parse(JSON.stringify(this.selectedData))
        let selectedIds = this.selectedData.map(o => o.id)
        this.$emit('input', selectedIds)
        this.$emit('change', selectedIds, this.selectedData)
        this.$emit('changeField', this.selectedData)
      }
      this.visible = false
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
    resetInputWidth() {
      this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
    },
    handleResize() {
      this.resetInputWidth();
      if (this.multiple) this.resetInputHeight();
    }
  }
}
</script>
<style lang="scss" scoped>
.table-dialog {
  >>> .el-dialog__body {
    height: 50vh;
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .JNPF-common-search-box {
      margin-bottom: 0;
      .JNPF-common-search-box-right {
        padding: 10px 10px 0 0;
      }
    }
  }
}
.table {
  margin-top: 20px;
}
</style>