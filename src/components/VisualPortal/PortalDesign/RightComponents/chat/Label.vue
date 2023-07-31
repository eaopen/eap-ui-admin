<template>
  <el-collapse-item title="数值设置" name="7">
    <el-form-item label="显示">
      <el-switch v-model="activeData.option.seriesLabelShow" />
    </el-form-item>
    <template v-if="activeData.option.seriesLabelShow">
      <template v-if="activeData.jnpfKey=='pieChart'&&showType=='pc'">
        <el-form-item label="显示位置">
          <el-radio-group v-model="activeData.option.seriesLabelPosition" size="small">
            <el-radio-button :label="item.value" v-for="(item,index) in labelPositionList"
              :key="index">
              {{item.label}}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="显示内容">
          <el-checkbox-group v-model="activeData.option.seriesLabelShowInfo">
            <el-checkbox v-for="(item,index) in labelShowList" :label="item.value" :key="index">
              {{item.label}}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </template>
      <template v-if="showType == 'pc'">
        <el-form-item label="字体大小">
          <el-input-number v-model="activeData.option.seriesLabelFontSize" controls-position="right"
            :min="12" :max="25" />
        </el-form-item>
        <el-form-item label="字体加粗">
          <el-switch v-model="activeData.option.seriesLabelFontWeight" />
        </el-form-item>
      </template>
      <el-form-item label="字体颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.seriesLabelColor" />
      </el-form-item>
      <el-form-item label="背景色" v-if="showType == 'pc'" style="height:32px">
        <el-color-picker v-model="activeData.option.seriesLabelBgColor" />
      </el-form-item>
    </template>
  </el-collapse-item>
</template>
<script>
const labelPositionList = [
  { label: '外侧', value: 'outside' },
  { label: '内侧', value: 'inside' }
]
const labelShowList = [
  { label: '数值', value: 'count' },
  { label: '百分比', value: 'percent' }
]
export default {
  props: ['activeData', 'showType'],
  data() {
    return {
      labelPositionList: labelPositionList,
      labelShowList: labelShowList
    }
  },
  methods: {

  }
}
</script>
<style lang="scss" scoped>
</style>