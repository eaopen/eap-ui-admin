<template>
  <el-collapse-item title="卡片设置" name="13">
    <el-form-item label="标题名称">
      <el-input v-model="activeData.title" placeholder="请输入标题名称" />
    </el-form-item>
    <el-form-item label="字体大小">
      <el-input-number v-model="activeData.card.titleFontSize" controls-position="right" :min="12"
        :max="25" />
    </el-form-item>
    <el-form-item label="字体加粗">
      <el-switch v-model="activeData.card.titleFontWeight" />
    </el-form-item>
    <el-form-item label="字体颜色" style="height:32px">
      <el-color-picker v-model="activeData.card.titleFontColor" />
    </el-form-item>
    <el-form-item label="字体位置">
      <el-radio-group v-model="activeData.card.titleLeft" size="small">
        <el-radio-button :label="item.value" v-for="(item,index) in alignList" :key="index">
          {{item.label}}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="背景色" style="height:32px">
      <el-color-picker v-model="activeData.card.titleBgColor" />
    </el-form-item>
    <el-form-item label="图标">
      <el-input v-model="activeData.card.cardIcon" placeholder="请输入图标名称">
        <el-button slot="append" @click="openIconsDialog">
          选择
        </el-button>
      </el-input>
    </el-form-item>
    <el-form-item label="图标颜色" style="height:32px">
      <el-color-picker v-model="activeData.card.cardIconColor" />
    </el-form-item>
    <iconBox :visible.sync="iconsVisible" :current="activeData.card.cardIcon"
      @choiceIcon="setIcon" />
    <el-form-item label="右上角名称">
      <el-input v-model="activeData.card.cardRightBtn" placeholder="请输入右上角名称" />
    </el-form-item>
    <Link v-if="activeData.card.cardRightBtn" :activeData="activeData" :menuList="menuList"
      :appMenuList="appMenuList" :showType="showType" :type="2" />
  </el-collapse-item>
</template>
<script>
import { alignList } from '../../components/config'
import iconBox from '@/components/extn/iconBox'
import Link from '../common/Link'
export default {
  components: { iconBox, Link },
  props: ['activeData', 'menuList', 'appMenuList', 'showType'],
  data() {
    return {
      alignList,
      iconsVisible: false
    }
  },
  watch: {
    'activeData.title': {
      handler() {
        this.$eventBus.$emit('eChart' + this.activeData.i)
      }
    }
  },
  methods: {
    openIconsDialog() {
      this.iconsVisible = true
    },
    setIcon(val) {
      this.activeData.card.cardIcon = val
    },
  }
}
</script>