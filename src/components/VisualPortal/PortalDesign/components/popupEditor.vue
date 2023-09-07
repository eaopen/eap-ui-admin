<template>
  <el-dialog title="文本内容" :close-on-click-modal="false" :visible.sync="visible"
    class="OBPM-dialog JNPF-dialog_center" lock-scroll width="600px" append-to-body>
    <JNPFQuill v-model="content" ref="myQuillEditor" />
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelBtn')}}</el-button>
      <el-button type="primary" @click="closeDialog()">{{$t('common.confirmBtn')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import JNPFQuill from '@/components/extn/JNPFEditor/quill'

export default {
  components: { JNPFQuill },
  data() {
    return {
      visible: false,
      content: ''
    }
  },
  methods: {
    init(val) {
      this.visible = true
      this.content = val
    },
    closeDialog() {
      this.visible = false
      this.$emit('refresh', this.content)
    },
  }
}
</script>
<style lang="scss" scoped>
.JNPF-dialog_center {
  >>> .el-dialog__body {
    padding-bottom: 20px !important;
  }
}
>>> .preview {
  border: 1px solid #dcdfe6;
}
>>> .json-editor {
  height: 430px;
  overflow: auto;
}
</style>