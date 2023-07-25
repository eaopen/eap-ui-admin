<template>
  <div class="icons-container">
    <aside>
      <el-input size="mini" v-model="searchKey" style="width: 250px" placeholder="输入icon名字搜索" clearable></el-input>
      <span style="display: inline-block; font-size: 14px; color:#67C23A; margin-left: 20px;">点击图标复制图标代码</span>
    </aside>
    <el-tabs type="border-card">
      <el-tab-pane label="Icons">
        <div v-for="item of svgIconsPool" :key="item" v-clipboard:copy="generateIconCode(item)" v-clipboard:success="clipboardSuccess">
          <el-tooltip placement="top">
            <div slot="content">
              {{ generateIconCode(item) }}
            </div>
            <div class="icon-item">
              <svg-icon :icon-class="item" class-name="disabled" />
              <span>{{ item }}</span>
            </div>
          </el-tooltip>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Element-UI Icons">
        <div v-for="item of elementIconsPool" :key="item" v-clipboard:copy="generateElementIconCode(item)" v-clipboard:success="clipboardSuccess">
          <el-tooltip placement="top">
            <div slot="content">
              {{ generateElementIconCode(item) }}
            </div>
            <div class="icon-item">
              <i :class="'el-icon-' + item" />
              <span>{{ item }}</span>
            </div>
          </el-tooltip>
        </div>
      </el-tab-pane>
      <el-tab-pane label="FA Icons">
        <div v-for="item of faIconsPool" :key="item.alias" v-clipboard:copy="generateEtechIconCode(item.alias)" v-clipboard:success="clipboardSuccess">
          <el-tooltip placement="top">
            <div slot="content">
              {{ generateEtechIconCode(item.alias) }}
            </div>
            <div class="icon-item">
              <i :class="'fa ' + item.alias" />
              <span>{{ item.alias }}</span>
            </div>
          </el-tooltip>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import svgIcons from './svg-icons'
import elementIcons from './element-icons'
import faIcons from './fa-icons'

export default {
  name: 'Icons',
  data() {
    return {
      svgIcons,
      elementIcons,
      faIcons,
      searchKey: ''
    }
  },
  computed:{
    svgIconsPool(){
      if(this.searchKey){
        return this.svgIcons.filter(i=>i.indexOf(this.searchKey)!=-1)
      }else {
        return this.svgIcons
      }
    },
    elementIconsPool(){
      if(this.searchKey){
        return this.elementIcons.filter(i=>i.indexOf(this.searchKey)!=-1)
      }else {
        return this.elementIcons
      }
    },
    faIconsPool(){
      if(this.searchKey){
        return this.faIcons.filter(i=>i.alias.indexOf(this.searchKey)!=-1)
      }else {
        return this.faIcons
      }
    },
  },
  methods: {
    clipboardSuccess() {
      this.$modal.msgSuccess("复制成功");
    },
    generateIconCode(symbol) {
      return `<svg-icon icon-class="${symbol}" />`
    },
    generateElementIconCode(symbol) {
      return `<i class="el-icon-${symbol}" />`
    },
    generateEtechIconCode(symbol){
      return `<i class="fa ${symbol}" />`
    }
  },
  created(){
    console.log(this.faIcons)
  }
}
</script>

<style lang="scss" scoped>
.icons-container {
  margin: 10px 20px 0;
  overflow: hidden;

  .icon-item {
    margin: 20px;
    height: 85px;
    text-align: center;
    width: 100px;
    float: left;
    font-size: 30px;
    color: #24292e;
    cursor: pointer;
  }

  span {
    display: block;
    font-size: 16px;
    margin-top: 10px;
  }

  .disabled {
    pointer-events: none;
  }
}
</style>
