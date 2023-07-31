<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-box-body" :style="{'background':option.textBgColor}">
      <web-link :linkType="option.linkType" :urlAddress="option.urlAddress"
        :linkTarget="option.linkTarget" :type="option.type" :propertyJson="option.propertyJson">
        <div class="text" v-if="option.styleType==1"
          :style="{'color':option.textFontColor,'font-size':option.textFontSize+'px','text-align':option.textLeft,'cursor':option.linkType?'pointer':'',
            'font-weight':option.textFontWeight?'bolder':'normal','font-style':option.textFontStyle?'italic':'','text-decoration':option.textUnderLine}">
          <marquee :style="{'text-decoration':option.textUnderLine}" :key="activeData.renderKey"
            :direction="option.textAutoplayMode" :scrollamount="option.textAutoplaySpeed/10"
            v-if="option.textAutoplay&&value">
            {{value}}</marquee>
          <span v-else>{{value}}</span>
        </div>
        <div class="text" v-else v-html="value"></div>
      </web-link>
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
  computed: {
    option() {
      return this.activeData.option
    },
    value() {
      return this.activeData.option.defaultValue
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
  overflow: auto;
  .text {
    margin: 15px;
    line-height: 1.5;
  }
}
</style>