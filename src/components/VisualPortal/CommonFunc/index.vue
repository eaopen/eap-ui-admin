<template>
  <el-card shadow="never" class="commonFunc-box">
    <div slot="header" class="portal-common-title">
      <span>{{title}}</span>
    </div>
    <div class="commonFunc-box-body">
      <app-link class="item com-hover" :to="item.path" v-for="(item,i) in menuList" :key="i">
        <i :class="item.icon" :style="{color:item.iconBackgroundColor||'#1890FF'}"></i>
        <p class="name">{{item.fullName}}</p>
      </app-link>
    </div>
  </el-card>
</template>
<script>
import AppLink from './Link'
import { getToken } from '@/utils/auth'
export default {
  components: { AppLink },
  props: {
    title: { type: String, default: '' },
    list: { type: Array, default: () => [] }
  },
  data() {
    return {
      menuList: []
    }
  },
  created() {
    this.getList()
  },
  watch: {
    list: {
      handler(val) {
        this.getList()
      },
      deep: true
    }
  },
  methods: {
    getList() {
      let list = this.list.filter(o => o.id)
      list = list.map(o => {
        let path = '/' + o.urlAddress
        // 大屏
        if (o.type == 6) {
          let propertyJson = o.propertyJson ? JSON.parse(o.propertyJson) : null,
            moduleId = '';
          if (propertyJson) moduleId = propertyJson.moduleId || ''
          path = `${this.define.dataV}/view/${moduleId}?token=${getToken()}`
        }
        if (o.type == 7) {
          if (o.linkTarget === "_self") {
            path = '/' + o.enCode
          } else {
            path = o.urlAddress.replace(/\${dataV}/g, this.define.dataV).replace(/\${jnpfToken}/g, getToken())
            if(path.startsWith("/")){
              path = location.origin + path;
            }
          }
        }
        return {
          ...o,
          path
        }
      })
      this.menuList = list
    }
  },
}
</script>
<style lang="scss" scoped>
.commonFunc-box {
  >>> .el-card__body {
    width: 100%;
    height: calc(100% - 55px);
  }
  .commonFunc-box-body {
    padding: 0 30px;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .item {
      display: block;
      text-align: center;
      i {
        display: inline-block;
        height: 40px;
        font-size: 40px;
        margin-bottom: 10px;
      }
      .name {
        font-size: 14px;
        line-height: 20px;
      }
    }
  }
}
</style>
