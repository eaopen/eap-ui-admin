
<template>
  <el-drawer :size="value && isConditionNode() ?'750px':'600px'" class="drawer JNPF-common-drawer"
    :visible.sync="visible" @close="cancel" v-if="properties" append-to-body
    :wrapperClosable="false">
    <!-- 标题 -->
    <header slot="title" class="header"
      v-if="value && (value.type=='condition'|| value.type=='approver' || value.type=='subFlow' || value.type=='start' )">
      <el-input size="mini" v-model="properties.title" style="z-index:9;max-width: 200px;"
        placeholder="请输入">
      </el-input>
    </header>
    <header slot="title" class="header" v-else>{{properties.title}}</header>

    <!-- 条件  -->
    <section class="condition-pane pd-10" v-if="value && isConditionNode()">
      <el-row class="condition-list condition-list-header">
        <el-col :span="8" class="label">条件字段</el-col>
        <el-col :span="4">比较</el-col>
        <el-col :span="8">数据值</el-col>
        <el-col :span="3">逻辑</el-col>
        <el-col :span="1"></el-col>
      </el-row>
      <template v-for="(item, index) in pconditions">
        <el-row class="condition-list" :key="index">
          <el-col :span="8" class="label">
            <el-select v-model="item.fieldType" placeholder="请选择"
              class="condition-select condition-type-select" @change="fieldTypeChange(item)">
              <el-option v-for="item in conditionTypeOptions" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
            <el-button size="mini" v-if="item.fieldType===3" class="edit-script-btn"
              @click="editFormula(item)">公式编辑
            </el-button>
            <el-select v-model="item.field" placeholder="请选择"
              @change="fieldNameChange($event,item,index)" v-else>
              <el-option v-for="item in usedFormItems" :key="item.__vModel__"
                :label="item.__config__.label" :value="item.__vModel__">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="item.symbol" placeholder="请选择" class="condition-select"
              @change="symbolChange($event,item)">
              <el-option v-for="item in symbolOptions" :key="item.value" :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="8" class="fieldValue">
            <el-select v-model="item.fieldValueType" placeholder="请选择"
              class="condition-select condition-type-select" @change="fieldValueTypeChange(item)">
              <el-option v-for="item in conditionTypeOptions1" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
            <div v-if="item.fieldValueType===2">
              <template v-if="item.jnpfKey==='numInput'">
                <el-input-number v-model="item.fieldValue" placeholder="请输入"
                  :precision="item.precision" controls-position="right" />
              </template>
              <template v-else-if="item.jnpfKey==='calculate'">
                <el-input-number v-model="item.fieldValue" placeholder="请输入" :precision="2"
                  controls-position="right" />
              </template>
              <template v-else-if="['rate','slider'].includes(item.jnpfKey)">
                <el-input-number v-model="item.fieldValue" placeholder="请输入"
                  controls-position="right" />
              </template>
              <template v-else-if="item.jnpfKey==='switch'">
                <el-switch v-model="item.fieldValue" :active-value="1" :inactive-value="0" />
              </template>
              <template v-else-if="item.jnpfKey==='time'">
                <el-time-picker v-model="item.fieldValue" :picker-options="item['picker-options']"
                  placeholder="请选择" clearable :value-format="item['value-format']"
                  :format="item.format">
                </el-time-picker>
              </template>
              <template v-else-if="['date','createTime', 'modifyTime'].includes(item.jnpfKey)">
                <el-date-picker v-model="item.fieldValue" clearable placeholder="请选择"
                  :type="item.jnpfKey==='date'&& item.type?item.type:'datetime'"
                  value-format="timestamp" @change="onConditionDateChange($event,item)"
                  :format="item.format||'yyyy-MM-dd HH:mm:ss'">
                </el-date-picker>
              </template>
              <template v-else-if="['comSelect','currOrganize'].includes(item.jnpfKey)">
                <comSelect v-model="item.fieldValue" placeholder="请选择" clearable
                  @change="onConditionListChange(arguments,item)" />
              </template>
              <template v-else-if="['depSelect'].includes(item.jnpfKey)">
                <depSelect v-model="item.fieldValue" placeholder="请选择" clearable
                  @change="onConditionObjChange(arguments,item)" />
              </template>
              <template v-else-if="['userSelect','createUser','modifyUser'].includes(item.jnpfKey)">
                <userSelect v-model="item.fieldValue" placeholder="请选择" hasSys clearable
                  @change="onConditionObjChange(arguments,item)" />
              </template>
              <template v-else-if="['usersSelect'].includes(item.jnpfKey)">
                <usersSelect v-model="item.fieldValue" placeholder="请选择" clearable
                  @change="onConditionObjChange(arguments,item)" />
              </template>
              <template v-else-if="['posSelect','currPosition'].includes(item.jnpfKey)">
                <posSelect v-model="item.fieldValue" placeholder="请选择" clearable
                  @change="onConditionObjChange(arguments,item)" />
              </template>
              <template v-else-if="item.jnpfKey==='address'">
                <JNPFAddress v-model="item.fieldValue" placeholder="请选择" :level="item.level"
                  clearable @change="onConditionListChange(arguments,item)" />
              </template>
              <template v-else-if="item.jnpfKey==='groupSelect'">
                <groupSelect v-model="item.fieldValue" placeholder="请选择" clearable
                  @change="onConditionObjChange(arguments,item)" />
              </template>
              <template v-else-if="item.jnpfKey==='roleSelect'">
                <roleSelect v-model="item.fieldValue" placeholder="请选择" clearable
                  @change="onConditionObjChange(arguments,item)" />
              </template>
              <template v-else>
                <el-input v-model="item.fieldValue" placeholder="请输入"></el-input>
              </template>
            </div>
            <el-select v-model="item.fieldValue" placeholder="请选择" v-if="item.fieldValueType===1"
              @change="fieldValueChange($event,item)">
              <el-option v-for="item in usedFormItems" :key="item.__vModel__"
                :label="item.__config__.label" :value="item.__vModel__">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select v-model="item.logic" placeholder="请选择" class="condition-select"
              @change="logicChange($event,item)">
              <el-option v-for="item in logicOptions" :key="item.value" :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="1">
            <i class="el-icon-delete" @click="onDelCondition(index)"></i>
          </el-col>
        </el-row>
      </template>
      <div style="padding-left:4px;margin-top:10px;">
        <el-button size="small" icon="el-icon-plus" @click="addCondition()">添加条件</el-button>
      </div>
    </section>

    <!-- 定时器  -->
    <section class="condition-pane pd-10-20" v-if="value && isTimerNode()">
      <el-row>
        <el-alert title="定时器将根据设置的延迟时间流转审批" type="warning" :closable="false" show-icon />
        <el-col :span="24">
          <el-form class="mt-10" label-position="top">
            <el-form-item label="时间设置">
              <div slot="label" class="form-item-label">延迟时间</div>
              <div class="form-item-content">
                <div class="mb-10">
                  <el-input-number :min="0" v-model="properties.day" :precision="0"
                    controls-position="right" />
                  <span class="ml-8">天</span>
                </div>
                <div class="mb-10">
                  <el-input-number :min="0" v-model="properties.hour" :precision="0"
                    controls-position="right" />
                  <span class="ml-8">小时</span>
                </div>
                <div class="mb-10">
                  <el-input-number :min="0" v-model="properties.minute" :precision="0"
                    controls-position="right" />
                  <span class="ml-8">分钟</span>
                </div>
                <div>
                  <el-input-number :min="0" v-model="properties.second" :precision="0"
                    controls-position="right" />
                  <span class="ml-8">秒</span>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </section>

    <!-- 子流程  -->
    <section class="approver-pane" v-if="value && isSubFlowNode()">
      <el-tabs style="height:100%;">
        <el-tab-pane label="基础设置">
          <el-scrollbar class="config-scrollbar">
            <el-form label-position="top" :model="subFlowForm" class="pd-10-20">
              <el-form-item label="发起设置">
                <div slot="label" class="form-item-label">发起设置</div>
                <div class="form-item-content">
                  <el-radio-group v-model="subFlowForm.initiateType" @change="resetOrgColl">
                    <el-radio v-for="item in initiateTypeOptions" :label="item.value"
                      :key="item.value" :disabled="item.disabled" class="radio-item">{{item.label}}
                    </el-radio>
                  </el-radio-group>
                  <div v-if="subFlowForm.initiateType === 1" class="option-box-tip">
                    发起者的主管将作为子流程发起人</div>
                  <div v-if="subFlowForm.initiateType === 2" class="option-box-tip">
                    发起者的部门主管将作为子流程发起人</div>
                  <div v-if="subFlowForm.initiateType === 3" class="option-box-tip">
                    发起者自己将作为子流程发起人</div>
                  <div v-if="subFlowForm.initiateType === 4" class="option-box-tip">
                    选择表单字段的值作为子流程发起人</div>
                  <div v-if="subFlowForm.initiateType === 5" class="option-box-tip">
                    设置审批流程中某个环节的审批人作为子流程发起人</div>
                  <div v-if="subFlowForm.initiateType === 6" class="option-box-tip">
                    所指定的成员将作为子流程发起人，多人时，发起多个子流程</div>
                  <div v-if="subFlowForm.initiateType === 7" class="option-box-tip">
                    指定可供选择的候选人发起多个子流程</div>
                  <div v-if="subFlowForm.initiateType === 9" class="option-box-tip">
                    从目标服务中获取子流程发起人</div>
                  <el-form-item label="发起者的" style="margin-bottom:0!important;"
                    v-if="subFlowForm.initiateType === 1">
                    <el-select v-model="subFlowForm.managerLevel">
                      <el-option v-for="item in 10" :key="item"
                        :label="item===1?'直接主管':'第'+item+'级主管'" :value="item">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="发起者的" style="margin-bottom:0!important;"
                    v-if="subFlowForm.initiateType === 2">
                    <el-select v-model="subFlowForm.departmentLevel">
                      <el-option v-for="item in 10" :key="item" :label="'第'+item+'级部门主管'"
                        :value="item">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="表单字段" style="margin-bottom:0!important;"
                    v-if="subFlowForm.initiateType === 4">
                    <div class="assignee-form">
                      <el-select v-model="subFlowForm.formFieldType" placeholder="请选择字段"
                        class="form-field-type">
                        <el-option :value="1" label="用户"></el-option>
                        <el-option :value="2" label="部门"></el-option>
                        <el-option :value="3" label="岗位"></el-option>
                        <el-option :value="4" label="角色"></el-option>
                        <el-option :value="5" label="分组"></el-option>
                      </el-select>
                      <el-select v-model="subFlowForm.formField" placeholder="请选择字段"
                        class="form-field">
                        <el-option v-for="item in usedFormItems" :key="item.__vModel__"
                          :label="item.__config__.label" :value="item.__vModel__">
                        </el-option>
                      </el-select>
                    </div>
                  </el-form-item>
                  <el-form-item label="审批节点" style="margin-bottom:0!important;"
                    v-if="subFlowForm.initiateType === 5">
                    <el-select v-model="subFlowForm.nodeId" placeholder="请选择节点">
                      <el-option v-for="item in nodeOptions" :key="item.nodeId"
                        :label="item.properties.title" :value="item.nodeId">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item style="margin-bottom:0!important;"
                    v-if="subFlowForm.initiateType === 9">
                    <div slot="label">请求路径
                      <el-tooltip placement="top"
                        content='请求自带参数：taskId、taskNodeId，返回结构：JSON对象{"handleId":"id1,id2"}'>
                        <a class="el-icon-warning-outline"></a>
                      </el-tooltip>
                    </div>
                    <el-input v-model="subFlowForm.getUserUrl" placeholder="请输入http或https接口地址">
                      <template slot="prepend">POST</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item style="margin-bottom:0!important;"
                    v-if="subFlowForm.initiateType === 6||subFlowForm.initiateType === 7">
                    <org-select ref="subFlow-department-org" type="department"
                      v-model="subFlowForm.initiateOrg" title="添加部门" class="mb-5" />
                    <org-select ref="subFlow-role-org" type="role"
                      v-model="subFlowForm.initiateRole" title="添加角色" class="mb-5" />
                    <org-select ref="subFlow-position-org" v-model="subFlowForm.initiatePos"
                      title="添加岗位" type="position" class="mb-5" />
                    <org-select ref="subFlow-group-org" type="group"
                      v-model="subFlowForm.initiateGroup" title="添加分组" class="mb-5" />
                    <org-select ref="subFlow-user-org" v-model="subFlowForm.initiator"
                      title="添加用户" />
                  </el-form-item>
                </div>
              </el-form-item>
              <el-form-item label="子流程类型">
                <div slot="label" class="form-item-label">子流程类型</div>
                <el-radio-group class="form-item-content" v-model="subFlowForm.isAsync">
                  <el-radio :label="false">同步</el-radio>
                  <el-radio :label="true">异步</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="子流程表单">
                <div slot="label" class="form-item-label">子流程表单</div>
                <flow-dialog class="form-item-content" :value="subFlowForm.flowId"
                  :title="subFlowForm.flowName" :flowType="flowType" @change="onSubFlowIdChange" />
              </el-form-item>
              <el-form-item label="子流程传递">
                <div slot="label" class="form-item-label">子流程传递</div>
                <div class="form-item-content hand" @click="openRuleBox">
                  <el-input class="hand" :value="subFlowForm.assignList.length?'已设置':''"
                    placeholder="请设置子流程传递规则" suffix-icon="el-icon-arrow-down" readonly />
                </div>
              </el-form-item>
              <el-form-item>
                <div slot="label" class="form-item-label">异常处理
                  <el-tooltip content="子流程发起节点人员异常时遵循该规则" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <div class="form-item-content">
                  <el-select v-model="subFlowForm.errorRule" class="mb-10"
                    @change="subFlowForm.errorRuleUser=[]">
                    <el-option label="超级管理员" :value="1"></el-option>
                    <el-option label="指定人员" :value="2"></el-option>
                    <el-option label="发起者本人" :value="6"></el-option>
                  </el-select>
                  <org-select type="user" v-model="subFlowForm.errorRuleUser" title="选择用户"
                    buttonType="button" v-if="subFlowForm.errorRule===2" />
                </div>
              </el-form-item>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="节点通知">
          <el-scrollbar class="config-scrollbar">
            <el-form :model="subFlowForm" label-position="top" class="pd-10-20">
              <el-alert title="该通知设置在【消息中心】-【消息发送配置】维护，选择默认则站内信提醒，选择关闭则不提醒。" type="warning"
                :closable="false" show-icon />
              <el-form-item class="mt-10">
                <div slot="label" class="form-item-label">子流程发起
                  <el-tooltip content="该子流程被发起的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="subFlowForm.launchMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptionsData" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div class="form-item-content" v-if="subFlowForm.launchMsgConfig.on===1">
                <el-form-item label=" 发送配置">
                  <msg-dialog :value="subFlowForm.launchMsgConfig.msgId"
                    :title="subFlowForm.launchMsgConfig.msgName"
                    @change="onMsgChange('subFlowForm','launchMsgConfig',arguments)" />
                </el-form-item>
                <el-form-item label="参数设置" style="margin-bottom: 0;"></el-form-item>
                <el-table :data="subFlowForm.launchMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option v-for="item in funcOptions" :key="item.__vModel__"
                          :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                          :value="item.__vModel__">
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- 发起人 -->
    <section class="approver-pane" v-if="value && isStartNode()">
      <el-tabs style="height:100%;">
        <el-tab-pane label="基础设置">
          <el-scrollbar class="config-scrollbar">
            <el-form label-position="top" :model="startForm" class="pd-10-20">
              <el-form-item>
                <div slot="label" class="form-item-label">{{flowType==1?"功能":"表单"}}设置</div>
                <div class="form-item-content">
                  <flow-form-dialog :value="startForm.formId" :title="startForm.formName"
                    :type="flowType" @change="onStartFormIdChange" :clearable="false"
                    :disabled="!!formInfo.onlineDev" :placeholder='"请选择"+(flowType==1?"功能":"表单")' />
                </div>
              </el-form-item>
              <el-form-item label="发起设置" v-if="flowType!=1">
                <div slot="label" class="form-item-label">发起设置
                  <el-tooltip content="谁可以发起 默认所有人,需要设置请选择" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <div class="form-item-content">
                  <org-select ref="start-department-org" type="department" v-model="initiateOrg"
                    title="添加部门" class="mb-5" />
                  <org-select ref="start-role-org" type="role" v-model="initiateRole" title="添加角色"
                    class="mb-5" />
                  <org-select ref="start-position-org" type="position" v-model="initiatePos"
                    title="添加岗位" class="mb-5" />
                  <org-select ref="start-group-org" type="group" v-model="initiateGroup"
                    title="添加分组" class="mb-5" />
                  <org-select ref="start-user-org" type="user" v-model="initiator" title="添加用户" />
                </div>
              </el-form-item>
              <el-form-item label="抄送设置">
                <div slot="label" class="form-item-label">抄送设置</div>
                <div class="form-item-content">
                  <org-select ref="start-copy-department-org" type="department"
                    v-model="startForm.circulateOrg" title="添加部门" class="mb-5" />
                  <org-select ref="start-copy-role-org" type="role"
                    v-model="startForm.circulateRole" title="添加角色" class="mb-5" />
                  <org-select ref="start-copy-position-org" v-model="startForm.circulatePosition"
                    title="添加岗位" type="position" class="mb-5" />
                  <org-select ref="start-copy-group-org" type="group"
                    v-model="startForm.circulateGroup" title="添加分组" class="mb-5" />
                  <org-select ref="start-copy-user-org" v-model="startForm.circulateUser"
                    title="添加用户" class="mb-5" />
                  <el-form-item>
                    <div slot="label">抄送人范围
                      <el-tooltip content="抄送人员增加人员选择范围附加条件" placement="top">
                        <a class="el-icon-warning-outline"></a>
                      </el-tooltip>
                    </div>
                    <el-select v-model="startForm.extraCopyRule">
                      <el-option v-for="(item,i) in extraRuleOptions" :key="i"
                        :label="item.value==1?'无抄送人范围':item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                  <el-checkbox v-model="startForm.isCustomCopy">允许自选抄送人</el-checkbox>
                </div>
              </el-form-item>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="高级设置">
          <el-scrollbar class="config-scrollbar">
            <el-form label-position="top" class="pd-10-20">
              <el-form-item label="操作设置">
                <div slot="label" class="form-item-label">操作设置</div>
                <div class="form-item-content">
                  <div class="per-cell">
                    <el-checkbox v-model="startForm.hasSubmitBtn" disabled>提交</el-checkbox>
                    <el-input v-model="startForm.submitBtnText" />
                  </div>
                  <div class="per-cell">
                    <el-checkbox v-model="startForm.hasSaveBtn" disabled>暂存</el-checkbox>
                    <el-input v-model="startForm.saveBtnText" />
                  </div>
                  <div class="per-cell">
                    <el-checkbox v-model="startForm.hasRevokeBtn">撤回</el-checkbox>
                    <el-input v-model="startForm.revokeBtnText" />
                  </div>
                  <div class="per-cell">
                    <el-checkbox v-model="startForm.hasPressBtn">催办</el-checkbox>
                    <el-input v-model="startForm.pressBtnText" />
                  </div>
                  <div class="per-cell">
                    <el-checkbox v-model="startForm.hasPrintBtn">打印</el-checkbox>
                    <el-input v-model="startForm.printBtnText" />
                  </div>
                  <div class="per-cell" v-if="startForm.hasPrintBtn">
                    <p style="width:112px"></p>
                    <JNPF-TreeSelect :options="printTplList" v-model="startForm.printId"
                      placeholder="请选择打印模板" lastLevel clearable multiple>
                      <div style="padding:10px 0;text-align:center" class="printWrap" slot="header">
                        <el-link type="primary" :underline="false" @click="openPrint">添加打印模板
                        </el-link>
                        <el-link type="info" style="position: absolute;right:8px;top: 18px;"
                          @click="refreshPrintOptions" :underline="false">
                          <i class="el-icon-refresh el-icon--right"></i></el-link>
                        <el-divider></el-divider>
                      </div>
                    </JNPF-TreeSelect>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="标题设置">
                <div slot="label" class="form-item-label">标题设置</div>
                <div class="form-item-content">
                  <el-radio-group v-model="startForm.titleType">
                    <el-radio :label="0">默认</el-radio>
                    <el-radio :label="1">自定义</el-radio>
                  </el-radio-group>
                  <template v-if="startForm.titleType==0">
                    <el-input class="mt-8" v-model="startForm.defaultContent" placeholder="请输入内容"
                      readOnly>
                    </el-input>
                  </template>
                  <template v-if="startForm.titleType==1">
                    <el-autocomplete class="mt-8" v-model="startForm.titleContent"
                      placeholder="请输入内容" style="width:100%" clearable
                      :fetch-suggestions="querySearch" @select="handleSelect">
                    </el-autocomplete>
                  </template>
                </div>
              </el-form-item>
              <el-form-item>
                <div slot="label" class="form-item-label">异常处理
                  <el-tooltip content="审批节点内设置的审批人员异常时遵循该规则" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <div class="form-item-content">
                  <el-select v-model="startForm.errorRule" @change="startForm.errorRuleUser=[]">
                    <el-option label="超级管理员" :value="1"></el-option>
                    <el-option label="指定人员" :value="2"></el-option>
                    <el-option label="上一节点审批人指定" :value="3"></el-option>
                    <el-option label="默认审批通过" :value="4"></el-option>
                    <el-option label="无法提交" :value="5"></el-option>
                  </el-select>
                  <org-select type="user" class="mt-10" v-model="startForm.errorRuleUser"
                    title="选择用户" buttonType="button" v-if="startForm.errorRule===2" />
                </div>
              </el-form-item>
            </el-form>
            <el-form class="pd-10-20" style="margin-top:-20px" label-width="90px"
              label-position="left">
              <el-form-item>
                <div slot="label" class="form-item-label">手写签名
                  <el-tooltip content="发起人在进行流程撤回操作时需手写签名" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-switch v-model="startForm.hasSign" />
              </el-form-item>
              <el-form-item>
                <div slot="label" class="form-item-label">意见填写
                  <el-tooltip content="发起人在进行流程撤回操作需填写意见" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-switch v-model="startForm.hasOpinion" />
              </el-form-item>
              <el-form-item>
                <div slot="label" class="form-item-label">审核汇总
                  <el-tooltip content="流程流转记录会按部门及岗位进行汇总展示" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-switch v-model="startForm.isSummary" />
              </el-form-item>
              <div v-if="startForm.isSummary" class="form-item-content form-item-content-first">
                <div class="form-sub-title">汇总设置</div>
                <el-select v-model="startForm.summaryType" placeholder="请选择">
                  <el-option label="汇总全部流转记录" :value="0"></el-option>
                  <el-option label="汇总通过及退回流转记录" :value="1"></el-option>
                </el-select>
              </div>
              <el-form-item label="流程评论">
                <div slot="label" class="form-item-label">流程评论
                  <el-tooltip content="流程内涉及的用户均可进行意见评论" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-switch v-model="startForm.isComment" />
              </el-form-item>
              <el-form-item label="批量审批">
                <div slot="label" class="form-item-label">批量审批
                  <el-tooltip content="流程待审批工单可进行批量操作" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-switch v-model="startForm.isBatchApproval" />
              </el-form-item>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="表单权限">
          <div class="form-auth-table">
            <el-table :data="getFormOperates()" class="JNPF-common-table" size="mini" height="100%">
              <el-table-column prop="name" label="表单字段" align="left"></el-table-column>
              <el-table-column prop="write" label="操作" align="center" width="250">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.read">查看</el-checkbox>
                  <el-checkbox v-model="scope.row.write">编辑</el-checkbox>
                  <el-checkbox v-model="scope.row.required" :disabled="scope.row.requiredDisabled">
                    必填</el-checkbox>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="流程事件">
          <el-scrollbar class="config-scrollbar">
            <el-form :model="startForm" class="pd-10-20" label-position="left">
              <el-alert title="开启后可配置触发事件同时进行参数赋值" type="warning" :closable="false" show-icon />
              <el-form-item label="发起事件" class="mt-10">
                <div slot="label" class="form-item-label">发起事件</div>
                <el-switch v-model="startForm.initFuncConfig.on" />
              </el-form-item>
              <div class="form-item-content form-item-content-first"
                v-if="startForm.initFuncConfig.on">
                <div class="form-sub-title">接口设置</div>
                <el-form-item label-width="0">
                  <interface-dialog :value="startForm.initFuncConfig.interfaceId"
                    :title="startForm.initFuncConfig.interfaceName"
                    @change="onFuncChange('startForm','initFuncConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.initFuncConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="参数名称" width="200">
                    <template slot-scope="scope">
                      <span class="required-sign">{{scope.row.required?'*':''}}</span>
                      {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable
                        filterable @change="onRelationFieldChange($event,scope.row)">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-if="scope.row.required">
                          <el-option v-for="item in funcRequiredOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-else>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item label="结束事件">
                <div slot="label" class="form-item-label">结束事件</div>
                <el-switch v-model="startForm.endFuncConfig.on" />
              </el-form-item>
              <div class="form-item-content form-item-content-first"
                v-if="startForm.endFuncConfig.on">
                <div class="form-sub-title">接口设置</div>
                <el-form-item label-width="0">
                  <interface-dialog :value="startForm.endFuncConfig.interfaceId"
                    :title="startForm.endFuncConfig.interfaceName"
                    @change="onFuncChange('startForm','endFuncConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.endFuncConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="参数名称" width="200">
                    <template slot-scope="scope">
                      <span class="required-sign">{{scope.row.required?'*':''}}</span>
                      {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable
                        filterable @change="onRelationFieldChange($event,scope.row)">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-if="scope.row.required">
                          <el-option v-for="item in funcRequiredOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-else>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item label="撤回事件">
                <div slot="label" class="form-item-label">撤回事件</div>
                <el-switch v-model="startForm.flowRecallFuncConfig.on" />
              </el-form-item>
              <div class="form-item-content form-item-content-first"
                v-if="startForm.flowRecallFuncConfig.on">
                <div class="form-sub-title">接口设置</div>
                <el-form-item label-width="0">
                  <interface-dialog :value="startForm.flowRecallFuncConfig.interfaceId"
                    :title="startForm.flowRecallFuncConfig.interfaceName"
                    @change="onFuncChange('startForm','flowRecallFuncConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.flowRecallFuncConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="参数名称" width="200">
                    <template slot-scope="scope">
                      <span class="required-sign">{{scope.row.required?'*':''}}</span>
                      {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable
                        filterable @change="onRelationFieldChange($event,scope.row)">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-if="scope.row.required">
                          <el-option v-for="item in funcRequiredOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-else>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="流程通知">
          <el-scrollbar class="config-scrollbar">
            <el-form :model="startForm" class="pd-10-20" label-position="top">
              <el-alert title="该通知设置在【消息中心】-【消息发送配置】维护，选择默认则站内信提醒，选择关闭则不提醒。" type="warning"
                :closable="false" show-icon />
              <el-form-item class="mt-10">
                <div slot="label" class="form-item-label">流程待办
                  <el-tooltip content="流程处于等待的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="startForm.waitMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptionsData" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="startForm.waitMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="startForm.waitMsgConfig.msgId"
                    :title="startForm.waitMsgConfig.msgName"
                    @change="onMsgChange('startForm','waitMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.waitMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">流程结束
                  <el-tooltip content="流程结束的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="startForm.endMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptionsData" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="startForm.endMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="startForm.endMsgConfig.msgId"
                    :title="startForm.endMsgConfig.msgName"
                    @change="onMsgChange('startForm','endMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.endMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">节点同意
                  <el-tooltip content="所有节点审核人同意的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="startForm.approveMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptionsData" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="startForm.approveMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="startForm.approveMsgConfig.msgId"
                    :title="startForm.approveMsgConfig.msgName"
                    @change="onMsgChange('startForm','approveMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.approveMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">节点退回
                  <el-tooltip content="所有节点审核人退回的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="startForm.rejectMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptionsData" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="startForm.rejectMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="startForm.rejectMsgConfig.msgId"
                    :title="startForm.rejectMsgConfig.msgName"
                    @change="onMsgChange('startForm','rejectMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.rejectMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">节点抄送
                  <el-tooltip content="所有节点抄送的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="startForm.copyMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptionsData" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="startForm.copyMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="startForm.copyMsgConfig.msgId"
                    :title="startForm.copyMsgConfig.msgName"
                    @change="onMsgChange('startForm','copyMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.copyMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">节点超时
                  <el-tooltip content="所有节点超时的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="startForm.overTimeMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptionsData" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="startForm.overTimeMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="startForm.overTimeMsgConfig.msgId"
                    :title="startForm.overTimeMsgConfig.msgName"
                    @change="onMsgChange('startForm','overTimeMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.overTimeMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option v-for="item in funcOptions" :key="item.__vModel__"
                          :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                          :value="item.__vModel__">
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">节点提醒
                  <el-tooltip content="所有节点提醒的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="startForm.noticeMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptionsData" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="startForm.noticeMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="startForm.noticeMsgConfig.msgId"
                    :title="startForm.noticeMsgConfig.msgName"
                    @change="onMsgChange('startForm','noticeMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="startForm.noticeMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option v-for="item in funcOptions" :key="item.__vModel__"
                          :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                          :value="item.__vModel__">
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="超时处理">
          <el-scrollbar class="config-scrollbar">
            <el-form :model="startForm" class="pd-10-20" label-position="top">
              <el-form-item label="限时设置">
                <div slot="label" class="form-item-label">限时设置</div>
                <el-select class="form-item-content" v-model="startForm.timeLimitConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div class="form-item-content" v-if="startForm.timeLimitConfig.on===1">
                <el-form-item label="节点限定时长起始值">
                  <el-select disabled v-model="startForm.timeLimitConfig.nodeLimit"
                    placeholder="请选择">
                    <el-option v-for="item in overTimeOptions" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="8">节点处理限定时长(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="startForm.timeLimitConfig.duringDeal" :min="1"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
              </div>
              <el-form-item class="mt-10">
                <div slot="label" class="form-item-label">超时设置
                  <el-tooltip content="超过设置的节点处理限定时间即为超时" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="startForm.overTimeConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div class="form-item-content" v-if="startForm.overTimeConfig.on===1">
                <el-row :gutter="20">
                  <el-col :span="8">第一次超时时间(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="startForm.overTimeConfig.firstOver" :min="0"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="mt-10">
                  <el-col :span="8">超时间隔(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="startForm.overTimeConfig.overTimeDuring" :min="0"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
                <el-row>超时事务</el-row>
                <el-row>
                  <el-checkbox v-model="startForm.overTimeConfig.overNotice">超时通知
                    <el-tooltip content="勾选后才能进行超时消息发送（站内信系统默认发送，第三方超时消息需在流程通知内配置）" placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                </el-row>
                <el-row>
                  <el-checkbox v-model="startForm.overTimeConfig.overAutoApprove">超时自动审批
                    <el-tooltip content="当前审批节点表单必填字段为空会使工单流转失败，下一审批节点设置候选人员、选择分支时当前审批节点规则失效"
                      placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="8">超时次数(次)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="startForm.overTimeConfig.overAutoApproveTime" :min="1"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
                <el-row>
                  <el-checkbox v-model="startForm.overTimeConfig.overEvent">超时事件
                    <el-tooltip content="请在流程事件内配置超时事件" placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="8">超时次数(次)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="startForm.overTimeConfig.overEventTime" :min="1"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
              </div>
              <el-form-item class="mt-10">
                <div slot="label" class="form-item-label">提醒设置
                  <el-tooltip content="还未到达设置的节点处理限定时间即为提醒" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="startForm.noticeConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in noticeOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div class="form-item-content" v-if="startForm.noticeConfig.on===1">
                <el-row :gutter="20">
                  <el-col :span="8">第一次提醒时间(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="startForm.noticeConfig.firstOver" :min="1" :step="1">
                    </el-input-number>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="mt-10">
                  <el-col :span="8">提醒间隔(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="startForm.noticeConfig.overTimeDuring" :min="0"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
                <el-row>提醒事务</el-row>
                <el-row>
                  <el-checkbox v-model="startForm.noticeConfig.overNotice">提醒通知
                    <el-tooltip content="勾选后才能进行提醒消息发送（站内信系统默认发送，第三方超时消息需在流程通知内配置）" placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                </el-row>
                <el-row>
                  <el-checkbox v-model="startForm.noticeConfig.overEvent">提醒事件
                    <el-tooltip content="请在流程事件内配置提醒事件" placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                  <el-row :gutter="20">
                    <el-col :span="8">提醒次数(次)</el-col>
                    <el-col :span="16">
                      <el-input-number v-model="startForm.noticeConfig.overEventTime" :min="1"
                        :step="1"></el-input-number>
                    </el-col>
                  </el-row>
                </el-row>
              </div>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </section>
    <!-- 审批人 -->
    <section class="approver-pane" v-if="value && isApproverNode()">
      <el-tabs v-model="activeName" style="height:100%;">
        <el-tab-pane label="基础设置" name="config">
          <el-scrollbar class="config-scrollbar">
            <el-form label-position="top" :model="approverForm" class="pd-10-20">
              <template v-if="flowType!==1">
                <el-form-item>
                  <div slot="label" class="form-item-label">表单配置
                    <el-tooltip content="审批节点不配置表单，默认引用发起节点表单" placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </div>
                  <div class="form-item-content">
                    <flow-form-dialog :value="approverForm.formId" :title="approverForm.formName"
                      :type="flowType" @change="onApproverFormIdChange" placeholder="请选择表单" />
                  </div>
                </el-form-item>
                <el-form-item>
                  <div slot="label" class="form-item-label">数据传递
                    <el-tooltip content="不设置传递规则时字段名称相同自动赋值；设置传递规则时相同名称字段会自动赋值字段后再按传递规则赋值"
                      placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </div>
                  <div class="form-item-content hand" @click="openApproverTransmitRuleBox">
                    <el-input class="hand" :value="approverForm.assignList.length?'已设置':''"
                      placeholder="请设置数据传递规则" suffix-icon="el-icon-arrow-down" readonly />
                  </div>
                </el-form-item>
              </template>
              <el-form-item label="审批设置">
                <div slot="label" class="form-item-label">审批设置</div>
                <div class="form-item-content">
                  <el-radio-group v-model="approverForm.assigneeType" @change="resetOrgColl">
                    <el-radio v-for="item in assigneeTypeOptions" :label="item.value"
                      :key="item.value" :disabled="item.disabled" class="radio-item">{{item.label}}
                    </el-radio>
                  </el-radio-group>
                  <div v-if="approverForm.assigneeType === 1" class="option-box-tip">
                    发起者主管将作为审批人处理审批单</div>
                  <div v-if="approverForm.assigneeType === 2" class="option-box-tip">
                    发起者的部门主管将作为审批人处理审批单</div>
                  <div v-if="approverForm.assigneeType === 3" class="option-box-tip">
                    发起者自己将作为审批人处理审批单</div>
                  <div v-if="approverForm.assigneeType === 4" class="option-box-tip">
                    选择流程表单字段的值作为审批人</div>
                  <div v-if="approverForm.assigneeType === 5" class="option-box-tip">
                    设置审批人为审批流程中某个环节的审批人</div>
                  <div v-if="approverForm.assigneeType === 6" class="option-box-tip">
                    指定审批人处理审批单</div>
                  <div v-if="approverForm.assigneeType === 7" class="option-box-tip">
                    默认所有人，需要设置请指定候选人范围处理审批单</div>
                  <div v-if="approverForm.assigneeType === 9" class="option-box-tip">
                    从目标服务中获取审批人</div>
                  <el-form-item label="发起者的" style="margin-bottom:0!important"
                    v-if="approverForm.assigneeType === 1">
                    <el-select v-model="approverForm.managerLevel">
                      <el-option v-for="item in 10" :key="item"
                        :label="item===1?'直属主管':'第'+item+'级主管'" :value="item">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="表单字段" style="margin-bottom:0"
                    v-if="approverForm.assigneeType === 4">
                    <div class="assignee-form">
                      <el-select v-model="approverForm.formFieldType" placeholder="请选择字段"
                        class="form-field-type">
                        <el-option :value="1" label="用户"></el-option>
                        <el-option :value="2" label="部门"></el-option>
                        <el-option :value="3" label="岗位"></el-option>
                        <el-option :value="4" label="角色"></el-option>
                        <el-option :value="5" label="分组"></el-option>
                      </el-select>
                      <el-select v-model="approverForm.formField" placeholder="请选择字段"
                        class="form-field">
                        <el-option v-for="item in usedFormItems" :key="item.__vModel__"
                          :label="item.__config__.label" :value="item.__vModel__">
                        </el-option>
                      </el-select>
                    </div>
                  </el-form-item>
                  <el-form-item label="审批节点" style="margin-bottom:0!important"
                    v-if="approverForm.assigneeType === 5">
                    <el-select v-model="approverForm.nodeId" placeholder="请选择节点">
                      <el-option v-for="item in nodeOptions" :key="item.nodeId"
                        :label="item.properties.title" :value="item.nodeId">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item style="margin-bottom:0!important"
                    v-if="approverForm.assigneeType === 9">
                    <div slot="label">请求路径
                      <el-tooltip placement="top"
                        content='请求自带参数：taskId、taskNodeId，返回结构：JSON对象{"handleId":"id1,id2"}'>
                        <a class="el-icon-warning-outline"></a>
                      </el-tooltip>
                    </div>
                    <el-input v-model="approverForm.getUserUrl" placeholder="请输入http或https接口地址">
                      <template slot="prepend">POST</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item style="margin-bottom:0!important"
                    v-if="approverForm.assigneeType === 6||approverForm.assigneeType === 7">
                    <org-select ref="approver-department-org" type="department" title="添加部门"
                      v-model="approverForm.approverOrg" class="mb-5" />
                    <org-select ref="approver-role-org" type="role" title="添加角色"
                      v-model="approverForm.approverRole" class="mb-5" />
                    <org-select ref="approver-position-org" v-model="approverForm.approverPos"
                      title="添加岗位" type="position" class="mb-5" />
                    <org-select ref="approver-group-org" type="group" title="添加分组"
                      v-model="approverForm.approverGroup" class="mb-5" />
                    <org-select ref="approver-user-org" title="添加用户"
                      v-model="approverForm.approvers" />
                  </el-form-item>
                  <el-form-item style="margin-bottom:0!important"
                    v-if="approverForm.assigneeType === 6">
                    <div slot="label">审批人范围
                      <el-tooltip content="指定成员增加人员选择范围附加条件" placement="top">
                        <a class="el-icon-warning-outline"></a>
                      </el-tooltip>
                    </div>
                    <el-select v-model="approverForm.extraRule">
                      <el-option v-for="(item,i) in extraRuleOptions" :key="i" :label="item.label"
                        :value="item.value" />
                    </el-select>
                  </el-form-item>
                </div>
              </el-form-item>
              <el-form-item label="审批方式">
                <div slot="label" class="form-item-label">审批方式</div>
                <div class="form-item-content">
                  <el-radio v-model="approverForm.counterSign" :label="0">
                    或签（一名审批人同意或退回即可）</el-radio>
                  <el-radio v-model="approverForm.counterSign" :label="1">
                    会签（无序会签，当审批达到会签比例时，则该审批通过）</el-radio>
                  <el-radio v-model="approverForm.counterSign" :label="2">
                    依次审批（按顺序依次审批）</el-radio>
                </div>
              </el-form-item>
              <el-form-item label="会签比例" v-if="approverForm.counterSign==1">
                <div slot="label" class="form-item-label">会签比例
                  <el-tooltip content="会签通过比例" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="approverForm.countersignRatio">
                  <el-option v-for="item in 10" :key="item*10" :label="item*10+'%'"
                    :value="item*10">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="退回设置">
                <div slot="label" class="form-item-label">退回设置
                  <el-tooltip content="纯表单流程设置退回到发起节点无效" placement="top">
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </div>
                <el-radio-group v-model="approverForm.rejectType" class="form-item-content"
                  @input="radioInput">
                  <el-radio :label="1">重新审批
                    <el-tooltip content="若流程为A->B->C,C退回至A，则C->A->B->C" placement="top">
                      <i class="el-icon-warning-outline"></i>
                    </el-tooltip>
                  </el-radio>
                  <el-radio :label="2">从当前节点审批
                    <el-tooltip content="若流程为A->B->C,C退回至A，则C->A->C" placement="top">
                      <i class="el-icon-warning-outline"></i>
                    </el-tooltip>
                  </el-radio>
                  <el-radio :label="3">自定义审批
                    <el-tooltip content="由用户选择重新审批或从当前节点审批" placement="top">
                      <i class="el-icon-warning-outline"></i>
                    </el-tooltip>
                  </el-radio>
                </el-radio-group>
                <el-select class="form-item-content" v-model="approverForm.rejectStep"
                  placeholder="请选择">
                  <el-option v-for="item in rejectStepOptions" :key="item.nodeId"
                    :label="item.properties.title" :value="item.nodeId">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="进度设置">
                <div slot="label" class="form-item-label">进度设置</div>
                <el-select class="form-item-content" v-model="approverForm.progress"
                  placeholder="请选择">
                  <el-option v-for="item in progressOptions" :key="item" :label="item+'%'"
                    :value="item">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="抄送设置">
                <div slot="label" class="form-item-label">抄送设置</div>
                <div class="form-item-content">
                  <org-select ref="approver-copy-department-org" type="department"
                    v-model="approverForm.circulateOrg" title="添加部门" class="mb-5" />
                  <org-select ref="approver-copy-role-org" type="role"
                    v-model="approverForm.circulateRole" title="添加角色" class="mb-5" />
                  <org-select ref="approver-copy-position-org"
                    v-model="approverForm.circulatePosition" title="添加岗位" type="position"
                    class="mb-5" />
                  <org-select ref="approver-copy-group-org" type="group"
                    v-model="approverForm.circulateGroup" title="添加分组" class="mb-5" />
                  <org-select ref="approver-copy-user-org" v-model="approverForm.circulateUser"
                    title="添加用户" class="mb-5" />
                  <el-form-item>
                    <div slot="label">抄送人范围
                      <el-tooltip content="抄送人员增加人员选择范围附加条件" placement="top">
                        <a class="el-icon-warning-outline"></a>
                      </el-tooltip>
                    </div>
                    <el-select v-model="approverForm.extraCopyRule">
                      <el-option v-for="(item,i) in extraRuleOptions" :key="i"
                        :label="item.value==1?'无抄送人范围':item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                  <el-checkbox v-model="approverForm.isCustomCopy">允许自选抄送人</el-checkbox>
                  <div>
                    <el-checkbox v-model="approverForm.isInitiatorCopy">抄送给流程发起人</el-checkbox>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="高级设置" name="senior">
          <el-scrollbar class="config-scrollbar">
            <el-form label-position="top" class="pd-10-20">
              <el-form-item label="操作设置">
                <div slot="label" class="form-item-label">操作设置</div>
                <div class="per-cell">
                  <el-checkbox v-model="approverForm.hasSaveBtn">暂存</el-checkbox>
                  <el-input v-model="approverForm.saveBtnText" />
                </div>
                <div class="per-cell">
                  <el-checkbox v-model="approverForm.hasAuditBtn">同意</el-checkbox>
                  <el-input v-model="approverForm.auditBtnText" />
                </div>
                <div class="per-cell">
                  <el-checkbox v-model="approverForm.hasRejectBtn">退回</el-checkbox>
                  <el-input v-model="approverForm.rejectBtnText" />
                </div>
                <div class="per-cell">
                  <el-checkbox v-model="approverForm.hasRevokeBtn">撤回</el-checkbox>
                  <el-input v-model="approverForm.revokeBtnText" />
                </div>
                <div class="per-cell">
                  <el-checkbox v-model="approverForm.hasTransferBtn">转审</el-checkbox>
                  <el-input v-model="approverForm.transferBtnText" />
                </div>
                <div class="per-cell">
                  <el-checkbox v-model="approverForm.hasPrintBtn">打印</el-checkbox>
                  <el-input v-model="approverForm.printBtnText" />
                </div>
                <div class="per-cell" v-if="approverForm.hasPrintBtn">
                  <p style="width:112px"></p>
                  <JNPF-TreeSelect :options="printTplList" v-model="approverForm.printId"
                    placeholder="请选择打印模板" lastLevel clearable multiple>
                    <div class="printWrap" slot="header">
                      <el-link type="primary" :underline="false" @click="openPrint">添加打印模板
                      </el-link>
                      <el-link type="info" style="position: absolute;right:8px;top: 18px;"
                        @click="refreshPrintOptions" :underline="false">
                        <i class="el-icon-refresh el-icon--right"></i></el-link>
                      <el-divider></el-divider>
                    </div>
                  </JNPF-TreeSelect>
                </div>
                <div class="per-cell">
                  <div slot="label" class="has-free-approver ">
                    <el-checkbox v-model="approverForm.hasFreeApproverBtn">加签<el-tooltip
                        content="允许在审批单中增加临时审批人" placement="top">
                        <a class="el-icon-warning-outline form-item-approver"></a>
                      </el-tooltip>
                    </el-checkbox>
                  </div>
                  <el-input v-model="approverForm.hasFreeApproverBtnText" />
                </div>
              </el-form-item>
            </el-form>
            <el-form class="pd-10-20" style="margin-top:-20px" label-width="90px"
              label-position="left">
              <el-form-item label="自动同意">
                <div slot="label" class="form-item-label">自动同意
                  <el-tooltip content="当前审批节点表单必填字段为空工单流转时不做校验，下一审批节点设置候选人员、选择分支、异常节点时当前审批节点规则失效"
                    placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-switch v-model="approverForm.hasAgreeRule" />
              </el-form-item>
              <div class="form-item-content form-item-content-first"
                v-show="approverForm.hasAgreeRule">
                <div class="form-sub-title">同意规则配置</div>
                <el-row>
                  <el-select v-model="approverForm.agreeRules" multiple>
                    <el-option label="审批人为发起人" :value="2"></el-option>
                    <el-option label="审批人与上一审批节点处理人相同" :value="3"></el-option>
                    <el-option label="审批人审批过" :value="4"></el-option>
                  </el-select>
                </el-row>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">手写签名
                  <el-tooltip content="审批人在进行审批操作时需手写签名" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-switch v-model="approverForm.hasSign" />
              </el-form-item>
              <el-form-item>
                <div slot="label" class="form-item-label">意见填写
                  <el-tooltip content="审批人在进行审批操作需填写意见" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-switch v-model="approverForm.hasOpinion" />
              </el-form-item>
              <el-form-item label="说明">
                <div slot="label" class="form-item-label">说明</div>
                <el-input v-model="approverForm.description" type="textarea" :rows="3">
                </el-input>
              </el-form-item>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="表单权限" name="formAuth">
          <div class="form-auth-table">
            <el-table :data="getFormOperates()" class="JNPF-common-table" size="mini" height="100%">
              <el-table-column prop="name" label="表单字段" align="left"></el-table-column>
              <el-table-column prop="write" label="操作" align="center" width="250">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.read">查看</el-checkbox>
                  <el-checkbox v-model="scope.row.write">编辑</el-checkbox>
                  <el-checkbox v-model="scope.row.required" :disabled="scope.row.requiredDisabled">
                    必填</el-checkbox>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="节点事件">
          <el-scrollbar class="config-scrollbar">
            <el-form :model="approverForm" class="pd-10-20" label-position="left">
              <el-alert title="开启后可配置触发事件同时进行参数赋值" type="warning" :closable="false" show-icon />
              <el-form-item label="同意事件" class="mt-10">
                <div slot="label" class="form-item-label">同意事件</div>
                <el-switch v-model="approverForm.approveFuncConfig.on" />
              </el-form-item>
              <div class="form-item-content form-item-content-first"
                v-if="approverForm.approveFuncConfig.on">
                <div class="form-sub-title">接口设置</div>
                <el-form-item label-width="0">
                  <interface-dialog :value="approverForm.approveFuncConfig.interfaceId"
                    :title="approverForm.approveFuncConfig.interfaceName"
                    @change="onFuncChange('approverForm','approveFuncConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.approveFuncConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="参数名称" width="200">
                    <template slot-scope="scope">
                      <span class="required-sign">{{scope.row.required?'*':''}}</span>
                      {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable
                        filterable @change="onRelationFieldChange($event,scope.row)">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-if="scope.row.required">
                          <el-option v-for="item in funcRequiredOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-else>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item label="退回事件">
                <div slot="label" class="form-item-label">退回事件</div>
                <el-switch v-model="approverForm.rejectFuncConfig.on" />
              </el-form-item>
              <div class="form-item-content form-item-content-first"
                v-if="approverForm.rejectFuncConfig.on">
                <div class="form-sub-title">接口设置</div>
                <el-form-item label-width="0">
                  <interface-dialog :value="approverForm.rejectFuncConfig.interfaceId"
                    :title="approverForm.rejectFuncConfig.interfaceName"
                    @change="onFuncChange('approverForm','rejectFuncConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.rejectFuncConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="参数名称" width="200">
                    <template slot-scope="scope">
                      <span class="required-sign">{{scope.row.required?'*':''}}</span>
                      {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable
                        filterable @change="onRelationFieldChange($event,scope.row)">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-if="scope.row.required">
                          <el-option v-for="item in funcRequiredOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-else>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item label="撤回事件">
                <div slot="label" class="form-item-label">撤回事件</div>
                <el-switch v-model="approverForm.recallFuncConfig.on" />
              </el-form-item>
              <div class="form-item-content form-item-content-first"
                v-if="approverForm.recallFuncConfig.on">
                <div class="form-sub-title">接口设置</div>
                <el-form-item label-width="0">
                  <interface-dialog :value="approverForm.recallFuncConfig.interfaceId"
                    :title="approverForm.recallFuncConfig.interfaceName"
                    @change="onFuncChange('approverForm','recallFuncConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.recallFuncConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="参数名称" width="200">
                    <template slot-scope="scope">
                      <span class="required-sign">{{scope.row.required?'*':''}}</span>
                      {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable
                        filterable @change="onRelationFieldChange($event,scope.row)">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-if="scope.row.required">
                          <el-option v-for="item in funcRequiredOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-else>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item label="超时事件" class="mt-10">
                <div slot="label" class="form-item-label">超时事件</div>
                <el-switch v-model="approverForm.overTimeFuncConfig.on" />
              </el-form-item>
              <div class="form-item-content form-item-content-first"
                v-if="approverForm.overTimeFuncConfig.on">
                <div class="form-sub-title">接口设置</div>
                <el-form-item label-width="0">
                  <interface-dialog :value="approverForm.overTimeFuncConfig.interfaceId"
                    :title="approverForm.overTimeFuncConfig.interfaceName"
                    @change="onFuncChange('approverForm','overTimeFuncConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.overTimeFuncConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="参数名称" width="200">
                    <template slot-scope="scope">
                      <span class="required-sign">{{scope.row.required?'*':''}}</span>
                      {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable
                        filterable @change="onRelationFieldChange($event,scope.row)">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-if="scope.row.required">
                          <el-option v-for="item in funcRequiredOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-else>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item label="提醒事件" class="mt-10">
                <div slot="label" class="form-item-label">提醒事件</div>
                <el-switch v-model="approverForm.noticeFuncConfig.on" />
              </el-form-item>
              <div class="form-item-content form-item-content-first"
                v-if="approverForm.noticeFuncConfig.on">
                <div class="form-sub-title">接口设置</div>
                <el-form-item label-width="0">
                  <interface-dialog :value="approverForm.noticeFuncConfig.interfaceId"
                    :title="approverForm.noticeFuncConfig.interfaceName"
                    @change="onFuncChange('approverForm','noticeFuncConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.noticeFuncConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="参数名称" width="200">
                    <template slot-scope="scope">
                      <span class="required-sign">{{scope.row.required?'*':''}}</span>
                      {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable
                        filterable @change="onRelationFieldChange($event,scope.row)">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-if="scope.row.required">
                          <el-option v-for="item in funcRequiredOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group v-else>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="节点通知">
          <el-scrollbar class="config-scrollbar">
            <el-form :model="approverForm" class="pd-10-20" label-position="top">
              <el-alert title="该通知设置在【消息中心】-【消息发送配置】维护，选择默认则站内信提醒，选择关闭则不提醒。" type="warning"
                :closable="false" show-icon />
              <el-form-item class="mt-10">
                <div slot="label" class="form-item-label">节点同意
                  <el-tooltip content="当前节点审核人同意的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="approverForm.approveMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in nodeNoticeOptionsData" :key="item.value"
                    :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="approverForm.approveMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="approverForm.approveMsgConfig.msgId"
                    :title="approverForm.approveMsgConfig.msgName"
                    @change="onMsgChange('approverForm','approveMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.approveMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">节点退回
                  <el-tooltip content="当前节点审核人退回的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="approverForm.rejectMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in nodeNoticeOptionsData" :key="item.value"
                    :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="approverForm.rejectMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="approverForm.rejectMsgConfig.msgId"
                    :title="approverForm.rejectMsgConfig.msgName"
                    @change="onMsgChange('approverForm','rejectMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.rejectMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">节点抄送
                  <el-tooltip content="当前节点抄送的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="approverForm.copyMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in nodeNoticeOptionsData" :key="item.value"
                    :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="approverForm.copyMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="approverForm.copyMsgConfig.msgId"
                    :title="approverForm.copyMsgConfig.msgName"
                    @change="onMsgChange('approverForm','copyMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.copyMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option-group>
                          <el-option v-for="item in systemFieldOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                        <el-option-group>
                          <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                            :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                            :value="item.__vModel__" />
                        </el-option-group>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">节点超时
                  <el-tooltip content="当前节点超时的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="approverForm.overTimeMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in nodeNoticeOptionsData" :key="item.value"
                    :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="approverForm.overTimeMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="approverForm.overTimeMsgConfig.msgId"
                    :title="approverForm.overTimeMsgConfig.msgName"
                    @change="onMsgChange('approverForm','overTimeMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.overTimeMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option v-for="item in funcOptions" :key="item.__vModel__"
                          :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                          :value="item.__vModel__">
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form-item>
                <div slot="label" class="form-item-label">节点提醒
                  <el-tooltip content="当前节点提醒的时候" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="approverForm.noticeMsgConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in nodeNoticeOptionsData" :key="item.value"
                    :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <div style="margin-bottom: 18px;" class="form-item-content"
                v-if="approverForm.noticeMsgConfig.on===1">
                <el-form-item label="发送配置">
                  <msg-dialog :value="approverForm.noticeMsgConfig.msgId"
                    :title="approverForm.noticeMsgConfig.msgName"
                    @change="onMsgChange('approverForm','noticeMsgConfig',arguments)" />
                </el-form-item>
                <div class="form-sub-title">参数设置</div>
                <el-table :data="approverForm.noticeMsgConfig.templateJson">
                  <el-table-column type="index" width="50" label="序号" align="center" />
                  <el-table-column prop="field" label="模板名称" width="150">
                    <template slot-scope="scope">
                      <el-link @click='goDetail(scope.row.templateId)'>{{scope.row.msgTemplateName}}
                      </el-link>
                    </template>
                  </el-table-column>
                  <el-table-column prop="field" label="参数名称" width="150">
                    <template slot-scope="scope">
                      <div class="parameter-box" v-for="(item,index) in scope.row.paramJson"
                        :key="index">
                        {{item.field}}({{item.fieldName}})
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="表单字段">
                    <template slot-scope="scope">
                      <el-select class="variable-box" v-model="it.relationField"
                        placeholder="请选择表单字段" clearable filterable
                        @change="onRelationFieldChange($event,it)"
                        v-for="(it,index) in scope.row.paramJson" :key="index">
                        <el-option v-for="item in funcOptions" :key="item.__vModel__"
                          :label="item.__config__.label?item.__vModel__+'('+item.__config__.label+')':item.__vModel__"
                          :value="item.__vModel__">
                        </el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="超时处理">
          <el-scrollbar class="config-scrollbar">
            <el-form :model="approverForm" class="pd-10-20" label-position="top">
              <el-form-item label="限时设置">
                <div slot="label" class="form-item-label">限时设置</div>
                <el-select class="form-item-content" v-model="approverForm.timeLimitConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in nodeNoticeOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div class="form-item-content" v-if="approverForm.timeLimitConfig.on===1">
                <el-form-item label="节点限定时长起始值">
                  <el-select v-model="approverForm.timeLimitConfig.nodeLimit" placeholder="请选择">
                    <el-option v-for="item in overTimeOptions" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="表单字段" v-if="approverForm.timeLimitConfig.nodeLimit===2">
                  <el-select v-model="approverForm.timeLimitConfig.formField" placeholder="请选择字段">
                    <el-option v-for="item in usedFormItems" :key="item.__vModel__"
                      :label="item.__config__.label" :value="item.__vModel__">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="8">节点处理限定时长(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="approverForm.timeLimitConfig.duringDeal" :min="1"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
              </div>
              <el-form-item class="mt-10">
                <div slot="label" class="form-item-label">超时设置
                  <el-tooltip content="超过设置的节点处理限定时间即为超时" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="approverForm.overTimeConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in nodeNoticeOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div class="form-item-content" v-if="approverForm.overTimeConfig.on===1">
                <el-row :gutter="20">
                  <el-col :span="8">第一次超时时间(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="approverForm.overTimeConfig.firstOver" :min="0"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="mt-10">
                  <el-col :span="8">超时间隔(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="approverForm.overTimeConfig.overTimeDuring" :min="0"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
                <el-row>超时事务</el-row>
                <el-row>
                  <el-checkbox v-model="approverForm.overTimeConfig.overNotice">超时通知
                    <el-tooltip content="勾选后才能进行超时消息发送（站内信系统默认发送，第三方超时消息需在节点通知内配置）" placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                </el-row>
                <el-row>
                  <el-checkbox v-model="approverForm.overTimeConfig.overAutoApprove">超时自动审批
                    <el-tooltip content="当前审批节点表单必填字段为空工单流转时不做校验，下一审批节点设置候选人员、选择分支、异常节点时当前审批节点规则失效"
                      placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="8">超时次数(次)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="approverForm.overTimeConfig.overAutoApproveTime"
                      :min="1" :step="1"></el-input-number>
                  </el-col>
                </el-row>
                <el-row>
                  <el-checkbox v-model="approverForm.overTimeConfig.overEvent">超时事件
                    <el-tooltip content="请在节点事件内配置超时事件" placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="8">超时次数(次)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="approverForm.overTimeConfig.overEventTime" :min="1"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
              </div>
              <el-form-item class="mt-10">
                <div slot="label" class="form-item-label">提醒设置
                  <el-tooltip content="还未到达设置的节点处理限定时间即为提醒" placement="top">
                    <a class="el-icon-warning-outline"></a>
                  </el-tooltip>
                </div>
                <el-select class="form-item-content" v-model="approverForm.noticeConfig.on"
                  placeholder="请选择">
                  <el-option v-for="item in nodeNoticeOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
              <div class="form-item-content" v-if="approverForm.noticeConfig.on===1">
                <el-row :gutter="20">
                  <el-col :span="8">第一次提醒时间(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="approverForm.noticeConfig.firstOver" :min="1"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="mt-10">
                  <el-col :span="8">提醒间隔(时)</el-col>
                  <el-col :span="16">
                    <el-input-number v-model="approverForm.noticeConfig.overTimeDuring" :min="0"
                      :step="1"></el-input-number>
                  </el-col>
                </el-row>
                <el-row>提醒事务</el-row>
                <el-row>
                  <el-checkbox v-model="approverForm.noticeConfig.overNotice">提醒通知
                    <el-tooltip content="勾选后才能进行提醒消息发送（站内信系统默认发送，第三方超时消息需在节点通知内配置）" placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                </el-row>
                <el-row>
                  <el-checkbox v-model="approverForm.noticeConfig.overEvent">提醒事件
                    <el-tooltip content="请在节点事件内配置提醒事件" placement="top">
                      <a class="el-icon-warning-outline"></a>
                    </el-tooltip>
                  </el-checkbox>
                  <el-row :gutter="20">
                    <el-col :span="8">提醒次数(次)</el-col>
                    <el-col :span="16">
                      <el-input-number v-model="approverForm.noticeConfig.overEventTime" :min="1"
                        :step="1"></el-input-number>
                    </el-col>
                  </el-row>
                </el-row>
              </div>
            </el-form>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </section>
    <div class="actions">
      <el-button size="small" @click="cancel">取消</el-button>
      <el-button size="small" type="primary" @click="confirm">确定</el-button>
    </div>
    <el-dialog title="数据传递" :close-on-click-modal="false" :visible.sync="ruleVisible"
      class="JNPF-dialog JNPF-dialog_center rule-dialog" lock-scroll append-to-body width='700px'>
      <el-tabs class="JNPF-el_tabs node-tabs">
        <el-tab-pane :label="item.title" v-for="(item,i) in assignList" :key="i">
          <div class="option-box-tip">当父流程流转到子流程时，将对应的上一节点表单字段赋值给子流程发起节点</div>
          <el-row :gutter="10" v-for="(child,cIndex) in item.ruleList" :key="cIndex" class="mb-10">
            <el-col :span="2" class="rule-cell">父流程</el-col>
            <el-col :span="7" class="rule-cell">
              <el-select v-model="child.parentField" placeholder="请选择字段" filterable clearable>
                <el-option v-for="field in item.formFieldList" :key="field.__vModel__"
                  :label="field.__config__.label" :value="field.__vModel__" />
              </el-select>
            </el-col>
            <el-col :span="4" class="rule-cell mid">赋值给</el-col>
            <el-col :span="2" class="rule-cell">子流程</el-col>
            <el-col :span="7" class="rule-cell">
              <el-select v-model="child.childField" placeholder="请选择字段" filterable clearable>
                <el-option v-for="field in childFieldOptions" :key="field.__vModel__"
                  :label="field.__config__.label" :value="field.__vModel__" />
              </el-select>
            </el-col>
            <el-col :span="2" class="rule-cell">
              <el-button type="danger" icon="el-icon-close" @click="delTransmitRule(i,cIndex)">
              </el-button>
            </el-col>
          </el-row>
          <div class="table-actions" @click="addTransmitRule(i)">
            <el-button type="text" icon="el-icon-plus">新增规则</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ruleVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="数据传递" :close-on-click-modal="false"
      :visible.sync="approverTransmitRuleVisible" class="JNPF-dialog JNPF-dialog_center rule-dialog"
      lock-scroll append-to-body width='700px'>
      <el-tabs class="JNPF-el_tabs node-tabs">
        <el-tab-pane :label="item.title" v-for="(item,i) in assignList" :key="i">
          <div class="option-box-tip">当节点流转到本节点时，将对应的上一节点的字段赋值给本节点</div>
          <el-row :gutter="10" v-for="(child,cIndex) in item.ruleList" :key="cIndex" class="mb-10">
            <el-col :span="2" class="rule-cell">上节点</el-col>
            <el-col :span="7" class="rule-cell">
              <el-select v-model="child.parentField" placeholder="请选择字段" filterable clearable>
                <el-option v-for="field in item.formFieldList" :key="field.__vModel__"
                  :label="field.__config__.label" :value="field.__vModel__" />
              </el-select>
            </el-col>
            <el-col :span="4" class="rule-cell mid">赋值给</el-col>
            <el-col :span="2" class="rule-cell">本节点</el-col>
            <el-col :span="7" class="rule-cell">
              <el-select v-model="child.childField" placeholder="请选择字段" filterable clearable>
                <el-option v-for="item in formFieldsOptions" :key="item.__vModel__"
                  :label="item.__config__.label" :value="item.__vModel__" />
              </el-select>
            </el-col>
            <el-col :span="2" class="rule-cell">
              <el-button type="danger" icon="el-icon-close" @click="delTransmitRule(i,cIndex)">
              </el-button>
            </el-col>
          </el-row>
          <div class="table-actions" @click="addTransmitRule(i)">
            <el-button type="text" icon="el-icon-plus">新增规则</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button @click="approverTransmitRuleVisible = false">取消</el-button>
        <el-button type="primary" @click="saveApproverTransmitRule">确定</el-button>
      </span>
    </el-dialog>
    <FormulaDialog :visible.sync="formulaVisible" :value="activeItem.field"
      @updateFormula="updateFormula" :formFieldsOptions="formFieldsOptions" />
    <Detail v-if="viewVisible" ref="View" @close="viewVisible = false" />
  </el-drawer>
</template>
<script>
import { getPrintDevSelector } from '@/api/system/printDev'
import { getFlowFormInfo } from '@/api/workFlow/FlowEngine'
import { getFormInfo } from '@/api/workFlow/FormDesign'
import { NodeUtils } from "../FlowCard/util"
import nodeConfig from "../FlowCard/config"
import OrgSelect from '../OrgSelect'
import MsgDialog from './msgDialog'
import InterfaceDialog from './InterfaceDialog'
import FormulaDialog from './formulaDialog'
import FlowDialog from './FlowDialog'
import Detail from './TemplateDetail'
import FlowFormDialog from "./FlowFormDialog"
const requiredDisabled = (jnpfKey) => {
  return ['billRule', 'createUser', 'createTime', 'modifyTime', 'modifyUser', 'currPosition', 'currOrganize', 'table'].includes(jnpfKey)
}
const getDataType = (data) => {
  if (!data.__config__ || !data.__config__.jnpfKey) return ''
  const jnpfKey = data.__config__.jnpfKey
  if (['numInput', 'date', 'rate', 'slider'].includes(jnpfKey)) {
    return 'number'
  } else if (['checkbox', 'uploadFz', 'uploadImg', 'cascader', 'comSelect', 'address'].includes(jnpfKey)) {
    return 'array'
  } else if (['select', 'depSelect', 'posSelect', 'userSelect', 'treeSelect', 'roleSelect', 'groupSelect'].includes(jnpfKey)) {
    if (data.multiple) return 'array'
  }
  return ''
}
const defaultSubFlowForm = {
  errorRule: 1, // 异常处理规则
  errorRuleUser: [], // 指定人员处理异常
  formFieldType: 1,// 表单字段审核方式的类型(1-用户 2-部门)
  initiateType: 6,
  managerLevel: 1,
  departmentLevel: 1,
  formField: '',
  nodeId: '',
  getUserUrl: '',
  initiator: [],
  initiatePos: [],
  initiateRole: [],
  initiateOrg: [],
  initiateGroup: [],
  flowId: '',
  flowName: '',
  assignList: [],
  prevNodeList: [],
  launchMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  isAsync: false
}
const defaultApproverForm = {
  extraRule: 1, // 审批人范围,默认无审批人范围
  extraCopyRule: 1, // 抄送审批人范围,默认无审批人范围
  hasAgreeRule: false, // 自动同意规则,默认不启用
  agreeRules: [], // 自动同意规则数组
  formFieldType: 1,// 表单字段审核方式的类型(1-用户 2-部门)
  approvers: [], // 审批人集合
  approverPos: [], // 审批岗位集合
  approverRole: [], // 审批角色集合
  approverOrg: [], // 审批部门集合
  approverGroup: [], // 审批分组集合
  assigneeType: 6, // 指定审批人
  userType: 'role', //role,position,user
  formOperates: [], // 表单权限集合
  circulateRole: [],   // 抄送角色集合
  circulatePosition: [],   // 抄送岗位集合
  circulateUser: [],  // 抄送人集合
  isCustomCopy: false,
  isInitiatorCopy: false,
  progress: '50',  // 进度
  rejectType: 1, //退回
  rejectStep: '0',  // 退回步骤
  description: '',  // 节点描述
  managerLevel: 1,
  departmentLevel: 1,
  countersignRatio: 100,
  formField: '',
  nodeId: '',
  getUserUrl: '',
  counterSign: 0,
  noApproverHandler: true,
  hasFreeApproverBtn: false,
  hasFreeApproverBtnText: '加 签',
  hasSaveBtn: false,
  saveBtnText: '暂 存',
  hasAuditBtn: true,
  auditBtnText: '通 过',
  hasRejectBtn: true,
  rejectBtnText: '退 回',
  hasRevokeBtn: true,
  revokeBtnText: '撤 回',
  hasTransferBtn: true,
  transferBtnText: '转 审',
  hasPrintBtn: false,
  printBtnText: '打 印',
  printId: '', // 打印模板
  hasSign: false,
  hasOpinion: true,
  formId: "",
  formName: "",
  formFieldList: [],
  prevNodeList: [],
  assignList: [],
  timeLimitConfig: {
    on: 2,  // 开启
    nodeLimit: 0, // 节点限定时长起始值类型
    duringDeal: 24, // 节点处理限定时长(时)
    formField: '',  // 请选择字段
  },
  overTimeConfig: {
    on: 2, // 开启
    firstOver: 0, // 第一次超时时间(时)
    overTimeDuring: 2, // 超时间隔(时)
    overNotice: false, // 超时事务-超时通知
    overAutoApprove: false, // 超时事务-超时自动审批
    overAutoApproveTime: 5, // 自动审批超时次数(次)
    overEvent: false, // 超时事件
    overEventTime: 5, // 超时事件超时次数(次)
  },
  noticeConfig: {
    on: 2, // 开启
    firstOver: 1, // 第一次提醒时间(时)
    overTimeDuring: 2, // 提醒间隔(时)
    overNotice: false, // 提醒事务-提醒通知
    overEvent: false, // 提醒事件
    overEventTime: 5, // 提醒次数(次)
  },
  // 节点事件
  overTimeFuncConfig: {
    on: false,     // 开启
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [] // 模块json
  },
  noticeFuncConfig: {
    on: false,     // 开启
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [] // 模块json
  },
  overTimeMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  noticeMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  approveMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  rejectMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  copyMsgConfig: {
    on: 2,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  approveFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: []
  },
  rejectFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: []
  },
  recallFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: []
  },
}
const defaultStep = [{
  nodeId: '0',
  properties: { title: '流程发起' }

}, {
  nodeId: '1',
  properties: { title: '上级审批节点' }
}]
const typeOptions = [
  {
    label: '指定成员',
    value: 6
  },
  {
    label: '发起者本人',
    value: 3
  },
  {
    label: '发起者主管',
    value: 1
  },
  {
    label: '部门主管',
    value: 2
  },
  {
    label: '表单变量',
    value: 4
  },
  {
    label: '流程环节',
    value: 5
  },
  {
    label: '接口服务',
    value: 9
  },
  {
    label: '候选人员',
    value: 7
  }]
const noticeOptions = [{
  value: 1,
  label: '自定义'
}, {
  value: 0,
  label: '关闭'
}]
const overTimeOptions = [{
  value: 0,
  label: '接收时间'
}, {
  value: 1,
  label: '发起时间'
}, {
  value: 2,
  label: '表单变量'
},]
const extraRuleOptions = [
  {
    value: 1,
    label: '无审批人范围'
  },
  {
    value: 6,
    label: '同一公司'
  },
  {
    value: 2,
    label: '同一部门'
  },
  {
    value: 3,
    label: '同一岗位'
  },
  {
    value: 4,
    label: '发起人上级'
  },
  {
    value: 5,
    label: '发起人下属'
  }
]
const nodeNoticeOptions = [
  {
    value: 2,
    label: '同步发起配置'
  },
  ...noticeOptions
]
const noticeOptionsData = [
  {
    value: 3,
    label: '默认'
  },
  ...noticeOptions
]
const nodeNoticeOptionsData = [
  {
    value: 2,
    label: '同步发起配置'
  },
  ...noticeOptionsData
]
const systemFieldOptions = [{
  __config__: {
    label: '流程ID',
    required: true
  },
  __vModel__: '@flowId',
},
{
  __config__: {
    label: '任务ID',
    required: true
  },
  __vModel__: '@taskId',
},
{
  __config__: {
    label: '节点ID',
    required: true
  },
  __vModel__: '@taskNodeId',
},
{
  __config__: {
    label: '流程名称',
    required: true
  },
  __vModel__: '@flowFullName',
},
{
  __config__: {
    label: '任务标题',
    required: true
  },
  __vModel__: '@taskFullName',
},
{
  __config__: {
    label: '发起用户ID',
    required: true
  },
  __vModel__: '@launchUserId',
},
{
  __config__: {
    label: '发起用户名',
    required: true
  },
  __vModel__: '@launchUserName',
},
{
  __config__: {
    label: '当前操作用户ID',
    required: true
  },
  __vModel__: '@flowOperatorUserId',
},
{
  __config__: {
    label: '当前操作用户名',
    required: true
  },
  __vModel__: '@flowOperatorUserName',
}]
export default {
  props: [/*当前节点数据*/"value", /*整个节点数据*/"processData", "flowType", 'formInfo'],
  components: { OrgSelect, MsgDialog, InterfaceDialog, FormulaDialog, FlowDialog, Detail, FlowFormDialog },
  data() {
    return {
      temporaryContent: '',
      visible: false,  // 控制面板显隐
      activeName: "config", // or formAuth  Tab面板key
      showingPCons: [], // 用户选择了得条件  被选中的才会被展示在面板上编辑
      pconditions: [], // 从vuex中获取的可以作为流程图条件的集合
      // 当前节点数据
      properties: {
        title: ''
      },
      // 发起人  start节点和condition节点需要
      initiator: [],
      initiatePos: [],
      initiateRole: [],
      initiateOrg: [],
      initiateGroup: [],
      priorityLength: 0, // 当为条件节点时  显示节点优先级选项的数据
      startForm: JSON.parse(JSON.stringify(nodeConfig.defaultStartForm)),
      ruleVisible: false,
      subFlowForm: JSON.parse(JSON.stringify(defaultSubFlowForm)),
      approverForm: JSON.parse(JSON.stringify(defaultApproverForm)),
      initiateTypeOptions: typeOptions,
      assigneeTypeOptions: typeOptions,
      noticeOptions,
      nodeNoticeOptions,
      noticeOptionsData,
      nodeNoticeOptionsData,
      systemFieldOptions,
      overTimeOptions,
      extraRuleOptions,
      realNodeList: [],
      progressOptions: ['10', '20', '30', '40', '50', '60', '70', '80', '90'],
      symbolOptions: [
        {
          label: '大于等于',
          value: ">="
        },
        {
          label: '大于',
          value: ">"
        },
        {
          label: '等于',
          value: "=="
        },
        {
          label: '小于等于',
          value: "<="
        },
        {
          label: '小于',
          value: "<"
        },
        {
          label: '不等于',
          value: "<>"
        },
        {
          label: '包含',
          value: "like"
        },
        {
          label: '不包含',
          value: "notLike"
        }],
      logicOptions: [
        {
          label: '并且',
          value: "&&"
        },
        {
          label: '或者',
          value: "||"
        }],
      conditionTypeOptions: [{
        label: '字段',
        value: 1
      },
      {
        label: '公式',
        value: 3
      }],
      conditionTypeOptions1: [{
        label: '字段',
        value: 1
      },
      {
        label: '自定义',
        value: 2
      }],
      assignList: [],
      printTplList: [],
      childFieldOptions: [],
      nodeOptions: [],
      formulaVisible: false,
      activeItem: {},
      viewVisible: false,
      formFieldList: [],
      approverTransmitRuleVisible: false,
      prevNodeList: [],
      isPrevNodeWithSubForm: false,
    };
  },
  computed: {
    // 未使用的条件个数
    notUseConNum() {
      // 发起人是默认就有得  所以需要加 1
      return this.pconditions.length - this.showingPCons.length + 1;
    },
    formFieldsOptions() {
      return this.formFieldList.filter(o => o.__config__.jnpfKey !== 'table')
    },
    usedFormItems() {
      return this.formFieldsOptions.filter(o => o.__vModel__.indexOf('-') < 0)
    },
    funcOptions() {
      let options = [
        ...systemFieldOptions,
        ...this.formFieldsOptions
      ]
      return options
    },
    funcRequiredOptions() {
      return this.formFieldsOptions.filter(o => o.__config__ && o.__config__.required)
    },
    rejectStepOptions() {
      let options = []
      const list = [{
        nodeId: '2',
        properties: { title: '自选审批节点' }
      }]
      options = [...defaultStep, ...list, ...this.realNodeList]
      if (this.approverForm.rejectType == 2) {
        options = options.filter(o => o.nodeId != 1)
      }
      return options
    }
  },
  methods: {
    refreshPrintOptions() {
      getPrintDevSelector(1).then(res => {
        let data = res.data.list
        let list = data.filter(o => o.children && o.children.length)
        this.printTplList = list.map(o => ({
          ...o,
          hasChildren: true
        }))
      }).catch(error => {
        reject(error)
      })
    },
    open(url) {
      window.open(url, "_blank");
    },
    openPrint() {
      let routeUrl = this.$router.resolve({
        path: '/system/printDev?open=true'
      });
      this.open(routeUrl.href)
    },
    handleSelect(item) {
      this.temporaryContent += "{" + item.id + "}"
      this.startForm.titleContent = this.temporaryContent
    },
    querySearch(queryString, cb) {
      let systemParams = [{
        id: '@flowFullName',
        value: '@flowFullName(流程名称)'
      },
      {
        id: '@flowFullCode',
        value: '@flowFullCode(流程编码)'
      },
      {
        id: '@launchUserName',
        value: '@launchUserName(发起用户名)'
      },
      {
        id: '@launchTime',
        value: '@launchTime(发起时间)'
      }]
      let items = []
      items = this.usedFormItems.filter(o => o.__config__.jnpfKey === 'comInput' || o.__config__.jnpfKey === 'textarea' || o.__config__.jnpfKey === 'numInput')
      const params = items.map(o => ({ id: o.__vModel__, value: o.__vModel__ + "(" + o.__config__.label + ")" }))

      cb([...systemParams, ...params]);
    },
    getFormOperates() {
      let res = []
      this.isApproverNode() && (res = this.approverForm.formOperates)
      this.isStartNode() && (res = this.startForm.formOperates)
      return res
    },
    resetOrgColl() {
      this.approverForm.approvers = []
      this.approverForm.approverPos = []
      this.approverForm.approverRole = []
      this.approverForm.approverOrg = []
      this.approverForm.approverGroup = []
      this.subFlowForm.initiator = []
      this.subFlowForm.initiatePos = []
      this.subFlowForm.initiateRole = []
      this.subFlowForm.initiateOrg = []
      this.subFlowForm.initiateGroup = []
    },
    onOrgChange(data, key) {

    },
    timeRangeLabel(item) {
      const index = ['fc-time-duration', 'fc-date-duration'].findIndex(t => t === item.tag)
      if (index > -1) {
        return '时长' + ['(小时)', '(天)'][index]
      } else {
        return item.label
      }
    },
    getAssignTypeLabel() {
      const res = this.assigneeTypeOptions.find(t => t.value === this.approverForm.assigneeType)
      return res ? res.label : ''
    },
    changeAllFormOperate(val) {
      const target = this.isStartNode() ? this.startForm : this.approverForm
      target.formOperates.forEach(t => t.formOperate = val)
    },
    // 是否可以显示当前条件组件
    couldShowIt(item, ...tag) {
      return tag.includes(item.tag) && this.showingPCons.includes(item.formId);
    },
    initFormOperates(target, isUpdate, isSameForm) {
      const formOperates = target.properties && target.properties.formOperates || []
      let res = []
      const getWriteById = id => {
        const arr = formOperates.filter(o => o.id === id)
        return arr.length ? arr[0].write : NodeUtils.isStartNode(target)
      }
      const getReadById = id => {
        const arr = formOperates.filter(o => o.id === id)
        return arr.length ? arr[0].read : true
      }
      const getRequiredById = id => {
        const arr = formOperates.filter(o => o.id === id)
        return arr.length ? arr[0].required : false
      }
      if (!formOperates.length || isUpdate) {
        for (let i = 0; i < this.formFieldList.length; i++) {
          const data = this.formFieldList[i];
          res.push({
            id: data.__vModel__,
            name: data.__config__.label,
            required: !isSameForm ? data.__config__.required : data.__config__.required || getRequiredById(data.__vModel__),
            requiredDisabled: requiredDisabled(data.__config__.jnpfKey) || data.__config__.required,
            jnpfKey: data.__config__.jnpfKey,
            dataType: getDataType(data),
            read: !isSameForm ? true : getReadById(data.__vModel__),
            write: !isSameForm ? NodeUtils.isStartNode(target) : getWriteById(data.__vModel__),
          })
        }
      } else {
        res = formOperates
      }
      return res
    },
    initCopyNode() {
      this.properties = this.value.properties
    },

    initStartNodeData() {
      this.initInitiator()
    },

    copyNodeConfirm() {
      this.$emit("confirm", this.properties, this.getOrgSelectLabel('copy') || '发起人自选');
      this.visible = false;
    },

    /**
     * 条件节点确认保存得回调
     */
    conditionNodeConfirm() {
      if (!this.exist()) return
      let nodeContent = ''
      this.properties.conditions = this.pconditions
      for (let i = 0; i < this.pconditions.length; i++) {
        const e = this.pconditions[i];
        nodeContent += `[${e.fieldName} ${e.symbolName} ${e.fieldLabel ? e.fieldLabel : (e.fieldValue || e.fieldValue === 0) ? e.fieldValue : ''}] ${i + 1 == this.pconditions.length ? '' : e.logicName}` + '\n'
      }
      this.$emit("confirm", this.properties, nodeContent || '请设置条件');
      this.visible = false;
    },

    getOrgSelectLabel(type) {
      return this.$refs[type + '-org'] && this.$refs[type + '-org']['selectedLabels']
    },
    /**
     * 开始节点确认保存
     */
    startNodeConfirm() {
      if (this.startForm.errorRule == 2 && !this.startForm.errorRuleUser.length) {
        this.$message({
          message: '请选择异常处理人',
          type: 'error',
        })
        return
      }

      if (this.startForm.hasPrintBtn && !this.startForm.printId) {
        this.$message.warning('请选择打印模板')
        return this.value
      }

      let titleObj = {
        title: this.properties.title
      }
      Object.assign(this.properties, this.startForm, titleObj)
      this.properties.initiator = this.initiator
      this.properties.initiatePos = this.initiatePos
      this.properties.initiateRole = this.initiateRole
      this.properties.initiateOrg = this.initiateOrg
      this.properties.initiateGroup = this.initiateGroup
      let content = '',
        initiatorOrgText = this.getOrgSelectLabel('start-department'),
        initiatorGroupText = this.getOrgSelectLabel('start-group'),
        initiatorText = this.getOrgSelectLabel('start-user'),
        initiatorPosText = this.getOrgSelectLabel('start-position'),
        initiatorRoleText = this.getOrgSelectLabel('start-role')
      if (!initiatorOrgText && !initiatorGroupText && !initiatorRoleText && !initiatorText && !initiatorPosText) {
        content = "所有人"
      } else {
        content += initiatorOrgText
        content += (content && initiatorRoleText ? ',' : '') + initiatorRoleText
        content += (content && initiatorPosText ? ',' : '') + initiatorPosText
        content += (content && initiatorGroupText ? ',' : '') + initiatorGroupText
        content += (content && initiatorText ? ',' : '') + initiatorText
      }
      this.$emit("confirm", this.properties, content);
      this.visible = false;
    },
    /**
     * 定时器节点确认保存
     */
    timerNodeConfirm() {
      let content = ''
      let { day, hour, minute, second } = this.properties
      if (!day && !hour && !minute && !second) {
        content = '请设置时间'
      } else {
        content = `将于${day ? day + '天' : ''}${hour ? hour + '小时' : ''}${minute ? minute + '分钟' : ''}${second ? second + '秒' : ''}后流转`
      }
      this.$emit("confirm", this.properties, content);
      this.visible = false;
    },
    /**
     * 子流程节点确认保存
     */
    subFlowNodeConfirm() {
      if (!this.properties.title) {
        this.$message({
          message: '请输入子流程名称',
          type: 'error',
        })
        return
      }
      let content = ''
      if (this.subFlowForm.initiateType === 6) {
        if (!this.subFlowForm.initiator.length && !this.subFlowForm.initiatePos.length && !this.subFlowForm.initiateRole.length && !this.subFlowForm.initiateOrg.length && !this.subFlowForm.initiateGroup.length) {
          this.$message({
            message: '请设置发起人',
            type: 'error',
          })
          return
        }
        let initiatorOrgText = this.getOrgSelectLabel('subFlow-department'),
          initiatorGroupText = this.getOrgSelectLabel('subFlow-group'),
          initiatorText = this.getOrgSelectLabel('subFlow-user'),
          initiatorPosText = this.getOrgSelectLabel('subFlow-position'),
          initiatorRoleText = this.getOrgSelectLabel('subFlow-role')
        content += initiatorOrgText
        content += (content && initiatorRoleText ? ',' : '') + initiatorRoleText
        content += (content && initiatorPosText ? ',' : '') + initiatorPosText
        content += (content && initiatorGroupText ? ',' : '') + initiatorGroupText
        content += (content && initiatorText ? ',' : '') + initiatorText
      } else {
        content = this.initiateTypeOptions.find(t => t.value === this.subFlowForm.initiateType).label
      }
      if (this.subFlowForm.initiateType == 4 && !this.subFlowForm.formField) {
        this.$message({
          message: '请选择表单字段',
          type: 'error',
        })
        return
      }
      if (this.subFlowForm.initiateType == 5 && !this.subFlowForm.nodeId) {
        this.$message({
          message: '请选择节点',
          type: 'error',
        })
        return
      }
      if (this.subFlowForm.initiateType == 9 && !this.subFlowForm.getUserUrl) {
        this.$message({
          message: '请输入接口路径',
          type: 'error',
        })
        return
      }
      if (!this.subFlowForm.flowId) {
        this.$message({
          message: '请选择子流程表单',
          type: 'error',
        })
        return
      }
      if (this.subFlowForm.errorRule == 2 && !this.subFlowForm.errorRuleUser.length) {
        this.$message({
          message: '请选择异常处理人',
          type: 'error',
        })
        return
      }
      let titleObj = {
        title: this.properties.title
      }
      Object.assign(this.properties, this.subFlowForm, titleObj)
      this.$emit("confirm", this.properties, content || '请设置发起人');
      this.visible = false;
    },
    /**
     * 审批节点确认保存
     */
    approverNodeConfirm() {
      if (!this.properties.title) {
        this.$message({
          message: '请输入节点名称',
          type: 'error',
        })
        return
      }

      if (this.approverForm.hasPrintBtn && !this.approverForm.printId) {
        this.$message.warning('请选择打印模板')
        return this.value
      }
      const assigneeType = this.approverForm.assigneeType
      let content = ''
      if (assigneeType == 6) {
        if (!this.approverForm.approvers.length && !this.approverForm.approverPos.length && !this.approverForm.approverRole.length && !this.approverForm.approverOrg.length && !this.approverForm.approverGroup.length) {
          this.$message({
            message: '请设置审批人',
            type: 'error',
          })
          return
        }
        // approver
        let approverText = this.getOrgSelectLabel('approver-user'),
          approverPosText = this.getOrgSelectLabel('approver-position'),
          approverRoleText = this.getOrgSelectLabel('approver-role'),
          approverOrgText = this.getOrgSelectLabel('approver-department'),
          approverGroupText = this.getOrgSelectLabel('approver-group')
        content += approverOrgText
        content += (content && approverRoleText ? ',' : '') + approverRoleText
        content += (content && approverPosText ? ',' : '') + approverPosText
        content += (content && approverGroupText ? ',' : '') + approverGroupText
        content += (content && approverText ? ',' : '') + approverText
      } else {
        content = this.assigneeTypeOptions.find(t => t.value === assigneeType).label
      }
      if (assigneeType == 4 && !this.approverForm.formField) {
        this.$message({
          message: '请选择表单字段',
          type: 'error',
        })
        return
      }
      if (assigneeType == 5 && !this.approverForm.nodeId) {
        this.$message({
          message: '请选择节点',
          type: 'error',
        })
        return
      }
      if (assigneeType == 9 && !this.approverForm.getUserUrl) {
        this.$message({
          message: '请输入接口路径',
          type: 'error',
        })
        return
      }
      if (this.approverForm.hasAgreeRule && !this.approverForm.agreeRules.length) {
        this.$message({
          message: '请选择同意规则配置',
          type: 'error',
        })
        return
      }
      // let copyContent = '', copyText = this.getOrgSelectLabel('approver-copy-user'),
      //   copyPosText = this.getOrgSelectLabel('approver-copy-position')
      // if (this.approverForm.circulatePosition.length || this.approverForm.circulateUser.length) {
      //   copyContent = '抄送:' + copyPosText + (copyText && copyPosText ? ',' : '') + copyText
      // }
      // let totalContent = '审批：' + content + copyContent
      let titleObj = {
        title: this.properties.title
      }
      Object.assign(this.properties, this.approverForm, titleObj)
      this.$emit("confirm", this.properties, content || '请设置审批人')
      this.visible = false

    },
    // 确认修改
    confirm() {
      this.isCopyNode() && this.copyNodeConfirm()
      this.isStartNode() && this.startNodeConfirm()
      this.isTimerNode() && this.timerNodeConfirm()
      this.isSubFlowNode() && this.subFlowNodeConfirm()
      this.isApproverNode() && this.approverNodeConfirm()
      this.isConditionNode() && this.conditionNodeConfirm()
    },
    // 关闭抽屉
    cancel() {
      setTimeout(() => {
        this.$emit("cancel");
        this.visible = false;
      }, 0)
    },
    /**
     * 删除流程条件
     */
    onDelCondition(index) {
      this.pconditions.splice(index, 1)
    },
    // 配合getPriorityLength 获取前一个节点条件数组长度 用于设置优先级
    getPrevData() {
      return NodeUtils.getPreviousNode(this.value.prevId, this.processData);
    },
    // 用于获取节点优先级范围
    getPriorityLength() {
      this.priorityLength = this.getPrevData().conditionNodes.length;
    },
    // 判断是否是条件节点
    isConditionNode() {
      return this.value ? NodeUtils.isConditionNode(this.value) : false;
    },
    /** 判断是否是审批节点*/
    isApproverNode() {
      return this.value ? NodeUtils.isApproverNode(this.value) : false;
    },

    isStartNode() {
      return this.value ? NodeUtils.isStartNode(this.value) : false;
    },
    isCopyNode() {
      return this.value ? NodeUtils.isCopyNode(this.value) : false
    },
    isTimerNode() {
      return this.value ? NodeUtils.isTimerNode(this.value) : false
    },
    isSubFlowNode() {
      return this.value ? NodeUtils.isSubFlowNode(this.value) : false
    },
    // 初始化发起人节点
    initInitiator() {
      this.initiator = this.value.properties && this.value.properties.initiator
      this.initiatePos = this.value.properties && this.value.properties.initiatePos
      this.initiateRole = this.value.properties && this.value.properties.initiateRole
      this.initiateOrg = this.value.properties && this.value.properties.initiateOrg
      this.initiateGroup = this.value.properties && this.value.properties.initiateGroup
      let properties = JSON.parse(JSON.stringify(this.value.properties))
      Object.assign(this.startForm, properties)
      this.formFieldList = this.startForm.formFieldList
    },
    /**
    * 初始化审批节点所需数据
    */
    initApproverNodeData() {
      this.activeName = 'config'
      this.isPrevNodeWithSubForm = false
      let properties = JSON.parse(JSON.stringify(this.value.properties))
      if (!properties.formId) properties.formFieldList = this.processData.properties.formFieldList
      this.formFieldList = properties.formFieldList
      this.approverForm.formOperates = this.initFormOperates(this.value)
      Object.assign(this.approverForm, properties)
      this.getNodeOption()
      this.getPrevNodeOption()
      this.approverForm.approveMsgConfig.on = typeof this.approverForm.approveMsgConfig.on === 'number' ? this.approverForm.approveMsgConfig.on : 2
      this.approverForm.rejectMsgConfig.on = typeof this.approverForm.rejectMsgConfig.on === 'number' ? this.approverForm.rejectMsgConfig.on : 2
    },
    initSubFlowData() {
      this.getNodeOption()
      this.getPrevNodeOption()
      let properties = JSON.parse(JSON.stringify(this.value.properties))
      Object.assign(this.subFlowForm, properties)
      const prevNode = this.prevNodeList[0]
      this.formFieldList = prevNode.properties.formId ? prevNode.properties.formFieldList : this.processData.properties.formFieldList
      this.subFlowForm.launchMsgConfig.on = typeof this.subFlowForm.launchMsgConfig.on === 'number' ? this.subFlowForm.launchMsgConfig.on : 0
    },
    openApproverTransmitRuleBox() {
      let assignList = this.approverForm.assignList ? JSON.parse(JSON.stringify(this.approverForm.assignList)) : []
      this.getRealAssignList(assignList)
      this.approverTransmitRuleVisible = true
    },
    getRealAssignList(assignList) {
      let newAssignList = this.prevNodeList.map(o => {
        let formFieldList = o.properties.formFieldList && o.properties.formFieldList.length ? o.properties.formFieldList : this.processData.properties.formFieldList
        return {
          nodeId: o.nodeId,
          title: o.properties.title,
          formFieldList: formFieldList.filter(o => o.__config__.jnpfKey !== 'table'),
          ruleList: []
        }
      })
      if (!assignList.length) {
        this.assignList = newAssignList
      } else {
        let list = []
        // 去掉被删掉的节点
        for (let i = 0; i < assignList.length; i++) {
          const e = assignList[i];
          inter: for (let j = 0; j < newAssignList.length; j++) {
            if (e.nodeId === newAssignList[j].nodeId) {
              const item = {
                nodeId: e.nodeId,
                title: newAssignList[j].title,
                formFieldList: newAssignList[j].formFieldList,
                ruleList: e.ruleList
              }
              list.push(item)
              break inter
            }
          }
        }
        let addList = newAssignList.filter(o => !assignList.some(item => item.nodeId === o.nodeId))
        this.assignList = [...list, ...addList]
      }
    },
    addTransmitRule(i) {
      this.assignList[i].ruleList.push({
        parentField: '',
        childField: '',
        childFieldOptions: []
      })
    },
    delTransmitRule(i, cIndex) {
      this.assignList[i].ruleList.splice(cIndex, 1)
    },
    saveApproverTransmitRule() {
      let boo = true
      for (let i = 0; i < this.assignList.length; i++) {
        const e = this.assignList[i]
        const ruleList = e.ruleList;
        for (let j = 0; j < ruleList.length; j++) {
          if (!ruleList[j].parentField) {
            boo = false
            this.$message({
              message: `请选择${e.title}的上节点字段`,
              type: 'error',
            })
            break
          }
          if (!ruleList[j].childField) {
            boo = false
            this.$message({
              message: `请选择${e.title}的本节点字段`,
              type: 'error',
            })
            break
          }
        }
      }
      if (!boo) return
      this.approverForm.assignList = this.assignList
      this.approverTransmitRuleVisible = false
      this.assignList = []
    },
    openRuleBox() {
      if (!this.subFlowForm.flowId) {
        this.$message({
          message: '请选择子流程表单',
          type: 'error',
        })
        return
      }
      getFlowFormInfo(this.subFlowForm.flowId).then(res => {
        let { formType = 1, propertyJson } = res.data
        let formJson = {}, fieldList = []
        if (propertyJson) formJson = JSON.parse(propertyJson)
        if (formType == 1) {
          fieldList = this.transformFormJson(formJson)
        } else {
          fieldList = formJson.fields
        }
        this.childFieldOptions = this.transformFieldList(fieldList).filter(o => o.__config__.jnpfKey !== 'table')
        let assignList = this.subFlowForm.assignList ? JSON.parse(JSON.stringify(this.subFlowForm.assignList)) : []
        this.getRealAssignList(assignList)
        this.ruleVisible = true
      })
    },
    saveRule() {
      let boo = true
      for (let i = 0; i < this.assignList.length; i++) {
        const e = this.assignList[i]
        const ruleList = e.ruleList;
        for (let j = 0; j < ruleList.length; j++) {
          if (!ruleList[j].parentField) {
            boo = false
            this.$message({
              message: `请选择${e.title}的父流程字段`,
              type: 'error',
            })
            break
          }
          if (!ruleList[j].childField) {
            boo = false
            this.$message({
              message: `请选择${e.title}的子流程字段`,
              type: 'error',
            })
            break
          }
        }
      }
      if (!boo) return
      this.subFlowForm.assignList = this.assignList
      this.ruleVisible = false
      this.assignList = []
    },
    // 获取上一节数据
    getPrevNodeOption() {
      let prevNode = NodeUtils.getPreviousNode(this.value.prevId, this.processData)
      let node = JSON.parse(JSON.stringify(prevNode))
      delete node.childNode
      let prevNodeList = []
      const loop = nodeData => {
        if (nodeData.conditionNodes) {
          let hasCondition = nodeData.conditionNodes.some(o => o.nodeId === this.value.nodeId)
          if (hasCondition) return prevNodeList.push(nodeData)
        }
        if (nodeData.childNode) {
          loop(nodeData.childNode)
        } else if (nodeData.conditionNodes && !nodeData.childNode) {
          for (let c of nodeData.conditionNodes) {
            loop(c)
          }
        } else {
          prevNodeList.push(nodeData)
        }
      }
      loop(node)
      this.prevNodeList = prevNodeList
      this.getPrevNodeRealList()
    },
    getPrevNodeRealList() {
      const loop = (data) => {
        inner: for (let i = 0; i < data.length; i++) {
          if (['condition', 'subFlow', 'timer'].includes(data[i].type)) {
            if (data[i].type === 'subFlow') this.isPrevNodeWithSubForm = true
            let prevNode = NodeUtils.getPreviousNode(data[i].prevId, this.processData)
            let node = JSON.parse(JSON.stringify(prevNode))
            delete node.childNode
            let prevNodeList = []
            const getPrevNodeAllList = nodeData => {
              if (nodeData.conditionNodes) {
                let hasCondition = nodeData.conditionNodes.some(o => o.nodeId === data[i].nodeId)
                if (hasCondition) return prevNodeList.push(nodeData)
              }
              if (nodeData.childNode) {
                getPrevNodeAllList(nodeData.childNode)
              } else if (nodeData.conditionNodes && !nodeData.childNode) {
                for (let c of nodeData.conditionNodes) {
                  getPrevNodeAllList(c)
                }
              } else {
                prevNodeList.push(nodeData)
              }
            }
            getPrevNodeAllList(node)
            data.splice(i, 1, ...prevNodeList)
            loop(data)
            break inner
          }
        }
      }
      loop(this.prevNodeList)
      this.prevNodeList = this.unique(this.prevNodeList, 'nodeId')
    },
    // 去重
    unique(arr, attrName) {
      const res = new Map()
      // 根据对象的某个属性值去重
      return arr.filter(o => !res.has(o[attrName]) && res.set(o[attrName], 1))
    },
    // 获取退回步骤选项
    getNodeOption() {
      let list = [], _this = this
      const loop = data => {
        if (Array.isArray(data)) data.forEach(d => loop(d))
        if (data.type === 'approver') list.push(data)
        if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes)
        if (data.childNode) loop(data.childNode)
      }
      loop(this.processData)
      let realList = []
      for (let i = 0; i < list.length; i++) {
        if (list[i].nodeId === _this.value.nodeId) break
        realList.push(list[i])
      }
      this.realNodeList = realList
      let nodeOptions = list.filter(o => o.nodeId !== _this.value.nodeId)
      this.nodeOptions = nodeOptions
    },
    /**
     * 初始化条件节点数据
     */
    initConditionNodeData() {
      this.getConditionNodeFieldList()
      // 初始化条件表单数据
      let nodeConditions = this.value.properties && this.value.properties.conditions
      for (let i = 0; i < nodeConditions.length; i++) {
        for (let j = 0; j < this.usedFormItems.length; j++) {
          if (nodeConditions[i].__vModel__ === this.usedFormItems[j].__vModel__) {
            nodeConditions[i] = { ...nodeConditions[i], ...this.usedFormItems[j] }
          }
        }
      }
      this.pconditions = JSON.parse(JSON.stringify(nodeConditions))
    },
    addCondition() {
      let item = {
        fieldName: '',
        symbolName: '',
        fieldValue: '',
        fieldType: 1,
        fieldValueType: 2,
        fieldLabel: '',
        logicName: '并且',
        field: '',
        symbol: '',
        logic: '&&',
        jnpfKey: ''
      }
      this.pconditions.push(item)
    },
    getConditionNodeFieldList() {
      this.getPrevNodeOption()
      if (!this.prevNodeList.length) {
        this.formFieldList = []
      } else {
        let prevNode = this.prevNodeList[0]
        let formFieldList = prevNode.properties.formFieldList && prevNode.properties.formFieldList.length ? prevNode.properties.formFieldList : this.processData.properties.formFieldList
        this.formFieldList = formFieldList.filter(o => o.__config__.jnpfKey !== 'table')
      }
    },
    fieldNameChange(val, item, i) {
      let obj = this.usedFormItems.filter(o => o.__vModel__ == val)[0]
      item.fieldName = obj.__config__.label
      item.jnpfKey = obj.__config__.jnpfKey
      item = { ...item, ...obj }
      item.fieldValue = undefined
      item.fieldLabel = ''
      this.$set(this.pconditions, i, item)
    },
    symbolChange(val, item) {
      let obj = this.symbolOptions.filter(o => o.value == val)[0]
      item.symbolName = obj.label
    },
    logicChange(val, item) {
      let obj = this.logicOptions.filter(o => o.value == val)[0]
      item.logicName = obj.label
    },
    fieldValueTypeChange(item) {
      item.fieldValue = ''
      item.fieldLabel = ''
    },
    fieldTypeChange(item) {
      item.field = ''
      item.fieldName = ''
    },
    fieldValueChange(val, item) {
      let obj = this.usedFormItems.filter(o => o.__vModel__ == val)[0]
      item.fieldLabel = obj.__config__.label
    },
    // 条件字段验证
    exist() {
      let isOk = true;
      //  遍历数组，判断非空
      for (let i = 0; i < this.pconditions.length; i++) {
        const e = this.pconditions[i];
        if (!e.field) {
          this.$message({
            showClose: true,
            message: '条件字段不能为空',
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
        if (!e.symbol) {
          this.$message({
            showClose: true,
            message: '比较不能为空',
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
      }
      return isOk;
    },
    getPrintTplList() {
      this.$store.dispatch('base/getPrintFlowTree').then(res => {
        let list = res.filter(o => o.children && o.children.length)
        this.printTplList = list.map(o => ({
          ...o,
          hasChildren: true
        }))
      })
    },
    onMsgChange(obj, key, params) {
      const [id, item] = params
      if (!id) {
        this[obj][key].msgId = ''
        this[obj][key].msgName = ''
        this[obj][key].templateJson = []
        return
      }
      if (this[obj][key].msgId === id) return
      this[obj][key].msgId = id
      this[obj][key].msgName = item.fullName
      this[obj][key].templateJson = item.templateJson
    },
    onFuncChange(obj, key, params) {
      const [id, item] = params
      if (!id) {
        this[obj][key].interfaceId = ''
        this[obj][key].interfaceName = ''
        this[obj][key].templateJson = []
        return
      }
      if (this[obj][key].interfaceId === id) return
      this[obj][key].interfaceId = id
      this[obj][key].interfaceName = item.fullName
      this[obj][key].templateJson = item.templateJson
    },
    onRelationFieldChange(val, item) {
      if (!val) return
      let list = this.funcOptions.filter(o => val === o.__vModel__)
      if (!list.length) return
      let obj = list[0]
      this.$set(item, 'isSubTable', obj.__config__ && obj.__config__.isSubTable ? obj.__config__.isSubTable : false)
    },
    onSubFlowIdChange(id, item) {
      if (!id) {
        this.subFlowForm.flowId = ''
        this.subFlowForm.flowName = ''
        return
      }
      if (this.subFlowForm.flowId === id) return
      this.subFlowForm.flowId = id
      this.subFlowForm.flowName = item.fullName
      this.subFlowForm.assignList = []
    },
    // 条件节点
    onConditionDateChange(val, item) {
      if (!val) return item.fieldLabel = ''
      let format = item.format || 'yyyy-MM-dd HH:mm:ss'
      item.fieldLabel = this.jnpf.toDate(val, format)
    },
    onConditionListChange(data, item) {
      if (!data || !data[1]) return item.fieldLabel = ''
      let labelList = data[1].map(o => o.fullName)
      item.fieldLabel = labelList.join('/')
    },
    onConditionObjChange(data, item) {
      if (!data || !data[1]) return item.fieldLabel = ''
      item.fieldLabel = data[1].fullName || ''
    },
    editFormula(item) {
      this.activeItem = item
      this.$nextTick(() => {
        this.formulaVisible = true
      })
    },
    updateFormula(formula) {
      this.activeItem.field = formula
      this.activeItem.fieldName = formula
    },
    goDetail(id) {
      this.viewVisible = true
      this.$nextTick(() => {
        this.$refs.View.init(id)
      })
    },
    onStartFormIdChange(id, item) {
      if (!id) return this.handleNull('startForm')
      let isSameForm = this.startForm.formId === id
      this.startForm.formName = item.fullName
      this.startForm.formId = id
      this.getFormFieldList(id, 'startForm', isSameForm)
    },
    onApproverFormIdChange(id, item) {
      if (!id) return this.handleNull('approverForm')
      let isSameForm = this.startForm.formId === id
      this.approverForm.formName = item.fullName
      this.approverForm.formId = id
      this.approverForm.assignList = []
      this.getFormFieldList(id, 'approverForm', isSameForm)
    },
    handleNull(form) {
      this[form].formName = ''
      this[form].formId = ''
      let formFieldList = []
      if (form === 'approverForm') {
        formFieldList = this.processData.properties.formFieldList || []
      }
      this.formFieldList = formFieldList
      this[form].formFieldList = formFieldList
      this[form].formOperates = this.initFormOperates(this.value, true)
      if (form === 'startForm') this.updateAllNodeFormOperates([])
    },
    getFormFieldList(id, form, isSameForm) {
      getFormInfo(id).then(res => {
        let { formType = 1, propertyJson } = res.data
        let formJson = {}, fieldList = []
        if (propertyJson) formJson = JSON.parse(propertyJson)
        if (formType == 1) {
          fieldList = this.transformFormJson(formJson)
        } else {
          fieldList = formJson.fields
        }
        let list = this.transformFieldList(fieldList)
        this.formFieldList = list
        this[form].formFieldList = list
        this[form].formOperates = this.initFormOperates(this.value, true, isSameForm)
        // 更新所有没设置表单的节点的表单权限
        if (form === 'startForm') this.updateAllNodeFormOperates(list, isSameForm)
      })
    },
    transformFormJson(list) {
      let fieldList = list.map(o => ({
        __config__: {
          label: o.filedName,
          jnpfKey: o.jnpfKey || '',
          required: o.required || false
        },
        __vModel__: o.filedId,
        multiple: o.multiple || false
      }))
      return fieldList
    },
    transformFieldList(formFieldList) {
      let list = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__vModel__) {
          const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table'
          let obj = JSON.parse(JSON.stringify(data))
          if (isTableChild) {
            obj.__vModel__ = parent.__vModel__ + '-' + data.__vModel__
            obj.__config__.label = parent.__config__.label + '-' + data.__config__.label
          }
          list.push(obj)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
      }
      loop(formFieldList)
      return list
    },
    updateAllNodeFormOperates(formFieldList, isSameForm) {
      const loop = data => {
        if (Array.isArray(data)) data.forEach(d => loop(d))
        if (data.type === 'approver' && !data.properties.formId) {
          data.properties.formOperates = this.initFormOperates(data, true, isSameForm)
          data.properties.formFieldList = formFieldList
        }
        if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes)
        if (data.childNode) loop(data.childNode)
      }
      loop(this.processData)
    },
    radioInput(val) {
      this.approverForm.rejectStep = '0'
    },
  },
  watch: {
    visible(val) {
      if (!val) {
        this.approverForm = JSON.parse(JSON.stringify(defaultApproverForm)) // 重置数据为默认状态
        this.subFlowForm = JSON.parse(JSON.stringify(defaultSubFlowForm))
        this.startForm = JSON.parse(JSON.stringify(nodeConfig.defaultStartForm))
        return
      }
      this.isStartNode() && this.initStartNodeData()
      this.isSubFlowNode() && this.initSubFlowData()
      this.isApproverNode() && this.initApproverNodeData()
      this.isConditionNode() && this.initConditionNodeData()
      this.getPrintTplList()
    },
    'startForm.titleContent'(newVal) {
      this.temporaryContent = newVal
    },
    value(newVal) {
      if (newVal && newVal.properties) {
        this.visible = true;
        this.properties = JSON.parse(JSON.stringify(newVal.properties));
        if (this.properties) {
          NodeUtils.isConditionNode(newVal) && this.getPriorityLength();
        }
      }
    }
  },
};
</script>
<style lang="scss">
.condition-dialog {
  .el-dialog__header {
    border-bottom: 1px solid #eee;
  }
}
</style>
<style lang="scss" scoped>
.hand >>> input {
  cursor: pointer;
}
.tips p {
  line-height: 24px;
}
.drawer {
  >>> .el-drawer__body {
    padding-bottom: 62px;
    overflow: hidden;
  }
  .el-select {
    width: 100%;
    &.timeout-select {
      width: 80px;
    }
  }

  >>> .el-tabs--top .el-tabs__item.is-top:nth-child(2) {
    padding-left: 20px;
  }

  >>> .el-tabs__item:focus {
    box-shadow: none !important;
  }

  >>> .el-tabs__header {
    margin-bottom: 0;
  }
}
.mr-10 {
  margin-right: 10px;
}

.header {
  line-height: 28px;
}

.printWrap {
  padding: 10px 0;
  text-align: center;
  >>> .el-divider--horizontal {
    margin-top: 10px;
  }
}
.actions {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 10px 20px 20px;
  width: 100%;
  box-sizing: border-box;
  text-align: right;
}

.radio-item {
  line-height: 30px;
  width: calc(25% - 30px);
}

.priority-select {
  width: 118px;
  position: absolute;
  right: 26px;
}

.form-auth-table {
  height: 100%;
  font-size: 14px;
  >>> .el-checkbox__label {
    font-size: 12px;
  }
  .auth-table-header {
    background: #fafafa;
    line-height: 40px;
  }
  .row {
    display: flex;
    align-items: center;
    line-height: 32px;
    padding: 8px 12px;
    border-bottom: 1px solid #efefef;
    &:hover {
      background: #f5f7fa;
    }
    .label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .required {
        color: #f2725e;
      }
    }
    .radio-group {
      flex: 2;
      display: flex;
      justify-content: space-between;
    }
  }
}

.approver-pane {
  height: 100%;
  overflow: hidden;
  >>> .el-tabs__content {
    height: calc(100% - 40px);
    .el-tab-pane {
      height: 100%;
      .config-scrollbar {
        height: 100%;
        .el-row {
          font-size: 14px;
          color: #606266;
          height: 32px;
          line-height: 32px;
        }
      }
    }
  }
  .per-cell {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .el-checkbox {
      margin-right: 40px;
    }
    &:last-child {
      margin-bottom: unset;
    }
  }
}
.option-box-tip {
  font-size: 14px;
  color: #a5a5a5;
}
.option-box {
  font-size: 14px;
  padding-left: 1rem;
}

.condition-pane {
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
}
.condition-list {
  font-size: 14px;
  line-height: 36px;
  &.condition-list-header {
    >>> .el-col {
      text-align: left;
    }
  }
  >>> .el-col {
    text-align: center;
    padding: 0 4px;
    &.label,
    &.fieldValue {
      display: flex;
      align-items: center;
    }
    .el-input,
    .el-input-number,
    .el-select {
      width: 100%;
    }
    .el-icon-delete {
      cursor: pointer;
      &:hover {
        color: #f2725e;
      }
    }
    .edit-script-btn {
      flex: 1;
      height: 32px;
    }
  }
  .condition-select {
    &.el-select {
      &.condition-type-select {
        width: 80px;
        flex-shrink: 0;
      }
      >>> .el-input__inner {
        padding: 0 26px 0 10px;
      }
    }
  }
}
.rule-dialog {
  >>> .el-dialog__body {
    padding: 0 0 10px !important;
    min-height: 364px;
  }
  .node-tabs {
    >>> .el-tabs__nav-wrap {
      padding: 0 20px;
    }
    >>> .el-tabs__content {
      .el-tab-pane {
        min-height: 300px !important;
        max-height: 500px !important;
        padding: 0 10px 10px;
        overflow: auto;
      }
    }
  }
  .option-box-tip {
    margin-bottom: 20px;
  }
  .rule-cell {
    line-height: 32px;
    &.mid {
      color: #1890ff;
      text-align: center;
    }
  }
}
.parameter-box {
  height: 30px;
  line-height: 30px;
  margin-bottom: 8px;
}
.variable-box {
  margin-bottom: 8px;
}
.form-item-label {
  font-weight: 600;
  font-size: 14px;
  line-height: 32px;
}
.form-sub-title {
  font-size: 14px;
  color: #606266;
  line-height: 32px;
}
.form-item-content {
  padding: 0 10px;
  &.form-item-content-first {
    margin: -12px 0 18px;
  }
}
.el-form-item {
  margin-bottom: 12px !important;
}
.has-free-approver {
  width: 92px;
}
.form-item-approver {
  margin-left: 5px;
}
.assignee-form {
  display: flex;
  .form-field-type {
    width: 120px;
    >>> .el-input--small {
      .el-input__inner {
        height: 32px;
        line-height: 32px;
        border-radius: 5px 0px 0px 5px;
      }
    }
  }
  .form-field {
    >>> .el-input--small {
      .el-input__inner {
        height: 32px;
        line-height: 32px;
        border-radius: 0px 5px 5px 0px;
        border-left: 0px solid #dcdfe6;
      }
    }
  }
}
</style>