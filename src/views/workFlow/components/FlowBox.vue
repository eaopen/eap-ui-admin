<template>
  <!-- <transition name="el-zoom-in-center"> -->
  <div class="JNPF-preview-main flow-form-main">
    <div class="JNPF-common-page-header">
      <div v-if="setting.fromForm">{{title}}</div>
      <el-page-header @back="goBack" v-else>
        <template slot="content">
          <div class="JNPF-page-header-content">{{title}}</div>
        </template>
      </el-page-header>
      <template v-if="!loading||title">
        <el-dropdown placement="bottom" @command="handleFlowUrgent" trigger="click"
          v-show="setting.opType=='-1'">
          <div class="flow-urgent-value" style="cursor:pointer">
            <span :style="{'background-color':flowUrgentList[selectState].color}"
              class="color-box"></span>
            <span :style="{'color':flowUrgentList[selectState].color}">
              {{flowUrgentList[selectState].name}}</span>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="(item,index) in flowUrgentList" :key="index"
              :command="item.state">
              <span :style="{'background-color':item.color}" class="color-box">
              </span>
              {{item.name}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="flow-urgent-value" v-show="setting.opType!=='-1'">
          <span :style="{'background-color':flowUrgentList[selectState].color}"
            class="color-box"></span>
          <span
            :style="{'color':flowUrgentList[selectState].color}">{{flowUrgentList[selectState].name}}</span>
        </div>
      </template>
      <div class="options" v-if="!subFlowVisible">
        <el-dropdown class="dropdown" placement="bottom" @command="handleMore"
          v-if="moreBtnList.length">
          <el-button style="width:70px" :disabled="allBtnDisabled">
            更 多<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item class="dropdown-item" v-for="(item,index) in moreBtnList" :key="index"
              :command="item.key">{{item.label}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-if="setting.opType=='-1'" type="primary" @click="eventLauncher('submit')"
          :loading="candidateLoading" :disabled="allBtnDisabled">
          {{properties.submitBtnText||'提 交'}}</el-button>
        <el-button type="primary" @click="eventLauncher('audit')" :loading="candidateLoading"
          v-if="setting.opType == 1&&properties.hasAuditBtn">{{properties.auditBtnText||'通 过'}}
        </el-button>
        <el-button type="primary" @click="press()"
          v-if="setting.opType == 0 && setting.status == 1&&(properties.hasPressBtn || properties.hasPressBtn===undefined)">
          {{properties.pressBtnText||'催 办'}}</el-button>
        <el-button type="danger" v-if="setting.opType == 2 && properties.hasRevokeBtn"
          @click="actionLauncher('recall')">{{properties.revokeBtnText||'撤 回'}}</el-button>
        <el-button type="danger" v-if="setting.opType == 4&&setting.status==1"
          @click="actionLauncher('cancel')">
          终 止</el-button>
        <el-button @click="goBack()" v-if="!setting.hideCancelBtn" :disabled="allBtnDisabled">
          {{$t('common.cancelButton')}}
        </el-button>
      </div>
    </div>
    <div class="approve-result"
      v-if="(setting.opType==0||setting.opType==4) && activeTab==='0' &&!subFlowVisible">
      <div class="approve-result-img" :class="flowTaskInfo.status | flowStatus()"></div>
    </div>
    <el-tabs class="JNPF-el_tabs" v-model="activeTab">
      <el-tab-pane label="表单信息" v-loading="loading" v-if="setting.opType!='4'&&!subFlowVisible ">
        <component :is="currentView" @close="goBack" ref="form" @eventReceiver="eventReceiver"
          @setLoad="setLoad" @setCandidateLoad="setCandidateLoad" @setPageLoad="setPageLoad" />
      </el-tab-pane>
      <el-tab-pane label="流程信息" v-loading="loading">
        <template v-if="!subFlowVisible">
          <Process :conf="flowTemplateJson" v-if="flowTemplateJson.nodeId" @subFlow='subFlow' />
        </template>
        <template v-else>
          <el-tabs v-model="subFlowTab" @tab-click="activeClick" type="card">
            <el-tab-pane v-for="(item,index) in subFlowInfoList" :key="index"
              :label="item.flowTaskInfo.fullName" :name="item.flowTaskInfo.id">
              <Process :conf="item.flowTemplateInfo.flowTemplateJson" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-tab-pane>
      <el-tab-pane label="流转记录" v-if="setting.opType!='-1'" v-loading="loading">
        <recordList :list='flowTaskOperatorRecordList' :endTime='endTime' :flowId="setting.flowId"
          :opType="setting.opType" />
      </el-tab-pane>
      <el-tab-pane label="审批汇总" v-if="setting.opType!='-1' && isSummary" v-loading="loading"
        name="recordSummary">
        <RecordSummary :id='setting.id' :summaryType="summaryType" ref="recordSummary" />
      </el-tab-pane>
      <el-tab-pane label="流程评论" v-if="setting.opType!='-1' && isComment" v-loading="loading"
        name="comment">
        <Comment :id='setting.id' ref="comment" />
      </el-tab-pane>
    </el-tabs>
    <el-dialog :title="eventType==='audit'?'审批通过':'审批退回'" :close-on-click-modal="false"
      :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body
      :before-close="beforeClose" width='600px'>
      <el-form ref="candidateForm" :model="candidateForm"
        :label-width="candidateForm.candidateList.length||branchList.length?'130px':'80px'">
        <template v-if="eventType==='audit'">
          <el-form-item label="分支选择" prop="branchList" v-if="branchList.length"
            :rules="[{ required: true, message: `分支不能为空`, trigger: 'change' }]">
            <el-select v-model="candidateForm.branchList" multiple placeholder="请选择审批分支" clearable
              @change="onBranchChange">
              <el-option v-for="item in branchList" :key="item.nodeId" :label="item.nodeName"
                :value="item.nodeId" />
            </el-select>
          </el-form-item>
          <el-form-item :label="item.nodeName+item.label" :prop="'candidateList.' + i + '.value'"
            v-for="(item,i) in candidateForm.candidateList" :key="i" :rules="item.rules">
            <candidate-user-select v-model="item.value" multiple :placeholder="'请选择'+item.label"
              :taskId="setting.taskId" :formData="formData" :nodeId="item.nodeId"
              v-if="item.hasCandidates" />
            <user-select v-model="item.value" multiple :placeholder="'请选择'+item.label" title="候选人员"
              v-else />
          </el-form-item>
        </template>
        <template v-if="properties.rejectType &&eventType!=='audit'&&showReject">
          <el-form-item label="退回节点" prop="rejectStep">
            <el-select v-model="candidateForm.rejectStep" placeholder="请选择退回节点"
              :disabled='properties.rejectStep!=="2"'>
              <el-option v-for="item in rejectList" :key="item.nodeCode" :label="item.nodeName"
                :value="item.nodeCode">
              </el-option>
            </el-select>
          </el-form-item>
          <template v-if="properties.rejectType==3">
            <el-form-item prop="rejectRadio">
              <el-radio-group v-model="candidateForm.rejectType" class="form-item-content">
                <el-radio :label=1>重新审批
                  <el-tooltip content="若流程为A->B->C,C退回至A，则C->A->B->C" placement="top">
                    <i class="el-icon-question tooltip-question"></i>
                  </el-tooltip>
                </el-radio>
                <el-radio :label=2>直接提交给我
                  <el-tooltip content="若流程为A->B->C,C退回至A，则C->A->C" placement="top">
                    <i class="el-icon-question tooltip-question"></i>
                  </el-tooltip>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </template>
        </template>
        <template v-if="properties.hasOpinion">
          <el-form-item label="审批意见" prop="handleOpinion">
            <el-input v-model="candidateForm.handleOpinion" placeholder="请输入审批意见" type="textarea"
              :rows="4" />
            <CommonWordsDialog ref="commonWordsDialog" @change="common" />
          </el-form-item>
          <el-form-item label="审批附件" prop="fileList">
            <JNPF-UploadFz v-model="candidateForm.fileList" :limit="3" />
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
        <el-form-item label="抄送人员" v-if="properties.isCustomCopy">
          <user-select v-model="copyIds" placeholder="请选择" multiple />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="handleApproval()" :loading="approvalBtnLoading">
          {{$t('common.confirmButton')}}
        </el-button>
      </span>

    </el-dialog>
    <!-- 流程节点变更复活对话框 -->
    <el-dialog :title="flowTaskInfo.completion==100?'复活':'变更'" :close-on-click-modal="false"
      :visible.sync="resurgenceVisible" class="JNPF-dialog JNPF-dialog_center" lock-scroll
      append-to-body width='600px'>
      <el-form label-width="80px" :model="resurgenceForm" :rules="resurgenceRules"
        ref="resurgenceForm">
        <el-form-item :label="flowTaskInfo.completion==100?'复活节点':'变更节点'" prop="taskNodeId">
          <el-select v-model="resurgenceForm.taskNodeId"
            :placeholder="flowTaskInfo.completion==100?'请选择复活节点':'请选择变更节点'">
            <el-option v-for="item in resurgenceNodeList" :key="item.id" :label="item.nodeName"
              :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="flowTaskInfo.completion==100?'复活意见':'变更意见'" prop="handleOpinion">
          <el-row>
            <el-col :span="24">
              <el-input type="textarea" v-model="resurgenceForm.handleOpinion" placeholder="请填写意见"
                :rows="4" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :label="flowTaskInfo.completion==100?'复活附件':'变更附件'" prop="fileList">
          <JNPF-UploadFz v-model="resurgenceForm.fileList" :limit="3" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resurgenceVisible = false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="handleResurgence()" :loading="resurgenceBtnLoading">
          {{$t('common.confirmButton')}}
        </el-button>
      </span>
    </el-dialog>
    <print-browse :visible.sync="printBrowseVisible" :id="printTemplateId" :formId="setting.id"
      :fullName="setting.fullName" />
    <candidate-form :visible.sync="candidateVisible" :candidateList="candidateList"
      :branchList="branchList" :taskId="setting.taskId" :formData="formData"
      @submitCandidate="submitCandidate" :isCustomCopy="properties.isCustomCopy" />
    <error-form :visible.sync="errorVisible" :nodeList="errorNodeList" @submit="handleError" />
    <actionDialog v-if="actionVisible" ref="actionDialog" :assignNodeList="assignNodeList"
      @submit="actionReceiver" />
    <SuspendDialog v-if="suspendVisible" ref="suspendDialog" @submit="suspendReceiver" />
    <HasFreeApprover :visible.sync="hasFreeApproverVisible" :taskId="setting.taskId"
      :formData="formData" :properties="properties" @close="approverDialog" />
    <SignImgDialog v-if="signVisible" ref="SignImg" :lineWidth='3' :userInfo='userInfo'
      :isDefault='1' @close="signDialog" />
    <FlowBox v-if="flowBoxVisible" ref="FlowBox" @close="flowBoxVisible = false" />
    <PrintDialog v-if="printDialogVisible" ref="printDialog" @change="printBrowseHandle">
    </PrintDialog>
  </div>
  <!-- </transition> -->
</template>

<script>
import PrintDialog from '@/components/PrintDialog'
import SignImgDialog from '@/components/SignImgDialog'
import { FlowBeforeInfo, Audit, Reject, Transfer, Recall, Cancel, Assign, SaveAudit, Candidates, CandidateUser, Resurgence, ResurgenceList, RejectList, suspend, restore, subFlowInfo } from '@/api/workFlow/FlowBefore'
import { Revoke, Press } from '@/api/workFlow/FlowLaunch'
import { Create, Update } from '@/api/workFlow/workFlowForm'
import recordList from './RecordList'
import Comment from './Comment'
import RecordSummary from './RecordSummary'
import CandidateForm from './CandidateForm'
import ErrorForm from './ErrorForm'
import CandidateUserSelect from './CandidateUserSelect'
import Process from '@/components/Process/Preview'
import PrintBrowse from '@/components/PrintBrowse'
import ActionDialog from '@/views/workFlow/components/ActionDialog'
import HasFreeApprover from './HasFreeApprover'
import SuspendDialog from './SuspendDialog'
import CommonWordsDialog from './CommonWordsDialog'
import { mapGetters } from "vuex"
export default {
  name: 'FlowBox',
  components: { PrintDialog, SignImgDialog, HasFreeApprover, recordList, Process, PrintBrowse, Comment, RecordSummary, CandidateForm, CandidateUserSelect, ErrorForm, ActionDialog, SuspendDialog, CommonWordsDialog },
  data() {
    return {
      printTemplateId: '',
      printDialogVisible: false,
      subFlowTab: '',
      resurgenceVisible: false,
      actionVisible: false,
      resurgenceForm: {
        taskNodeId: '',
        handleOpinion: '',
        fileList: []
      },
      resurgenceRules: {
        taskNodeId: [
          {
            required: true,
            message: '请选择节点',
            trigger: 'change'
          }
        ],
      },
      previewVisible: false,
      assignNodeList: [],
      resurgenceNodeList: [],
      currentView: '',
      previewTitle: '',
      formData: {},
      setting: {},
      monitorList: [{ fullName: '1', flowName: '1', startTime: '1', userName: '1', thisStep: '1' }, { fullName: '1', flowName: '1', startTime: '1', userName: '1', thisStep: '1' }],
      flowFormInfo: {},
      flowTemplateInfo: {},
      flowTaskInfo: {},
      flowTaskNodeList: [],
      flowTemplateJson: {},
      flowTaskOperatorRecordList: [],
      properties: {},
      endTime: 0,
      suspendVisible: false,
      visible: false,
      handleId: '',
      activeTab: '0',
      isComment: false,
      isSummary: false,
      summaryType: 0,
      loading: false,
      btnLoading: false,
      approvalBtnLoading: false,
      resurgenceBtnLoading: false,
      candidateLoading: false,
      candidateVisible: false,
      hasFreeApproverVisible: false,
      signVisible: false,
      candidateType: 1,
      branchList: [],
      candidateList: [],
      candidateForm: {
        branchList: [],
        candidateList: [],
        fileList: [],
        handleOpinion: '',
        rejectStep: '',
        rejectType: 1
      },
      printBrowseVisible: false,
      rejectList: [],
      showReject: false,
      eventType: '',
      signImg: '',
      copyIds: [],
      fullName: '',
      thisStep: '',
      allBtnDisabled: false,
      flowUrgent: 1,
      flowUrgentList: [
        { name: '普通', color: '#409EFF', state: 1, },
        { name: '重要', color: '#E6A23C', state: 2, },
        { name: '紧急', color: '#F56C6C', state: 3, },
      ],
      errorVisible: false,
      errorNodeList: [],
      isValidate: false,
      moreBtnList: [],
      subFlowVisible: false,
      flowBoxVisible: false,
      subFlowInfoList: [],
      commonWordsVisible: false,
    }
  },
  computed: {
    title() {
      if ([2, 3, 4].includes(this.setting.opType)) return this.fullName
      return this.thisStep ? this.fullName + '/' + this.thisStep : this.fullName
    },
    selectState() {
      const index = this.flowUrgentList.findIndex(c => this.flowUrgent === c.state)
      return index
    },
    ...mapGetters(['userInfo'])
  },
  watch: {
    activeTab(val) {
      if (val === 'comment') {
        this.$refs.comment && this.$refs.comment.init()
        this.moreBtnList.push({ label: "评 论", key: "comment" })
      } else {
        this.moreBtnList = this.moreBtnList.filter(o => o.key != "comment")
      }
      if (val === 'recordSummary') {
        this.$refs.recordSummary && this.$refs.recordSummary.init()
      }
    }
  },
  methods: {
    common(val) {
      this.commonWordsVisible = false
      if (val) {
        if (this.resurgenceVisible) {
          this.resurgenceForm.handleOpinion += val.commonWordsText
        } else {
          this.candidateForm.handleOpinion += val.commonWordsText
        }

      }
    },
    beforeClose() {
      this.visible = false
      this.$refs.commonWordsDialog.close()
    },
    beforeClose() {
      this.visible = false
      this.$refs.commonWordsDialog.close()
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
    approverDialog(needClose) {
      if (needClose) this.$emit('close', true)
    },
    activeClick() {
      let data = this.subFlowInfoList.filter(o => o.flowTaskInfo.id == this.subFlowTab) || []
      if (data.length) {
        this.fullName = data[0].flowTaskInfo.fullName
        this.flowTaskOperatorRecordList = data[0].flowTaskOperatorRecordList || []
        let templateJson = data[0].flowTaskInfo.flowTemplateJson ? JSON.parse(data[0].flowTaskInfo.flowTemplateJson) : null
        this.isComment = templateJson.properties.isComment
        this.isSummary = templateJson.properties.isSummary
        this.summaryType = templateJson.properties.summaryType
        this.flowUrgent = data[0].flowTaskInfo.flowUrgent || 1
        this.setting.id = data[0].flowTaskInfo.id
      }
    },
    subFlow(enCode) {
      let flowTaskNodeList = this.flowTaskNodeList.filter(res => res.nodeCode == enCode)
      if (!flowTaskNodeList.length) return
      if (!flowTaskNodeList[0].type || flowTaskNodeList[0].nodeType != 'subFlow') return
      let item = {
        subFlowVisible: true,
        ...flowTaskNodeList,
        ...this.setting,
      }
      this.flowBoxVisible = true
      this.$nextTick(() => {
        this.$refs.FlowBox.init(item)
      })
    },
    handleResurgence(errorRuleUserList) {
      this.$refs['resurgenceForm'].validate((valid) => {
        if (!valid) return
        let query = {
          ...this.resurgenceForm,
          taskId: this.setting.taskId,
          resurgence: this.flowTaskInfo.completion == 100
        }
        if (errorRuleUserList) query.errorRuleUserList = errorRuleUserList
        this.resurgenceBtnLoading = true
        Resurgence(query).then(res => {
          const errorData = res.data
          if (errorData && Array.isArray(errorData) && errorData.length) {
            this.errorNodeList = errorData
            this.eventType = 'resurgence'
            this.errorVisible = true
            this.resurgenceBtnLoading = false
          } else {
            this.$message({
              type: 'success',
              message: res.msg,
              duration: 1000,
              onClose: () => {
                this.resurgenceBtnLoading = false
                this.visible = false
                this.errorVisible = false
                this.$emit('close', true)
              }
            })
          }
        }).catch(() => { this.resurgenceBtnLoading = false })
      })
    },
    flowResurgence() {
      this.resurgenceVisible = true
      ResurgenceList(this.setting.taskId).then(res => {
        this.resurgenceNodeList = res.data
      })
    },
    goBack(isRefresh) {
      this.$emit('close', isRefresh)
    },
    init(data) {
      this.loading = true
      this.activeTab = '0'
      this.setting = data
      if (data.subFlowVisible) {
        this.subFlowInfo(data)
      } else {
        /**
         * opType
         * -1 - 我发起的新建/编辑
         * 0 - 我发起的详情
         * 1 - 待办事宜
         * 2 - 已办事宜
         * 3 - 抄送事宜
         * 4 - 流程监控
         */
        this.getBeforeInfo(data)
      }

    },
    getBeforeInfo(data) {
      FlowBeforeInfo(data.id || 0, { taskNodeId: data.taskNodeId, taskOperatorId: data.taskId, flowId: data.flowId }).then(res => {
        this.flowFormInfo = res.data.flowFormInfo
        this.flowTaskInfo = res.data.flowTaskInfo || {}
        this.flowTemplateInfo = res.data.flowTemplateInfo
        const fullName = data.opType == '-1' ? this.flowTemplateInfo.fullName : this.flowTaskInfo.fullName
        data.fullName = fullName
        this.fullName = fullName
        this.thisStep = this.flowTaskInfo.thisStep
        this.flowUrgent = this.flowTaskInfo.flowUrgent || 1
        data.type = this.flowTemplateInfo.type
        data.draftData = res.data.draftData || null
        data.formData = res.data.formData || {}
        data.formEnCode = this.flowFormInfo.enCode
        const formUrl = this.flowFormInfo.formType == 2 ? 'workFlow/workFlowForm/dynamicForm' : this.flowFormInfo.urlAddress ? this.flowFormInfo.urlAddress.replace(/\s*/g, "") : `workFlow/workFlowForm/${this.flowFormInfo.enCode}`
        this.currentView = (resolve) => require([`@/views/${formUrl}`], resolve)
        this.flowTaskNodeList = res.data.flowTaskNodeList || []
        this.flowTemplateJson = this.flowTemplateInfo.flowTemplateJson ? JSON.parse(this.flowTemplateInfo.flowTemplateJson) : null
        this.isComment = this.flowTemplateJson.properties.isComment
        this.isSummary = this.flowTemplateJson.properties.isSummary
        this.summaryType = this.flowTemplateJson.properties.summaryType
        this.flowTaskOperatorRecordList = res.data.flowTaskOperatorRecordList || []
        this.flowTaskOperatorRecordList = this.flowTaskOperatorRecordList.reverse()
        this.properties = res.data.approversProperties || {}
        this.candidateForm.rejectType = this.properties.rejectType == 3 ? 1 : this.properties.rejectType
        this.endTime = this.flowTaskInfo.completion == 100 ? this.flowTaskInfo.endTime : 0
        data.formConf = this.flowFormInfo.propertyJson
        if (data.opType != 1 && data.opType != '-1') data.readonly = true
        data.formOperates = res.data.formOperates || []
        if (data.opType == 0) {
          for (let i = 0; i < data.formOperates.length; i++) {
            data.formOperates[i].write = false
          }
        }
        data.flowTemplateJson = this.flowTemplateJson
        if (this.flowTaskNodeList.length) {
          let assignNodeList = []
          for (let i = 0; i < this.flowTaskNodeList.length; i++) {
            const nodeItem = this.flowTaskNodeList[i]
            data.opType == 4 && nodeItem.type == 1 && nodeItem.nodeType === 'approver' && assignNodeList.push(nodeItem)
            const loop = data => {
              if (Array.isArray(data)) data.forEach(d => loop(d))
              if (data.nodeId === nodeItem.nodeCode) {
                if (nodeItem.type == 0) data.state = 'state-past'
                if (nodeItem.type == 1) data.state = 'state-curr'
                if (nodeItem.nodeType === 'approver' || nodeItem.nodeType === 'start' || nodeItem.nodeType === 'subFlow') data.content = nodeItem.userName
                return
              }
              if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes)
              if (data.childNode) loop(data.childNode)
            }
            loop(this.flowTemplateJson)
          }
          this.assignNodeList = assignNodeList
        } else {
          this.flowTemplateJson.state = 'state-curr'
        }
        this.initBtnList()
        setTimeout(() => {
          this.$nextTick(() => {
            this.$refs.form && this.$refs.form.init(data)
            if (!this.$refs.form) setTimeout(() => { this.$refs.form && this.$refs.form.init(data) }, 500)
          })
        }, 500)
      }).catch(() => { this.loading = false })
    },
    initBtnList() {
      const list = []
      const setting = this.setting
      const opType = this.setting.opType
      const properties = this.properties
      const flowTaskInfo = this.flowTaskInfo
      if (opType == '-1' && !setting.hideCancelBtn) list.push({ label: properties.saveBtnText || '暂 存', key: 'save' })
      if (opType == 0 && setting.status == 1 && (properties.hasRevokeBtn || properties.hasRevokeBtn === undefined)) list.push({ label: properties.revokeBtnText || '撤 回', key: 'revoke' })
      if (opType != 4 && setting.id && properties.hasPrintBtn && properties.printId) list.push({ label: properties.printBtnText || '打 印', key: 'print' })
      if (opType == 1) {
        if (properties.hasTransferBtn) list.push({ label: properties.transferBtnText || '转 审', key: 'transfer' })
        if (properties.hasSaveBtn) list.push({ label: properties.saveBtnText || '暂 存', key: 'saveAudit' })
        if (properties.hasRejectBtn) list.push({ label: properties.rejectBtnText || '退 回', key: 'reject' })
        if (properties.hasFreeApproverBtn) list.push({ label: properties.hasFreeApproverBtnText || '加 签', key: 'hasFreeApprover' })
      }
      if (opType == 4) {
        if (flowTaskInfo.completion == 100) list.push({ label: '复 活', key: 'resurgence' })
        if (flowTaskInfo.completion > 0 && flowTaskInfo.completion < 100 && !flowTaskInfo.rejectDataId && (setting.status == 1 || setting.status == 3)) list.push({ label: '变 更', key: 'resurgence' })
        if (setting.status == 1 && this.assignNodeList.length) list.push({ label: '指 派', key: 'assign' })
        if (flowTaskInfo.status == 1) list.push({ label: '挂 起', key: 'suspend' })
        if (flowTaskInfo.status == 6 && !flowTaskInfo.suspend) list.push({ label: '恢 复', key: 'recovery' })
      }
      this.moreBtnList = list
    },
    subFlowInfo(data) {
      this.loading = false
      this.activeTab = '0'
      this.subFlowVisible = true
      subFlowInfo(data[0].id).then(res => {
        this.subFlowInfoList = res.data || []
        this.subFlowTab = this.subFlowInfoList[0].flowTaskInfo.id
        this.flowUrgent = this.subFlowInfoList[0].flowTaskInfo.flowUrgent || 1
        this.fullName = this.subFlowInfoList[0].flowTaskInfo.fullName
        this.flowTaskOperatorRecordList = this.subFlowInfoList[0].flowTaskOperatorRecordList || []
        this.flowTaskOperatorRecordList = this.flowTaskOperatorRecordList.reverse()
        for (let index = 0; index < this.subFlowInfoList.length; index++) {
          let element = this.subFlowInfoList[index];
          element.flowTemplateInfo.flowTemplateJson = element.flowTemplateInfo ? JSON.parse(element.flowTemplateInfo.flowTemplateJson) : {}
          if (element.flowTaskNodeList.length) {
            let assignNodeList = []
            for (let i = 0; i < element.flowTaskNodeList.length; i++) {
              const nodeItem = element.flowTaskNodeList[i]
              data.opType == 4 && nodeItem.type == 1 && nodeItem.nodeType === 'approver' && assignNodeList.push(nodeItem)
              const loop = data => {
                if (Array.isArray(data)) data.forEach(d => loop(d))
                if (data.nodeId === nodeItem.nodeCode) {
                  if (nodeItem.type == 0) data.state = 'state-past'
                  if (nodeItem.type == 1) data.state = 'state-curr'
                  if (nodeItem.nodeType === 'approver' || nodeItem.nodeType === 'start' || nodeItem.nodeType === 'subFlow') data.content = nodeItem.userName
                  return
                }
                if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes)
                if (data.childNode) loop(data.childNode)
              }
              loop(element.flowTemplateInfo.flowTemplateJson)
            }
            element.assignNodeList = assignNodeList
          } else {
            element.flowTemplateInfo.flowTemplateJson.state = 'state-curr'
          }
          let templateJson = this.subFlowInfoList[0].flowTaskInfo.flowTemplateJson ? JSON.parse(this.subFlowInfoList[0].flowTaskInfo.flowTemplateJson) : null
          this.isComment = templateJson.properties.isComment
          this.isSummary = templateJson.properties.isSummary
          this.summaryType = templateJson.properties.summaryType
          this.setting.id = this.subFlowInfoList[0].flowTaskInfo.id
        }
      }).catch(() => { this.loading = false })


    },
    printBrowseHandle(id) {
      this.printTemplateId = id
      this.printDialogVisible = false
      this.printBrowseVisible = true
    },
    printDialog() {
      this.printDialogVisible = true
      this.$nextTick(() => {
        this.$refs.printDialog.init(this.properties.printId)
      })
    },
    handleMore(e) {
      if (e == 'revoke') return this.actionLauncher('revoke')
      if (e == 'transfer') return this.actionLauncher('transfer')
      if (e == 'saveAudit') return this.eventLauncher('saveAudit')
      if (e == 'reject') return this.eventReceiver({}, 'reject')
      if (e == 'resurgence') return this.flowResurgence()
      if (e == 'assign') return this.actionLauncher('assign')
      if (e == 'comment') return this.addComment()
      if (e == 'print') return this.printDialog()
      if (e == 'suspend') return this.suspend()
      if (e == 'recovery') return this.recovery()
      this.eventLauncher(e)
    },
    suspend() {
      this.suspendVisible = true
      this.$nextTick(() => {
        this.$refs.suspendDialog.init(this.setting.id)
      })
    },
    recovery() {
      let data = {
        handleOpinion: '',
        fileList: [],
      }
      restore(this.setting.id, data).then(res => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            this.$emit('close', true)
          }
        })
      }).catch(() => {
        this.$refs.suspendDialog.btnLoading = false
      })
    },
    suspendReceiver(dataForm) {
      suspend(this.setting.id, dataForm).then(res => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            this.$emit('close', true)
          }
        })
      })
    },
    eventLauncher(eventType) {
      this.$refs.form && this.$refs.form.dataFormSubmit(eventType, this.flowUrgent)
    },
    eventReceiver(formData, eventType) {
      this.formData = formData
      this.formData.flowId = this.setting.flowId
      this.formData.id = this.setting.id
      this.eventType = eventType
      if (eventType === 'save' || eventType === 'submit') {
        return this.submitOrSave()
      }
      if (eventType === 'saveAudit') {
        return this.saveAudit()
      }
      if (eventType === 'hasFreeApprover') {
        return this.hasFreeApproverVisible = true
      }
      if (eventType === 'audit' || eventType === 'reject') {
        this.handleId = ''
        this.candidateForm.handleOpinion = ''
        this.candidateForm.fileList = []
        this.copyIds = []
        this.isValidate = false
        if (this.properties.hasSign) this.signImg = this.userInfo.signImg
        if (eventType === 'reject') {
          RejectList(this.setting.taskId).then(res => {
            this.showReject = res.data.isLastAppro
            this.rejectList = res.data.list || []
            this.candidateForm.rejectStep = this.rejectList[0].nodeCode
            if (!this.properties.hasSign && !this.properties.hasOpinion && !this.properties.isCustomCopy && !this.showReject) {
              this.$confirm('此操作将退回该审批单，是否继续？', '提示', {
                type: 'warning'
              }).then(() => {
                this.handleApproval()
              }).catch(() => { });
              return
            }
            this.isValidate = true
            this.visible = true
          }).catch({})
          return
        }
        this.candidateLoading = true
        Candidates(this.setting.taskId, this.formData).then(res => {
          let data = res.data
          this.candidateType = data.type
          this.candidateLoading = false
          this.candidateForm.branchList = []
          this.branchList = []
          if (data.type == 1) {
            this.branchList = res.data.list.filter(o => o.isBranchFlow)
            let list = res.data.list.filter(o => !o.isBranchFlow && o.isCandidates)
            this.candidateForm.candidateList = list.map(o => ({
              ...o,
              isDefault: true,
              label: '审批人',
              value: [],
              rules: [{ required: true, message: `审批人不能为空`, trigger: 'click' }]
            }))
            this.$nextTick(() => {
              this.$refs['candidateForm'].resetFields()
            })
            this.isValidate = true
            this.visible = true
          } else if (data.type == 2) {
            let list = res.data.list.filter(o => o.isCandidates)
            this.candidateForm.candidateList = list.map(o => ({
              ...o,
              label: '审批人',
              value: [],
              rules: [{ required: true, message: `审批人不能为空`, trigger: 'click' }]
            }))
            this.$nextTick(() => {
              this.$refs['candidateForm'].resetFields()
            })
            this.isValidate = true
            this.visible = true
          } else {
            this.candidateForm.candidateList = []
            if (!this.properties.hasSign && !this.properties.hasOpinion && !this.properties.hasFreeApprover && !this.properties.isCustomCopy) {
              this.$confirm('此操作将通过该审批单，是否继续？', '提示', {
                type: 'warning'
              }).then(() => {
                this.handleApproval()
              }).catch(() => { });
              return
            }
            this.isValidate = true
            this.visible = true
          }
        }).catch(() => {
          this.candidateLoading = false
        })
      }
    },
    onBranchChange(val) {
      const defaultList = this.candidateForm.candidateList.filter(o => o.isDefault)
      if (!val.length) return this.candidateForm.candidateList = defaultList
      let list = []
      for (let i = 0; i < val.length; i++) {
        inner: for (let j = 0; j < this.branchList.length; j++) {
          let o = this.branchList[j]
          if (val[i] === o.nodeId && o.isCandidates) {
            list.push({
              ...o,
              label: '审批人',
              value: [],
              rules: [{ required: true, message: `审批人不能为空`, trigger: 'click' }]
            })
            break inner
          }
        }
      }
      this.candidateForm.candidateList = [...defaultList, ...list]
    },
    saveAudit() {
      this.btnLoading = true
      SaveAudit(this.setting.taskId, this.formData).then(res => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            this.btnLoading = false
            this.$emit('close', true)
          }
        })
      }).catch(() => {
        this.btnLoading = false
      })
    },
    submitOrSave() {
      this.formData.status = this.eventType === 'submit' ? 0 : 1
      this.formData.flowUrgent = this.flowUrgent
      if (this.setting.delegateUserList) {//受委托人不为空的时候走委托创建流程
        this.formData.delegateUserList = this.setting.delegateUserList
      }

      if (this.eventType === 'save') return this.handleRequest()
      this.candidateLoading = true
      Candidates(0, this.formData).then(res => {
        let data = res.data
        this.candidateLoading = false
        this.candidateType = data.type
        if (data.type == 1) {
          this.branchList = res.data.list.filter(o => o.isBranchFlow)
          this.candidateList = res.data.list.filter(o => !o.isBranchFlow && o.isCandidates)
          this.candidateVisible = true
        } else if (data.type == 2) {
          this.branchList = []
          this.candidateList = res.data.list.filter(o => o.isCandidates)
          this.candidateVisible = true
        } else {
          if (this.properties.isCustomCopy) {
            this.branchList = []
            this.candidateList = []
            this.candidateVisible = true
            return
          }
          this.$confirm('您确定要提交当前流程吗, 是否继续?', '提示', {
            type: 'warning'
          }).then(() => {
            this.handleRequest()
          }).catch(() => { });
        }
      }).catch(() => {
        this.candidateLoading = false
      })
    },
    handleRequest(candidateData) {
      if (candidateData) this.formData = { ...this.formData, ...candidateData }
      this.formData.candidateType = this.candidateType
      if (!this.formData.id) delete (this.formData.id)
      if (this.eventType === 'save') this.btnLoading = true
      this.allBtnDisabled = true
      const formMethod = this.formData.id ? Update : Create
      formMethod(this.formData).then(res => {
        const errorData = res.data
        if (errorData && Array.isArray(errorData) && errorData.length) {
          this.errorNodeList = errorData
          this.errorVisible = true
          this.allBtnDisabled = false
        } else {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              if (this.eventType === 'save') this.btnLoading = false
              this.candidateVisible = false
              this.allBtnDisabled = false
              this.errorVisible = false
              this.$emit('close', true)
            }
          })
        }
      }).catch(() => {
        if (this.eventType === 'save') this.btnLoading = false
        this.allBtnDisabled = false
        this.errorVisible = false
      })
    },
    submitCandidate(data) {
      this.handleRequest(data)
    },
    actionLauncher(eventType) {
      this.eventType = eventType
      if ((eventType === 'revoke' || eventType === 'recall') && !this.properties.hasOpinion && !this.properties.hasSign) {
        const title = this.eventType == 'revoke' ? '此操作将撤回该流程，是否继续？' : '此操作将撤回该审批单，是否继续？'
        this.$confirm(title, '提示', {
          type: 'warning'
        }).then(() => {
          this.actionReceiver()
        }).catch(() => { });
        return
      }
      this.showActionDialog()
    },
    showActionDialog() {
      this.actionVisible = true
      this.$nextTick(() => {
        this.$refs.actionDialog.init(this.properties, this.eventType)
      })
    },
    actionReceiver(query) {
      if (!query) {
        query = {
          handleOpinion: '',
          signImg: '',
          fileList: []
        }
      }
      const id = this.eventType == 'revoke' ? this.setting.id : this.setting.taskId
      const actionMethod = this.getActionMethod()
      this.approvalBtnLoading = true
      actionMethod(id, query).then(res => {
        this.approvalBtnLoading = false
        this.$message({
          type: 'success',
          message: res.msg,
          duration: 1000,
          onClose: () => {
            this.$emit('close', true)
          }
        })
      }).catch(() => {
        this.$refs.actionDialog.btnLoading = false
        this.approvalBtnLoading = false
      })
    },
    getActionMethod() {
      if (this.eventType === 'transfer') return Transfer
      if (this.eventType === 'assign') return Assign
      if (this.eventType === 'revoke') return Revoke
      if (this.eventType === 'recall') return Recall
      if (this.eventType === 'cancel') return Cancel
    },
    press() {
      this.$confirm('此操作将提示该节点尽快处理，是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        Press(this.setting.id).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1000
          })
        })
      }).catch(() => { })
    },
    handleError(data) {
      if (this.eventType === 'submit') {
        this.formData.errorRuleUserList = data
        this.handleRequest()
        return
      }
      if (this.eventType === 'audit' || this.eventType === 'reject') {
        this.handleApproval(data)
        return
      }
      if (this.eventType === 'resurgence') {
        this.handleResurgence(data)
        return
      }
    },
    handleApproval(errorRuleUserList) {
      const handleRequest = () => {
        if (this.properties.hasSign && !this.signImg) {
          this.$message({
            message: '请签名',
            type: 'error'
          })
          return
        }
        let query = {
          handleOpinion: this.candidateForm.handleOpinion,
          fileList: this.candidateForm.fileList,
          ...this.formData,
          enCode: this.setting.enCode,
          signImg: this.signImg,
          copyIds: this.copyIds.join(','),
          branchList: this.candidateForm.branchList,
          candidateType: this.candidateType,
          rejectType: this.candidateForm.rejectType
        }
        if (this.eventType === 'reject') query.rejectStep = this.candidateForm.rejectStep
        if (errorRuleUserList) query.errorRuleUserList = errorRuleUserList
        if (this.candidateForm.candidateList.length) {
          let candidateList = {}
          for (let i = 0; i < this.candidateForm.candidateList.length; i++) {
            candidateList[this.candidateForm.candidateList[i].nodeId] = this.candidateForm.candidateList[i].value
          }
          query.candidateList = candidateList
        }
        if (this.eventType === 'audit' && this.properties.hasFreeApprover) {
          query = { freeApproverUserId: this.handleId, ...query }
        }
        const approvalMethod = this.eventType === 'audit' ? Audit : Reject
        this.approvalBtnLoading = true
        approvalMethod(this.setting.taskId, query).then(res => {
          const errorData = res.data
          if (errorData && Array.isArray(errorData) && errorData.length) {
            this.errorNodeList = errorData
            this.errorVisible = true
            this.approvalBtnLoading = false
          } else {
            this.$message({
              type: 'success',
              message: res.msg,
              duration: 1000,
              onClose: () => {
                this.approvalBtnLoading = false
                this.visible = false
                this.errorVisible = false
                this.$emit('close', true)
              }
            })
          }
        }).catch(() => { this.approvalBtnLoading = false })
      }
      if (!this.isValidate) return handleRequest()
      this.$refs['candidateForm'].validate((valid) => {
        if (valid) {
          handleRequest()
        }
      })
    },
    addComment() {
      this.$refs.comment && this.$refs.comment.showCommentDialog()
    },
    setPageLoad(val) {
      this.loading = !!val
    },
    setCandidateLoad(val) {
      this.candidateLoading = !!val
      this.allBtnDisabled = !!val
    },
    setLoad(val) {
      this.btnLoading = !!val
    },
    handleFlowUrgent(e) {
      this.flowUrgent = e
    }
  }
}
</script>
<style lang="scss" scoped>
.flow-form-main {
  .JNPF-el_tabs {
    height: calc(100% - 62px);
  }
}

.color-box {
  width: 7px;
  height: 7px;
  display: inline-block;
  border-radius: 50%;
}
.flow-urgent-value {
  display: flex;
  align-items: center;
  span:first-child {
    margin: 0 3px 0 10px;
  }
}

.options {
  .dropdown {
    margin-right: 10px;
  }
  .el-button {
    min-width: 70px;
  }
}
.dropdown-item {
  min-width: 70px;
  text-align: center;
}
.subFlow_tabs {
  // >>> .el-tabs__item {
  //   text-align: center;
  // }
  // >>> .el-tabs__content {
  //   padding: 0px 0 15px;
  // }
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
  /* padding: 0 10px 10px; */
}
.commonWords-button {
  margin-top: 57px;
}
.JNPF-page-header-content {
  max-width: 40vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
