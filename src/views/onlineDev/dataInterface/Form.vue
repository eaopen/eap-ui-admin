<template>
  <div class="JNPF-preview-main flow-form-main">
    <div class="JNPF-common-page-header">
      <el-page-header @back="goBack" content="" />
      <el-steps :active="active" finish-status="success" simple class="steps" :key="key">
        <el-step v-for="item in stepList" :key="item" :title="item"></el-step>
      </el-steps>
      <div class="options">
        <el-button :disabled="active <= 0" @click="handlePrevStep">{{$t('common.prev')}}</el-button>
        <el-button :disabled="active >= stepList.length-1"
          @click="handleNextStep">{{$t('common.next')}}</el-button>
        <el-button type="primary" :loading="btnLoading" :disabled="active < stepList.length-1"
          @click="dataFormSubmit()">{{$t('common.confirmBtn')}}</el-button>
        <el-button @click="goBack">{{$t('common.cancelBtn')}}</el-button>
      </div>
    </div>
    <!-- 基本信息 -->
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" v-loading="formLoading"
      label-width="100px" v-if="active === 0">
      <el-row>
        <el-col :span="14" :offset="5" class="baseInfo mt-20">
          <el-form-item label="名称" prop="fullName">
            <el-input v-model="dataForm.fullName" placeholder="输入名称" maxlength="50" />
          </el-form-item>
          <el-form-item label="编码" prop="enCode">
            <el-input v-model="dataForm.enCode" placeholder="输入编码" maxlength="50" />
          </el-form-item>
          <el-form-item label="分类" prop="categoryId">
            <JNPF-TreeSelect v-model="dataForm.categoryId" :options="selectData" placeholder="选择分类"
              clearable />
          </el-form-item>
          <el-form-item label="类型" prop="dataType">
            <el-radio-group v-model="dataForm.dataType" @change="onDataTypeChange">
              <el-radio :label="2">静态数据</el-radio>
              <el-radio :label="1">SQL操作</el-radio>
              <el-radio :label="3">API操作</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="动作" prop="requestMethod" v-if="dataForm.dataType===1">
            <el-radio-group v-model="dataForm.requestMethod" @change="onMethodChange($event,'sql')">
              <el-radio label="3">查询</el-radio>
              <el-radio label="1">增加</el-radio>
              <el-radio label="2">修改</el-radio>
              <el-radio label="4">删除</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="排序" prop="sortCode">
            <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
              controls-position="right" />
          </el-form-item>
          <el-form-item label="状态" prop="enabledMark">
            <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="分页" prop="checkType">
            <el-switch v-model="dataForm.checkType" :active-value="1" :inactive-value="0" />
            <span class="page-explain" @click="handleShowPageExplain">分页使用说明</span>
          </el-form-item>
          <el-form-item label="说明" prop="description">
            <el-input v-model="dataForm.description" type="textarea" :rows="3" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- sql语句 -->
    <div class="config" v-if="getShowSqlBox()">
      <div class="tableData">
        <el-select v-model="dataForm.dbLinkId" filterable placeholder="选择数据库" style="width: 100%"
          @change="handleSelectTable">
          <el-option-group v-for="group in dbOptions" :key="group.fullName" :label="group.fullName">
            <el-option v-for="item in group.children" :key="item.id" :label="item.fullName"
              :value="item.id" />
          </el-option-group>
        </el-select>
        <div class="box">
          <div class="search-box">
            <el-input placeholder="请输入关键词查询" v-model="keyword" @keyup.enter.native="search"
              clearable class="search-input">
              <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
            </el-input>
          </div>
          <div class="tree-box">
            <el-tree :data="treeData" node-key="index" v-loading="treeLoading" :props="defaultProps"
              lazy :load="loadNode" @node-click="handleNodeClick" :expand-on-click-node="false">
              <span class="custom-tree-node" slot-scope="{ data }">
                <span class="text" v-if="data.isLeaf">
                  {{ data.fieldName?data.field + '(' + data.fieldName + ')':data.field}}
                </span>
                <span class="text" v-else>
                  <i
                    :class="data.type == 1 ? 'icon-ym icon-ym-view' : 'icon-ym icon-ym-generator-tableGrid'" />
                  {{ data.tableName?data.table + '(' + data.tableName + ')':data.table}}
                </span>
              </span>
            </el-tree>
          </div>
        </div>
      </div>
      <div class="detail">
        <div class="middle-pane">
          <div class="right-pane-list">
            <div class="cap">
              <span slot="label">SQL语句
                <el-tooltip content="支持SQL语句&存储过程语句" placement="top">
                  <a class="el-icon-question tooltip-question"></a>
                </el-tooltip>
              </span>
              <div style="float:right;cursor:pointer">
                <el-dropdown>
                  <span class="el-dropdown-link" title="111">
                    系统变量<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item disabled>当前系统变量仅支持内部接口引用</el-dropdown-item>
                    <el-dropdown-item divided></el-dropdown-item>
                    <el-dropdown-item v-for="(item,index) in sysVariableList" :key="index">
                      <div @click="handleSysNodeClick(item.value)">
                        <span>{{ item.value }}</span>
                        <span class="tips">{{ item.tips }}</span>
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
            <div class="list">
              <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="100px"
                style="padding-top: 0px;">
                <el-form-item label-width="0" prop="query" v-if="active===1">
                  <div class="sql-box">
                    <SQLEditor v-model="dataForm.query" :options="sqlOptions" ref="SQLEditorRef" />
                  </div>
                </el-form-item>
                <el-form-item label-width="0" prop="propertyJson.countSql" v-if="active===2">
                  <div class="sql-box">
                    <SQLEditor v-model="dataForm.propertyJson.countSql" :options="sqlOptions"
                      ref="SQLEditorRef" />
                  </div>
                </el-form-item>
                <el-form-item label-width="0" prop="propertyJson.echoSql" v-if="active===3">
                  <div class="sql-box">
                    <SQLEditor v-model="dataForm.propertyJson.echoSql" :options="sqlOptions"
                      ref="SQLEditorRef" />
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>
      <div class="right-pane">
        <div class="right-pane-list">
          <div class="cap">
            <span>接口参数
              <el-tooltip content="接收方式:Body/json" placement="top">
                <a class="el-icon-question tooltip-question"></a>
              </el-tooltip>
            </span>
          </div>
          <div class="list">
            <el-table :data="requestParameters" ref="dragTable" row-key="id" size='mini'
              height="100%">
              <el-table-column align="center" label="拖动" width="50">
                <template>
                  <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
                    title='点击拖动' />
                </template>
              </el-table-column>
              <el-table-column prop="field" label="参数名称">
                <template slot-scope="scope">
                  <p @click="handleItemClick(scope.row)" style="cursor:pointer">
                    <span class="required-sign">{{scope.row.required?'*':''}}</span>
                    {{scope.row.field}}{{scope.row.fieldName?'('+scope.row.fieldName+')':''}}
                  </p>
                </template>
              </el-table-column>
              <el-table-column prop="dataType" label="参数类型" width="70">
                <template slot-scope="scope">
                  <span v-if="scope.row.dataType === 'varchar'">字符串</span>
                  <span v-if="scope.row.dataType === 'int'">整型</span>
                  <span v-if="scope.row.dataType === 'datetime'">日期时间</span>
                  <span v-if="scope.row.dataType === 'decimal'">浮点</span>
                  <span v-if="scope.row.dataType === 'bigint'">长整型</span>
                  <span v-if="scope.row.dataType === 'text'">文本</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="70">
                <template slot-scope="scope">
                  <el-button type="text" @click="addOrUpdateHandle(scope.row)"
                    icon="el-icon-edit-outline"></el-button>
                  <el-button type="text" class="JNPF-table-delBtn" icon="el-icon-delete"
                    @click="removeParameter(scope.$index)"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="table-actions" @click="addOrUpdateHandle()">
            <el-button type="text" icon="el-icon-plus">添加参数</el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- api操作 -->
    <el-form v-if="active === 1&&dataForm.dataType === 3" ref="dataForm" :model="dataForm"
      :rules="dataRule" label-width="110px">
      <el-row>
        <el-col :span="14" :offset="5" class="mt-20 baseInfo">
          <jnpf-form-tip-item label="接口类型" prop="requestMethod">
            <el-radio-group v-model="dataForm.requestMethod" @change="onMethodChange($event,'api')">
              <el-radio label="6">GET</el-radio>
              <el-radio label="7">POST</el-radio>
            </el-radio-group>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="接口路径" prop="path">
            <el-input v-model="dataForm.path" placeholder="输入接口路径">
              <el-button slot="append" class="el-icon-plus" @click="addHeaders()">添加headers
              </el-button>
            </el-input>
            <el-row v-for="(item, index) in requestHeaders" :key="item.index" class="mt-10">
              <el-col :span="10">
                <el-autocomplete v-model="item.field" :fetch-suggestions="querySearch"
                  placeholder="key" clearable style="width:100%" />
              </el-col>
              <el-col :span="10" :offset="1">
                <el-input v-model="item.defaultValue" placeholder="value" clearable />
              </el-col>
              <el-col :span="2" :offset="1">
                <el-button type="danger" icon="el-icon-close" @click="removeHeaders(index)">
                </el-button>
              </el-col>
            </el-row>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="接口参数" tip-label="接收方式:Body/json">
            <el-button @click="addOrUpdateHandle()" class="el-icon-plus" size="mini">添加参数
            </el-button>
          </jnpf-form-tip-item>
          <div class="parameterList">
            <el-table :data="requestParameters" ref="dragTable" row-key="id" size='mini'>
              <el-table-column align="center" label="拖动" width="50">
                <template>
                  <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
                    title='点击拖动' />
                </template>
              </el-table-column>
              <el-table-column prop="field" label="参数名称">
                <template slot-scope="scope">
                  <p>
                    <span class="required-sign">{{scope.row.required?'*':''}}</span>
                    {{scope.row.field}}{{scope.row.fieldName?'('+scope.row.fieldName+')':''}}
                  </p>
                </template>
              </el-table-column>
              <el-table-column prop="dataType" label="参数类型" width="70">
                <template slot-scope="scope">
                  <span v-if="scope.row.dataType === 'varchar'">字符串</span>
                  <span v-if="scope.row.dataType === 'int'">整型</span>
                  <span v-if="scope.row.dataType === 'datetime'">日期时间</span>
                  <span v-if="scope.row.dataType === 'decimal'">浮点</span>
                  <span v-if="scope.row.dataType === 'bigint'">长整型</span>
                  <span v-if="scope.row.dataType === 'text'">文本</span>
                </template>
              </el-table-column>
              <el-table-column prop="defaultValue" label="默认值" />
              <el-table-column label="操作" width="70">
                <template slot-scope="scope">
                  <el-button type="text" @click="addOrUpdateHandle(scope.row)"
                    icon="el-icon-edit-outline"></el-button>
                  <el-button type="text" class="JNPF-table-delBtn" icon="el-icon-delete"
                    @click="removeParameter(scope.$index)"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <jnpf-form-tip-item label="分页参数">
            <el-table :data="pageParameters" row-key="id" size='mini'>
              <el-table-column prop="fieldName" label="分页字段">
                <template slot-scope="scope">
                  <p>{{scope.row.fieldName}}</p>
                </template>
              </el-table-column>
              <el-table-column prop="field" label="接口参数">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.field" :placeholder="scope.row.field" clearable />
                </template>
              </el-table-column>
            </el-table>
          </jnpf-form-tip-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form v-if="active === 2&&dataForm.dataType === 3&&dataForm.checkType" ref="dataForm"
      :model="dataForm" :rules="dataRule" label-width="110px">
      <el-row>
        <el-col :span="14" :offset="5" class="mt-20 baseInfo">
          <jnpf-form-tip-item label="接口类型" prop="propertyJson.echoReqMethod">
            <el-radio-group v-model="dataForm.propertyJson.echoReqMethod">
              <el-radio label="6">GET</el-radio>
              <el-radio label="7">POST</el-radio>
            </el-radio-group>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="接口路径" prop="propertyJson.echoPath">
            <el-input v-model="dataForm.propertyJson.echoPath" placeholder="输入接口路径">
              <el-button slot="append" class="el-icon-plus" @click="addHeaders(1)">添加headers
              </el-button>
            </el-input>
            <el-row v-for="(item, index) in echoReqHeaders" :key="item.index" class="mt-10">
              <el-col :span="10">
                <el-autocomplete v-model="item.field" :fetch-suggestions="querySearch"
                  placeholder="key" clearable style="width:100%" />
              </el-col>
              <el-col :span="10" :offset="1">
                <el-input v-model="item.defaultValue" placeholder="value" clearable />
              </el-col>
              <el-col :span="2" :offset="1">
                <el-button type="danger" icon="el-icon-close" @click="removeHeaders(index,1)">
                </el-button>
              </el-col>
            </el-row>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="接口参数" tip-label="接收方式:Body/json">
            <el-button @click="addOrUpdateHandle('',1)" class="el-icon-plus" size="mini">添加参数
            </el-button>
          </jnpf-form-tip-item>
          <div class="parameterList">
            <el-table :data="echoReqParameters" ref="dragTable" row-key="id" size='mini'>
              <el-table-column align="center" label="拖动" width="50">
                <template>
                  <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
                    title='点击拖动' />
                </template>
              </el-table-column>
              <el-table-column prop="field" label="参数名称">
                <template slot-scope="scope">
                  <p>
                    <span class="required-sign">{{scope.row.required?'*':''}}</span>
                    {{scope.row.field}}{{scope.row.fieldName?'('+scope.row.fieldName+')':''}}
                  </p>
                </template>
              </el-table-column>
              <el-table-column prop="dataType" label="参数类型" width="70">
                <template slot-scope="scope">
                  <span v-if="scope.row.dataType === 'varchar'">字符串</span>
                  <span v-if="scope.row.dataType === 'int'">整型</span>
                  <span v-if="scope.row.dataType === 'datetime'">日期时间</span>
                  <span v-if="scope.row.dataType === 'decimal'">浮点</span>
                  <span v-if="scope.row.dataType === 'bigint'">长整型</span>
                  <span v-if="scope.row.dataType === 'text'">文本</span>
                </template>
              </el-table-column>
              <el-table-column prop="defaultValue" label="默认值" />
              <el-table-column label="操作" width="70">
                <template slot-scope="scope">
                  <el-button type="text" @click="addOrUpdateHandle(scope.row,1)"
                    icon="el-icon-edit-outline"></el-button>
                  <el-button type="text" class="JNPF-table-delBtn" icon="el-icon-delete"
                    @click="removeParameter(scope.$index,1)"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <jnpf-form-tip-item label="回显参数">
            <el-table :data="echoParameters" row-key="id" size='mini'>
              <el-table-column prop="fieldName" label="回显字段">
                <template slot-scope="scope">
                  <p>{{scope.row.fieldName}}</p>
                </template>
              </el-table-column>
              <el-table-column prop="field" label="接口参数">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.field" clearable />
                </template>
              </el-table-column>
            </el-table>
          </jnpf-form-tip-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 静态数据数据处理 -->
    <div class="staticData" v-if="active === 1&&dataForm.dataType === 2">
      <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="100px">
        <el-form-item label-width="0" prop="query">
          <div class="json-box">
            <JSONEditor v-model="dataForm.query" :options="jsonOptions" ref="JSONEditorRef" />
          </div>
        </el-form-item>
      </el-form>
    </div>
    <!-- api\sql数据处理 -->
    <div class="jsStaticData" v-if="active === stepList.length-1&&dataForm.dataType !== 2">
      <div class="json-box">
        <JNPFCodeEditor v-model="text" :options="jsOptions" ref="CodeEditor" />
      </div>
      <div class="jsTips">
        <p>1、支持JavaScript的脚本</p>
        <p>2、小程序不支持在线JS脚本</p>
      </div>
    </div>
    <FieldForm v-show="fieldFormVisible" ref="fieldForm" @addParameter="addParameter" />
    <form-script :visible.sync="formScriptVisible" :value="this.dataForm.dataProcessing"
      @updateScript="updateScript" />
    <page-explain v-if="pageExplainVisible" ref="pageExplain" />
  </div>
