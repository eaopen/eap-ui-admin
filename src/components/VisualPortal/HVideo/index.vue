<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-box-body">
      <template v-if="value">
        <video :key="key" controls :loop="option.playNumber==2?true:false"
          :autoplay="option.videoAutoplay" :muted="option.mutePlay">
          <source :src="value" type="video/mp4">
        </video>
      </template>
      <div class="portal-common-noData" v-else>
        <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
        <p class="noData-txt">暂无视频</p>
      </div>
    </div>
  </el-card>
</template>
<script>
import CardHeader from "../CardHeader"
import { getDataInterfaceRes } from '@/api/systemData/dataInterface'
export default {
  components: { CardHeader },
  props: {
    activeData: { type: Object, default: () => { } }
  },
  data() {
    return {
      key: ''
    }
  },
  computed: {
    option() {
      return this.activeData.option
    },
    value() {
      this.key = +new Date()
      let val = this.activeData.option.defaultValue
      if (this.option.styleType == 1 && val.url) val = this.define.comUrl + val.url
      return val
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      if (this.activeData.dataType === 'dynamic') {
        const propsApi = this.activeData.propsApi
        if (!propsApi) return
        getDataInterfaceRes(propsApi).then(res => {
          this.option.defaultValue = res.data
        })
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.portal-box-body {
  height: 100%;
  video {
    width: 100%;
    height: 100%;
  }
}
</style>