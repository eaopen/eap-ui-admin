<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-box-body">
      <iframe v-if="value" :src="value" scrolling="yes" frameborder="0"></iframe>
      <div class="portal-common-noData" v-else>
        <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
        <p class="noData-txt">暂无地址</p>
      </div>
    </div>
  </el-card>
</template>
<script>
import commonMixins from '@/components/VisualPortal/mixins/common'
export default {
  mixins: [commonMixins],
}
</script>
<style lang="scss" scoped>
.portal-box-body {
  height: 100%;
  iframe {
    width: 100%;
    height: 100%;
  }
}
</style>