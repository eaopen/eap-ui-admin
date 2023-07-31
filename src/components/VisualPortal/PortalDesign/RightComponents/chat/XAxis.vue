<template>
  <el-collapse-item title="X轴设置" name="5">
    <el-form-item label="坐标轴类型" v-show="showType=='pc'">
      <el-radio-group v-model="activeData.option.category" size="small">
        <el-radio-button :label="item.value" v-for="(item,index) in categoryList" :key="index">
          {{item.label}}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="显示坐标轴">
      <el-switch v-model="activeData.option.xAxisShow" />
    </el-form-item>
    <template v-if="activeData.option.xAxisShow">
      <el-form-item label="坐标轴颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.xAxisAxisLineLineStyleColor" />
      </el-form-item>
      <template v-if="showType=='pc'">
        <el-form-item label="X轴名称">
          <el-input v-model="activeData.option.xAxisName" placeholder="请输入X轴名称" />
        </el-form-item>
        <el-form-item label="字体大小">
          <el-input-number v-model="activeData.option.xAxisNameTextStyleFontSize"
            controls-position="right" :min="12" :max="25" />
        </el-form-item>
        <el-form-item label="字体加粗" v-if="activeData.option.xAxisShow">
          <el-switch v-model="activeData.option.xAxisNameTextStyleFontWeight" />
        </el-form-item>
        <el-form-item label="字体颜色" v-if="activeData.option.xAxisShow" style="height:32px">
          <el-color-picker v-model="activeData.option.xAxisNameTextStyleColor" />
        </el-form-item>
      </template>
      <el-form-item label="标签大小" v-show="showType=='pc'">
        <el-input-number v-model="activeData.option.xAxisAxisLabelTextStyleFontSize"
          controls-position="right" :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="标签加粗" v-show="showType=='pc'">
        <el-switch v-model="activeData.option.xAxisAxisLabelTextFontWeight" />
      </el-form-item>
      <el-form-item label="标签颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.xAxisAxisLabelTextStyleColor" />
      </el-form-item>
      <el-form-item label="标签角度">
        <el-input-number v-model="activeData.option.xAxisAxisLabelRotate" controls-position="right"
          :min="0" :max="100" />
      </el-form-item>
      <el-form-item label="显示网格线">
        <el-switch v-model="activeData.option.xAxisSplitLineShow" />
      </el-form-item>
      <el-form-item label="网格线颜色" v-if="activeData.option.xAxisSplitLineShow" style="height:32px">
        <el-color-picker v-model="activeData.option.xAxisSplitLineLineStyleColor" />
      </el-form-item>
    </template>
    <el-form-item label="反转" v-show="showType=='pc'">
      <el-switch v-model="activeData.option.xAxisInverse" />
    </el-form-item>
  </el-collapse-item>
</template>
<script>
const categoryList = [
  { label: '类型', value: 'category' },
  { label: '数值', value: 'value' }
]
export default {
  props: ['activeData', 'showType'],
  data() {
    return {
      categoryList: categoryList
    }
  },
  methods: {

  }
}
</script>