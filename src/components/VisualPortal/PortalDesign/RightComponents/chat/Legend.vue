<template>
  <el-collapse-item title="图例设置" name="10">
    <el-form-item label="显示">
      <el-switch v-model="activeData.option.legendShow" />
    </el-form-item>
    <template v-if="activeData.option.legendShow&&showType=='pc'">
      <el-form-item label="字体大小">
        <el-input-number v-model="activeData.option.legendTextStyleFontSize"
          controls-position="right" :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="布局">
        <el-radio-group v-model="activeData.option.legendOrient" size="small">
          <el-radio-button :label="item.value" v-for="(item,index) in layoutList" :key="index">
            {{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上下边距">
        <el-slider v-model="activeData.option.legendTop" :max="100" />
      </el-form-item>
      <el-form-item label="左右边距">
        <el-slider v-model="activeData.option.legendLeft" :max="100" />
      </el-form-item>
    </template>
  </el-collapse-item>
</template>
<script>

const layoutList = [
  { label: '横排', value: 'horizontal' },
  { label: '竖排', value: 'vertical' }
]
export default {
  props: ['activeData', 'showType'],
  data() {
    return {
      layoutList: layoutList
    }
  },
  methods: {

  }
}
</script>