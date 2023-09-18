<template>
  <el-dialog :close-on-click-modal="false" class="JNPF-dialog JNPF-dialog_center form-script-dialog"
    lock-scroll append-to-body v-bind="$attrs" width="1100px" :modal-append-to-body="false"
    v-on="$listeners" @open="onOpen">
    <span slot="title" class="dialog-title">
      <span>表单脚本
        <el-tooltip content="小程序不支持在线JS脚本" placement="top-start">
          <a class="el-icon-question tooltip-question"></a>
        </el-tooltip>
      </span>
    </span>
    <div class="form-script-dialog-body">
      <div class="left-tree">
        <el-tree :data="treeData" default-expand-all :expand-on-click-node="false"
          :props="treeProps" @node-click="handleNodeClick"></el-tree>
      </div>
      <div class="right-main">
        <div class="codeEditor">
          <JNPFCodeEditor v-model="text" :options="options" ref="CodeEditor" />
        </div>
        <div class="tips">
          <p>请从左侧面板选择的字段名，支持JavaScript的脚本</p>
          <p>data--当前组件的选中数据，formData--表单数据，setFormData--设置表单某个组件数据(prop,value)</p>
          <p>
            setShowOrHide--设置显示或隐藏(prop,value)，setRequired--设置必填项(prop,value)
          </p>
          <p>
            setDisabled--设置禁用项(prop,value)，request--异步请求(url,method,data)
          </p>
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
  props: ['tpl', 'fields'],
  inject: ["getFormInfo"],
  data() {
    return {
      text: '',
      treeData: [],
      treeProps: {
        children: 'children',
        label: 'label',
      },
      treeData: [],
      options: {
        language: 'javascript'
      },
    }
  },
  methods: {
    onOpen() {
      this.text = this.tpl
      this.getTree()
      this.$nextTick(() => {
        this.$refs.CodeEditor.changeEditor({
          value: this.text,
          options: this.options
        })
      });
    },
    getTree() {
      let list = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__config__ && data.__config__.jnpfKey !== 'table' && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__vModel__) {
          if (data.__config__.jnpfKey === 'table') {
            let item = {
              value: data.__vModel__,
              label: data.__config__.label,
              children: []
            }
            let children = []
            if (data.__config__.children && Array.isArray(data.__config__.children) && data.__config__.children.length) {
              for (let i = 0; i < data.__config__.children.length; i++) {
                const child = data.__config__.children[i]
                if (child.__vModel__) {
                  children.push({ value: data.__vModel__ + '.' + child.__vModel__, label: child.__config__.label })
                }
              }
            }
            item.children = children
            list.push(item)
          } else {
            list.push({ value: data.__vModel__, label: data.__config__.label })
          }
        }
      }
      loop(this.fields)
      let topItem = {
        value: +new Date(),
        label: this.getFormInfo().fullName,
        top: true,
        children: list
      }
      this.treeData = [topItem]
    },
    onClose() {
      this.$emit('updateScript', this.text)
      this.closeDialog()
    },
    closeDialog() {
      this.$emit('update:visible', false)
    },
    handleNodeClick(item, node) {
      if (item.top) return
      if (item.children) return
      this.$refs.CodeEditor.insert(item.value);
    }
  }
}
</script>