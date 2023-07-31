<template>
  <el-container class="JNPF-Portal">
    <el-main class="center-box">
      <div class="action-bar">
        <div class="components-list">
          <div v-for="(item, listIndex) in componentsList" :key="listIndex" class="components-part">
            <el-dropdown @command="addComponent">
              <div class="components-title">{{ item.title }}<i
                  class="el-icon-arrow-down el-icon--right"></i></div>
              <el-dropdown-menu slot="dropdown" class="components-box">
                <el-dropdown-item class="components-item" v-for="(element, index) in item.list"
                  :icon="element.icon" :key="index" :command="element">{{element.label}}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
      <el-scrollbar class="layout-area" :class="{'ml-10':showType=='pc'}">
        <div v-if="showType=='pc'">
          <grid-layout :layout.sync="layout" :row-height="40" v-if="layout.length">
            <grid-item v-for="item in layout" :x="item.x" :y="item.y" :w="item.w" :h="item.h"
              :i="item.i" :key="item.i" :maxH="item.maxH" :minH="item.minH" :minW="item.minW"
              :maxW="item.maxW" :class="{'active-item': item.i===activeId}"
              @resized="resizedEvent(item.i,item)" @moved="movedEvent"
              @click.native="handleClick(item)">
              <parser :item="item" :activeId="activeId" />
              <div class="mask" v-if="!noNeedMaskList.includes(item.jnpfKey)"></div>
              <span title="复制" class="drawing-item-copy" @click="addComponent(item,'copy')">
                <i class="el-icon-copy-document"></i></span>
              <el-popconfirm title="确定删除该组件？" class="drawing-item-delete"
                @confirm="(event)=>{handleRemoveItem(item.i)}">
                <i slot="reference" class="el-icon-delete"></i>
              </el-popconfirm>
            </grid-item>
          </grid-layout>
          <div v-show="!layout.length" class="empty-info">
            <img src="@/assets/images/emptyPortal.png" class="empty-img">
          </div>
        </div>
        <div id="ipad" v-else>
          <div class="outeripad">
            <div class="ipadbody">
              <div class="ipad-name">当前展示pc设计内容，请前往APP查看效果</div>
              <el-scrollbar class="center-scrollbar">
                <draggable v-if="layout.length" class="drawing-board" :list="layout"
                  :animation="340" group="componentsGroup">
                  <div v-for="(item,index) in layout" :key="index" class="item-box"
                    @click="handleClick(item)" :class="{'active-item': item.i===activeId}">
                    <parser :item="item" :activeId="activeId" :showType='showType' />
                    <div class="mask" v-if="!noNeedMaskList.includes(item.jnpfKey)"></div>
                    <span title="复制" class="drawing-item-copy" @click="addComponent(item)">
                      <i class="el-icon-copy-document"></i></span>
                    <el-popconfirm title="确定删除该组件？" class="drawing-item-delete"
                      @confirm="(event)=>{handleRemoveItem(item.i)}">
                      <i slot="reference" class="el-icon-delete"></i>
                    </el-popconfirm>
                  </div>
                </draggable>
                <div v-show="!layout.length" class="empty-info app-empty-info">
                  <img src="@/assets/images/emptyPortal.png" class="empty-img">
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-main>
    <right-panel :active-data="activeData" :refresh="refresh" :showType="showType" />
    <Preview :visible.sync="previewVisible" :layout="layout" />
  </el-container>
</template>
<script>
import VueGridLayout from 'vue-grid-layout'
import { deepClone } from '@/utils'
import {
  layoutComponents,
  systemComponents,
  basicComponents,
  chartComponents,
  noNeedMaskList,
  needDefaultList,
} from './config'
import {
  chartData,
  mapChartData,
  rankList,
  timeAxisList,
  tableList
} from '@/components/VisualPortal/PortalDesign/components/data'
import Preview from './Preview'
import CardHeader from '@/components/VisualPortal/CardHeader'
import RightPanel from './RightPanel'
import parser from './parser'
import draggable from 'vuedraggable'
import { validURL } from '@/utils/validate'

