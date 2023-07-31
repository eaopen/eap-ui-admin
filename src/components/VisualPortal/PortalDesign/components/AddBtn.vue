<template>

  <el-dropdown trigger="click">
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
</template>
<script>
import {
  layoutComponents,
  systemComponents,
  basicComponents,
  chartComponents,
} from '@/components/VisualPortal/PortalDesign/components/config'
export default {
  props: {
    activeData: { type: Object, default: () => { } }
  },
  data() {
    return {
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
      this.$emit('addComponent', val)
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
    }
  }
}
</style>
