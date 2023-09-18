<template>
  <el-dialog :title="webType?'更改模式':'新建功能'" :close-on-click-modal="false" lock-scroll
    v-bind="$attrs" v-on="$listeners" class="JNPF-dialog JNPF-dialog_center JNPF-dialog-add"
    :width="webType?'310px':'600px'">
    <div class="add-main">
      <div class="add-item add-item-left" @click="add(2)" v-if="webType!==1">
        <i class="add-icon el-icon-document"></i>
        <div class="add-txt">
          <p class="add-title">表单</p>
          <p class="add-desc">业务功能的表单</p>
        </div>
      </div>
      <div class="add-item add-item-list" @click="add(4)" v-if="webType!==2&&webType!==3">
        <i class="add-icon icon-ym icon-ym-sysMenu"></i>
        <div class="add-txt">
          <p class="add-title">视图</p>
          <p class="add-desc">数据视图</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: ['webType'],
  methods: {
    add(type) {
      this.$emit('add', type, this.webType ? true : false)
      this.$emit('update:visible', false)
    }
  }
}
</script>
