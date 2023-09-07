<template>
  <el-dialog :title="title" :close-on-click-modal="false" width='600px' :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body>
    <el-form ref="dataForm" :model="dataForm" label-width="80px" :rules="fromRules">
      <template v-if="eventType==='transfer'||eventType==='assign'||eventType==='cancel'">
        <el-form-item label="指派节点" prop="nodeCode" v-if="eventType==='assign'">
          <el-select v-model="dataForm.nodeCode" placeholder="请选择指派节点">
            <el-option v-for="item in assignNodeList" :key="item.nodeCode" :label="item.nodeName"
              :value="item.nodeCode" />
          </el-select>
        </el-form-item>
        <el-form-item :label="label+'给谁'" prop="freeApproverUserId"
          v-if="eventType==='transfer'||eventType==='assign'"
          :rules="[{ required: true, message: `请选择${label}给谁`, trigger: 'click' }]">
          <user-select v-model="dataForm.freeApproverUserId" :placeholder="`请选择${label}给谁`" />
        </el-form-item>
        <el-form-item :label="`${label}原因`" prop="handleOpinion"
          v-if="eventType==='assign'||eventType==='cancel'||(eventType==='transfer'&&properties&&properties.hasOpinion)">
          <el-input v-model="dataForm.handleOpinion" :placeholder="`请输入${label}原因`" type="textarea"
            :rows="4" />
        </el-form-item>
        <el-form-item :label="`${label}附件`" prop="fileList"
          v-if="eventType==='assign'||eventType==='cancel'||(eventType==='transfer'&&properties&&properties.hasOpinion)">
          <JNPF-UploadFz v-model="dataForm.fileList" :limit="3" />
        </el-form-item>
        <el-form-item label="手写签名" required v-if="properties.hasSign&&eventType==='transfer'">
          <div class="sign-main">
            <img :src="signImg" alt="" v-if="signImg" class="sign-img">
            <div @click="addSign" class="sign-style">
              <i class="icon-ym icon-ym-signature add-sign"></i>
              <span class="sign-title" v-if="!signImg">手写签名</span>
            </div>
          </div>
        </el-form-item>
      </template>
      <template v-else>
        <template v-if="properties.hasOpinion">
          <el-form-item :label="`${label}原因`" prop="handleOpinion">
            <el-input v-model="dataForm.handleOpinion" :placeholder="`请输入${label}原因`"
              type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item :label="`${label}附件`" prop="fileList">
            <JNPF-UploadFz v-model="dataForm.fileList" :limit="3" />
          </el-form-item>
        </template>
        <el-form-item label="手写签名" required v-if="properties.hasSign">
          <div class="sign-main">
            <img :src="signImg" alt="" v-if="signImg" class="sign-img">
            <div @click="addSign" class="sign-style">
              <i class="icon-ym icon-ym-signature add-sign"></i>
              <span class="sign-title" v-if="!signImg">手写签名</span>
            </div>
          </div>
        </el-form-item>
      </template>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="handleSure()" :loading="btnLoading">
        {{$t('common.confirmButton')}}
      </el-button>
    </span>
    <SignImgDialog v-if="signVisible" ref="SignImg" :lineWidth='3' :userInfo='userInfo'
      :isDefault='1' @close="signDialog" />
  </el-dialog>
</template>
<script>
import SignImgDialog from '@/components/SignImgDialog'
import { mapGetters } from "vuex"
export default {
  components: { SignImgDialog },
  props: {
    assignNodeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      properties: {},
      eventType: '',
      dataForm: {
        handleOpinion: '',
        freeApproverUserId: '',
        nodeCode: '',
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
      label: ''
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  methods: {
    init(properties, eventType) {
      this.visible = true
      this.properties = properties
      this.eventType = eventType || ''
      this.dataForm.handleOpinion = ''
      this.dataForm.freeApproverUserId = ''
      this.dataForm.nodeCode = ''
      this.dataForm.fileList = []
      this.signImg = ""
      if (this.properties.hasSign) this.signImg = this.userInfo.signImg
      switch (eventType) {
        case 'transfer':
          this.title = '转审'
          this.label = '转审'
          break;
        case 'revoke':
          this.title = '撤回流程'
          this.label = '撤回'
          break;
        case 'recall':
          this.title = '撤回审核'
          this.label = '撤回'
          break;
        case 'assign':
          this.title = '指派'
          this.label = '指派'
          break;
        case 'cancel':
          this.title = '终止审核不可恢复'
          this.label = '终止'
          break;
        default:
          break;
      }
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
    },
    addSign() {
      this.signVisible = true
      this.$nextTick(() => {
        this.$refs.SignImg.init()
      })
    },
    signDialog(val) {
      this.signVisible = false
      if (val) {
        this.signImg = val
      }
    },
    handleSure() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.properties.hasSign && !this.signImg && this.eventType != 'assign' && this.eventType != 'cancel') {
            this.$message({
              message: '请签名',
              type: 'error'
            })
            return
          }
          let query = {
            signImg: this.signImg,
            ...this.dataForm
          }
          this.btnLoading = true
          this.$emit('submit', query)
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