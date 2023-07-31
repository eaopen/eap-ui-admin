<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="commonFunc-box-body">
      <web-link class="item com-hover" :linkType="item.linkType" :urlAddress="item.urlAddress"
        :linkTarget="item.linkTarget" :type="item.type" :propertyJson="item.propertyJson"
        v-for="(item,i) in list" :key="i" :style="{'width':100 / option.rowNumber+'%'}"
        :class="{'item-box':option.showBorder,'item-horizontal-box':option.styleType==2}">
        <i :class="item.icon" :style="{color:item.iconBgColor}"></i>
        <p class="name"
          :style="{'font-size':option.labelFontSize+'px',
              'font-weight':option.labelFontWeight?'bolder':'normal','color':option.labelFontColor}">
          {{item.fullName}}</p>
      </web-link>
    </div>
  </el-card>
</template>
<script>
import webLink from '../Link'
import CardHeader from "../CardHeader"
export default {
  components: { webLink, CardHeader },
  props: {
    activeData: { type: Object, default: () => { } }
  },
  data() {
    return {
      list: []
    }
  },
  computed: {
    option() {
      return this.activeData.option
    }
  },
  created() {
    this.list = this.option.defaultValue
  }
}
</script>
<style lang="scss" scoped>
.portal-eChart-box {
  >>> .el-card__body {
    width: 100%;
    height: calc(100% - 55px);
  }
  .commonFunc-box-body {
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
    .item-horizontal-box {
      flex-direction: unset !important;
      justify-content: unset !important;
      padding-left: 35px;
      .name {
        padding-left: 5px;
      }
    }
    .item {
      height: 141px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      i {
        display: inline-block;
        height: 40px;
        font-size: 40px;
        margin-bottom: 10px;
      }
      .name {
        font-size: 14px;
        line-height: 20px;
      }
    }
  }
}
</style>