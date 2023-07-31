<template>
  <div class="item" @click.stop="handleClick(item)">
    <HTodo v-if="item.jnpfKey==='todo'" :activeData="item" :key="item.renderKey" />
    <HCommonFunc v-if="item.jnpfKey==='commonFunc'" :activeData="item" :key="item.renderKey" />
    <HDataBoard v-if="item.jnpfKey==='dataBoard'" :activeData="item" :key="item.renderKey" />
    <HTodoList v-if="item.jnpfKey==='todoList'" :activeData="item" />
    <HNotice v-if="item.jnpfKey==='notice'" :activeData="item" :key="item.renderKey"
      :showType='showType' />
    <HEmail v-if="item.jnpfKey==='email'" :activeData="item" />
    <HTable v-if="item.jnpfKey==='tableList'" :activeData="item" :showType='showType'
      :key="item.renderKey" />
    <HText v-if="item.jnpfKey==='text'" :activeData="item" :key="item.renderKey" />
    <HImage v-if="item.jnpfKey==='image'" :activeData="item" :key="item.renderKey" />
    <HCarousel v-if="item.jnpfKey==='carousel'" :activeData="item" :key="item.renderKey" />
    <HVideo v-if="item.jnpfKey==='video'" :activeData="item" :key="item.renderKey" />
    <HSchedule v-if="item.jnpfKey==='schedule'" :activeData="item" :key="item.renderKey" />
    <HIframe v-if="item.jnpfKey==='iframe'" :activeData="item" />
    <HBarChart v-if="item.jnpfKey==='barChart'" :activeData="item" />
    <HLineChart v-if="item.jnpfKey==='lineChart'" :activeData="item" />
    <HPieChart v-if="item.jnpfKey==='pieChart'" :activeData="item" />
    <HRadarChart v-if="item.jnpfKey==='radarChart'" :activeData="item" />
    <HMapChart v-if="item.jnpfKey==='mapChart'" :activeData="item" />
    <HRankList v-if="item.jnpfKey==='rankList'" :activeData="item" />
    <HTimeAxis v-if="item.jnpfKey==='timeAxis'" :activeData="item" />
    <template v-if="item.jnpfKey==='card'">
      <el-card shadow="never" class="portal-eChart-box">
        <CardHeader v-if="item.title" slot="header" :title="item.title" :card="item.card" />
        <div class="portal-box-body">
          <div v-show="item.children&&item.children.length" class="portal-box-item"
            v-for="(it,index) in item.children" :key="index" @click.stop="handleClick(it)">
            <parser :item="it" :class="{'active-item': it.i===activeId}" :activeId="activeId"
              :detailed="detailed" />
            <el-popconfirm v-if="!detailed" title="确定删除该组件？" class="drawing-item-delete"
              @confirm="(event)=>{handleRemoveItem(index,item.children)}">
              <i slot="reference" class="el-icon-delete"></i>
            </el-popconfirm>
          </div>
          <add-btn :activeData="item" @addComponent="addComponent"
            v-show="!item.children.length&&!detailed" />
        </div>
      </el-card>
    </template>
    <template v-if="item.jnpfKey==='tab'">
      <el-tabs v-model="item.active" :type="item.type" :tab-position="item['tab-position']"
        class="portal-eChart-tab" @tab-click="handleTabClick"
        :class="{'portal-eChart-tab-position':item['tab-position']=='left'||item['tab-position']=='right'}">
        <el-tab-pane v-for="child in item.children" :key="child.name" :label="child.title"
          :name="item.name" :style="{'color':'red'}">
          <span slot="label"><i v-if="item.icon" :class="child.icon"></i> {{child.title}}</span>
          <div class="portal-box-body">
            <div v-show="child.children&&child.children.length" class="portal-box-item"
              v-for="(it,index) in child.children" :key="index" @click.stop="handleClick(it)">
              <parser :item="it" :class="{'active-item': it.i===activeId}" :activeId="activeId"
                :detailed="detailed" />
              <el-popconfirm v-if="!detailed" title="确定删除该组件？" class="drawing-item-delete"
                @confirm="(event)=>{handleRemoveItem(index,child.children)}">
                <i slot="reference" class="el-icon-delete"></i>
              </el-popconfirm>
            </div>
            <add-btn :activeData="item" @addComponent="addComponent"
              v-show="!child.children.length&&!detailed" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>
    <template v-if="item.jnpfKey==='collapse'">
      <el-collapse v-model="item.active" :accordion="item.accordion" class="portal-eChart-tab">
        <el-collapse-item :title="child.title" :name="child.name"
          v-for="child,index in item.children" :key="index">
          <div class="portal-box-body">
            <div v-if="child.children&&child.children.length" class="portal-box-item">
              <parser v-for="(it,index) in child.children" :key="index" :item="it" style="300px" />
            </div>
            <add-btn :activeData="item" v-else @addComponent="addComponent($event,index)" />
          </div>
        </el-collapse-item>
      </el-collapse>
    </template>
  </div>