</template>

<script>
import { getDataInterfaceInfo, createDataInterface, updateDataInterface } from '@/api/extn/dataInterface'
import { getDataSourceListAll } from '@/api/extn/dataSource'
import { DataModelListAll, DataModelFieldList } from '@/api/extn/dataModel'
import SQLEditor from '@/components/extn/JNPFEditor/monaco'
import JSONEditor from '@/components/extn/JNPFEditor/monaco'
import FieldForm from './FieldForm'
import FormScript from './FormScript'
import PageExplain from './PageExplain'
import { deepClone } from '@/utils'
import Sortable from 'sortablejs'
import JNPFCodeEditor from '@/components/extn/JNPFEditor/monaco'
const defaultDataHandler = '(data) => {\r\n    // 处理数据逻辑\r\n\r\n    // 返回所需的数据\r\n    return data\r\n}'
const defaultPageParameters = [
  { fieldName: 'currentPage', field: 'currentPage' },
  { fieldName: 'pageSize', field: 'pageSize' },
  { fieldName: 'keyword', field: 'keyword' },
]
const defaultEchoParameters = [
  { fieldName: 'showKey', field: '' },
  { fieldName: 'showValue', field: '' },
]
const defaultJson = {
  countSql: "",
  echoSql: "",
  echoPath: "",
  echoReqMethod: "6",
  echoReqParameters: [],
  echoReqHeaders: [],
  pageParameters: defaultPageParameters,
  echoParameters: defaultEchoParameters
}

