<template>
  <div class="columnDesign-container">
    <div class="main-board">
      <div class="search-box">
        <h4 class="cap">查询字段</h4>
        <el-table :data="columnData.searchList" class="JNPF-common-table" ref="dragTableSearch"
          :row-key="row=>row.__vModel__">
          <el-table-column align="center" label="拖动" width="50">
            <template>
              <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
                title='点击拖动' />
            </template>
          </el-table-column>
          <el-table-column prop="__config__.label" label="列名" v-if="webType!=4" />
          <el-table-column prop="label" label="列名" v-else>
            <template slot-scope="scope">
              <el-input v-model="scope.row.__config__.label" placeholder="列名" />
            </template>
          </el-table-column>
          <el-table-column prop="__vModel__" label="字段" />
          <el-table-column prop="searchType" label="类型">
            <template slot-scope="scope">
              <el-select v-model="scope.row.searchType" placeholder="请选择"
                :disabled="scope.row.jnpfKey!=='comInput'&&scope.row.jnpfKey!=='textarea'">
                <el-option label="等于查询" :value="1"></el-option>
                <el-option label="模糊查询" :value="2"></el-option>
                <el-option label="范围查询" :value="3"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop='searchMultiple' label="是否多选" align="center">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.searchMultiple"
                v-if="['select','depSelect','roleSelect','userSelect','usersSelect','comSelect','posSelect','groupSelect'].includes(scope.row.jnpfKey)">
              </el-checkbox>
              <el-checkbox v-else disabled></el-checkbox>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-divider></el-divider>
      <div class="column-box">
        <h4 class="cap">列表字段</h4>
        <el-table :data="columnData.columnList" class="JNPF-common-table" ref="dragTable"
          :row-key="row=>row.prop">
          <el-table-column align="center" label="拖动" width="50">
            <template>
              <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
                title='点击拖动' />
            </template>
          </el-table-column>
          <el-table-column prop="label" label="列名" v-if="webType!=4" />
          <el-table-column prop="label" label="列名" v-else>
            <template slot-scope="scope">
              <el-input v-model="scope.row.label" placeholder="列名" />
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="字段" />
          <el-table-column prop="sortable" label="排序" width="60" align="center">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.sortable"
                :disabled="scope.row.__config__&&scope.row.__config__.isSubTable" />
            </template>
          </el-table-column>
          <el-table-column prop="align" label="冻结" v-if="columnData.childTableStyle!=2">
            <template slot-scope="scope">
              <el-select v-model="scope.row.fixed" placeholder="请选择" filterable
                :disabled="scope.row.__config__&&scope.row.__config__.isSubTable">
                <el-option v-for="item in fixedOptions" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="align" label="对齐">
            <template slot-scope="scope">
              <el-select v-model="scope.row.align" placeholder="请选择" filterable>
                <el-option v-for="item in alignOptions" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="width" label="宽度">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.width" placeholder="宽度" :min="0" :precision="0"
                controls-position="right" style="width:100%" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="right-board">
      <el-tabs v-model="currentTab" class="top-tabs">
        <el-tab-pane label="查询字段" name="search" />
        <el-tab-pane label="列表字段" name="field" />
        <el-tab-pane label="列表属性" name="column" />
      </el-tabs>
      <div class="field-box">
        <div class="searchList" v-show="currentTab==='search'">
          <el-table :data="searchOptions" class="JNPF-common-table" height="100%"
            @selection-change="searchSelectionChange" ref="searchTable">
            <el-table-column prop="__config__.label" label="查询字段" v-if="webType!=4" />
            <el-table-column prop="__vModel__" label="查询字段" v-else />
            <el-table-column type="selection" width="55" align="center" />
          </el-table>
        </div>
        <div class="columnList" v-show="currentTab==='field'">
          <el-table :data="columnOptions" class="JNPF-common-table" height="100%"
            @selection-change="columnSelectionChange" ref="columnTable">
            <el-table-column prop="label" label="列表字段" v-if="webType!=4" />
            <el-table-column prop="prop" label="列表字段" v-else />
            <el-table-column type="selection" width="55" align="center" />
          </el-table>
        </div>
        <el-scrollbar class="right-scrollbar" v-show="currentTab==='column'">
          <div class="setting-box">
            <el-form :model="columnData" label-width="80px" label-position="left">
              <div class="typeList">
                <div class="item" :class="{'item-box':webType==4}" v-for="(item, index) in typeList"
                  :key="index" @click="toggleType(item.value)">
                  <div class="item-img" :class="{'checked':columnData.type==item.value}">
                    <img :src="item.url" alt="">
                    <div class="icon-checked" v-if="columnData.type==item.value">
                      <i class="el-icon-check"></i>
                    </div>
                  </div>
                  <p class="item-name">{{item.name}}</p>
                </div>
              </div>
              <template v-if="columnData.type==2">
                <el-divider>左侧配置</el-divider>
                <jnpf-form-tip-item class="left-tree-query" tip-label="暂不支持异步的左侧查询" label="左侧查询">
                  <el-switch v-model="columnData.hasTreeQuery"></el-switch>
                </jnpf-form-tip-item>
                <el-form-item label="左侧标题">
                  <el-input v-model="columnData.treeTitle" placeholder="树形标题"></el-input>
                </el-form-item>
                <el-form-item label="数据来源">
                  <el-select v-model="columnData.treeDataSource" placeholder="请选择数据来源"
                    @change="dataTypeChange">
                    <el-option label="数据字典" value="dictionary"></el-option>
                    <el-option label="远端数据" value="api"></el-option>
                    <el-option label="组织数据" value="organize"></el-option>
                    <el-option label="部门数据" value="department"></el-option>
                  </el-select>
                </el-form-item>
                <template v-if="columnData.treeDataSource==='dictionary'">
                  <el-form-item label="数据字典">
                    <DicSelect v-model="columnData.treeDictionary" placeholder="请选择数据字典" />
                  </el-form-item>
                  <el-form-item label="主键字段">
                    <el-select v-model="columnData.treePropsValue" placeholder="请选择主键字段">
                      <el-option label="id" value="id"></el-option>
                      <el-option label="enCode" value="enCode"></el-option>
                    </el-select>
                  </el-form-item>
                </template>
                <template v-if="columnData.treeDataSource==='api'">
                  <el-form-item label="数据接口">
                    <el-row class="jnpf-el-row">
                      <el-col :span="18">
                        <JNPF-TreeSelect :options="dataInterfaceSelector" :isDataInterface="1"
                          v-model="columnData.treePropsUrl" placeholder="请选择数据接口" lastLevel
                          lastLevelKey='categoryId' lastLevelValue='1' clearable
                          @selectChange="getDataInterfaceSelector" />
                      </el-col>
                      <el-col :span="6">
                        <el-button @click="goDataInterface()">
                          添加</el-button>
                      </el-col>
                    </el-row>
                  </el-form-item>
                  <el-form-item label="主键字段">
                    <el-input v-model="columnData.treePropsValue" placeholder="主键字段" />
                  </el-form-item>
                  <el-form-item label="显示字段">
                    <el-input v-model="columnData.treePropsLabel" placeholder="显示字段" />
                  </el-form-item>
                  <el-form-item label="子级字段">
                    <el-input v-model="columnData.treePropsChildren" placeholder="子级字段" />
                  </el-form-item>
                </template>
                <el-form-item label="关联字段">
                  <el-select v-model="columnData.treeRelation" placeholder="请选择关联字段" filterable>
                    <el-option :label="item.__config__.label" :value="item.__vModel__"
                      v-for="(item, index) in list" :key="index"></el-option>
                  </el-select>
                </el-form-item>
                <template v-if="columnData.treeDataSource==='api'">
                  <el-form-item label="数据加载">
                    <el-radio-group v-model="columnData.treeSynType">
                      <el-radio :label="0">同步</el-radio>
                      <el-radio :label="1">异步</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <template v-if="columnData.treeSynType==1">
                    <jnpf-form-tip-item class="left-tree-query" tip-label="提供异步调用的数据接口"
                      label="数据接口">
                      <interface-dialog :value="columnData.treeInterfaceId"
                        :title="columnData.treeInterfaceName" @change="onInterfaceChange" />
                    </jnpf-form-tip-item>
                    <el-table :data="columnData.treeTemplateJson">
                      <el-table-column type="index" width="50" label="序号" align="center" />
                      <el-table-column prop="field" label="参数名称">
                        <template slot-scope="scope">
                          <span class="required-sign">{{scope.row.required?'*':''}}</span>
                          {{scope.row.field}}
                        </template>
                      </el-table-column>
                      <el-table-column prop="value" label="映射参数名">
                        <template slot-scope="scope">
                          <el-input v-model="scope.row.relationField" placeholder="请输入" />
                        </template>
                      </el-table-column>
                    </el-table>
                  </template>
                </template>
              </template>
              <el-divider>表格配置</el-divider>
              <el-form-item label="数据过滤" v-if="webType != 4">
                <el-button style="width: 100%;" @click="filterPanelShow">
                  {{ this.columnData.ruleList && this.columnData.ruleList.length > 0 ? '编辑过滤条件' : '添加过滤条件' }}
                </el-button>
              </el-form-item>
              <Condition ref="conditionpane" :modelType="modelType" :columnData="columnData"
                @ruleConfig="ruleConfig">
              </Condition>
              <template v-if="columnData.type==3">
                <el-form-item label="分组字段">
                  <el-select v-model="columnData.groupField" placeholder="请选择分组字段" clearable
                    filterable>
                    <el-option :label="item.__config__.label" :value="item.__vModel__"
                      v-for="(item, i) in groupFieldOptions" :key="i"></el-option>
                  </el-select>
                </el-form-item>
              </template>
              <template v-if="columnData.type==5">
                <el-form-item label="父级字段">
                  <el-select v-model="columnData.parentField" placeholder="请选择父级字段" filterable>
                    <el-option :label="item.__config__.label" :value="item.__vModel__"
                      v-for="(item, i) in treeFieldOptions" :key="i"></el-option>
                  </el-select>
                </el-form-item>
              </template>
              <el-form-item label="排序类型">
                <el-select v-model="columnData.sort" placeholder="请选择排序类型">
                  <el-option label="升序" value="asc"></el-option>
                  <el-option label="降序" value="desc"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="排序字段">
                <el-select v-model="columnData.defaultSidx" placeholder="请选择排序字段" clearable
                  filterable>
                  <el-option :label="item.__config__.label" :value="item.__vModel__"
                    v-for="(item, i) in groupFieldOptions" :key="i"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="高级查询" v-if="webType != 4">
                <el-switch v-model="columnData.hasSuperQuery"></el-switch>
              </el-form-item>
              <template v-if="columnData.type !==3&&columnData.type !==5">
                <el-form-item label="分页设置">
                  <el-switch v-model="columnData.hasPage"></el-switch>
                </el-form-item>
                <el-form-item label="分页条数" v-if="columnData.hasPage">
                  <el-radio-group v-model="columnData.pageSize">
                    <el-radio-button :label="20">20条</el-radio-button>
                    <el-radio-button :label="50">50条</el-radio-button>
                    <el-radio-button :label="100">100条</el-radio-button>
                    <el-radio-button :label="500">500条</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </template>
              <div v-if="columnData.type==1||columnData.type==2||columnData.type==4">
                <el-form-item label="合计配置">
                  <el-switch v-model="columnData.showSummary"></el-switch>
                </el-form-item>
                <el-form-item label="合计字段" v-if="columnData.showSummary">
                  <el-select v-model="columnData.summaryField" placeholder="请选择合计字段" clearable
                    multiple filterable>
                    <template v-for="(item,i) in groupFieldOptions">
                      <el-option :key="i" :label="item.__config__.label" :value="item.__vModel__"
                        v-if="['comInput','numInput','calculate'].includes(item.__config__.jnpfKey)" />
                    </template>
                  </el-select>
                </el-form-item>
              </div>
              <el-form-item label="子表样式"
                v-if="(columnData.type==1||columnData.type==2)&&webType != 4">
                <el-select v-model="columnData.childTableStyle" placeholder="请选择子表样式">
                  <el-option label="分组展示" :value="1" />
                  <el-option label="折叠展示" :value="2" />
                </el-select>
              </el-form-item>
              <el-divider>按钮配置</el-divider>
              <el-checkbox-group v-model="btnsList" class="btnsList">
                <div v-for="item in btnsOption" :key="item.value">
                  <el-checkbox :label="item.value">
                    <span class="btn-label">{{ item.value | btnText }}</span>
                    <el-input v-model="item.label" />
                  </el-checkbox>
                  <el-button class="upload"
                    v-if="item.value === 'upload'&&btnsList.indexOf('upload')!=-1"
                    @click="setUploaderTemplateJson">请设置导入模板</el-button>
                </div>
              </el-checkbox-group>
              <template v-if="btnsList.includes('batchPrint')">
                <el-form-item label="" label-width="104px">
                  <JNPF-TreeSelect key="sel" :options="printTplList" v-model="columnData.printIds"
                    multiple placeholder="请选择打印模板" lastLevel clearable node-key="id">
                    <div class="printWrap" slot="header">
                      <el-link type="primary" :underline="false" @click="openPrint">添加打印模板
                      </el-link>
                      <el-link type="info" style="position: absolute;right:8px;top: 18px;"
                        @click="refreshPrintOptions" :underline="false">
                        <i class="el-icon-refresh el-icon--right"></i></el-link>
                      <el-divider style="margin: 10px;!important 0;"></el-divider>
                    </div>
                  </JNPF-TreeSelect>
                </el-form-item>
              </template>
              <el-checkbox-group v-model="columnBtnsList" class="btnsList columnBtnList">
                <el-checkbox :label="item.value" v-for="item in columnBtnsOption" :key="item.value">
                  <span class="btn-label">{{ item.value | btnText }}</span>
                  <el-input v-model="item.label" />
                </el-checkbox>
              </el-checkbox-group>
              <template v-if="modelType==1">
                <p class="btn-cap mt-10 mb-10">自定义按钮区
                </p>
                <div class="custom-btns-list">
                  <draggable :list="columnData.customBtnsList" :animation="340" group="customItem"
                    handle=".option-drag">
                    <div v-for="(item, index) in columnData.customBtnsList" :key="index"
                      class="custom-item">
                      <div class="custom-line-icon option-drag">
                        <i class="icon-ym icon-ym-darg" />
                      </div>
                      <p class="custom-line-value">{{item.value}}</p>
                      <el-input v-model="item.label" placeholder="按钮名称" size="small">
                        <template slot="append">
                          <el-button type="primary" @click="editFunc(item)" class="custom-btn">事件
                          </el-button>
                        </template>
                      </el-input>
                      <div class="close-btn custom-line-icon"
                        @click="columnData.customBtnsList.splice(index, 1)">
                        <i class="el-icon-remove-outline" />
                      </div>
                    </div>
                  </draggable>
                </div>
                <div>
                  <el-button type="text" icon="el-icon-plus" @click="addCustomBtn">添加按钮</el-button>
                </div>
              </template>
              <template v-if="webType!=4">
                <el-divider>权限设置</el-divider>
                <el-form-item label="按钮权限">
                  <el-switch v-model="columnData.useBtnPermission"></el-switch>
                </el-form-item>
                <el-form-item label="列表权限">
                  <el-switch v-model="columnData.useColumnPermission"></el-switch>
                </el-form-item>
                <el-form-item label="表单权限">
                  <el-switch v-model="columnData.useFormPermission"></el-switch>
                </el-form-item>
                <el-form-item label="数据权限">
                  <el-switch v-model="columnData.useDataPermission"></el-switch>
                </el-form-item>
              </template>
              <template v-if="modelType==1">
                <el-divider>脚本事件</el-divider>
                <el-form-item label="表格事件" label-width="85px">
                  <el-button style="width: 100%;"
                    @click="addFunc(columnData.funcs.afterOnload,'afterOnload',true)">脚本编写
                  </el-button>
                </el-form-item>
                <el-form-item label="表格行样式" label-width="85px">
                  <el-button style="width: 100%;"
                    @click="addFunc(columnData.funcs.rowStyle,'rowStyle',true)">脚本编写
                  </el-button>
                </el-form-item>
                <el-form-item label="单元格样式" label-width="85px">
                  <el-button style="width: 100%;"
                    @click="addFunc(columnData.funcs.cellStyle,'cellStyle',true)">脚本编写
                  </el-button>
                </el-form-item>
              </template>
            </el-form>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <form-script v-if="formScriptVisible" :key="scriptKey" :value="activeItem.func" ref="formScript"
      :type="activeItem.type" @updateScript="updateScript" @closeDialog="formScriptVisible=false" />
    <custom-btn v-if="customBtnVisible" :key="scriptKey" ref="customBtn"
      @updateCustomBtn="updateCustomBtn" @closeDialog="customBtnVisible=false" />
    <upload-box ref="uploadRef" :visible.sync="uploadBoxVisible" @onConfirm="onConfirm" />
  </div>
