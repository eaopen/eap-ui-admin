<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.__config__.tipLabel"
        placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="开启展示值">
      <el-input v-model="activeData.activeTxt" placeholder="请输入开启展示值" />
    </el-form-item>
    <el-form-item label="关闭展示值">
      <el-input v-model="activeData.inactiveTxt" placeholder="请输入关闭展示值" />
    </el-form-item>
    <el-form-item label="默认值">
      <el-switch v-model="activeData.__config__.defaultValue"
        :active-value="activeData['active-value']" :inactive-value="activeData['inactive-value']" />
    </el-form-item>
    <!-- <el-form-item label="显示标签">
      <el-switch v-model="activeData.__config__.showLabel" />
    </el-form-item> -->
    <!-- <el-form-item label="开启颜色">
      <el-color-picker v-model="activeData['active-color']" />
    </el-form-item>
    <el-form-item label="关闭颜色">
      <el-color-picker v-model="activeData['inactive-color']" />
    </el-form-item> -->
    <el-form-item label="是否禁用">
      <el-switch v-model="activeData.disabled" />
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="activeData.__config__.required" />
    </el-form-item>
  </el-row>
</template>
<script>
import comMixin from './mixin'
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