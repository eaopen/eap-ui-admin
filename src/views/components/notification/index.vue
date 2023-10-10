<template>
  <div class="icons-container">
    <div  style="margin-top: 20px;">
      <el-button @click="isSupport">浏览器支持</el-button>
        <el-button @click="isGetPermission">是否可以显示桌面通知</el-button>
        <el-button @click="isDisable">是否禁用本网站的显示桌面通知</el-button>
        <el-button @click="isRequestPermission">尝试获取发送桌面通知权限</el-button>
    </div>
    <div style="margin-top: 20px;">
      <el-button @click="doNotify">测试发送通知</el-button>
    </div>
        
  </div>
</template>

<script>

export default {
  name: 'Notification',
  data(){
    return {
      i: 1
    }
  },
  methods: {
    isSupport(){
      if(window.Notifier.HasSupport()) {
        this.$alert("你的浏览器支持桌面通知功能！");
      } else {
        this.$alert("你的浏览器不支持桌面通知同能，请你使用chrome浏览器！");
      }
    },
    isGetPermission(){
      if(window.Notifier.IsGetPermission()) {
          this.$alert("网站已经获取浏览器允许发送桌面通知权限！");
        } else {
          this.$alert("需要获取浏览器允许发送桌面通知权限 ！");
        }
    },
    isDisable(){
      if(window.Notifier.Disable()) {
          this.$alert("网站被禁止发送桌面通知！");
      } else {
          this.$alert("未被禁止发送桌面通知 ！");
      }
    },
    isRequestPermission(){
      window.Notifier.RequestPermission();
      this.$alert("已经发送请求，在可以获取权限的情况下会显示获取权限提示！");
    },
    doNotify(){
      window.Notifier.ModelCount(2);
        window.Notifier.Notify("", "通知" + this.i, "内容" + this.i);
        this.i++
        console.log(this.i)
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
.icon-ym {
  font-size: 32px !important
}
</style>
