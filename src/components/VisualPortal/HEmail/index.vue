<template>
  <el-card shadow="never" class="portal-todoList-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-todoList-box-body">
      <template v-if="list.length">
        <router-link class="item com-hover" :to="'/emailDetail?id='+item.id"
          v-for="(item, i) in list" :key="i">
          <span class="name">{{item.fullName}}</span>
          <span class="time">{{item.creatorTime | toDateText()}}</span>
        </router-link>
      </template>
      <div class="portal-common-noData" v-else>
        <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
        <p class="noData-txt">暂无数据</p>
      </div>
    </div>
  </el-card>
</template>
<script>
import { getEmail } from '@/api/home'
import CardHeader from "../CardHeader"
export default {
  components: { CardHeader },
  props: {
    activeData: { type: Object, default: () => { } },
  },
  data() {
    return {
      list: []
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      getEmail().then(res => {
        this.list = res.data.list ? res.data.list.slice(0, 7) : []
      })
    }
  }
}
</script>