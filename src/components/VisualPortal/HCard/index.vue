<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-box-body">
      <template v-if="activeData.children&&activeData.children.length">
        <div v-for="(item,index) in activeData.children" :key="index">
          <parser-item :item="item" />
        </div>
      </template>
      <el-dropdown trigger="click" v-else>
        <span class="el-dropdown-link">
          <el-button icon="el-icon-plus">添加控件</el-button>
        </span>
        <el-dropdown-menu slot="dropdown">
          <div v-for="(item,index) in componentsList" :key="index">
            <el-dropdown placement="right-start" trigger="click">
              <el-dropdown-item><i :class="item.icon"></i>{{ item.label }}
              </el-dropdown-item>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(childItem,childIndex) in item.list" :key="childIndex"
                  @click.native="addComponent(childItem)">
                  <i :class="childItem.icon"></i>{{childItem.label}}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-card>
</template>
<script>
import {
  layoutComponents,
  systemComponents,
  basicComponents,
  chartComponents,
} from '@/components/VisualPortal/PortalDesign/components/config'
import CardHeader from "../CardHeader"
import ParserItem from '@/components/VisualPortal/PortalDesign/components/parser'
export default {
  components: { ParserItem, CardHeader },
  props: {
    activeData: { type: Object, default: () => { } }
  },
  data() {
    return {
      marqueeKey: +new Date(),
      key: +new Date(),
      fistData: {},
      secondData: {},
      thirdData: {},
      otherDataList: [],
      listLoading: false,
      value: '',
      list: [],
      timeList: [],
      componentsList: [
        { label: '布局控件', jnpfKey: 'layout', icon: 'icon-ym icon-ym-generator-function', list: layoutComponents },
        { label: '基础控件', jnpfKey: 'basic', icon: 'icon-ym icon-ym-tree-department', list: basicComponents },
        { label: '系统控件', jnpfKey: 'system', icon: 'icon-ym icon-ym-tree-user2', list: systemComponents },
        { label: '图表控件', jnpfKey: 'chart', icon: 'icon-ym icon-ym-file-photo', list: chartComponents }
      ],
    }
  },
  methods: {
    addComponent(val) {
      this.$eventBus.$emit('addComponent', val, this.activeData)
    }
  },
}
</script>
<style lang="scss" scoped>
.portal-box-body {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>