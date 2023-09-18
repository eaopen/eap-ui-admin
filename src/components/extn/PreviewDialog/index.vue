<template>
  <el-dialog :title="title" class="JNPF-dialog JNPF-dialog_center previewDialog" lock-scroll
    v-bind="$attrs" v-on="$listeners" width="600px">
    <div class="preview-main">
      <div class="preview-item preview-item-pc" @click="previewPc()">
        <i class="preview-icon icon-ym icon-ym-pc"></i>
        <div class="preview-txt">
          <p class="preview-title">Web预览</p>
        </div>
      </div>
      <div class="preview-item" @click="previewApp()">
        <i class="preview-icon icon-ym icon-ym-mobile"></i>
        <div class="preview-txt">
          <p class="preview-title">App预览</p>
        </div>
      </div>
    </div>
    <el-dialog :close-on-click-modal="false" :modal-append-to-body="false" append-to-body
      :visible.sync="previewAppVisible" class="JNPF-dialog JNPF-dialog_center code-dialog"
      :title="title" width="400px" @opened="getQRimg">
      <div class="qrcode-img">
        <div id="qrcode" ref="qrCode"></div>
      </div>
      <p class="tip">打开手机APP扫码预览</p>
    </el-dialog>
  </el-dialog>
</template>
<script>
import QRCode from 'qrcodejs2'
export default {
  props: ['id', 'type', 'fullName', 'dataSource', 'previewType'],
  data() {
    return {
      previewAppVisible: false,
      qrCodeText: '',
    }
  },
  computed: {
    title() {
      if (this.type === 'webDesign' || this.type === 'flow') return this.previewType == 0 ? '预览设计中的表单' : '预览已发布的表单'
      return '预览'
    }
  },
  methods: {
    closeDialog() {
      this.$emit('update:visible', false)
    },
    previewPc() {
      this.closeDialog()
      if (this.type === 'flow' || this.type === 'report' || this.type === 'portal') {
        setTimeout(() => {
          this.$emit('previewPc')
        }, 300)
      }
      if (this.type === 'webDesign') {
        if (!this.id) return
        this.$router.push(`/previewModel?isPreview=1&id=${this.id}&previewType=${this.previewType}`)
      }
    },
    previewApp() {
      let text = {
        t: this.type === 'flow' ? 'WFP' : this.type === 'webDesign' ? 'ADP' : 'report',
        id: this.id
      }
      if (this.type === 'report') text.fullName = this.fullName
      if (this.type === 'flow') text.ds = this.dataSource
      if (this.type == 'webDesign') text.previewType = this.previewType
      if (this.type == 'portal') text.t = 'portal'
      this.qrCodeText = JSON.stringify(text)
      this.closeDialog()
      setTimeout(() => {
        this.previewAppVisible = true
      }, 300)
    },
    getQRimg() {
      if (!this.qrCodeText) return
      this.$refs.qrCode.innerHTML = "";
      let qrcode = new QRCode(this.$refs.qrCode, {
        width: 260,
        height: 260,
        text: this.qrCodeText,
        correctLevel: QRCode.CorrectLevel.H
      })
      qrcode._el.title = ''
    },
  },
}
</script>
<style lang="scss" scoped>
.code-dialog {
  ::v-deep {
    .el-dialog__body {
      padding: 20px 50px 2px !important;
      .qrcode-img {
        width: 300px;
        height: 300px;
        padding: 20px;
      }
      .tip {
        text-align: center;
        font-size: 18px;
        margin-top: 10px;
        margin-bottom: 20px;
      }
    }
  }
}
.JNPF-dialog.previewDialog {
  >>> .el-dialog__body {
    padding: 50px 30px !important;
  }
}
.preview-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .preview-item {
    width: 255px;
    height: 136px;
    background: #f0fff7;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding-left: 30px;
    &:hover {
      opacity: 0.9;
    }
    &.preview-item-pc {
      background: #edfbfd;
      .preview-icon {
        background: #d6f0ff;
        color: #3399fa;
      }
    }
    .preview-icon {
      width: 56px;
      height: 56px;
      margin-right: 10px;
      background: #ccf7e0;
      border-radius: 10px;
      color: #36ac6c;
      flex-shrink: 0;
      font-size: 30px;
      line-height: 56px;
      text-align: center;
    }
    .preview-txt {
      height: 56px;
      .preview-title {
        font-size: 18px;
        line-height: 56px;
      }
    }
  }
}
</style>