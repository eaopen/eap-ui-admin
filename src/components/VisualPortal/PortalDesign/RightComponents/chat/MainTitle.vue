<template>
  <el-collapse-item title="图表标题设置" name="2">
    <el-form-item label="标题名称">
      <el-input v-model="activeData.option.titleText" placeholder="请输入标题名称" />
    </el-form-item>
    <el-form-item label="字体大小">
      <el-input-number v-model="activeData.option.titleTextStyleFontSize" controls-position="right"
        :min="12" :max="25" />
    </el-form-item>
    <el-form-item label="字体加粗">
      <el-switch v-model="activeData.option.titleTextStyleFontWeight" />
    </el-form-item>
    <el-form-item label="字体颜色" style="height:32px">
      <el-color-picker v-model="activeData.option.titleTextStyleColor" />
    </el-form-item>
    <el-form-item label="字体位置">
      <el-radio-group v-model="activeData.option.titleLeft" size="small">
        <el-radio-button :label="item.value" v-for="(item,index) in alignList" :key="index">
          {{item.label}}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="背景色" style="height:32px">
      <el-color-picker v-model="activeData.option.titleBgColor" />
    </el-form-item>
  </el-collapse-item>
</template>
<script>
import { alignList } from '../../components/config'
export default {
  props: ['activeData', 'showType'],
  data() {
    return {
      alignList
    }
  },
}
</script>