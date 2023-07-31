<template>
  <div class="portal-common-title" :style="{'background':card.titleBgColor}">
    <div class="title" :style="{'color':card.titleFontColor,'font-size':card.titleFontSize+'px',
    'justify-content':card.titleLeft,'font-weight':card.titleFontWeight?'bolder':'normal'}">
      <i :class="card.cardIcon" :style="{'color':card.cardIconColor||'#000'}"></i>
      <span>{{title}}</span>
    </div>
    <web-link v-if="card.cardRightBtn" :linkType="card.linkType" :urlAddress="card.urlAddress"
      :linkTarget="card.linkTarget" :type="card.type" :propertyJson="card.propertyJson">
      <el-button class="button" type="text">{{card.cardRightBtn}}</el-button>
    </web-link>
  </div>
</template>
<script>
import webLink from '../Link'
export default {
  components: { webLink },
  props: {
    title: { type: String, default: '' },
    card: { type: Object, default: () => { } },
  }
}
</script>
<style lang="scss" scoped>
.portal-common-title {
  width: 100%;
  height: 100%;
  font-size: 16px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  .title {
    flex: 1;
    display: flex;
    align-items: center;
    overflow: hidden;
    i {
      font-size: 18px;
    }
    span {
      padding-left: 5px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .button {
    padding-left: 10px;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>