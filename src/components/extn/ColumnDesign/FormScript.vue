<template>
  <el-dialog :close-on-click-modal="false" class="OBPM-dialog JNPF-dialog_center form-script-dialog"
    lock-scroll append-to-body v-bind="$attrs" width="1000px" :modal-append-to-body="false"
    v-on="$listeners" destroy-on-close :visible.sync="dialogVisible">
    <span slot="title" class="dialog-title">
      <span>{{title}}
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
        <div class="tips" v-if="type == 'btn'">
          <p>支持JavaScript的脚本</p>
          <p>data--列表当前行数据，index--列表当前行下标，request--异步请求(url,method,data)</p>
          <p>toast--消息提示，refresh--刷新页面</p>
        </div>
        <div class="tips" v-if="type == 'afterOnload'">
          <p>支持JavaScript的脚本</p>
          <p>data--列表行数据，tableRef--表格DOM元素，request--异步请求(url,methods,data)</p>
        </div>
        <div class="tips" v-if="type == 'rowStyle'">
          <p>支持JavaScript的脚本，需要返回一个Object</p>
          <p>row--列表行数据，rowIndex--列表行下标</p>
        </div>
        <div class="tips" v-if="type == 'cellStyle'">
          <p>支持JavaScript的脚本，需要返回一个Object</p>
          <p>row--列表行数据，column--列表列数据</p>
          <p>rowIndex--列表行下标，columnIndex--列表列下标</p>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">{{$t('common.cancelBtn')}}</el-button>
      <el-button type="primary" @click="onClose()">{{$t('common.confirmBtn')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import JNPFCodeEditor from '@/components/extn/JNPFEditor/monaco'
export default {
  components: { JNPFCodeEditor },
  props: ['value', 'type'],
  data() {
    return {
      text: '',
      options: {
        language: 'javascript'
      },
      title: "",
      dialogVisible: false
    }
  },

  methods: {
    init() {
      this.dialogVisible = true
      this.text = this.value
      this.$nextTick(() => {
        this.$refs.CodeEditor.changeEditor({
          value: this.text,
          options: this.options
        })
      });
      this.setTitle()
    },
    onClose() {
      this.$emit('updateScript', this.text)
      this.closeDialog()
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
    setTitle() {
      switch (this.type) {
        case 'btn':
          this.title = "按钮脚本"
          break;
        case 'afterOnload':
          this.title = "表格脚本"
          break;
        case 'rowStyle':
          this.title = "行样式"
          break;
        case 'cellStyle':
          this.title = "单元格样式"
          break;
        default:
          break;
      }
    }
  }
}
</script>
