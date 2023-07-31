<template>
  <el-scrollbar class="layout-area">
    <template v-if="layout.length">
      <grid-layout :layout.sync="layout" :row-height="40">
        <grid-item v-for="item in layout" :x="item.x" :y="item.y" :w="item.w" :h="item.h"
          :i="item.i" :key="item.i" :maxH="item.maxH" :minH="item.minH" :minW="item.minW"
          :maxW="item.maxW" @resized="resizedEvent(item.i,item)" @moved="movedEvent"
          :static="!!enabledLock">
          <parser :item="item" :detailed="true" />
          <div class="mask" v-if="mask&&!noNeedMaskList.includes(item.jnpfKey)"></div>
        </grid-item>
      </grid-layout>
    </template>
    <div class="portal-layout-nodata" v-else>
      <img src="@/assets/images/dashboard-nodata.png" alt="" class="layout-nodata-img">
      <p class="layout-nodata-txt">暂无数据</p>
    </div>
  </el-scrollbar>
</template>

<script>
import parser from '@/components/VisualPortal/PortalDesign/components/parser'
import VueGridLayout from 'vue-grid-layout'
import { noNeedMaskList } from '@/components/VisualPortal/PortalDesign/components/config'
export default {
  props: {
    layout: { type: Array, default: () => [] },
    mask: { type: Boolean, default: false },
    detailed: { type: Boolean, default: false },
    enabledLock: { type: Number, default: 1 },
  },
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    parser
  },
  data() {
    return {
      noNeedMaskList,
      timer: ''
    }
  },
  methods: {
    movedEvent() {
      this.$emit('layoutUpdatedEvent')
    },
    resizedEvent(i, item) {
      this.$eventBus.$emit('eChart' + i)
      const loop = (data) => {
        if (data.children && item.children.length) {
          data.children.map(ele => {
            if (ele.jnpfKey) this.$eventBus.$emit('eChart' + ele.i)
            if (ele.children && ele.children.length) loop(ele)
          })
        }
      }
      loop(item)
      this.movedEvent()
    }
  }
}
</script>
<style lang="scss" scoped>
.layout-area {
  height: 100%;
  overflow: hidden;
  >>> .el-scrollbar__wrap {
    margin-bottom: 0 !important;
    overflow-x: auto;
  }
  >>> .el-scrollbar__bar.is-horizontal > div {
    display: none;
  }
  >>> .el-card {
    width: 100%;
    height: 100%;
    .el-card__body {
      padding: 0;
    }
  }
  .vue-grid-item {
    position: relative;
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9;
    }
    >>> .vue-resizable-handle {
      z-index: 200;
    }
  }
}
</style>