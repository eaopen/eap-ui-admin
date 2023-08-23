<template>
  <el-dialog :close-on-click-modal="false" class="OBPM-dialog JNPF-dialog_center form-script-dialog"
    lock-scroll append-to-body v-bind="$attrs" width="1000px" :modal-append-to-body="false"
    title="表单样式" v-on="$listeners" @open="onOpen">
    <div class="form-script-dialog-body">
      <div class="right-main">
        <div class="codeEditor">
          <JNPFCodeEditor v-model="text" :options="options" ref="CodeEditor" />
        </div>
        <div class="tips">
          <p>示例：</p>
          <p>.text{</p>
          <p style="text-indent: 2em">
            background-color: #fff; //背景颜色
          </p>
          <p style="text-indent: 2em">
            font-size: 18px; //字体大小
          </p>
          <p>
            }
          </p>
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
        language: 'css'
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
      this.$emit('updateStyleScript', this.text)
      this.closeDialog()
    },
    closeDialog() {
      this.$emit('update:visible', false)
    }
  }
}
</script>