</template>
<script>
import { getPrintDevSelector } from '@/api/extn/printDev'
import Condition from './FlowCondition'
import Sortable from 'sortablejs'
import draggable from 'vuedraggable'
import FormScript from './FormScript'
import CustomBtn from './CustomBtn'
import uploadBox from './uploadBox'
import InterfaceDialog from '@/components/extnProcess/PropPanel/InterfaceDialog'
import { getDrawingList } from '@/components/extnGenerator/utils/db'
import { noColumnShowList, noSearchList, useInputList, useDateList } from '@/components/extnGenerator/generator/comConfig'
import { getDataInterfaceSelector } from '@/api/extn/dataInterface'
import { noVModelList, systemComponentsList } from '@/components/extnGenerator/generator/comConfig'
import { getFields } from '@/api/onlineDev/visualDev'
const excludeList = [...noVModelList, 'uploadFz', 'uploadImg', 'colorPicker', 'popupTableSelect', 'relationForm', 'popupSelect', 'calculate', 'groupTitle']
const getSearchMultiple = item => {
  const jnpfKey = item.__config__.jnpfKey
  const searchMultipleList = ['select', 'depSelect', 'roleSelect', 'userSelect', 'usersSelect', 'comSelect', 'posSelect', 'groupSelect']
  if (searchMultipleList.includes(jnpfKey)) return true
  return false
}
const getSearchType = item => {
  const jnpfKey = item.__config__.jnpfKey
  // 等于-1  模糊-2  范围-3
  const fuzzyList = [...useInputList]
  const RangeList = [...useDateList, 'time', 'date', 'numInput', 'calculate']
  if (RangeList.includes(jnpfKey)) return 3
  if (fuzzyList.includes(jnpfKey)) return 2
  return 1
}