</template>
<script>
import {
  HTodo,
  HCommonFunc,
  HTodoList,
  HNotice,
  HEmail,
  HDataBoard,
  HTable,
  HText,
  HImage,
  HCarousel,
  HVideo,
  HSchedule,
  HIframe,
  HBarChart,
  HRankList,
  HLineChart,
  HPieChart,
  HMapChart,
  HRadarChart,
  HTimeAxis,
} from "@/components/VisualPortal"
import CardHeader from "@/components/VisualPortal/CardHeader"
import AddBtn from "./AddBtn"

export default {
  name: 'parser',
  props: ['item', 'activeId', 'showType', 'detailed'],
  components: {
    HTodo,
    HCommonFunc,
    HTodoList,
    HNotice,
    HEmail,
    HDataBoard,
    HTable,
    HText,
    HImage,
    HCarousel,
    HVideo,
    HSchedule,
    HIframe,
    HBarChart,
    HLineChart,
    HPieChart,
    HRadarChart,
    HMapChart,
    HRankList,
    HTimeAxis,
    CardHeader,
    AddBtn
  },
  data() {
    return {
      key: +new Date()
    }
  },
  watch: {
    "item.type": {
      handler(val) {
        this.handleTabClick()
      }
    },
  },
  created() {
    this.$watch(
      () => {
        return this.item['tab-position']
      },
      (val) => {
        this.handleTabClick()
      }
    )
  },
  methods: {
    addComponent(val, index) {
      this.$eventBus.$emit('addComponent', val, this.item, index)
    },
    handleClick(data) {
      this.$eventBus.$emit('handlerActive', data)
    },
    handleTabClick(e) {
      const active = this.item.active
      const subItem = this.item.children[active].children
      if (subItem && subItem.length) {
        subItem.map(ele => {
          this.$eventBus.$emit('eChart' + ele.i)
        })
      }
    },
    handleRemoveItem(i, parent) {
      parent.splice(i, 1)
    }
  },
}
</script>
<style lang="scss" scoped>
.item {
  width: 100%;
  height: 100%;
  >>> .el-card {
    width: 100%;
    height: 100%;
    .el-card__body {
      padding: 0;
      position: relative;
    }
  }
}
.portal-box-body {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;

  .portal-box-item {
    width: 100%;
    height: 100%;
  }
}
.portal-eChart-tab-position {
  >>> .el-tabs__content {
    height: 100% !important;
  }
}
.portal-eChart-tab {
  width: 100%;
  height: 100%;
  background-color: #fff;
  overflow: hidden;
  >>> .is-top {
    margin: unset;
  }
  >>> .is-bottom {
    margin: unset !important;
  }
  >>> .el-tabs__content {
    height: calc(100% - 42px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    .el-tab-pane {
      width: 100%;
      height: 100%;
    }
    &:hover {
      .drawing-item-delete {
        display: block;
      }
    }
  }
}
.active-item {
  border: 1px solid #409eff;
}
.portal-box-item {
  &:hover {
    .drawing-item-delete {
      display: block;
    }
  }
}

.drawing-item-delete {
  display: none;
  position: absolute;
  top: 5px;
  right: 20px;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  border: 1px solid;
  cursor: pointer;
  z-index: 20;
  border-color: #f56c6c;
  color: #f56c6c;
  background: #fff;
}

.el-tabs--border-card {
  >>> .el-tabs__content {
    padding: 0;
  }
}
</style>
