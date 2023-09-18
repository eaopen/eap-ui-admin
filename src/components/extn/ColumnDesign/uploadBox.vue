<template>
  <el-dialog title="模板设置" :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center JNPF-dialog-export" lock-scroll append-to-body
    v-bind="$attrs" width="600px" :modal-append-to-body="false" v-on="$listeners">
    <div class="dialog-main">
      <el-form ref="dataForm" :model="dataForm" label-width="100px" label-position="left">
        <el-form-item label="导入模式">
          <el-radio-group v-model="dataForm.dataType">
            <el-radio label="1">仅新增数据
              <el-tooltip content="导入数据只能进行新增，同一条数据无法重复导入" placement="top-start">
                <a class="el-icon-question tooltip-question"></a>
              </el-tooltip>
            </el-radio>
            <el-radio label="2">更新和新增数据
              <el-tooltip content="允许新增数据的同时支持导入数据更新" placement="top-start">
                <a class="el-icon-question tooltip-question"></a>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="upload-line">
          <p slot="label" class="export-label">表单数据<span>请选择要导入的字段</span></p>
        </div>
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
          @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="checkedList" @change="handleCheckedChange">
          <el-checkbox v-for="item in columnList" :label="item.__vModel__" :key="item.__vModel__"
            :disabled="item.disabled" class="column-item">
            {{item.label}}
          </el-checkbox>
        </el-checkbox-group>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">{{$t('common.cancelBtn')}}</el-button>
      <el-button type="primary" @click="onConfirm()">{{$t('common.confirmBtn')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { noVModelList, systemComponentsList } from '@/components/extnGenerator/generator/comConfig'
const excludeList = [...noVModelList, 'uploadFz', 'uploadImg', 'colorPicker', 'popupTableSelect', 'relationForm', 'popupSelect', 'calculate', 'groupTitle']
export default {
  props: ['value'],
  data() {
    return {
      visible: false,
      dataForm: {
        dataType: "1"
      },
      checkAll: false,
      checkedList: [],
      isIndeterminate: false,
      columnList: [],
      defaultCheckedList: []
    }
  },
  methods: {
    init(columnList, selectData, dataType) {
      this.visible = true
      this.columnList = []
      this.checkedList = []
      this.defaultCheckedList = []
      for (let i = 0; i < columnList.length; i++) {
        const element = columnList[i]
        const label = element.__config__.label
        const required = element.__config__.required
        const jnpfKey = element.__config__.jnpfKey
        const disabled = systemComponentsList.includes(jnpfKey) || required
        if (!excludeList.includes(jnpfKey)) {
          this.columnList.push({ __vModel__: element.__vModel__, label, disabled })
          if ((required || systemComponentsList.includes(jnpfKey))) {
            this.checkedList.push(element.__vModel__)
            this.defaultCheckedList.push(element.__vModel__)
          }
        }
      }
      if (selectData && selectData.length) {
        this.checkedList.push(...selectData)
        this.checkedList = Array.from(new Set(this.checkedList))
      }
      if (this.checkedList.length) {
        this.isIndeterminate = this.checkedList.length > 0 && this.checkedList.length < this.columnList.length;
        this.checkAll = this.checkedList.length === this.columnList.length;
      }
      if (dataType) this.dataForm.dataType = dataType
    },
    closeDialog() {
      this.$emit('update:visible', false)
    },
    handleCheckAllChange(val) {
      this.checkedList = val ? this.columnList.map(o => o.__vModel__) : this.defaultCheckedList
      this.isIndeterminate = false;
    },
    handleCheckedChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.columnList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.columnList.length;
    },
    onConfirm() {
      if (!this.checkedList.length) return this.$message.warning('请至少选择一个导入字段')
      this.$emit('onConfirm', { dataType: this.dataForm.dataType, selectKey: this.checkedList })
      this.closeDialog()
    }
  }
}
</script>
<style lang="scss" scoped>
.el-checkbox {
  line-height: 32px;
}
</style>