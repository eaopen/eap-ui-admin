<template>
  <el-row>
    <el-form-item label="是否手风琴" v-show="showType==='pc'">
      <el-switch v-model="activeData.accordion" />
    </el-form-item>
    <el-divider>面板配置</el-divider>
    <draggable :list="activeData.__config__.children" :animation="340" group="selectItem"
      handle=".option-drag">
      <div v-for="(item, index) in activeData.__config__.children" :key="index" class="select-item">
        <div class="select-line-icon option-drag">
          <i class="icon-ym icon-ym-darg" />
        </div>
        <el-input v-model="item.title" placeholder="标签名称" size="small" />
        <div class="close-btn select-line-icon" @click="delItem(index,item)">
          <i class="el-icon-remove-outline" />
        </div>
      </div>
    </draggable>
    <div style="margin-left: 29px;">
      <el-button style="padding-bottom: 0" icon="el-icon-circle-plus-outline" type="text"
        @click="addItem">
        添加面板
      </el-button>
    </div>
  </el-row>
</template>
<script>
import draggable from 'vuedraggable'
import comMixin from './mixin';
export default {
  props: ['activeData'],
  mixins: [comMixin],
  components: { draggable },
  data() {
    return {}
  },
  created() { },
  methods: {
    addItem() {
      this.activeData.__config__.children.push({
        title: '新面板',
        name: this.jnpf.idGenerator(),
        __config__: {
          jnpfKey: "collapseItem",
          children: [],
        }
      })
    },
    delItem(index, item) {
      let list = this.activeData.__config__.children
      let length = list.length
      if (length < 2) {
        this.$message({
          message: '最后一项不能删除',
          type: 'warning'
        });
        return
      }
      this.$confirm('删除后不能撤销，确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.activeData.__config__.children.splice(index, 1)
      }).catch(() => { });
    }
  }
}
</script>