<template>
  <el-dialog :close-on-click-modal="false" class="JNPF-dialog JNPF-dialog_center form-script-dialog"
    lock-scroll append-to-body v-bind="$attrs" width="800px" :modal-append-to-body="false"
    v-on="$listeners" @open="onOpen">
    <span slot="title" class="dialog-title">
      <span>数据处理
        <el-tooltip content="小程序不支持在线JS脚本" placement="top-start">
          <a class="el-icon-question tooltip-question"></a>
        </el-tooltip>
      </span>
    </span>
    <div class="form-script-dialog-body">
      <div class="right-main">
        <div class="codeEditor">
          <JNPFCodeEditor v-model="text" :options="options" ref="CodeEditor" />
        </div>
        <div class="tips">
          <p>支持JavaScript的脚本</p>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="onClose()">{{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import JNPFCodeEditor from '@/components/extn/JNPFEditor/monaco'
export default {
  components: { JNPFCodeEditor },
  props: ['value'],
  data() {
    return {
      text: '',
      options: {
        language: 'javascript'
      },
    }
  },
  methods: {
    onOpen() {
      this.text = this.value
      this.$nextTick(() => {
        this.$refs.CodeEditor.changeEditor({
          value: this.text,
          options: this.options
        })
      });
    },
    onClose() {
      this.$emit('updateScript', this.text)
      this.closeDialog()
    },
    closeDialog() {
      this.$emit('update:visible', false)
    }
  }
}
</script>