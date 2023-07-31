<template>
  <el-collapse-item title="标签设置" name="13">
    <el-form-item label="是否手风琴">
      <el-switch v-model="activeData.accordion" />
    </el-form-item>
    <el-divider>面板配置</el-divider>
    <draggable :list="activeData.children" :animation="340" group="selectItem"
      handle=".option-drag">
      <div v-for="(item, index) in activeData.children" :key="index" class="select-item">
        <div class="select-line-icon option-drag">
          <i class="icon-ym icon-ym-darg" />
        </div>
        <el-input v-model="item.title" placeholder="标签名称" size="small" />
        <div class="close-btn select-line-icon" @click="delItem(index,item)">
          <i class="el-icon-remove-outline" />
        </div>
      </div>
    </draggable>
    <div style="margin-left: 29px;margin-bottom:15px">
      <el-button style="padding-bottom: 0" icon="el-icon-circle-plus-outline" type="text"
        @click="addItem">
        添加面板
      </el-button>
    </div>
  </el-collapse-item>
</template>
<script>
import draggable from 'vuedraggable'
export default {
  props: ['activeData'],
  components: { draggable },
  data() {
    return {}
  },
  created() { },
  methods: {
    addItem() {
      this.activeData.children.push({
        title: '新面板',
        name: this.jnpf.idGenerator(),
        children: [],
      })
    },
    delItem(index, item) {
      let list = this.activeData.children
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
        this.activeData.children.splice(index, 1)
      }).catch(() => { });
    }
  }
}
</script>