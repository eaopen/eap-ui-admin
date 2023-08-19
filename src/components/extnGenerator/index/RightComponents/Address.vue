<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.__config__.tipLabel"
        placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="占位提示">
      <el-input v-model="activeData.placeholder" placeholder="请输入占位提示" />
    </el-form-item>
    <el-form-item label="默认值">
      <JNPFAddress v-model="activeData.__config__.defaultValue" placeholder="选择默认值" clearable
        :multiple="activeData.multiple" :level="activeData.level" :key="key" />
    </el-form-item>
    <el-form-item label="格式">
      <el-radio-group v-model="activeData.level" @change="levelChange" class="level">
        <el-radio :label="0">省</el-radio>
        <el-radio :label="1">省市</el-radio>
        <el-radio :label="2">省市区</el-radio>
        <el-radio :label="3">省市区-街道</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="能否清空">
      <el-switch v-model="activeData.clearable" />
    </el-form-item>
    <el-form-item label="能否多选">
      <el-switch v-model="activeData.multiple" @change="levelChange" />
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
import JNPFAddress from '@/components/extnGenerator/components/Address'
import { getDrawingList } from '@/components/extnGenerator/utils/db'
const selectTypeOptions = [{
  value: 'all',
  label: '全部'
}]
const addressSelectTypeOptions = [
  ...selectTypeOptions,
  {
    value: 'address',
    label: '省联动'
  },
  {
    value: 'cities',
    label: '省市联动'
  },
]
export default {
  props: ['activeData'],
  mixins: [comMixin],
  components: {
    JNPFAddress
  },
  data() {
    return {
      addressSelectTypeOptions,
      key: ''
    }
  },
  computed: {},
  created() { },
  methods: {
    onTypeChange() {
      this.$set(this.activeData.__config__, 'defaultValue', this.activeData.multiple ? [] : '')
      this.activeData.ableAddressIds = []
      this.activeData.relationField = ''
      if (this.activeData.selectType != 'all') {
        this.$set(this.activeData.__config__, 'defaultValue', null)
      }
      this.activeData.__config__.renderKey = +new Date()
      this.key = +new Date()
    },
    levelChange() {
      this.$set(this.activeData.__config__, 'defaultValue', [])
      this.activeData.__config__.renderKey = +new Date() // 更新renderKey,重新渲染该组件
      this.key = +new Date()
    }
  }
}
</script>
<style lang="scss">
.level {
  .el-radio {
    display: block;
    margin: 10px 0;
  }
}
.relation-radio {
  .el-radio {
    margin: 10px 0 0;
    display: block;
  }
}
</style>