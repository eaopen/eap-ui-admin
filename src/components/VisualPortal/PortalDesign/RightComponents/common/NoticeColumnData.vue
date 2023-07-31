<template>
  <el-dialog title="选项设置" :close-on-click-modal="false" :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center dialog_height" lock-scroll width="1000px" append-to-body>
    <JNPF-table :data="list" ref="dragNoticeTable" :hasNO="false" row-key="id">
      <el-table-column align="center" label="拖动" width="50" v-if="showType == 'pc' && type ==1">
        <template>
          <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
            title='点击拖动' />
        </template>
      </el-table-column>
      <el-table-column prop="fullName" label="名称">
        <template slot-scope="scope">
          <div style="display: flex;">
            <el-input v-model="scope.row.fullName" placeholder="请输入名称"
              :disabled="scope.row.filedName =='classify'?true:false" v-if="showType == 'pc'" />
            <el-input v-model="scope.row.fullName" placeholder="请输入名称" disabled
              v-if="showType == 'app'" />
            <el-select v-model="scope.row.classify" multiple placeholder="请选择类型"
              style="margin-left: 5px;" v-if="scope.row.filedName == 'classify'" filterable>
              <el-option v-for="item in classifyOptions" :key="item.enCode" :label="item.fullName"
                :value="item.enCode">
              </el-option>
            </el-select>
            <el-select v-model="scope.row.timeClassify" placeholder="请选择" style="margin-left: 5px;"
              v-if="scope.row.filedName == 'time'" filterable>
              <el-option v-for="item in timeOptions" :key="item.fullName" :label="item.fullName"
                :value="item.value">
              </el-option>
            </el-select>
            <el-select v-model="scope.row.userClassify" placeholder="请选择" style="margin-left: 5px;"
              v-if="scope.row.filedName == 'user'" filterable>
              <el-option v-for="item in userOptions" :key="item.value" :label="item.fullName"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <template v-if="showType == 'pc'">
        <template v-if="type !=1">
          <el-table-column label="是否显示" prop="show" width="70">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.show" v-if="scope.row.id != 2 && scope.row.id != 4">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="fontSize" label="大小" width="170">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.fontSize" placeholder="大小" :min="0" :precision="0"
                controls-position="right" style="width:100%"
                v-if="scope.row.filedName !== 'classify'" />
            </template>
          </el-table-column>
          <el-table-column prop="fontWeight" label="加粗" align="center" width="100">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.fontWeight" v-if="scope.row.filedName !== 'classify'" />
            </template>
          </el-table-column>
          <el-table-column prop="fontColor" label="颜色" align="center" width="100">
            <template slot-scope="scope">
              <el-color-picker v-model="scope.row.fontColor"
                v-if="scope.row.filedName !== 'classify'" />
            </template>
          </el-table-column>
        </template>
        <template v-if="type ==1">
          <el-table-column label="是否显示" prop="show" width="70">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.show">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="sortable" label="排序" width="60" align="center"
            v-if="showType == 'pc'">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.sortable" />
            </template>
          </el-table-column>
          <el-table-column prop="align" label="冻结方式" v-if="showType == 'pc'" width="110">
            <template slot-scope="scope">
              <el-select v-model="scope.row.fixed" placeholder="请选择"
                v-if="scope.row.filedName !== 'classify'" filterable>
                <el-option v-for="item in fixedOptions" :key="item.value" :label="item.fullName"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="align" label="对齐方式" v-if="showType == 'pc'" width="110">
            <template slot-scope="scope">
              <el-select v-model="scope.row.align" placeholder="请选择"
                v-if="scope.row.filedName !== 'classify'" filterable>
                <el-option v-for="item in alignOptions" :key="item.value" :label="item.fullName"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="width" label="宽度" width="110">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.width" placeholder="宽度" :min="0" :precision="0"
                controls-position="right" style="width:100%"
                v-if="scope.row.filedName !== 'classify'" />
            </template>
          </el-table-column>
        </template>
      </template>
      <template v-else>
        <el-table-column label="是否显示" prop="show" width="90">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.show" v-if="scope.row.filedName == 'classify'">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="fontSize" label="大小" width="170">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.fontSize" placeholder="大小" :min="0" :precision="0"
              controls-position="right" style="width:100%"
              v-if="scope.row.filedName !== 'classify'" />
          </template>
        </el-table-column>
        <el-table-column prop="fontWeight" label="加粗" align="center" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.fontWeight" v-if="scope.row.filedName !== 'classify'" />
          </template>
        </el-table-column>
        <el-table-column prop="fontColor" label="颜色" align="center" width="100">
          <template slot-scope="scope">
            <el-color-picker v-model="scope.row.fontColor"
              v-if="scope.row.filedName !== 'classify'" />
          </template>
        </el-table-column>
      </template>
    </JNPF-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="closeDialog()">{{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import Sortable from 'sortablejs'
export default {
  props: ['showType'],
  components: {},
  data() {
    return {
      visible: false,
      list: [],
      type: 1,
      fixedOptions: [
        {
          value: 'none',
          fullName: '无'
        }, {
          value: 'left',
          fullName: '左冻结'
        }, {
          value: 'right',
          fullName: '右冻结'
        }],
      alignOptions: [
        {
          value: 'left',
          fullName: '左对齐'
        }, {
          value: 'center',
          fullName: '居中对齐'
        }, {
          value: 'right',
          fullName: '右对齐'
        }],
      classifyOptions: [],
      timeOptions: [
        {
          value: '1',
          fullName: '创建时间'
        }, {
          value: '2',
          fullName: '发布时间'
        }],
      userOptions: [
        {
          value: '1',
          fullName: '创建人'
        }, {
          value: '2',
          fullName: '发布人'
        }],
    }
  },
  methods: {
    init(option, type) {
      this.type = type || 1
      this.list = option ? JSON.parse(JSON.stringify(option)) : []
      this.visible = true
      // 获取公告类型
      this.$store.dispatch('base/getDictionaryData', { sort: 'NoticeType' }).then(res => {
        this.classifyOptions = res
      })
      this.$nextTick(() => {
        this.setSort()
      });
    },
    closeDialog() {
      for (let index = 0; index < this.list.length; index++) {
        const element = this.list[index];
        if (!element.fullName) return this.$message.warning('名称不能为空')
      }
      this.$emit('columnList', this.list)
      this.visible = false
    },
    handleDel(index) {
      this.list.splice(index, 1);
    },

    setSort() {
      const el = this.$refs.dragNoticeTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
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
.JNPF-dialog_center {
  >>> .el-dialog__body {
    height: 70vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0px 3px 2px !important;
    // padding-bottom: 20px !important;
  }
}
</style>