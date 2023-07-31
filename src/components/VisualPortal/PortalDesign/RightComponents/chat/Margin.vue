<template>
  <el-collapse-item :title="getTitle()" name="9">
    <template v-if="activeData.jnpfKey=='pieChart'||activeData.jnpfKey=='mapChart'">
      <el-form-item label="上下边距">
        <el-slider v-model="activeData.option.seriesCenterTop" :max="100" />
      </el-form-item>
      <el-form-item label="左右边距">
        <el-slider v-model="activeData.option.seriesCenterLeft" :max="100" />
      </el-form-item>
    </template>
    <template v-else-if="activeData.jnpfKey=='radarChart'">
      <el-form-item label="上下边距">
        <el-slider v-model="activeData.option.radarCenterTop" :max="100" />
      </el-form-item>
      <el-form-item label="左右边距">
        <el-slider v-model="activeData.option.radarCenterLeft" :max="100" />
      </el-form-item>
    </template>
    <template v-else>
      <el-form-item label="左边距">
        <el-slider v-model="activeData.option.gridLeft" :max="400" />
      </el-form-item>
      <el-form-item label="顶边距">
        <el-slider v-model="activeData.option.gridTop" :max="400" />
      </el-form-item>
      <el-form-item label="右边距">
        <el-slider v-model="activeData.option.gridRight" :max="400" />
      </el-form-item>
      <el-form-item label="底边距">
        <el-slider v-model="activeData.option.gridBottom" :max="400" />
      </el-form-item>
    </template>
  </el-collapse-item>
</template>
<script>
export default {
  props: ['activeData'],
  data() {
    return {
    }
  },
  methods: {
    getTitle() {
      const jnpfKey = this.activeData.jnpfKey
      if (jnpfKey == 'pieChart' || jnpfKey == 'radarChart' || jnpfKey == 'mapChart') return '中心坐标设置'
      return '坐标轴边距设置'
    }
  }
}
</script>