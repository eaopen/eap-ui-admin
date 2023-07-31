<template>
  <el-collapse-item title="Y轴设置" name="6">
    <el-form-item label="显示坐标轴">
      <el-switch v-model="activeData.option.yAxisShow" />
    </el-form-item>
    <template v-if="activeData.option.yAxisShow">
      <el-form-item label="坐标轴颜色">
        <el-color-picker v-model="activeData.option.yAxisAxisLineLineStyleColor" />
      </el-form-item>
      <template v-if="showType == 'pc'">
        <el-form-item label="Y轴名称">
          <el-input v-model="activeData.option.yAxisName" placeholder="请输入Y轴名称" />
        </el-form-item>
        <el-form-item label="字体大小">
          <el-input-number v-model="activeData.option.yAxisNameTextStyleFontSize"
            controls-position="right" :min="12" :max="25" />
        </el-form-item>
        <el-form-item label="字体加粗">
          <el-switch v-model="activeData.option.yAxisNameTextStyleFontWeight" />
        </el-form-item>
        <el-form-item label="字体颜色" style="height:32px">
          <el-color-picker v-model="activeData.option.yAxisNameTextStyleColor" />
        </el-form-item>
      </template>
      <el-form-item label="标签大小" v-show="showType == 'pc'">
        <el-input-number v-model="activeData.option.yAxisAxisLabelTextStyleFontSize"
          controls-position="right" :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="标签加粗" v-show="showType == 'pc'">
        <el-switch v-model="activeData.option.yAxisAxisLabelTextFontWeight" />
      </el-form-item>
      <el-form-item label="标签颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.yAxisAxisLabelTextStyleColor" />
      </el-form-item>
      <el-form-item label="显示网格线">
        <el-switch v-model="activeData.option.yAxisSplitLineShow" />
      </el-form-item>
      <el-form-item label="网格线颜色" v-if="activeData.option.yAxisSplitLineShow" style="height:32px">
        <el-color-picker v-model="activeData.option.yAxisSplitLineLineStyleColor" />
      </el-form-item>
    </template>
    <el-form-item label="反转" v-show="showType == 'pc'">
      <el-switch v-model="activeData.option.yAxisInverse" />
    </el-form-item>
  </el-collapse-item>
</template>
<script>
export default {
  props: ['activeData', 'showType'],
  data() {
    return {
    }
  },
  methods: {

  }
}
</script>