<template>
  <el-collapse-item title="柱体设置" name="4"
    v-if="!(activeData.option.styleType == 6&&showType == 'app')">
    <el-form-item label="宽度">
      <el-input-number v-model="activeData.option.seriesBarWidth" controls-position="right" :min="0"
        :max="100" />
    </el-form-item>
    <el-form-item label="弧度" v-if="!(activeData.option.styleType == 2&&showType == 'app')">
      <el-input-number v-model="activeData.option.seriesItemStyleBarBorderRadius"
        controls-position="right" :min="0" :max="100" />
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