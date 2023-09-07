<template>
  <el-dialog title="挂起流程暂停" :close-on-click-modal="false" width='600px' :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body>
    <el-form ref="dataForm" :model="dataForm" label-width="80px" :rules="fromRules">
      <el-form-item label="挂起类型" prop="suspend">
        <el-select v-model="dataForm.suspend" placeholder="挂起类型" filterable>
          <el-option v-for="item in suspendOptions" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="挂起原因" prop="handleOpinion">
        <el-input v-model="dataForm.handleOpinion" placeholder="请输入挂起原因" type="textarea"
          :rows="4" />
      </el-form-item>
      <el-form-item label="挂起附件" prop="fileList">
        <JNPF-UploadFz v-model="dataForm.fileList" :limit="3" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="handleSure()" :loading="btnLoading">
        {{$t('common.confirmButton')}}
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
import { suspendType } from '@/api/workFlow/FlowBefore'
export default {
  components: {},
  props: {
  },
  data() {
    return {
      visible: false,
      eventType: '',
      dataForm: {
        suspend: false,
        handleOpinion: '',
        fileList: [],
      },
      signVisible: false,
      fromRules: {
        nodeCode: [
          { required: true, message: '请选择指派节点', trigger: 'change' }
        ]
      },
      signImg: '',
      btnLoading: false,
      title: '',
      label: '',
      suspendOptions: []
    }
  },
  computed: {
  },
  methods: {
    init(id) {
      this.visible = true
      this.dataForm.suspend = false
      this.dataForm.handleOpinion = ''
      this.dataForm.fileList = []
      this.suspendOptions = []
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        suspendType(id).then(res => {
          let listOptions = []
          if (res.data) {
            listOptions = [{ value: false, label: '全部流程挂起' }, { value: true, label: '主流程挂起' }]

          } else {
            listOptions = [{ value: false, label: '全部流程挂起' }]
          }
          this.suspendOptions = listOptions
        })
      })
    },
    handleSure() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          this.$emit('submit', this.dataForm)
        }
      })
    },
    closeDialog() {
      this.btnLoading = false
      this.visible = false
    },
  }
}
</script>
