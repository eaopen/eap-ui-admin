<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-box-body">
      <web-link class="web-link" v-if="value" :linkType="option.linkType"
        :urlAddress="option.urlAddress" :linkTarget="option.linkTarget" :type="option.type"
        :propertyJson="option.propertyJson">
        <img class="image" :key="key" :style="{'object-fit':option.imageFillStyle}" :src="value">
        <div class="text-ellipsis bottom-text" v-if="option.textDefaultValue"
          :style="{'color':option.textFontColor,'font-size':option.textFontSize+'px','text-align':option.textLeft,'background':option.textBgColor,
        'font-weight':option.textFontWeight?'bolder':'normal','font-style':option.textFontStyle?'italic':''}">{{option.textDefaultValue}}
        </div>
      </web-link>
      <div class="portal-common-noData" v-else>
        <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
        <p class="noData-txt">暂无图片</p>
      </div>
    </div>
  </el-card>
</template>
<script>
import CardHeader from "../CardHeader"
import webLink from '../Link'
import { getDataInterfaceRes } from '@/api/systemData/dataInterface'
export default {
  components: { CardHeader, webLink },
  props: {
    activeData: { type: Object, default: () => { } }
  },
  data() {
    return {
      key: +new Date(),
    }
  },
  computed: {
    option() {
      return this.activeData.option
    },
    value() {
      this.key = +new Date()
      const val = this.activeData.option.defaultValue
      if (this.option.styleType == 1 && val) return this.define.comUrl + val
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
        if (!propsApi) return this.option.defaultValue = ''
        getDataInterfaceRes(propsApi).then(res => {
          this.option.defaultValue = res.data
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.portal-box-body {
  height: 100%;
  position: relative;
  .web-link,
  .image {
    width: 100%;
    height: 100%;
  }
  .bottom-text {
    position: absolute;
    width: 100%;
    height: 30px;
    line-height: 30px;
    bottom: 0;
    font-size: 14px;
    background: #000;
    color: #fff;
    padding: 0 10px;
  }
}
</style>