const defaultConf = {
  layoutId: 100,
  layout: [],
  refresh: {
    autoRefresh: false,
    autoRefreshTime: '5',
  }
}
export default {
  name: 'JNPF-PortalDesigner',
  props: ['conf', 'showType'],
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    Preview,
    RightPanel,
    draggable,
    CardHeader,
    parser
  },
  data() {
    return {
      componentsList: [
        { title: '布局控件', list: layoutComponents },
        { title: '基础控件', list: basicComponents },
        { title: '系统控件', list: systemComponents },
        { title: '图表控件', list: chartComponents }
      ],
      layout: [],
      activeId: null,
      activeData: null,
      refresh: {},
      previewVisible: false,
      noNeedMaskList,
      config: {},
      copyDrawingList: ''
    }
  },
  mounted() {
    if (typeof this.conf === 'object' && this.conf !== null) {
      this.config = { ...defaultConf, ...this.conf }
    } else {
      this.config = deepClone(defaultConf)
      this.config.layoutId = 100
    }
    this.layout = this.config.layout || []
    this.refresh = this.config.refresh || {}
    setTimeout(() => {
      this.addLocalRecord(this.layout)
      this.setActiveData()
    }, 50);
    this.$eventBus.$on('addComponent', (val, currentVal, index) => {
      this.addComponent(val, '', currentVal, index)
    })
    this.$eventBus.$on('handlerActive', val => {
      this.handleClick(val)
    })
  },
  beforeDestroy() {
    if (this.activeData && this.activeData.i) this.$eventBus.$off('eChart' + this.activeData.i)
    this.$eventBus.$off('addComponent')
    this.$eventBus.$off('handlerActive')
  },
  methods: {
    handleData(data) {
      this.layout = JSON.parse(JSON.stringify(data));
      this.copyDrawingList = JSON.stringify(this.layout);
      let boo = false;
      const loop = list => {
        for (let i = 0; i < list.length; i++) {
          const e = list[i];
          if (e.i === this.activeId) {
            this.activeData = e;
            this.activeId = e.i
            boo = true;
          }
          if (e.children && Array.isArray(e.children)) loop(e.children);
        }
      };
      loop(this.layout);
      if (!boo) {
        this.activeData = {};
        this.activeId = null;
      }
    },
    addLocalRecord(val) {
      if (JSON.stringify(val) != this.copyDrawingList) {
        this.copyDrawingList = JSON.stringify(val);
        this.$emit('addRecord', val)
      }
    },
    setActiveData(i = 0) {
      this.activeId = null
      this.activeData = {}
      if (this.layout.length) {
        this.activeData = this.layout[i]
        this.activeId = this.layout[i].i
      }
    },
    getData() {
      return new Promise((resolve, reject) => {
        const loop = list => {
          for (let i = 0; i < list.length; i++) {
            const e = list[i]
            const option = e.option || {}
            const card = e.card || {}
            if (card.cardRightBtn) {
              if (card.linkType === '1' && !card.urlAddress) {
                reject({ msg: `${e.label}控件“菜单名称”属性不能为空`, target: 1 })
                break
              }
              if (card.linkType === '2') {
                if (!card.urlAddress) {
                  reject({ msg: `${e.label}控件“链接地址”属性不能为空`, target: 1 })
                  break
                }
                if (!validURL(card.urlAddress)) {
                  reject({ msg: '请输入正确的链接地址', target: 1 })
                  break
                }
              }
              if (card.appLinkType === '1' && !card.appUrlAddress) {
                reject({ msg: `${e.label}控件“菜单名称”属性不能为空`, target: 1 })
                break
              }
              if (card.appLinkType === '2') {
                if (!card.appUrlAddress) {
                  reject({ msg: `${e.label}控件“链接地址”属性不能为空`, target: 1 })
                  break
                }
                if (!validURL(card.appUrlAddress)) {
                  reject({ msg: '请输入正确的链接地址', target: 1 })
                  break
                }
              }
            }
            if (option.linkType === '1' && !option.urlAddress) {
              reject({ msg: `${e.label}控件“菜单名称”属性不能为空`, target: 1 })
              break
            }
            if (option.linkType === '2') {
              if (!option.urlAddress) {
                reject({ msg: `${e.label}控件“链接地址”属性不能为空`, target: 1 })
                break
              }
              if (!validURL(option.urlAddress)) {
                reject({ msg: '请输入正确的链接地址', target: 1 })
                break
              }
            }
            if (option.appLinkType === '1' && !option.appUrlAddress) {
              reject({ msg: `${e.label}控件“菜单名称”属性不能为空`, target: 1 })
              break
            }
            if (option.appLinkType === '2') {
              if (!option.appUrlAddress) {
                reject({ msg: `${e.label}控件“链接地址”属性不能为空`, target: 1 })
                break
              }
              if (!validURL(option.appUrlAddress)) {
                reject({ msg: '请输入正确的链接地址', target: 1 })
                break
              }
            }
            if ((e.jnpfKey == 'video' || e.jnpfKey == 'image') && option.styleType == 2) {
              const val = e.jnpfKey == 'video' ? '视频' : '图片'
              if (!option.defaultValue) {
                reject({ msg: `${e.label}控件“${val}地址”属性不能为空`, target: 1 })
                break
              }
              if (!validURL(option.defaultValue)) {
                reject({ msg: `请输入正确的${val}地址`, target: 1 })
                break
              }
            }
            if (e.jnpfKey == 'iframe') {
              if (!option.defaultValue) {
                reject({ msg: `${e.label}控件“链接地址”属性不能为空`, target: 1 })
                break
              }
              if (!validURL(option.defaultValue)) {
                reject({ msg: '请输入正确的链接地址', target: 1 })
                break
              }
            }
            if (e.children && Array.isArray(e.children)) loop(e.children)
          }
        }
        loop(this.layout)
        this.config.layout = this.layout
        resolve({ formData: this.config, target: 1 })
      })
    },
    addComponent(item, type, currentItem, index) {
      let clone = deepClone(item)
      let x = 0, y = 0, i = this.config.layoutId
      if (this.layout.length) {
        let lastItem = this.layout[this.layout.length - 1]
        y = lastItem.y + lastItem.h
      }
      let row = { ...clone, i, x, y }
      if (needDefaultList.includes(row.jnpfKey) && type != 'copy') row.option.defaultValue = this.getDefaultValue(row)
      if (currentItem) {
        if (currentItem.jnpfKey == 'card') currentItem.children.push(row)
        if (currentItem.jnpfKey == 'tab') currentItem.children[currentItem.active].children.push(row)
        if (currentItem.jnpfKey == 'collapse') currentItem.children[index].children.push(row)
      } else {
        this.layout.push(row)
      }
      this.activeId = this.config.layoutId
      this.activeData = row
      this.config.layoutId++
      this.addLocalRecord(this.layout)
    },
    getDefaultValue(row) {
      const jnpfKey = row.jnpfKey
      if (jnpfKey == 'text') return "JNPF快速开发平台"
      if (jnpfKey == 'image') return "https://app.cdn.jnpfsoft.com/image/3.2/banner1.png"
      if (jnpfKey == 'video') return "https://cdn.jnpfsoft.com/2022/video/index_video.mp4"
      if (jnpfKey == 'barChart' || jnpfKey == 'lineChart' || jnpfKey == 'pieChart') return chartData.baseBarData
      if (jnpfKey == 'radarChart') return chartData.radarData
      if (jnpfKey == 'mapChart') return mapChartData
      if (jnpfKey == 'rankList') return rankList
      if (jnpfKey == 'timeAxis') return timeAxisList
      if (jnpfKey == 'tableList') return tableList
    },
    handleRemoveItem(i) {
      this.layout = this.layout.filter(item => item.i !== i);
      this.activeId = null
      this.activeData = {}
      this.addLocalRecord(this.layout)
      this.$nextTick(() => {
        const len = this.layout.length
        if (len) this.setActiveData(len - 1)
      })
    },
    empty() {
      this.$confirm('确定要清空所有吗？', '提示', { type: 'warning' }).then(() => {
        this.layout = []
        this.config.layoutId = 100
        this.activeId = null
        this.activeData = {}
        this.addLocalRecord(this.layout)
      }).catch(() => { })
    },
    preview() {
      this.previewVisible = true
    },
    handleClick(item) {
      this.activeId = item.i
      this.activeData = item
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
      this.addLocalRecord(this.layout)
    },
    movedEvent() {
      this.addLocalRecord(this.layout)
    }
  }
}
</script>
<style lang="scss" scoped>
$lighterBlue: #409eff;
.JNPF-Portal {
  height: 100%;
  .el-aside,
  >>> .el-aside {
    padding: 0;
    margin: 0;
    .cap-wrapper {
      position: relative;
      height: 42px;
      border-bottom: 1px solid #dcdfe6;
      box-sizing: border-box;
      line-height: 41px;
      padding-left: 10px;
      font-size: 16px;
    }
    .aside-scrollbar {
      height: calc(100% - 42px);
      overflow: hidden;

      .el-scrollbar__wrap {
        overflow-x: auto;
      }
    }
  }
  .left-box {
    background-color: #fff;
    border-radius: 4px;
    overflow: hidden;
  }
  .el-main {
    height: 100%;
    padding: 0;
    overflow: hidden;
    .action-bar {
      position: relative;
      height: 40px;
      padding: 0 15px;
      box-sizing: border-box;
      background: #fff;
      margin-right: 10px;
      border: none;
      display: flex;
      border-bottom: 1px solid #dcdfe6;
      justify-content: space-between;
      .icon {
        color: #000 !important;
      }

      .delete-btn {
        color: #f56c6c !important;
      }

      .unActive-btn {
        color: #606266 !important;
        &:hover {
          color: #1890ff !important;
        }
      }

      .components-list {
        display: flex;
        align-items: center;

        .components-part {
          padding: 0 10px;
          margin-bottom: unset;

          .components-title {
            margin-bottom: unset;
            font-weight: normal;
            cursor: pointer;
          }
        }
      }
    }
    .empty-info {
      position: absolute;
      top: calc(50% - 200px);
      left: calc(50% - 200px);

      .empty-img {
        width: 400px;
        height: 400px;
      }
    }
    >>> .vue-grid-item.vue-grid-placeholder {
      background: $lighterBlue;
    }

    .layout-area {
      height: calc(100% - 42px);
      margin-left: -10px;
      margin-right: 10px;
      background: #fff;
      position: relative;
      border: none;
      #ipad {
        height: calc(100% - 42px);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 781px;

        >>> .eChart-box-body {
          height: 250px !important;
        }

        .empty-info {
          top: calc(50% - 150px);
          left: calc(50% - 150px);

          .empty-img {
            width: 300px;
            height: 300px;
          }
        }

        .outeripad {
          background: url('../../../../assets/images/iphoneBg.png');
          width: 389px;
          height: 711px;
          padding: 65px 40px;

          .ipadHead {
            background: #f7f8f9;
            text-align: center;

            .ipadHead-img {
              margin: 0 auto;
              height: 20px;
            }
          }

          .ipadbody {
            height: 98%;
            // background: #ebeef5;
            .ipad-name {
              text-align: center;
              margin-bottom: 5px;
              margin-top: 5px;
            }
            .center-board-row > .el-form {
              height: 550px;
            }

            .center-scrollbar {
              height: 95.6672%;
              overflow: hidden;
            }
          }
        }
      }

      >>> .el-scrollbar__wrap {
        margin-bottom: 0 !important;
        overflow-x: auto;
      }
      .item-box {
        margin: 10px;
      }
      .drawing-board,
      .vue-grid-item,
      .item-box {
        position: relative;
        height: 100%;
        border: 1px dashed #e2e0e0;

        >>> .vue-resizable-handle {
          z-index: 20;
        }
        &.active-item {
          border: 1px solid $lighterBlue;
          & > .drawing-item-copy,
          & > .drawing-item-delete {
            display: block !important;
          }
        }
        .mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9;
        }
        .drawing-item-copy,
        .drawing-item-delete {
          display: none;
          position: absolute;
          top: -10px;
          width: 22px;
          height: 22px;
          line-height: 22px;
          text-align: center;
          border-radius: 50%;
          font-size: 12px;
          border: 1px solid;
          cursor: pointer;
          z-index: 20;
        }

        .drawing-item-copy {
          right: 56px;
          border-color: $lighterBlue;
          color: $lighterBlue;
          background: #fff;

          &:hover {
            background: $lighterBlue;
            color: #fff;
          }
        }

        .drawing-item-delete {
          right: 20px;
          border-color: #f56c6c;
          color: #f56c6c;
          background: #fff;

          &:hover {
            background: #f56c6c;
            color: #fff;
          }
        }
        &:hover {
          .drawing-item-copy,
          .drawing-item-delete {
            display: block;
          }
        }
        >>> .el-card {
          width: 100%;
          height: 100%;
          .el-card__body {
            padding: 0;
          }
        }
      }
    }
  }
}
.components-box {
  >>> .components-item {
    line-height: 35px;
    padding: 0 25px 0 20px;
  }
}
.ml-10 {
  >>> .el-scrollbar__wrap {
    margin-left: 10px !important;
  }
}
</style>

