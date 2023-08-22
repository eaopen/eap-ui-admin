<template>
  <el-drawer title="列表显示设置" :visible.sync="drawerVisible" :wrapperClosable="false" size="320px"
    append-to-body class="JNPF-common-drawer columnSettings-drawer">
    <div class="JNPF-flex-main">
      <el-scrollbar class="column-list" v-loading="loading">
        <template v-if="list.length">
          <draggable :list="list" :animation="340" handle=".column-item-icon">
            <div class="column-item" v-for="item in list" :key="item.prop"
              @click.self="item.columnVisible = !item.columnVisible">
              <div class="column-item-label">
                <i class="icon-ym icon-ym-darg column-item-icon"></i>
                <span>{{item.label}}</span>
              </div>
              <el-checkbox class="check-box" v-model="item.columnVisible">
              </el-checkbox>
            </div>
          </draggable>
        </template>
        <el-empty description="暂无数据" :image-size="120" v-else></el-empty>
      </el-scrollbar>
      <div class="footer">
        <el-button @click="drawerVisible=false">取 消</el-button>
        <el-button type="primary" @click="saveSettings">确 定</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  name: 'ColumnSettings',
  components: { draggable },
  props: {
    defaultColumns: {
      type: Array,
      default: () => []
    },
    columnList: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      loading: false,
      drawerVisible: false,
      list: []
    }
  },
  computed: {
    menuId() {
      return this.$route.meta.modelId || ''
    }
  },
  methods: {
    init() {
      this.drawerVisible = true
      this.list = [...this.columnList]
    },
    reset() {
      this.list = this.defaultColumns.map(item => ({
        ...item,
        columnVisible: true
      }))
    },
    saveSettings() {
      this.$emit('setColumn', this.list)
      this.drawerVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.columnSettings-drawer {
  .JNPF-flex-main {
    overflow: hidden;
  }
  .columnSetting-head {
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    font-size: 14px;
    color: #303133;
  }

  .column-list {
    height: 100%;
    padding: 8px 10px 0;
    .column-item {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0;
      font-size: 12px;
      color: #303133;
      cursor: pointer;
      border-bottom: 1px solid #e3e6eb;
      &:hover {
        background: rgba(25, 144, 250, 0.1);
      }
      .column-item-icon {
        margin: auto 8px auto 10px;
        color: #909399;
        cursor: move;
        font-size: 14px;
      }
      .el-switch {
        transform: scale(0.8);
      }
      .column-item-label {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        word-break: break-all;
        display: flex;
        align-items: center;
      }
      .check-box {
        margin-right: 16px;
      }
    }
  }
  .footer {
    margin: 4px 20px 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>