<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="dataBoard-box-body">
      <web-link :linkType="item.linkType" :urlAddress="item.urlAddress"
        :linkTarget="item.linkTarget" :type="item.type" :propertyJson="item.propertyJson"
        class="dataBoard-item" v-for="(item,i) in list" :key="i"
        :style="{'width':100 / option.rowNumber+'%'}" :class="{'item-box':option.showBorder}">
        <i :class="item.icon+' dataBoard-body-item'"
          :style="{'color':item.iconColor,'background':item.iconColor.replace('rgb','rgba').replace(')',',0.1)')}"></i>
        <div class="text">
          <p class="num">
            <span
              :style="{'font-size':option.valueFontSize+'px',
              'font-weight':option.valueFontWeight?'bolder':'normal','color':option.valueFontColor}">{{item.num}}</span>
            <span class="unit"
              :style="{'font-size':option.unitFontSize+'px',
              'font-weight':option.unitFontWeight?'bolder':'normal','color':option.unitFontColor}">{{item.unit}}</span>
          </p>
          <p class="name"
            :style="{'font-size':option.labelFontSize+'px',
              'font-weight':option.labelFontWeight?'bolder':'normal','color':option.labelFontColor}">
            {{item.fullName}}</p>
        </div>
      </web-link>
    </div>
  </el-card>
</template>
<script>
import { getDataInterfaceRes } from '@/api/systemData/dataInterface'
import CardHeader from "../CardHeader"
import webLink from '../Link'
export default {
  components: { CardHeader, webLink },
  props: {
    activeData: { type: Object, default: () => { } }
  },
  data() {
    return {
      list: [],
    }
  },
  // watch: {
  //   'option.defaultValue': {
  //     handler(val) {
  //       this.list = val
  //       this.initData()
  //     },
  //     immediate: true,
  //     deep: true
  //   },
  // },
  computed: {
    option() {
      return this.activeData.option
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      let list = JSON.parse(JSON.stringify(this.option.defaultValue))
      for (let i = 0; i < list.length; i++) {
        if (list[i].dataType === 'dynamic') {
          list[i].num = ''
          if (!list[i].propsApi) continue
          getDataInterfaceRes(list[i].propsApi).then(res => {
            list[i].num = res.data
          })
        }
      }
      this.list = list
    }
  }
}
</script>
<style lang="scss" scoped>
.dataBoard-box-body {
  display: flex;
  flex-wrap: wrap;
  .item-box {
    box-shadow: 1px 0 #f0f0f0, 0 1px #f0f0f0, 1px 1px #f0f0f0, 1px 0 #f0f0f0 inset, 0 1px #f0f0f0 inset;
    &:hover {
      position: relative;
      z-index: 1;
      box-shadow: 0 1px 2px -2px #00000029, 0 3px 6px #0000001f, 0 5px 12px 4px #00000017;
    }
  }
  .dataBoard-item {
    padding-left: 30px;
    height: 141px;
    display: flex;
    align-items: center;
    overflow: hidden;

    .dataBoard-body-item {
      width: 66px;
      height: 66px;
      margin-right: 16px;
      border-radius: 50%;
      text-align: center;
      line-height: 66px;
      font-size: 36px;
      flex-shrink: 0;
    }
    .text {
      display: inline-block;
      height: 56px;
      .num {
        font-size: 20px;
        line-height: 36px;
        height: 36px;
        overflow: hidden;
        .unit {
          padding-left: 3px;
        }
      }
      .name {
        font-size: 14px;
        color: #666;
        overflow: hidden;
      }
    }
  }
}
</style>