const defaultFunc = '({ data, index, request, toast, refresh }) => {\r\n   \r\n}'
const defaultFuncs = '({ data, tableRef, request }) => {\r\n   \r\n}'
const rowStyleDefaultFunc = '({row,rowIndex}) => {\r\n   \r\n}'
const cellStyleDefaultFunc = '({row, column, rowIndex, columnIndex}) => {\r\n   \r\n}'
const defaultColumnData = {
  printIds: [],
  ruleList: [], // 过滤规则
  searchList: [], // 查询字段
  hasSuperQuery: true, // 高级查询
  childTableStyle: 1, // 子表样式
  showSummary: false, // 合计配置
  summaryField: [], // 合计字段
  thousands: false,//千位分割
  thousandsField: [],//千位字段
  columnList: [], // 字段列表
  columnOptions: [], // 字段列表
  defaultColumnList: [], // 所有可选择字段列表
  type: 1, //列表类型
  defaultSidx: '', // 默认排序字段
  sort: 'desc',   // 排序类型
  hasPage: true,  // 列表分页
  pageSize: 20,  // 分页条数
  hasTreeQuery: false, //左侧树查询
  treeTitle: '左侧标题', // 树形标题
  treeDataSource: 'dictionary',  // 树形数据来源
  treeDictionary: '',//数据字典
  treeRelation: '',  // 关联字段
  treeSynType: 0, //数据加载 同步、异步
  treeInterfaceId: '',
  treeInterfaceName: '',
  treeTemplateJson: [],
  treePropsUrl: '',  // 数据选择
  treePropsValue: 'id',  // 主键字段
  treePropsChildren: 'children',  // 子级字段
  treePropsLabel: 'fullName',  // 显示字段
  groupField: '',  // 分组字段
  parentField: '', // 父级字段
  useColumnPermission: false,
  useFormPermission: false,
  useBtnPermission: false,
  useDataPermission: false,
  customBtnsList: [],
  btnsList: [
    { value: 'add', icon: 'el-icon-plus', label: '新增' }
  ],  // 按钮
  columnBtnsList: [
    { value: 'edit', icon: 'el-icon-edit', label: '编辑' },
    { value: 'remove', icon: 'el-icon-delete', label: '删除' }
  ], // 列按钮
  funcs: {
    afterOnload: {
      func: "",
      name: "脚本事件"
    },
    rowStyle: {
      func: "",
      name: "脚本事件"
    },
    cellStyle: {
      func: "",
      name: "脚本事件"
    }
  },
  uploaderTemplateJson: {}
}
const defaultFuncsData = {
  afterOnload: {
    func: "",
    name: "脚本事件"
  },
  rowStyle: {
    func: "",
    name: "脚本事件"
  },
  cellStyle: {
    func: "",
    name: "脚本事件"
  }
}
const defaultBtnsOption = [
  { value: 'add', icon: 'el-icon-plus', label: '新增' },
  { value: 'download', icon: 'el-icon-download', label: '导出' },
  { value: 'upload', icon: 'el-icon-upload2', label: '导入' },
  { value: 'batchRemove', icon: 'el-icon-delete', label: '批量删除' },
  { value: 'batchPrint', icon: 'el-icon-printer', label: '批量打印' },
]
export default {
  name: 'columnDesign',
  props: {
    conf: {
      type: Object,
      default: () => { }
    },
    webType: '',
    modelType: '',
    interfaceId: '',
    templateJson: {
      type: Array,
      default: () => []
    },
  },
  components: { draggable, FormScript, uploadBox, CustomBtn, InterfaceDialog, Condition },
  data() {
    return {
      currentTab: 'column',
      alignOptions: ['left', 'center', 'right'],
      fixedOptions: ['none', 'left', 'right'],
      list: [],
      searchList: [],
      columnList: [],
      columnData: JSON.parse(JSON.stringify(defaultColumnData)),
      btnsOption: defaultBtnsOption,
      columnBtnsOption: [
        { value: 'edit', icon: 'el-icon-edit', label: '编辑' },
        { value: 'remove', icon: 'el-icon-delete', label: '删除' },
        { value: 'detail', icon: 'el-icon-tickets', label: '详情' }
      ],
      columnOptions: [],
      printTplList: [],
      searchOptions: [],
      groupFieldOptions: [],
      thousandsOptions: [],
      treeFieldOptions: [],
      btnsList: [],
      columnBtnsList: [],
      typeList: [
        { url: require('@/assets/images/extn/generator/columnType1.png'), value: 1, name: '普通表格' },
        { url: require('@/assets/images/extn/generator/columnType2.png'), value: 2, name: '左侧树+普通表格' },
        { url: require('@/assets/images/extn/generator/columnType4.png'), value: 4, name: '编辑表格' },
        { url: require('@/assets/images/extn/generator/columnType3.png'), value: 3, name: '分组表格' },
        { url: require('@/assets/images/extn/generator/columnType5.png'), value: 5, name: '树形表格' },
      ],
      dataInterfaceSelector: [],
      formScriptVisible: false,
      customBtnVisible: false,
      dataFilterVisible: false,
      activeItem: {},
      scriptKey: '',
      uploadBoxVisible: false,
    }
  },
  filters: {
    btnText(key) {
      let text = ''
      switch (key) {
        case 'download':
          text = '导出'
          break;
        case 'batchRemove':
          text = '批量删除'
          break;
        case 'batchPrint':
          text = '批量打印'
          break;
        case 'edit':
          text = '编辑'
          break;
        case 'remove':
          text = '删除'
          break;
        case 'detail':
          text = '详情'
          break;
        case 'upload':
          text = '导入'
          break;
        default:
          text = '新增'
          break;
      }
      return text
    }
  },
  watch: {
    'columnData.type': {
      handler(val) {
        if (val == 5) this.columnData.printIds = []
      },
      deep: true,
      immediate: true
    },
    'columnData.ruleList': {
      handler() {
        let ruleData = this.$store.getters.ruleData;
        if (ruleData && ruleData.length > 0 && this.columnData.ruleList.length == 0) {
          this.$set(this.columnData, 'ruleList', JSON.parse(JSON.stringify(ruleData)))
        }
      },
      deep: true,
      immediate: true
    },
    btnsList(val) {
      let list = []
      outer: for (let i = 0; i < this.btnsOption.length; i++) {
        inter: for (let ii = 0; ii < val.length; ii++) {
          if (val[ii] === this.btnsOption[i].value) {
            list.push(this.btnsOption[i])
            break inter;
          }
        }
      }
      this.columnData.btnsList = list
    },
    columnBtnsList(val) {
      let list = []
      outer: for (let i = 0; i < this.columnBtnsOption.length; i++) {
        inter: for (let ii = 0; ii < val.length; ii++) {
          if (val[ii] === this.columnBtnsOption[i].value) {
            list.push(this.columnBtnsOption[i])
            break inter;
          }
        }
      }
      this.columnData.columnBtnsList = list
    }
  },
  created() {
    this.getDataInterfaceSelector()
    if (typeof this.conf === 'object' && this.conf !== null) {
      this.columnData = Object.assign({}, defaultColumnData, this.conf)
      this.columnData.funcs = Object.assign({}, defaultFuncsData, this.columnData.funcs)
    }
    if (this.webType != 4) {
      if (this.columnData.type == 5) this.updateBtnsList(5)
      let list = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__config__ && data.__config__.jnpfKey) {
          const visibility = !data.__config__.visibility || (Array.isArray(data.__config__.visibility) && data.__config__.visibility.includes('pc'))
          if (data.__config__.layout === "colFormItem" && data.__vModel__ && visibility) {
            const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table'
            const id = isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__
            const label = isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label
            data.__vModel__ = id
            data.__config__.label = label
            list.push(data)
          }
        }
      }
      loop(getDrawingList())
      this.list = list
      let columnOptions = list.filter(o => noColumnShowList.indexOf(o.__config__.jnpfKey) < 0 || o.__config__.isStorage == 2)
      let searchOptions = list.filter(o => noSearchList.indexOf(o.__config__.jnpfKey) < 0)
      this.groupFieldOptions = list.filter(o => o.__vModel__.indexOf('-') < 0)
      this.treeFieldOptions = list.filter(o => o.__vModel__.indexOf('-') < 0 && o.__config__.jnpfKey == 'treeSelect')
      this.columnOptions = columnOptions.map(o => ({
        label: o.__config__.label,
        prop: o.__vModel__,
        fixed: 'none',
        align: 'left',
        jnpfKey: o.__config__.jnpfKey,
        sortable: false,
        width: null,
        ...o
      }));
      this.searchOptions = searchOptions.map(o => ({
        label: o.__config__.label,
        prop: o.__vModel__,
        jnpfKey: o.__config__.jnpfKey,
        value: '',
        searchType: getSearchType(o),
        searchMultiple: getSearchMultiple(o),
        ...o
      }));
      this.columnData.columnOptions = columnOptions
      if (!this.columnOptions.length) this.columnData.columnList = []
      if (!this.searchOptions.length) this.columnData.searchList = []
      this.setBtnValue(this.columnData.btnsList, this.btnsOption)
      this.setBtnValue(this.columnData.columnBtnsList, this.columnBtnsOption)
      this.btnsList = this.columnData.btnsList.map(o => o.value)
    }
    if (this.webType == 4) {
      this.btnsOption = [{ value: 'download', icon: 'el-icon-download', label: '导出' }]
      this.columnBtnsOption = []
      this.typeList = this.typeList.filter((ele) => ele.value == 1 || ele.value == 3)
      if (!this.interfaceId) return
      const query = {
        paramList: this.templateJson || []
      }
      getFields(this.interfaceId, query).then(res => {
        let fieldsList = res.data
        this.columnOptions = fieldsList.map(o => ({
          label: "",
          prop: o,
          fixed: 'none',
          align: 'left',
          jnpfKey: 'comInput',
          sortable: false,
          width: null,
          __vModel__: o,
          __config__: {
            jnpfKey: 'comInput',
          }
        }));
        this.searchOptions = fieldsList.map(o => ({
          label: "",
          prop: o,
          jnpfKey: 'comInput',
          value: '',
          searchType: 1,
          __vModel__: o,
          searchMultiple: false,
          __config__: {
            label: "",
            jnpfKey: 'comInput',
          }
        }));
        this.groupFieldOptions = fieldsList.map(o => ({
          label: o,
          prop: o,
          jnpfKey: 'comInput',
          __vModel__: o,
          __config__: {
            label: o,
            jnpfKey: 'comInput',
          }
        }));
        if (!this.columnOptions.length) this.columnData.columnList = []
        if (!this.searchOptions.length) this.columnData.searchList = []
        this.$nextTick(() => {
          this.setListValue(this.columnData.columnList, this.columnOptions, 'column')
          this.setListValue(this.columnData.searchList, this.searchOptions, "search")
        })
      })
    }
    this.columnBtnsList = this.columnData.columnBtnsList.map(o => o.value)
    this.setBtnValue(this.columnData.btnsList, this.btnsOption)
    this.btnsList = this.columnData.btnsList.map(o => o.value)
  },
  mounted() {
    this.setSort()
    this.$nextTick(() => {
      this.setListValue(this.columnData.columnList, this.columnOptions, 'column')
      this.setListValue(this.columnData.searchList, this.searchOptions, "search")
      this.getPrintTplList()
      if (this.btnsList.indexOf('upload') != -1) this.setDefaultUpLoadData()
    })
  },
  methods: {
    refreshPrintOptions() {
      getPrintDevSelector(2).then(res => {
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
    getPrintTplList() {
      this.$store.dispatch('base/getPrintFormTree').then(res => {
        let list = res.filter(o => o.children && o.children.length)
        this.printTplList = list.map(o => ({
          ...o,
          hasChildren: true
        }))
      })

    },
    filterPanelShow() {
      this.$refs.conditionpane.show(this.columnData.ruleList)
    },
    ruleConfig(data) {
      this.columnData.ruleList = data
    },
    setBtnValue(replacedData, data, key) {
      key = key ? key : 'value'
      outer: for (let i = 0; i < replacedData.length; i++) {
        inter: for (let ii = 0; ii < data.length; ii++) {
          if (replacedData[i][key] === data[ii][key]) {
            data[ii] = replacedData[i]
            break inter
          }
        }
      }
    },
    setListValue(replacedData, data, type) {
      const key = type === 'column' ? 'prop' : '__vModel__'
      let res = []
      outer: for (let i = 0; i < replacedData.length; i++) {
        inter: for (let ii = 0; ii < data.length; ii++) {
          if (replacedData[i][key] === data[ii][key]) {
            if (type === 'column') {
              data[ii].fixed = replacedData[i].fixed
              data[ii].align = replacedData[i].align
              data[ii].width = replacedData[i].width
              data[ii].sortable = replacedData[i].sortable
              if (this.webType == 4) data[ii].label = replacedData[i].label
            }
            if (type === 'search') {
              data[ii].searchType = replacedData[i].searchType
              data[ii].searchMultiple = replacedData[i].searchMultiple
              if (this.webType == 4) data[ii].__config__.label = replacedData[i].__config__.label
            }
            res.push(data[ii])
            break inter
          }
        }
      }
      res.forEach(row => {
        this.$refs[type + 'Table'].toggleRowSelection(row, true)
      })
    },
    setDefaultUpLoadData() {
      let selectKey = this.columnData.uploaderTemplateJson.selectKey
      const newList = []
      for (let i = 0; i < selectKey.length; i++) {
        const element = selectKey[i];
        if (this.list.some(item => item.__vModel__ == element)) newList.push(element)
      }
      for (let i = 0; i < this.list.length; i++) {
        const element = this.list[i]
        const required = element.__config__.required
        const jnpfKey = element.__config__.jnpfKey
        if (!excludeList.includes(jnpfKey)) {
          if ((required || systemComponentsList.includes(jnpfKey))) {
            if (!selectKey.includes(element.__vModel__)) {
              newList.push(element.__vModel__)
            }
          }
        }
      }
      this.columnData.uploaderTemplateJson.selectKey = newList
    },
    /**
      * 供父组件使用 获取列表JSON
    */
    getData() {
      if (this.btnsList.includes('batchPrint') && this.columnData.printIds.length === 0) {
        return this.$message.warning('请选择打印模板')
      }
      if (!this.columnData.printIds) return this.$message.warning('请选择打印模板')
      if (!this.columnData.columnList.length) return this.$message.warning('列表字段不允许为空')
      if (!this.columnData.uploaderTemplateJson.selectKey && this.btnsList.indexOf('upload') != -1) return this.$message.warning('请设置导入模板')
      if (this.columnData.type == 2) {
        if (this.columnData.treeDataSource === 'dictionary' && !this.columnData.treeDictionary) return this.$message.warning('请选择数据字典')
        if (this.columnData.treeDataSource === 'api') {
          if (!this.columnData.treePropsValue) return this.$message.warning('请输入主键字段')
          if (!this.columnData.treePropsLabel) return this.$message.warning('请输入显示字段')
          if (!this.columnData.treePropsChildren) return this.$message.warning('请输入子级字段')
        }
        if (!this.columnData.treeRelation) return this.$message.warning('请选择关联字段')
        if (!this.columnData.treeInterfaceId && this.columnData.treeSynType == 1) return this.$message.warning('请选择异步数据接口')
      }
      if (this.columnData.type == 3) {
        if (!this.columnData.groupField) return this.$message.warning('请选择分组字段')
      }
      if (this.columnData.type == 5) {
        if (!this.columnData.parentField) return this.$message.warning('请选择父级字段')
      }
      this.columnData.defaultColumnList = this.columnOptions.map(o => ({
        ...o,
        checked: this.columnData.columnList.some(i => i.prop === o.prop)
      }))
      return this.columnData
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.columnData.columnList.splice(evt.oldIndex, 1)[0]
          this.columnData.columnList.splice(evt.newIndex, 0, targetRow)
        },
        handle: '.drag-handler',
      })
      const el2 = this.$refs.dragTableSearch.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      Sortable.create(el2, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.columnData.searchList.splice(evt.oldIndex, 1)[0]
          this.columnData.searchList.splice(evt.newIndex, 0, targetRow)
        },
        handle: '.drag-handler',
      })
    },
    searchSelectionChange(val) {
      this.$set(this.columnData, 'searchList', val)
    },
    columnSelectionChange(val) {
      this.$set(this.columnData, 'columnList', val)
    },
    getDataInterfaceSelector() {
      getDataInterfaceSelector().then(res => {
        this.dataInterfaceSelector = res.data
      })
    },
    dataTypeChange() {
      this.columnData.treePropsValue = 'id'
      this.columnData.treePropsChildren = 'children'
      this.columnData.treePropsLabel = 'fullName'
      this.columnData.treeSynType = 0;
    },
    addCustomBtn() {
      const id = this.jnpf.idGenerator()
      this.columnData.customBtnsList.push({
        value: 'btn_' + id,
        label: '按钮' + id,
        event: {
          func: ''
        }
      })
    },
    editFunc(item) {
      if (!item.event.func) item.event.func = defaultFunc
      this.activeItem = item
      this.customBtnVisible = true
      this.$nextTick(() => {
        this.$refs.customBtn.init('pc', item.event, this.webType, this.columnOptions)
      })
    },
    updateScript(func) {
      this.activeItem.func = func
    },
    updateCustomBtn(val) {
      this.columnData.customBtnsList.forEach((ele, index) => {
        if (ele.value == this.activeItem.value) this.$set(this.columnData.customBtnsList[index], 'event', val)
      })
    },
    addFunc(item, type) {
      if (!item.func && type == 'afterOnload') item.func = defaultFuncs
      if (!item.func && type == 'rowStyle') item.func = rowStyleDefaultFunc
      if (!item.func && type == 'cellStyle') item.func = cellStyleDefaultFunc
      this.activeItem = item
      this.activeItem.type = type
      this.formScriptVisible = true
      this.$nextTick(() => {
        this.$refs.formScript.init()
      })
    },
    setUploaderTemplateJson() {
      this.uploadBoxVisible = true
      this.$nextTick(() => {
        const selectData = this.columnData.uploaderTemplateJson.selectKey ? this.columnData.uploaderTemplateJson.selectKey : []
        const dataType = this.columnData.uploaderTemplateJson.dataType ? this.columnData.uploaderTemplateJson.dataType : ''
        this.$refs.uploadRef.init(this.list, selectData, dataType)
      })
    },
    onConfirm(data) {
      this.columnData.uploaderTemplateJson = data
    },
    onInterfaceChange(id, row) {
      if (!id) {
        this.columnData.treeInterfaceId = ''
        this.columnData.treeInterfaceName = ''
        this.columnData.treeTemplateJson = []
        return
      }
      if (this.columnData.treeInterfaceId === id) return
      this.columnData.treeInterfaceId = id
      this.columnData.treeInterfaceName = row.fullName
      this.columnData.treeTemplateJson = row.templateJson ? row.templateJson.map(o => ({
        ...o,
        relationField: ''
      })) : []
    },
    goDataInterface() {
      let src = window.location.protocol + "//" + window.location.host + "/systemData/dataInterface"
      window.open(src, "_blank")
    },
    toggleType(val) {
      if (this.columnData.type == val) return;
      this.columnData.type = val;
      this.columnData.childTableStyle = 1
      this.updateBtnsList(val)
    },
    updateBtnsList(val) {
      if (this.webType == '4') return
      if (val == 5) {
        this.btnsOption = [defaultBtnsOption[0]]
        this.btnsList = this.btnsList.filter(o => o === 'add');
      } else {
        this.btnsOption = defaultBtnsOption
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import './index.scss';

.printWrap {
  padding: 10px 0;
  text-align: center;
  >>> .el-divider--horizontal {
    margin: 10px 0 !important;
  }
}
.jnpf-el-row {
  >>> .el-input__inner {
    border-radius: 4px 0 0 4px !important;
  }

  >>> .el-button {
    border-left: 0;
    background-color: #f5f7fa;
    font-size: 13px;
    color: #909399;
    border-radius: 0 4px 4px 0;
    line-height: 12px;
  }
  >>> .el-button:hover {
    border-color: #dcdfe6;
  }
}
</style>
