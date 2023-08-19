<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="占位提示">
      <el-input v-model="activeData.placeholder" placeholder="请输入占位提示" />
    </el-form-item>
    <el-form-item label="默认值">
      <el-input :value="setDefaultValue(activeData.__config__.defaultValue)" placeholder="请输入默认值"
        @input="onDefaultValueInput" />
    </el-form-item>
    <!-- <el-form-item label="显示标签">
      <el-switch v-model="activeData.__config__.showLabel" />
    </el-form-item> -->
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
  methods: {}
}
</script>