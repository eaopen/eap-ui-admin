<template>
  <div>
    <el-dialog title="请签名" class="JNPF-dialog JNPF-dialog_center sign-dialog"
      :closeOnClickModal='false' :visible.sync="signVisible" append-to-body width="600px">
      <div class="sign-main-box">
        <vue-esign ref="esign" :height='300' :width="560" :lineWidth="lineWidth" />
        <div class="tip" v-show="showTip">使用鼠标在此签名</div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleReset">清空</el-button>
        <el-button type="primary" :loading="loading" @click="handleGenerate()">确定签名</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { createSign } from '@/api/extn/permission'
import vueEsign from 'vue-esign'
export default {
  name: 'SignImgDialog',
  components: { vueEsign },
  props: {
    lineWidth: {
      required: true,
      type: Number
    },
    isDefault: {
      required: true,
      type: Number
    },
    userInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      signVisible: false,
      loading: false,
      signImg: '',
      showTip: true
    }
  },
  methods: {
    init() {
      this.handleReset()
      this.signVisible = true
      this.showTip = true
      this.$nextTick(() => {
        this.$watch(
          () => {
            return this.$refs.esign.hasDrew
          },
          (val) => {
            this.showTip = !val
          }
        )
      })
    },
    handleReset() {
      this.signImg = ''
      this.$nextTick(() => {
        this.$refs.esign && this.$refs.esign.reset()
      })
    },
    handleGenerate() {
      this.loading = true
      this.$refs.esign.generate().then(res => {
        if (res) this.signImg = res
        let query = {
          signImg: this.signImg,
          isDefault: this.isDefault
        }
        createSign(query).then(res => {
          if (this.isDefault == 0) {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500
            })
            if (!this.userInfo.signImg) this.$store.commit('user/SET_USERINFO_SIGNIMG', this.signImg)
          }
          if (this.isDefault == 1) {
            this.$store.commit('user/SET_USERINFO_SIGNIMG', this.signImg)
          }
          this.signVisible = false
          this.loading = false
          this.$emit('close', this.signImg)
          this.handleReset()

        }).catch(err => {
          this.signVisible = false
          this.loading = false
          this.$emit('close')
          this.handleReset()
        })
      }).catch(err => {
        this.loading = false
        this.$message.warning("请签名")
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.sign-dialog {
  >>> .el-dialog__body {
    overflow: hidden;
    height: 320px;
    overflow: auto;
    overflow-x: hidden;
    padding: 23px 14px 2px !important;
  }
}

.sign-main-box {
  border: 1px solid rgb(224, 238, 238);
  width: 100%;
  height: 300px;
  background-color: rgb(247, 247, 247);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -10px;
  margin-bottom: -10px;
  position: relative;
  .tip {
    height: 300px;
    line-height: 300px;
    text-align: center;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    color: #9d9d9f;
    font-size: 16px;
    pointer-events: none;
  }
}
</style>