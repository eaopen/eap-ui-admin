<template>
  <el-row>
    <el-form-item label="提示文本">
      <el-input v-model="activeData.title" placeholder="请输入提示文本" />
    </el-form-item>
    <el-form-item label="辅助文本">
      <el-input type="textarea" :rows="3" v-model="activeData.description" placeholder="请输入辅助文本" />
    </el-form-item>
    <el-form-item label="样式效果">
      <div class="type-list">
        <div class="type-list-item" :class="{active:activeData.type===item.id}"
          v-for="(item,i) in typeList" :key="i" @click="activeData.type=item.id">
          <el-alert :title="item.fullName" :type="item.id" :closable="false" center />
        </div>
      </div>
    </el-form-item>
    <el-form-item label="提示图标">
      <el-switch v-model="activeData['show-icon']" />
    </el-form-item>
    <el-form-item label="提示可关闭">
      <el-switch v-model="activeData.closable" />
    </el-form-item>
    <el-form-item label="按钮文字" v-if="activeData.closable">
      <el-input v-model="activeData.closeText" maxlength="10" placeholder="请输入按钮文字" />
    </el-form-item>
  </el-row>
</template>
<script>
import comMixin from "./mixin";
export default {
  props: ["activeData"],
  mixins: [comMixin],
  data() {
    return {
      typeList: [
        {
          id: 'success',
          fullName: '成功提示'
        },
        {
          id: 'info',
          fullName: '消息提示'
        },
        {
          id: 'warning',
          fullName: '警告提示'
        },
        {
          id: 'error',
          fullName: '错误提示'
        },
      ]
    };
  },
  created() { },
  methods: {}
};
</script>
<style lang="scss" scoped>
.type-list {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .type-list-item {
    width: 110px;
    margin-bottom: 10px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #fff;
    &:last-child,
    &:nth-last-child(2) {
      margin-bottom: 0;
    }
    &.active {
      border: 1px solid #999;
    }
  }
}
</style>