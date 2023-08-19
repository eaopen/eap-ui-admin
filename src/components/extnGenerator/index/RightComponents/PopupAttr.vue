<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.__config__.tipLabel"
        placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="关联弹窗">
      <el-select v-model="activeData.relationField" placeholder="请选择关联弹窗" clearable filterable>
        <el-option v-for="(item,i) in options" :key="i" :label="item.__config__.label"
          :value="item.prop" />
      </el-select>
    </el-form-item>
    <el-form-item label="关联字段">
      <el-input v-model="activeData.showField" placeholder="请输入关联字段" />
    </el-form-item>
  </el-row>
</template>
<script>
import comMixin from './mixin'
import { getDrawingList } from '@/components/extnGenerator/utils/db'
export default {
  props: ['activeData'],
  mixins: [comMixin],
  data() {
    return {
      options: [],
      fieldOptions: [],
    }
  },
  methods: {
    getOptions() {
      const drawingList = getDrawingList() || []
      let list = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__config__ && data.__config__.jnpfKey) {
          if (data.__config__.jnpfKey === 'popupSelect' && data.__vModel__ && this.getPopupSelect(data)) {
            list.push(data)
          }
        }
      }
      loop(drawingList)
      this.options = list.map(o => ({
        ...o,
        prop: o.__config__ && o.__config__.tableName ? o.__vModel__ + '_jnpfTable_' + o.__config__.tableName + (o.__config__.isSubTable ? '0' : "1") : o.__vModel__
      }))
    },
    getPopupSelect(data) {
      const isSubTable = this.activeData.__config__.isSubTable
      if (!isSubTable && !data.__config__.isSubTable) return true
      if (isSubTable && data.__config__.isSubTable && this.activeData.__config__.relationTable === data.__config__.relationTable) return true
      return false
    }
  }
}
</script>