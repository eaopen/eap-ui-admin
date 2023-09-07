<template>
  <el-collapse-item title="标签设置" name="13">
    <el-form-item label="风格类型" v-show="showType==='pc'">
      <el-radio-group v-model="activeData.type">
        <el-radio-button label="">默认</el-radio-button>
        <el-radio-button label="card">选项卡</el-radio-button>
        <el-radio-button label="border-card">卡片化</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="选项卡位置" v-show="showType==='pc'">
      <el-radio-group v-model="activeData['tab-position']">
        <el-radio-button label="top">顶部</el-radio-button>
        <el-radio-button label="left">左侧</el-radio-button>
        <el-radio-button label="right">右侧</el-radio-button>
        <el-radio-button label="bottom">底部</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-divider>标签页配置</el-divider>
    <draggable :list="activeData.children" :animation="340" group="selectItem"
      handle=".option-drag">
      <div v-for="(item, index) in activeData.children" :key="index" class="select-item">
        <div class="select-line-icon option-drag">
          <i class="icon-ym icon-ym-darg" />
        </div>
        <el-input v-model="item.title" placeholder="标签名称" size="small" />
        <el-input v-model="item.icon" placeholder="请输入图标名称" v-show="showType==='pc'">
          <el-button slot="append" @click="openIconsDialog(item.icon,index)">
            选择
          </el-button>
        </el-input>
        <div class="close-btn select-line-icon" @click="delItem(index,item)">
          <i class="el-icon-remove-outline" />
        </div>
      </div>
    </draggable>
    <div style="margin-left: 29px;margin-bottom:15px">
      <el-button style="padding-bottom: 0" icon="el-icon-circle-plus-outline" type="text"
        @click="addItem">
        添加标签页
      </el-button>
    </div>
    <iconBox :visible.sync="iconsVisible" :current="currentIcon" @choiceIcon="setIcon" />
  </el-collapse-item>
</template>
<script>
import draggable from 'vuedraggable'
import iconBox from '@/components/extn/iconBox'
export default {
  components: { draggable, iconBox },
  props: ['activeData', 'showType'],
  data() {
    return {
      iconsVisible: false,
      currentIcon: '',
      currentIndex: 0
    }
  },
  methods: {
    addItem() {
      this.activeData.children.push({
        title: 'New Tab',
        children: []
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
        confirmBtnText: '确定',
        cancelBtnText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.activeData.active === item.name) {
          let nextTab = list[index + 1] || list[index - 1];
          if (nextTab) this.activeData.active = nextTab.name;
        }
        this.activeData.children.splice(index, 1)
      }).catch(() => { });
    },
    setIcon(val) {
      this.$set(this.activeData.children[this.currentIndex], 'icon', val)
    },
    openIconsDialog(icon, index) {
      this.currentIcon = icon
      this.currentIndex = index
      this.iconsVisible = true
    },
  }
}
</script>