export default {
  components: {
    SQLEditor,
    JSONEditor,
    FieldForm,
    FormScript,
    PageExplain,
    JNPFCodeEditor
  },
  data() {
    return {
      active: 0,
      treeLoading: false,
      formLoading: false,
      btnLoading: false,
      fieldFormVisible: false,
      pageExplainVisible: false,
      formScriptVisible: false,
      selectData: [],
      sqlOptions: { language: 'sql' },
      jsonOptions: { language: 'json' },
      jsOptions: { language: 'javascript' },
      dataForm: {
        fullName: '',
        enCode: '',
        categoryId: '',
        dbLinkId: '0',
        dataType: 2,
        checkType: 0,
        ipAddress: '',
        requestHeaders: '',
        requestMethod: '1',
        responseType: 'json',
        sortCode: 0,
        enabledMark: 1,
        description: '',
        dataProcessing: '',
        requestParameters: '',
        query: '',
        propertyJson: defaultJson
      },
      restaurants: [
        { "value": "Postman-Token" },
        { "value": "Host" },
        { "value": "User-Agent" },
        { "value": "Accept" },
        { "value": "Accept-Encoding" },
        { "value": "Connection" }
      ],
      requestHeaders: [],
      requestParameters: [],
      pageParameters: [],
      echoReqHeaders: [],
      echoReqParameters: [],
      echoParameters: [],
      sqlRequestMethod: '3',
      apiRequestMethod: '6',
      dbOptions: [],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'fullName',
        isLeaf: 'isLeaf'
      },
      dataRule: {
        fullName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        enCode: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
        categoryId: [{ required: true, message: '请选择分类', trigger: 'blur' }],
        path: [{ required: true, message: '请填写接口路径', trigger: 'blur' }],
        query: [{ required: true, message: '请输入SQL查询语句或静态数据', trigger: 'blur' }],
        'propertyJson.countSql': [{ type: "string", required: true, message: '请输入SQL语句', trigger: 'blur' }],
        'propertyJson.echoSql': [{ type: "string", required: true, message: '请输入SQL语句', trigger: 'blur' }],
        'propertyJson.echoPath': [{ required: true, message: '请填写接口路径', trigger: 'blur' }],
      },
      text: '',
      key: +new Date(),
      sqlType: 0,
      keyword: ""
    }
  },
  computed: {
    stepList() {
      this.key = +new Date()
      let base = ['基本信息', '数据配置']
      if (this.dataForm.dataType == 2) return base
      if (this.dataForm.dataType == 1 && this.dataForm.checkType === 1) return [...base, '数量统计', '数据回显', '数据处理']
      if (this.dataForm.dataType == 3 && this.dataForm.checkType === 1) return [...base, '数据回显', '数据处理']
      return [...base, '数据处理']
    },
    sysVariableList() {
      const list = [
        { value: '@user', tips: "当前用户" },
        { value: '@currentUsersAndSubordinates', tips: "当前用户及下属" },
        { value: '@organization', tips: "当前组织" },
        { value: '@currentOrganizationAndSuborganization', tips: "当前组织及子组织" },
        { value: '@chargeorganization', tips: "当前分管组织" },
        { value: '@currentChargeorganizationAndSuborganization', tips: "当前分管组织及子组织" }
      ]
      const dataConfigList = [
        { value: '@offsetSize', tips: "开始数据条数" },
        { value: '@pageSize', tips: "返回数据条数" },
      ]
      const dataEchoList = [
        { value: '@showKey', tips: "回显字段查询key" },
        { value: '@showValue', tips: "回显字段值" },
      ]
      const keyword = { value: '@keyword', tips: "关键词搜索" }
      if (this.active === 2) return [...list, keyword]
      if (this.active === 3) return [...list, ...dataEchoList]
      return [...list, ...dataConfigList, keyword]
    }
  },
  methods: {
    goBack() {
      this.$emit('close')
    },
    init(id, categoryId) {
      Object.assign(this.$data, this.$options.data())
      this.active = 0
      this.dataForm.id = id || ''
      this.formLoading = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        // 获取分类
        this.$store.dispatch('dict/getDictionaryData', { sort: 'DataInterfaceType' }).then((res) => {
          this.selectData = res
        })
        // 获取数据库
        getDataSourceListAll().then(res => {
          const list = res.data.list || []
          this.dbOptions = list.filter(o => o.children && o.children.length)
          if (this.dataForm.id) {
            this.getFormData()
          } else {
            this.dataForm.categoryId = categoryId
            this.pageParameters = defaultPageParameters
            this.echoParameters = defaultEchoParameters
            this.formLoading = false
            this.getTableList()
          }
        })
      })
    },
    getFormData() {
      getDataInterfaceInfo(this.dataForm.id).then(res => {
        if (!res.data.propertyJson) res.data.propertyJson = JSON.stringify(defaultJson)
        res.data.propertyJson = JSON.parse(res.data.propertyJson)
        this.dataForm = res.data
        this.getTableList()
        this.dataForm.query = res.data.query
        if (res.data.requestHeaders) this.requestHeaders = JSON.parse(res.data.requestHeaders) || []
        if (res.data.requestParameters) this.requestParameters = JSON.parse(res.data.requestParameters) || []
        if (res.data.propertyJson) {
          const propertyJson = res.data.propertyJson
          this.echoReqHeaders = propertyJson.echoReqHeaders || []
          this.echoReqParameters = propertyJson.echoReqParameters || []
          this.pageParameters = propertyJson.pageParameters && propertyJson.pageParameters.length ? propertyJson.pageParameters : defaultPageParameters
          this.echoParameters = propertyJson.echoParameters && propertyJson.echoParameters.length ? propertyJson.echoParameters : defaultEchoParameters
        } else {
          this.pageParameters = defaultPageParameters
          this.echoParameters = defaultEchoParameters
        }
        if (res.data.dataType === 1) this.sqlRequestMethod = this.dataForm.requestMethod
        if (res.data.dataType === 3) this.apiRequestMethod = this.dataForm.requestMethod
        this.formLoading = false
      })
    },
    onDataTypeChange(val) {
      if (val === 1) {
        this.dataForm.requestMethod = this.sqlRequestMethod
      } else if (val === 3) {
        this.dataForm.requestMethod = this.apiRequestMethod
      } else {
        this.dataForm.requestMethod = ''
      }
      this.requestParameters = []
    },
    onMethodChange(val, key, type) {
      this[key + 'RequestMethod'] = val
    },
    handleSelectTable(val) {
      this.dataForm.dbLinkId = val
      this.getTableList();
    },
    getTableList() {
      this.treeLoading = true
      DataModelListAll(this.dataForm.dbLinkId, { keyword: this.keyword }).then(res => {
        this.treeData = res.data.list
        this.treeLoading = false
      })
    },
    handleNodeClick(data) {
      const content = data.isLeaf ? data.field : data.table
      this.$refs.SQLEditorRef && this.$refs.SQLEditorRef.insert(content)
    },
    handleSysNodeClick(data) {
      this.$refs.SQLEditorRef && this.$refs.SQLEditorRef.insert(data)
    },
    handlePrevStep() {
      this.active -= 1
      if (this.active == 0) this.$refs['dataForm'].clearValidate()
      if (this.dataForm.dataType === 1) this.setSqlData()
    },
    handleNextStep() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.active += 1
          // 静态数据
          if (this.active === this.stepList.length - 1) {
            this.text = this.dataForm.dataProcessing
            this.$refs.JSONEditorRef && this.$refs.JSONEditorRef.changeEditor({ value: this.text, options: this.jsonOptions })
          }
          // SQL操作
          if (this.dataForm.dataType === 1) {
            this.setSqlData()
            if (this.active === this.stepList.length - 1) this.setDataProcessing()
          }
          // API操作
          if (this.dataForm.dataType === 3) {
            if (this.active === 1 || (this.active === 2 && this.dataForm.checkType)) this.$nextTick(() => this.setSort())
            if (this.active === this.stepList.length - 1) this.setDataProcessing()
          }
        }
      })
    },
    setSqlData() {
      this.$nextTick(() => {
        if (this.active == 1) this.$refs.SQLEditorRef && this.$refs.SQLEditorRef.changeEditor({ value: this.dataForm.query, options: this.sqlOptions })
        if (this.dataForm.checkType && (this.active === 2 || this.active === 3)) {
          const sql = this.dataForm.propertyJson[this.active === 2 ? 'countSql' : 'echoSql'] || ''
          this.$refs.SQLEditorRef && this.$refs.SQLEditorRef.changeEditor({ value: sql, options: this.sqlOptions })
        }
      })
    },
    setDataProcessing() {
      if (!this.dataForm.dataProcessing) this.dataForm.dataProcessing = defaultDataHandler
      this.text = this.dataForm.dataProcessing
      this.$nextTick(() => {
        this.$refs.CodeEditor && this.$refs.CodeEditor.changeEditor({ value: this.text, options: this.jsOptions })
      })
    },
    querySearch(queryString, cb) {
      const restaurants = this.restaurants;
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      cb(results);
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    removeHeaders(index, type) {
      this[type === 1 ? 'echoReqHeaders' : 'requestHeaders'].splice(index, 1)
    },
    addHeaders(type) {
      this[type === 1 ? 'echoReqHeaders' : 'requestHeaders'].push({
        field: '',
        defaultValue: ''
      })
    },
    removeParameter(index, type) {
      this.$confirm('此操作删除该参数, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        this[type === 1 ? 'echoReqParameters' : 'requestParameters'].splice(index, 1)
      }).catch(() => { });
    },
    addParameter(type, item) {
      this.fieldFormVisible = false
      const key = this.sqlType == 1 ? 'echoReqParameters' : 'requestParameters'
      if (type === 'add') return this[key].push(deepClone(item))
      for (let i = 0; i < this[key].length; i++) {
        if (item.id === this[key][i].id) {
          this.$set(this[key], i, deepClone(item))
          break
        }
      }
    },
    addOrUpdateHandle(item, type) {
      this.sqlType = type || 0
      const data = item ? JSON.parse(JSON.stringify(item)) : null
      const parameters = type == 1 ? this.echoReqParameters : this.requestParameters
      this.fieldFormVisible = true
      this.$nextTick(() => {
        this.$refs.fieldForm.init(data, parameters)
      })
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.requestParameters.splice(evt.oldIndex, 1)[0]
          this.requestParameters.splice(evt.newIndex, 0, targetRow)
        },
        handle: '.drag-handler',
      })
    },
    editFunc() {
      if (!this.dataForm.dataProcessing) this.dataForm.dataProcessing = defaultDataHandler
      this.$nextTick(() => {
        this.formScriptVisible = true
      })
    },
    updateScript(data) {
      this.dataForm.dataProcessing = data
    },
    handleItemClick(item) {
      if (!item.field) return
      this.$refs.SQLEditorRef.insert('{' + item.field + '}')
    },
    dataFormSubmit() {
      if (this.dataForm.dataType !== 2) {
        this.btnLoading = true
        this.dataForm.dataProcessing = this.text
        this.handleSubmit()
      } else {
        this.$refs['dataForm'].validate(valid => {
          if (valid) {
            this.btnLoading = true
            this.handleSubmit()
          }
        })
      }
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve(this.treeData)
      }
      DataModelFieldList(this.dataForm.dbLinkId, node.data.table).then(res => {
        resolve(res.data.list.map(o => ({ ...o, isLeaf: true })))
      })
    },
    search() {
      this.getTableList();
    },
    handleSubmit() {
      this.dataForm.requestHeaders = JSON.stringify(this.requestHeaders)
      this.dataForm.requestParameters = JSON.stringify(this.requestParameters)
      this.dataForm.propertyJson.echoReqHeaders = this.echoReqHeaders || []
      this.dataForm.propertyJson.echoReqParameters = this.echoReqParameters || []
      this.dataForm.propertyJson.pageParameters = this.pageParameters
      this.dataForm.propertyJson.echoParameters = this.echoParameters
      let query = JSON.parse(JSON.stringify(this.dataForm))
      query.propertyJson = JSON.stringify(query.propertyJson)
      const formMethod = this.dataForm.id ? updateDataInterface : createDataInterface
      formMethod(query).then(res => {
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
    handleShowPageExplain() {
      this.pageExplainVisible = true
      this.$nextTick(() => {
        this.$refs.pageExplain.init()
      })
    },
    getShowSqlBox() {
      if (this.dataForm.dataType !== 1) return false
      if (this.active === 1) return true
      if (this.dataForm.checkType && (this.active === 2 || this.active === 3)) return true
    },
    getShowApiBox() {
      if (this.dataForm.dataType !== 3) return false
      if (this.active === 1) return true
      if (this.dataForm.checkType && this.active === 2) return true
    }
  }
}
</script>
<style lang="scss" scoped>
.tips {
  float: right;
  color: #8492a6;
  padding-left: 10px;
}
.jsTips {
  -ms-flex-negative: 0;
  flex-shrink: 0;
  padding: 8px 16px;
  background-color: #ecf8ff;
  border-radius: 4px;
  border-left: 5px solid #50bfff;
  font-size: 14px;
  line-height: 24px;
  color: #5e6d82;
}
.jsStaticData {
  flex: 1;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  padding: 10px;
  .json-box {
    flex: 1;
  }
}
.monaco-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.steps {
  width: unset;
  overflow: auto;
  padding: 6px 20px;
  background: #fff;
  justify-items: flex-start;
  .el-step {
    width: 155px;
  }
}
.page-explain {
  cursor: pointer;
  float: right;
  color: #606266;
}
.flow-form-main {
  >>> .main {
    padding: 0 !important;
  }
  >>> .el-tabs__header {
    padding: 0;
    margin-bottom: 0;
    .el-tabs__item {
      line-height: 50px;
    }
  }
  .config {
    flex: 1;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .tableData {
      flex-shrink: 0;
      width: 350px;
      .box {
        margin-top: 8px;
        border-radius: 4px;
        height: calc(100% - 40px);
        border: 1px solid #dcdfe6;
        overflow: hidden;
        .search-box {
          padding: 10px;
        }
        .tree-box {
          height: calc(100% - 52px);
          overflow: auto;
          overflow-x: hidden;
        }
      }
    }

    .detail {
      flex: 1;
      margin: 0 10px;
      margin-top: -10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .top-box {
        display: flex;
        .main-box {
          flex: 1;
          margin-right: 18px;
        }
      }
      .sql-box {
        border-top: 1px solid #dcdfe6;
        height: calc(100vh - 258px);
        overflow: auto;
      }
    }
  }
  .staticData {
    flex: 1;
    .json-box {
      height: calc(100vh - 210px);
    }
  }
  .parameterList {
    padding-left: 110px;
    margin-bottom: 18px;
    >>> .el-icon-edit-outline,
    >>> .el-icon-delete {
      font-size: 16px;
    }
  }
  .middle-pane {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    margin-top: 10px;
    .right-pane-list {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
      overflow: hidden;
      .cap {
        height: 36px;
        line-height: 36px;
        display: flex;
        color: #606266;
        font-size: 14px;
        padding: 0 10px;
        flex-shrink: 0;
        justify-content: space-between;
        align-items: center;
      }
      .table-actions {
        flex-shrink: 0;
      }
      .list {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      >>> .el-icon-edit-outline,
      >>> .el-icon-delete {
        font-size: 16px;
      }
    }
    .right-pane-btn {
      flex-shrink: 0;
      .el-button {
        width: 100%;
      }
    }
  }
  .right-pane {
    width: 350px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: calc(100% + 9px);
    overflow: hidden;

    .right-pane-list {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
      overflow: hidden;
      .cap {
        height: 38px;
        line-height: 38px;
        display: flex;
        color: #606266;
        font-size: 14px;
        padding: 0 10px;
        flex-shrink: 0;
        justify-content: space-between;
        align-items: center;
      }
      .table-actions {
        flex-shrink: 0;
      }
      .list {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      >>> .el-icon-edit-outline,
      >>> .el-icon-delete {
        font-size: 16px;
      }
    }
    .right-pane-btn {
      flex-shrink: 0;
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>