<template>
  <p class="groupTitle" :style="{'text-align':contentPosition}">{{content}}
    <span slot="label" v-if="tipLabel&&content">
      <el-tooltip placement="top" :content=tipLabel>
        <a class='el-icon-question tooltip-question'></a>
      </el-tooltip>
    </span>
  </p>
</template>
<script>
export default {
  name: 'groupTitle',
  props: {
    tipLabel: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    'content-position': {
      type: String,
      default: 'left'
    },
  }
}
</script>
<style lang="scss" scoped>
.groupTitle {
  border-bottom: 1px solid #ebeef5;
  color: #606266;
  font-size: 16px;
  line-height: 50px;
  font-weight: 600;
}
</style>