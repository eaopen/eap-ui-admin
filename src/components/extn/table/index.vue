<template>
  <div class="tableContainer">
    <el-table v-if="!refreshTable" :data="data" ref="JNPFTable" class="JNPF-common-table"
      :height="height" :element-loading-text="$t('common.loadingText')" v-bind="$attrs"
      v-on="$listeners" :border="border">
      <el-table-column prop="selection" type="selection" width="50" v-if="hasC" align="center"
        :selectable="checkSelectable" />
      <el-table-column prop="index" type="index" width="50" label="序号" v-if="hasNO"
        :fixed="hasNOFixed" align="center" />
      <jnpf-table-column :columns="columns" :columnList="columnList" v-if="customColumn" />
      <template v-else>
        <slot />
      </template>
      <el-table-column align="center" fixed="right" width="40" v-if="customColumn">
        <template slot="header">
          <el-tooltip content="表头设置" placement="top">
            <el-link icon="icon-ym icon-ym-shezhi JNPF-common-head-icon" :underline="false"
              @click="showDrawer" />
          </el-tooltip>
        </template>
      </el-table-column>
      <template slot="empty">
        <el-empty description="暂无数据" :image-size="120"></el-empty>
      </template>
    </el-table>
    <ColumnSettings v-if="drawerVisible" ref="columnSettings" :defaultColumns="defaultColumns"
      :columnList="columnList" @setColumn="setColumn" />
  </div>
</template>

<script>
import JnpfTableColumn from './Column'
import ColumnSettings from './ColumnSettings'
export default {
  name: 'JNPF-table',
  components: { JnpfTableColumn, ColumnSettings },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    // 序号 默认有
    hasNO: {
      type: Boolean,
      default: true
    },
    hasNOFixed: {
      type: Boolean,
      default: false
    },
    // 多选框 默认无
    hasC: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    },
    customColumn: {
      type: Boolean,
      default: false
    },
    height: {
      default: '100%'
    }
  },
  data() {
    return {
      columnList: [],
      hasSlotContent: false,
      columns: [],
      defaultColumns: [],
      drawerVisible: false,
      refreshTable: false
    }
  },
  watch: {
    data: {
      handler(val) {
        if (!val) return
        this.doLayout()
      },
      deep: true
    }
  },
  computed: {
    menuId() {
      return this.$route.meta.modelId || ''
    }
  },
  mounted() {
    this.getColumns()
  },
  beforeUpdate() {
    this.getColumns()
  },
  updated() {
    if (this.refreshTable) this.refreshTable = false
  },
  methods: {
    showDrawer() {
      this.drawerVisible = true
      this.$nextTick(() => {
        this.$refs.columnSettings.init(this.columnList, this.columns)
      })
    },
    checkForSlotContent() {
      let checkForContent = (hasContent, node) => {
        return hasContent || node.tag || (node.text && node.text.trim())
      }
      return this.$slots && this.$slots.default && this.$slots.default.reduce(checkForContent, false)
    },
    getColumns() {
      if (!this.customColumn) return
      this.hasSlotContent = this.checkForSlotContent()
      if (!this.hasSlotContent) return
      this.columns = this.$slots.default
      let defaultColumns = this.columns.map(o => o.componentOptions && o.componentOptions.propsData).filter(item => item)
      this.defaultColumns = defaultColumns.filter(o => o.prop)
      let list = [...this.defaultColumns]
      const cacheList = this.jnpf.storageGet(this.menuId)
      if (!cacheList) {
        this.columnList = list.map(item => {
          return {
            ...item,
            columnVisible: true
          }
        })
      } else {
        let columnList = cacheList.map(item => {
          let isShow = false
          list.forEach(item2 => {
            if (item.prop === item2.prop) isShow = true
          })
          return isShow ? item : null
        }).filter(item => item)
        this.columnList = this.mergeArray(columnList, list)
      }
    },
    mergeArray(arr1, arr2) {
      let arr = [...arr1]
      for (let i = 0; i < arr2.length; i++) {
        let flag = true
        inner: for (let j = 0; j < arr1.length; j++) {
          if (arr2[i].prop == arr1[j].prop) {
            flag = false
            break inner
          }
        }
        if (flag) arr.push(arr2[i])
      }
      return arr
    },
    doLayout() {
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs && this.$refs.JNPFTable && this.$refs.JNPFTable.doLayout()
        })
      }, 50)
    },
    setColumn(list) {
      // this.loading = true
      this.jnpf.storageSet({ [this.menuId]: list })
      this.columnList = list
      this.$forceUpdate()
      this.refreshTable = true
    },
    checkSelectable(row) {
      if (row.top) return false
      return true
    }
  }
}
</script>
<style lang="scss">
.tableContainer {
  flex: 1 0 0;
  height: 100%;
  overflow: hidden;
}
</style>
