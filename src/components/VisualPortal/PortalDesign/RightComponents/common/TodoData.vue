<template>
  <div>
    <el-dialog title="选项设置" :close-on-click-modal="false" :visible.sync="visible"
      class="OBPM-dialog JNPF-dialog_center todoData" lock-scroll width="1000px" append-to-body>
      <JNPF-table :data="list" ref="dragTable" :hasNO="false" row-key="id">
        <el-table-column align="center" label="拖动" width="50">
          <template>
            <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
              title='点击拖动' />
          </template>
        </el-table-column>
        <el-table-column prop="field" label="名称" width="250px">
          <template slot-scope="scope">
            <el-input v-model="scope.row.fullName" placeholder="请输入名称" maxlength="50" />
          </template>
        </el-table-column>
        <el-table-column prop="dataType" label="分类" width="250px">
          <template slot-scope="scope">
            <el-select v-if="scope.row.id!=2" filterable v-model="scope.row.category"
              placeholder="请选择分类" multiple clearable>
              <el-option v-for="item in categoryList" :key="item.id" :label="item.fullName"
                :value="item.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="dataLength" label="隐藏" width="70">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.noShow" />
          </template>
        </el-table-column>
        <el-table-column prop="field" label="图标">
          <template slot-scope="scope">
            <el-input v-model="scope.row.icon" placeholder="请输入图标名称">
              <el-button slot="append" @click="openIconsDialog(scope.row.icon,scope.$index)">
                选择
              </el-button>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column label="图标背景色" width="80px">
          <template slot-scope="scope">
            <el-color-picker class="color-picker" v-model="scope.row.iconBgColor" />
          </template>
        </el-table-column>
      </JNPF-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">{{$t('common.cancelBtn')}}</el-button>
        <el-button type="primary" @click="confirm">{{$t('common.confirmBtn')}}</el-button>
      </span>
    </el-dialog>
    <iconBox :visible.sync="iconsVisible" :current="currentIcon" @choiceIcon="setIcon" />
  </div>
</template>

<script>
import iconBox from '@/components/extn/iconBox'
import Sortable from 'sortablejs'
export default {
  components: { iconBox },
  data() {
    return {
      visible: false,
      list: [],
      categoryList: [],
      iconsVisible: false,
      currentIcon: '',
      currentIndex: ''
    }
  },
  methods: {
    init(data) {
      this.list = JSON.parse(JSON.stringify(data))
      this.getDictionaryData()
      this.visible = true
      this.$nextTick(() => {
        this.setSort()
      })
    },
    getDictionaryData() {
      this.$store.dispatch('dict/getDictionaryData', { sort: 'WorkFlowCategory' }).then((res) => {
        this.categoryList = res
      })
    },
    confirm() {
      for (let i = 0; i < this.list.length; i++) {
        const element = this.list[i];
        if (!element.fullName) return this.$message.warning('名称不能为空')
        if (!element.icon) return this.$message.warning('请选择图标')
        if (!element.iconBgColor) return this.$message.warning('请选择图标背景色')
      }
      this.visible = false
      this.$emit('refresh', this.list)
    },
    openIconsDialog(icon, index) {
      this.currentIcon = icon
      this.currentIndex = index
      this.iconsVisible = true
    },
    setIcon(val) {
      this.list[this.currentIndex].icon = val
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.list.splice(evt.oldIndex, 1)[0]
          this.list.splice(evt.newIndex, 0, targetRow)
        },
        handle: '.drag-handler',
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.todoData {
  >>> .el-dialog__body {
    padding: 0 !important;
    height: 50vh;
  }
  .color-picker {
    display: flex;
  }
}
>>> .preview {
  border: 1px solid #dcdfe6;
}
>>> .json-editor {
  height: 430px;
  overflow: auto;
}
</style>