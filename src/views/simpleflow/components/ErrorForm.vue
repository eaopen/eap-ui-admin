<template>
  <el-dialog title="异常处理" :close-on-click-modal="false" class="JNPF-dialog JNPF-dialog_center"
    lock-scroll append-to-body v-bind="$attrs" width="600px" :modal-append-to-body="false"
    v-on="$listeners" @open="onOpen">
    <el-form label-width="100px" ref="dataForm" :model="dataForm">
      <el-form-item :label="item.nodeName" :prop="'nodeList.' + i + '.value'"
        v-for="(item,i) in dataForm.nodeList" :key="i" :rules="item.rules">
        <userSelect v-model="item.value" multiple placeholder="请选择异常处理人员" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="submit()">{{$t('common.confirmButton')}}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: ['nodeList'],
  data() {
    return {
      dataForm: {
        nodeList: []
      }
    }
  },
  methods: {
    onOpen() {
      this.dataForm.nodeList = this.nodeList.map(o => ({
        ...o,
        value: [],
        rules: [{ required: true, message: `异常处理人员不能为空`, trigger: 'click' }]
      }))
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
    },
    submit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let nodeList = {}
          for (let i = 0; i < this.dataForm.nodeList.length; i++) {
            nodeList[this.dataForm.nodeList[i].nodeId] = this.dataForm.nodeList[i].value
          }
          this.$emit('submit', nodeList)
        }
      })
    },
    closeDialog() {
      this.$emit('update:visible', false)
    },
  }
}
</script>
