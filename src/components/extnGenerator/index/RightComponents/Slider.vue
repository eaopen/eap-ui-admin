<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.__config__.tipLabel"
        placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="默认值">
      <el-input-number v-model="activeData.__config__.defaultValue" placeholder="请输入默认值"
        controls-position="right" />
    </el-form-item>
    <!-- <el-form-item label="显示标签">
      <el-switch v-model="activeData.__config__.showLabel" />
    </el-form-item> -->
    <el-form-item label="最小值">
      <el-input-number v-model="activeData.min" placeholder="最小值" controls-position="right" />
    </el-form-item>
    <el-form-item label="最大值">
      <el-input-number v-model="activeData.max" placeholder="最大值" controls-position="right" />
    </el-form-item>
    <el-form-item label="步长">
      <el-input-number v-model="activeData.step" placeholder="步数" controls-position="right" />
    </el-form-item>
    <el-form-item v-if="activeData['show-stops'] !== undefined && showType==='pc'" label="显示间断点">
      <el-switch v-model="activeData['show-stops']" />
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
  methods: {}
}
</script>