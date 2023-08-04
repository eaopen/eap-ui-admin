<template>
  <el-dialog title="公式编辑" :close-on-click-modal="false" v-on="$listeners"
    class="JNPF-dialog JNPF-dialog_center formula-dialog" lock-scroll append-to-body v-bind="$attrs"
    width="800px" :modal-append-to-body="false" @open="onOpen">
    <div class="formula-dialog-body">
      <div class="code-editor-area">
        <JSONEditor v-model="text" mode="javascript" ref="codemirror" class="json-editor" />
      </div>
      <div class="operation-area">
        <div class="area-item field-area">
          <div class="area-title">当前表单字段</div>
          <div class="area-content">
            <el-tree :data="fieldsOptions" node-key="id" default-expand-all
              :expand-on-click-node="false" :props="treeProps" @node-click="handleNodeClick">
            </el-tree>
          </div>
        </div>
        <div class="area-item formula-area">
          <div class="area-title">函数</div>
          <div class="area-content">
            <el-tree :data="formulaData" node-key="id" default-expand-all
              :expand-on-click-node="false" :props="treeProps" @node-click="formulaNodeClick">
              <span class="custom-tree-node" slot-scope="{ node,data }">
                <span class="text" @mouseenter="formulaMouseenter(data)">{{node.label}}</span>
              </span>
            </el-tree>
          </div>
        </div>
        <div class="area-item formula-desc-area">
          <div class="area-title">{{descTitle}}</div>
          <div class="area-content" v-html="descContent"></div>
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
import JSONEditor from '@/components/JsonEditor'
import formulaData from "./formulaData";
export default {
  components: { JSONEditor },
  props: ['value', 'formFieldsOptions'],
  data() {
    return {
      text: '111',
      treeProps: {
        children: 'children',
        label: 'fullName'
      },
      formulaData,
      descTitle: '',
      descContent: '请从左侧面板选择字段名和函数',
    }
  },
  computed: {
    fieldsOptions() {
      let list = this.formFieldsOptions.map(o => ({
        id: o.__vModel__,
        fullName: o.__config__.label
      }))
      return list
    }
  },
  methods: {
    onOpen() {
      this.text = this.value
    },
    handleNodeClick(item) {
      this.$refs.codemirror.insert('{' + item.id + '}')
    },
    formulaNodeClick(item) {
      if (!item.desc) return
      this.$refs.codemirror.insert(item.id + '()', true)
    },
    formulaMouseenter(item) {
      if (!item.desc) return
      this.descContent = item.desc
      this.descTitle = item.fullName
    },
    onClose() {
      this.$emit('updateFormula', this.text)
      this.closeDialog()
    },
    closeDialog() {
      this.$emit('update:visible', false)
    }
  }
}
</script>