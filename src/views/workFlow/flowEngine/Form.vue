<template>
  <el-dialog :visible.sync="visible" fullscreen lock-scroll class="JNPF-full-dialog"
    :show-close="false" :modal="false" append-to-body>
    <div class="JNPF-full-dialog-header">
      <div class="header-title">
        <img src="@/assets/images/jnpf.png" class="header-logo" />
        <p class="header-txt"> · 流程设计</p>
      </div>
      <el-steps :active="activeStep" finish-status="success" simple class="steps steps2">
        <el-step title="基础信息" @click.native="stepChick(0)" />
        <el-step title="流程设计" @click.native="stepChick(1)" />
      </el-steps>
      <div class="options">
        <el-button @click="prev" :disabled="activeStep<=0||btnLoading">{{$t('common.prev')}}
        </el-button>
        <el-button @click="next" :disabled="activeStep>=1||loading||btnLoading">
          {{$t('common.next')}}
        </el-button>
        <el-button type="primary" @click="dataFormSubmit()" :disabled="loading"
          :loading="btnLoading">保 存</el-button>
        <el-button @click="closeDialog()">{{$t('common.cancelButton')}}</el-button>
      </div>
    </div>
    <div class="main" v-loading="loading">
      <el-row type="flex" justify="center" align="middle" v-if="!activeStep" class="basic-box">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="10" class="basicForm">
          <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="80px"
            @submit.native.prevent label-position="right">
            <el-form-item label="流程名称" prop="fullName">
              <el-input v-model="dataForm.fullName" placeholder="流程名称" maxlength="50"></el-input>
            </el-form-item>
            <el-form-item label="流程编码" prop="enCode">
              <el-input v-model="dataForm.enCode" placeholder="流程编码" maxlength="50"></el-input>
            </el-form-item>
            <el-form-item label="流程分类" prop="category">
              <el-select v-model="dataForm.category" placeholder="选择分类" filterable>
                <el-option :key="item.id" :label="item.fullName" :value="item.id"
                  v-for="item in categoryList" />
              </el-select>
            </el-form-item>
            <el-form-item label="流程类型" prop="type">
              <el-input v-model="type" maxlength="50" disabled></el-input>
            </el-form-item>
            <el-form-item label="流程图标" prop="icon" v-if="dataForm.type==0">
              <el-row type="flex">
                <div style="flex:1;margin-right:10px">
                  <el-input v-model="dataForm.icon" placeholder="请选择流程图标" readonly
                    :suffix-icon="dataForm.icon">
                    <el-button slot="append" @click="openIconBox()">选择</el-button>
                  </el-input>
                </div>
                <el-color-picker v-model="dataForm.iconBackground" title="图标背景色"
                  :predefine="['#008cff', '#35b8e0', '#00cc88','#ff9d00','#ff4d4d', '#5b69bc', '#ff8acc', '#3b3e47','#282828']" />
              </el-row>
            </el-form-item>
            <el-form-item label="流程排序" prop="sortCode">
              <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
                controls-position="right" />
            </el-form-item>
            <el-form-item label="流程说明" prop="description">
              <el-input v-model="dataForm.description" placeholder="流程说明" type="textarea"
                :rows="3" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <Process ref="processDesign" :conf="flowTemplateJson" :flowType="dataForm.type"
        v-if="activeStep==1" :formInfo="dataForm" />
    </div>
    <icon-box :visible.sync="iconBoxVisible" ref="iconBox" :current="dataForm.icon"
      @choiceIcon="choiceIcon" />
  </el-dialog>
</template>

<script>
import { FlowEngineInfo, Update, Create, mainVersion } from '@/api/workFlow/FlowEngine'
import iconBox from '@/components/JNPF-iconBox'
import Process from "@/components/Process"

export default {
  components: { iconBox, Process },
  data() {
    return {
      visible: false,
      activeStep: 0,
      dataForm: {
        id: '',
        category: '',
        fullName: '',
        enCode: '',
        description: '',
        type: 0,
        sortCode: 0,
        icon: '',
        iconBackground: '#008cff',
        flowTemplateJson: null
      },
      dataRule: {
        fullName: [
          { required: true, message: '流程名称不能为空', trigger: 'blur' }
        ],
        enCode: [
          { required: true, message: '流程编码不能为空', trigger: 'blur' },
          { pattern: /^\w+$/, message: '请输入正确的流程编码', trigger: 'blur' },
        ],
        category: [
          { required: true, message: '流程分类不能为空', trigger: 'change' }
        ],
        type: [
          { required: true, message: '流程类型不能为空', trigger: 'change' }
        ],
        formType: [
          { required: true, message: '功能类型不能为空', trigger: 'change' }
        ],
        formId: [
          { required: true, message: '关联功能不能为空', trigger: 'click' }
        ],
        icon: [
          { required: true, message: '流程图标不能为空', trigger: 'click' }
        ],
      },
      btnLoading: false,
      flowTemplateJson: {},
      iconBoxVisible: false,
      loading: false,
      categoryList: [],
      type: '功能流程'
    }
  },
  methods: {
    init(categoryList, id, type) {
      this.categoryList = categoryList
      this.activeStep = 0
      this.dataForm.id = id || ''
      this.dataForm.icon = ''
      this.dataForm.iconBackground = '#008cff'
      this.visible = true
      this.loading = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          FlowEngineInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data
            this.type = this.dataForm.type == 1 ? '功能流程' : '发起流程'
            this.dataForm.flowTemplateJson && (this.flowTemplateJson = JSON.parse(this.dataForm.flowTemplateJson))
            this.loading = false
            this.$nextTick(() => {
              this.next()
            })
          }).catch(() => { this.loading = false })
        } else {
          this.dataForm.type = type
          this.type = type == 1 ? '功能流程' : '发起流程'
          this.loading = false
        }
      })
    },
    dataFormSubmit() {
      if (this.activeStep === 1) {
        this.$refs['processDesign'].getData().then(res => {
          this.flowTemplateJson = res.formData
          this.dataForm.flowTemplateJson = JSON.stringify(this.flowTemplateJson)
          this.submit()
        }).catch(err => {
          err.msg && this.$message.warning(err.msg)
        })
      } else {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          this.submit()
        })
      }
    },
    submit() {
      this.btnLoading = true
      const formMethod = this.dataForm.id ? Update : Create
      formMethod(this.dataForm).then((res) => {
        if (this.activeStep == 1 && res.data && res.data.isMainVersion) {
          this.setMainVersion(res.data.id, res.msg)
        } else {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.btnLoading = false
              this.closeDialog(true)
            }
          })
        }
      }).catch(() => { this.btnLoading = false })
    },
    setMainVersion(id, msg) {
      this.$confirm('流程已被使用，此版本是否覆盖线上流程。覆盖后，新发起的流程按此版本流转?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        mainVersion(id).then(res => {
          this.$message({
            message: msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.btnLoading = false
              this.closeDialog(true)
            }
          })
        }).catch(() => { this.btnLoading = false });
      }).catch(() => {
        this.btnLoading = false
        this.closeDialog(true)
      });
    },
    prev() {
      this.activeStep -= 1
    },
    next() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.activeStep += 1
        }
      })
    },
    closeDialog(isRefresh) {
      this.visible = false
      this.$emit('close', isRefresh)
    },
    stepChick(key) {
      if (this.activeStep <= key) return
      this.activeStep = key
    },
    openIconBox() { this.iconBoxVisible = true },
    choiceIcon(value) {
      this.dataForm.icon = value
    },
  }
}
</script>