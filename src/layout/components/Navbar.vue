<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!topNav"/>
    <top-nav id="topmenu-container" class="topmenu-container" v-if="topNav"/>

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <template v-if="showSearch">
          <search id="header-search" class="right-menu-item" />
        </template>

        <!-- 站内信 -->
        <notify-message class="right-menu-item hover-effect" />
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <!-- <el-tooltip :content="$t('navbar.size')" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip> -->
        <div class="right-menu-item hover-effect">
          <i class="el-icon-chat-line-round" style="font-size: 20px;" @click="openUserList()"
            :class="{'twinkle':isTwinkle}"></i>
        </div>
        <div class="right-menu-item hover-effect">
          <i class="el-icon-lock" style="font-size: 20px;" @click="setLock()"
            :class="{'twinkle':isTwinkle}"></i>
        </div>
        <template v-if="showLanguage">
          <lang-select class="right-menu-item hover-effect" />
        </template>

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" @error="changeAvatar">
          <span v-if="nickname" class="user-nickname">{{ nickname }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>{{ $t('navbar.profile') }}</el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="setting = true">
            <span>{{ $t('navbar.setting') }}</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span>{{ $t('navbar.logOut') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <UserList ref="UserList" @changeTwinkle='changeTwinkle' />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import LangSelect from '@/components/LangSelect'
import Search from '@/components/HeaderSearch'
import UserList from './userList/UserList'
import NotifyMessage from '@/layout/components/Message'
import {getAccessToken} from '@/utils/auth'
import ReconnectingWebSocket from 'reconnecting-websocket'
import {getPath} from "@/utils/ruoyi";


export default {
  components: {
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    SizeSelect,
    LangSelect,
    Search,
    NotifyMessage,
    UserList
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'nickname',
      'device'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    showLanguage: {
      get() {
        return this.$store.state.settings.showLanguage
      }
    },
    showSearch: {
      get() {
        return this.$store.state.settings.showSearch
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      }
    }
  },
  data(){
    return {
      isTwinkle: false
    }
  },
  created(){
    this.initWebSocket()
  },
  methods: {
    setLock(){
      this.$store.dispatch('user/setLock')
      this.$nextTick(() => {
        this.$router.push('/lockScreen')
      })
    },
    changeAvatar(event){
      event.target.src = require("@/assets/images/avatar.png");
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    openUserList() {
      this.$refs.UserList.init()
    },
    changeTwinkle(boo) {
      this.isTwinkle = boo
    },
    initWebSocket() {
      this.socket = this.$store.getters.socket || null
      if ('WebSocket' in window) {
        if (!this.socket) {
          const isDev = process.env.NODE_ENV === 'development'
          const token = localStorage.getItem('ACCESS_TOKEN')
          const url = isDev ? process.env.VUE_APP_BASE_API+ '/api/message/websocket/' + token : window.location.origin + process.env.VUE_APP_BASE_API + '/websocket/' + token
          // const url = ''
          const webSocketUrl = url.replace('https://', 'wss://').replace('http://', 'ws://')
          this.socket = new ReconnectingWebSocket(webSocketUrl)
          
          this.$store.commit('SET_SOCKET', this.socket)
          console.log('this.socket', this.$store.getters.socket )
        }
        //添加事件监听
        let socket = this.socket
        socket.onopen = () => {
          var onConnection = {
            "method": "OnConnection", "token": this.$store.getters.token, "mobileDevice": false
          }
          socket.send(JSON.stringify(onConnection))
        }
        socket.onmessage = (event) => {
          let data = JSON.parse(event.data)
          if (data.method == 'initMessage') {
            this.messageCount = data.unreadMessageCount + data.unreadNoticeCount+data.unreadSystemMessageCount
            this.isTwinkle = !!data.unreadNums.length
          }
          //用户在线
          if (data.method == 'Online') {
          }
          //用户离线
          if (data.method == 'Offline') {
          }
          //消息推送（消息公告用的）
          if (data.method == 'messagePush') {
            this.messageCount += data.unreadNoticeCount
            if (this.$refs.MessageList.visible) this.$refs.MessageList.init()
          }
          //用户过期
          if (data.method == 'logout') {
            if (this.socket) {
              this.socket.close()
              this.socket = null
              this.$store.commit('SET_SOCKET', this.socket)
            }
            this.$message({
              message: data.msg || '登录过期,请重新登录',
              type: 'error',
              duration: 1000,
              onClose: () => {
                this.$store.dispatch('user/resetToken').then(() => {
                  location.reload()
                })
              }
            })
          }
          //断开websocket连接
          if (data.method == 'closeSocket') {
            if (this.socket) {
              this.socket.close()
              this.socket = null
              this.$store.commit('SET_SOCKET', this.socket)
            }
          }
          //接收对方发送的消息
          if (data.method == 'receiveMessage') {
            //判断是否打开窗口
            if (this.$refs.UserList && this.$refs.UserList.$refs.JNPFIm && this.$refs.UserList.$refs.JNPFIm.visible) {
              if (this.$refs.UserList.$refs.JNPFIm.info.id === data.formUserId) {
                let messItem = {
                  userId: data.formUserId,
                  messageType: data.messageType,
                  message: data.formMessage,
                  dateTime: this.jnpf.toDate(data.dateTime)
                }
                this.$refs.UserList.$refs.JNPFIm.addItem(messItem)
                //更新已读
                let updateReadMessage = {
                  method: "UpdateReadMessage",
                  formUserId: data.formUserId,
                  token: this.$store.getters.token
                }
                socket.send(JSON.stringify(updateReadMessage))
                this.$refs.UserList.updateReply(data)
              } else {
                this.$refs.UserList.updateReply(data, 1)
                this.isTwinkle = true
              }
            } else {
              this.$refs.UserList.updateReply(data, 1)
              this.isTwinkle = true
            }
          }
          //显示自己发送的消息
          if (data.method == 'sendMessage') {
            if (this.$refs.UserList.$refs.JNPFIm.info.id !== data.toUserId) return
            //添加到客户端
            let messItem = {
              userId: data.UserId,
              messageType: data.messageType,
              message: data.toMessage,
              dateTime: this.jnpf.toDate(data.dateTime)
            }
            this.$refs.UserList.updateLatestMessage(data)
            this.$refs.UserList.$refs.JNPFIm.addItem(messItem)
          }
          //消息列表
          if (data.method == 'messageList') {
            this.$refs.UserList.$refs.JNPFIm.getList(data)
          }
          //刷新页面
          if (data.method == 'refresh') {
            location.reload()
          }
        }
      }
    },
    async logout() {
      this.$modal.confirm('确定注销并退出系统吗？', '提示').then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = getPath('/index');
        })
      }).catch(() => {});
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 35px;
          height: 35px;
          border-radius: 50%;
        }
        .user-nickname{
          margin-left: 5px;
          font-size: 14px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
