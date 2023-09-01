<template>
  <el-form-item v-on="$listeners" v-bind="$attrs">
    <span slot="label">{{label}}
      <template v-if="tipLabel">
        <el-tooltip placement="top">
          <div slot="content" v-html="tipLabel"></div>
          <a :class="tipIcon + ' tooltip-question'"></a>
        </el-tooltip>
      </template>
      <a v-if="!tipLabel && label" class="empty-icon"></a>
    </span>
    <slot />
  </el-form-item>
</template>

<script>
export default {
  name: 'jnpf-form-tip-item',
  props: {
    label: {
      type: String,
      default: ''
    },
    tipLabel: {
      type: String,
      default: ''
    },
    tipIcon: {
      type: String,
      default: 'el-icon-question'
    }
  }
}
</script>
<style lang="scss" scoped>
.empty-icon {
  display: inline-block;
  width: 14px;
}
</style>