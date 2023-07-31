<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="todo-box-body">
      <router-link class="item" :style="{'width':100 / option.rowNumber+'%'}"
        :class="{'item-box':option.showBorder}"
        :to="item.category?item.urlAddress+'?category='+item.category:item.urlAddress"
        v-for="(item,index) in list" :key="index" v-show="!item.noShow">
        <i :class="item.icon" :style="{'background':item.iconBgColor}"></i>
        <div class="text">
          <p class="num" :style="{'font-size':option.valueFontSize+'px',
            'font-weight':option.valueFontWeight?'bolder':'normal','color':option.valueFontColor}">
            {{item.num}}
          </p>
          <p class="name"
            :style="{'font-size':option.labelFontSize+'px',
              'font-weight':option.labelFontWeight?'bolder':'normal','color':option.labelFontColor}">
            {{item.fullName}}
          </p>
        </div>
      </router-link>
    </div>
  </el-card>
</template>
<script>
import { getFlowTodoCount } from '@/api/home'
import CardHeader from "../CardHeader"
export default {
  components: { CardHeader },
  props: {
    activeData: { type: Object, default: () => { } }
  },
  data() {
    return {
      list: []
    }
  },
  computed: {
    option() {
      return this.activeData.option
    }
  },
  created() {
    this.list = this.option.defaultValue
    this.initData()
  },
  methods: {
    initData() {
      const query = {
        flowDoneType: [],
        toBeReviewedType: [],
        flowCirculateType: [],
      }
      this.list.map(ele => {
        if (ele.id == 'flowDone') query.flowDoneType = ele.category
        if (ele.id == 'toBeReviewed') query.toBeReviewedType = ele.category
        if (ele.id == 'flowCirculate') query.flowCirculateType = ele.category
      })
      getFlowTodoCount(query).then(res => {
        this.list.forEach((ele) => {
          if (ele.id == 'flowDone') ele.num = res.data.flowDone || 0
          if (ele.id == 'toBeReviewed') ele.num = res.data.toBeReviewed || 0
          if (ele.id == 'flowCirculate') ele.num = res.data.flowCirculate || 0
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.todo-box-body {
  display: flex;
  flex-wrap: wrap;
  .item-box {
    box-shadow: 1px 0 #f0f0f0, 0 1px #f0f0f0, 1px 1px #f0f0f0, 1px 0 #f0f0f0 inset, 0 1px #f0f0f0 inset;
    transition: all 0.3s;
    &:hover {
      position: relative;
      z-index: 1;
      box-shadow: 0 1px 2px -2px #00000029, 0 3px 6px #0000001f, 0 5px 12px 4px #00000017;
    }
  }
  .item {
    height: 141px;
    display: flex;
    align-items: center;
    overflow: hidden;
    i {
      width: 56px;
      height: 56px;
      margin-right: 14px;
      border-radius: 50%;
      color: #fff;
      display: inline-block;
      vertical-align: top;
      text-align: center;
      line-height: 56px;
      font-size: 30px;
      margin-left: 30px;
    }
    .text {
      display: inline-block;
      height: 56px;
      .num {
        font-size: 20px;
        line-height: 36px;
      }
      .name {
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>