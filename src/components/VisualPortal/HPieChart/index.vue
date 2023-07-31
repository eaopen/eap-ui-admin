<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="eChart-box-body">
      <div ref="chart" id="chart" v-show="!isEmpty"></div>
      <div class="portal-common-noData portal-common-noData-eChart" v-show="isEmpty">
        <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
        <p class="noData-txt">暂无数据</p>
      </div>
    </div>
  </el-card>
</template>
<script>
import echartMixin from '@/components/VisualPortal/mixins'
export default {
  mixins: [echartMixin]
}
</script>