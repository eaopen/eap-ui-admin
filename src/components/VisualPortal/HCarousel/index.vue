<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-box-body">
      <el-carousel :interval="option.carouselInterval" :arrow="option.carouselArrow"
        :autoplay="option.carouselAutoplay" :direction="option.carouselDirection"
        :loop="option.carouselLoop" :class="{'indicator-top':option.carouselIndicatorPosition=='topLeft'&&option.carouselDirection=='horizontal',
        'indicator-left':option.carouselIndicatorPosition=='topLeft'&&option.carouselDirection=='vertical',
        'indicator-none':option.carouselIndicatorPosition=='none'}">
        <el-carousel-item v-for="(item,index) in list" :key="index">
          <web-link class="web-link" :linkType="item.linkType" :urlAddress="item.urlAddress"
            :linkTarget="item.linkTarget" :type="item.type" :propertyJson="item.propertyJson">
            <img :key="key" :style="{'object-fit':option.imageFillStyle}" :src="item.imageUrl">
            <div class="text-ellipsis bottom-text" v-if="item.textDefaultValue"
              :style="{'color':option.textFontColor,'font-size':option.textFontSize+'px','text-align':option.textLeft,
            'background':option.textBgColor,'font-weight':option.textFontWeight?'bolder':'normal',
            'padding': option.carouselIndicatorPosition == 'bottomRight'&&option.carouselDirection=='horizontal'?'0 10px 15px':''}">
              {{item.textDefaultValue}}
            </div>
          </web-link>
        </el-carousel-item>
      </el-carousel>
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
      list: [],
      key: +new Date()
    }
  },
  computed: {
    option() {
      return this.activeData.option
    },
  },
  watch: {
    // 'option.defaultValue': {
    //   handler(val) {
    //     this.handleCarousel(JSON.parse(JSON.stringify(val)))
    //   },
    //   immediate: true
    // }
  },
  created() {
    this.handleCarousel(JSON.parse(JSON.stringify(this.option.defaultValue)))
  },
  methods: {
    async handleCarousel(val) {
      for (let i = 0; i < val.length; i++) {
        const ele = val[i];
        if (ele.dataType == 1) ele.imageUrl = this.define.comUrl + ele.imageUrl
        if (ele.dataType == 3) {
          let res = await getDataInterfaceRes(ele.propsApi)
          ele.imageUrl = res.data
        }
      }
      this.list = val
    },
  }
}
</script>
<style lang="scss" scoped>
.portal-box-body {
  height: 100%;
  >>> .el-carousel,
  >>> .el-carousel__container {
    height: 100%;
    min-height: 130px;
  }
  .indicator-top {
    >>> .el-carousel__indicators {
      top: 0;
    }
  }
  .indicator-left {
    >>> .el-carousel__indicators {
      left: 0;
    }
  }
  .indicator-none {
    >>> .el-carousel__indicators {
      display: none;
    }
  }
  .web-link,
  img {
    width: 100%;
    height: 100%;
  }
  .bottom-text {
    position: absolute;
    width: calc(100% - 20px);
    height: 30px;
    line-height: 30px;
    bottom: 0;
    font-size: 14px;
    background: #000;
    color: #fff;
    padding: 0 10px;
    box-sizing: content-box;
  }
}
</style>