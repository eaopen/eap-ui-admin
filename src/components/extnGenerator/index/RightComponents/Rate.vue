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
      <el-rate v-model="activeData.__config__.defaultValue" :max="activeData.max"
        :allow-half="activeData['allow-half']"></el-rate>
      <a @click="activeData.__config__.defaultValue=0">清空</a>
    </el-form-item>
    <el-form-item label="最大值">
      <el-input-number v-model="activeData.max" placeholder="最大值" controls-position="right" />
    </el-form-item>
    <!-- <el-form-item label="显示标签">
      <el-switch v-model="activeData.__config__.showLabel" />
    </el-form-item> -->
    <el-form-item label="允许半选">
      <el-switch v-model="activeData['allow-half']" />
    </el-form-item>
    <el-form-item label="辅助文字" v-show="showType==='pc'">
      <el-switch v-model="activeData['show-text']" @change="rateTextChange" />
    </el-form-item>
    <el-form-item label="显示分数" v-show="showType==='pc'">
      <el-switch v-model="activeData['show-score']" @change="rateScoreChange" />
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
  methods: {
    rateTextChange(val) {
      if (val) this.activeData['show-score'] = false
    },
    rateScoreChange(val) {
      if (val) this.activeData['show-text'] = false
    },
  }
}
</script>