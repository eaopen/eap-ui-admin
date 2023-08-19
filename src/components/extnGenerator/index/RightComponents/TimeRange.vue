<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="开始占位">
      <el-input v-model="activeData['start-placeholder']" placeholder="请输入占位提示" />
    </el-form-item>
    <el-form-item label="结束占位">
      <el-input v-model="activeData['end-placeholder']" placeholder="请输入占位提示" />
    </el-form-item>
    <el-form-item label="默认值">
      <el-time-picker v-model="activeData.__config__.defaultValue" start-placeholder="开始时间"
        end-placeholder="结束时间" clearable :value-format="activeData['value-format']"
        :format="activeData.format" is-range range-separator="至">
      </el-time-picker>
    </el-form-item>
    <el-form-item label="分隔符">
      <el-input v-model="activeData['range-separator']" placeholder="请输入分隔符" />
    </el-form-item>
    <el-form-item label="时间格式">
      <el-input :value="activeData.format" placeholder="请输入时间格式" @input="setTimeValue($event)" />
    </el-form-item>
    <!-- <el-form-item label="显示标签">
      <el-switch v-model="activeData.__config__.showLabel" />
    </el-form-item> -->
    <el-form-item label="能否清空">
      <el-switch v-model="activeData.clearable" />
    </el-form-item>
    <el-form-item label="是否只读" v-show="showType==='pc'">
      <el-switch v-model="activeData.readonly" />
    </el-form-item>
    <el-form-item label="是否禁用">
      <el-switch v-model="activeData.disabled" />
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="activeData.__config__.required" />
    </el-form-item>
  </el-row>
</template>
<script>
import comMixin from './mixin';
export default {
  props: ['activeData'],
  mixins: [comMixin],
  data() {
    return {}
  },
  created() { },
  methods: {
    setTimeValue(val, type) {
      const valueFormat = type === 'week' ? dateTimeFormat.date : val
      this.$set(this.activeData.__config__, 'defaultValue', null)
      this.$set(this.activeData, 'value-format', valueFormat)
      this.$set(this.activeData, 'format', val)
    }
  }
}
</script>