<template>
  <div>
    <template v-if="showType=='app'">
      <el-form-item label="显示名称">
        <el-switch v-model="activeData.option.showName">
        </el-switch>
      </el-form-item>
      <el-form-item label="数据类型">
        <el-radio-group v-model="activeData.dataType" size="small" @change="dataTypeChange">
          <el-radio-button label="static">静态数据</el-radio-button>
          <el-radio-button label="dynamic">远端数据</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="数据设置" v-if="activeData.dataType==='static'">
        <el-button @click="showData(activeData.option.defaultValue)">设置</el-button>
      </el-form-item>
      <el-form-item label="数据接口" v-if="activeData.dataType==='dynamic'">
        <interface-dialog :value="activeData.propsApi" :title="activeData.propsName"
          popupTitle="数据接口" @change="propsApiChange" />
      </el-form-item>
      <refresh v-if="activeData.propsApi" :refresh="activeData.refresh" />
      <el-form-item label="行数据">
        <el-button @click="showColumnData(activeData.option.appColumnList)">设置</el-button>
      </el-form-item>
      <jnpf-form-tip-item label="显示条数" tipLabel="置空时，则显示全部数据">
        <el-input-number v-model="activeData.option.appCount" controls-position="right" :min="1"
          :max="99999" />
      </jnpf-form-tip-item>
      <template v-if="activeData.option.showName">
        <el-form-item label="名称大小">
          <el-input-number v-model="activeData.option.nameFontSize" controls-position="right"
            :min="12" :max="25" />
        </el-form-item>
        <el-form-item label="名称加粗">
          <el-switch v-model="activeData.option.nameFontWeight" />
        </el-form-item>
        <el-form-item label="名称颜色" style="height:32px">
          <el-color-picker v-model="activeData.option.nameFontColor" />
        </el-form-item>
      </template>
      <el-form-item label="数据大小">
        <el-input-number v-model="activeData.option.dataFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="数据加粗">
        <el-switch v-model="activeData.option.dataFontWeight" />
      </el-form-item>
      <el-form-item label="数据颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.dataFontColor" />
      </el-form-item>
    </template>
    <template v-else>
      <el-form-item label="风格类型">
        <el-select v-model="activeData.option.styleType" placeholder="请选择风格类型"
          @change="renderKeyChange" filterable>
          <el-option v-for="(item, index) in styleTypeOptions" :key="index" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <template v-if="activeData.option.styleType==1">
        <el-form-item label="显示边框">
          <el-switch v-model="activeData.border">
          </el-switch>
        </el-form-item>
        <el-divider>表头设置</el-divider>
        <el-form-item label="显示表头">
          <el-switch v-model="activeData.option.showHeader" @change="renderKeyChange">
          </el-switch>
        </el-form-item>
        <template v-if="activeData.option.showHeader">
          <el-form-item label="字体大小">
            <el-input-number v-model="activeData.option.headerFontSize" controls-position="right"
              :min="12" :max="25" />
          </el-form-item>
          <el-form-item label="字体加粗">
            <el-switch v-model="activeData.option.headerFontWeight" />
          </el-form-item>
          <el-form-item label="字体颜色" style="height:32px">
            <el-color-picker v-model="activeData.option.headerFontColor" />
          </el-form-item>
          <el-form-item label="字体位置">
            <el-radio-group v-model="activeData.option.headerLeft" size="small">
              <el-radio-button :label="item.value" v-for="(item,index) in alignList" :key="index">
                {{item.label}}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="背景色" style="height:32px">
            <el-color-picker v-model="activeData.option.headerBgColor" />
          </el-form-item>
        </template>
        <el-divider>表格设置</el-divider>
        <el-form-item label="显示序号">
          <el-switch v-model="activeData.option.tableIndex" @change="renderKeyChange">
          </el-switch>
        </el-form-item>
        <el-form-item label="字体大小">
          <el-input-number v-model="activeData.option.tableFontSize" controls-position="right"
            :min="12" :max="25" />
        </el-form-item>
        <el-form-item label="字体颜色" style="height:32px">
          <el-color-picker v-model="activeData.option.tableFontColor" />
        </el-form-item>
      </template>
      <el-form-item label="显示描述" v-if="activeData.option.styleType==3">
        <el-switch v-model="activeData.option.describe">
        </el-switch>
      </el-form-item>
      <jnpf-form-tip-item label="显示条数" tipLabel="置空时，则显示全部数据">
        <el-input-number v-model="activeData.option.tableCount" controls-position="right" :min="1"
          :max="99999" @change="renderKeyChange" />
      </jnpf-form-tip-item>
      <el-form-item label="背景色" style="height:32px">
        <el-color-picker v-model="activeData.option.tableBgColor" />
      </el-form-item>
      <el-form-item label="奇行颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.tableOddLineColor" />
      </el-form-item>
      <el-form-item label="偶行颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.tableEvenLineColor" />
      </el-form-item>
      <el-divider v-if="activeData.option.styleType==1">列数据设置</el-divider>
      <el-form-item label="数据类型">
        <el-radio-group v-model="activeData.dataType" size="small" @change="dataTypeChange">
          <el-radio-button label="static">静态数据</el-radio-button>
          <el-radio-button label="dynamic">远端数据</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="数据设置" v-if="activeData.dataType==='static'">
        <el-button @click="showData(activeData.option.defaultValue)">设置</el-button>
      </el-form-item>
      <el-form-item label="数据接口" v-if="activeData.dataType==='dynamic'">
        <interface-dialog :value="activeData.propsApi" :title="activeData.propsName"
          popupTitle="数据接口" @change="propsApiChange" />
      </el-form-item>
      <Refresh v-if="activeData.propsApi" :refresh="activeData.refresh" />
      <el-form-item :label="activeData.option.styleType==1?'列数据':'行数据'">
        <el-button
          @click="showColumnData(activeData.option.styleType==1?activeData.option.columnData:activeData.option.rowData,activeData.option.styleType)">
          设置</el-button>
      </el-form-item>
    </template>
    <JSONArea v-if="areaVisible" ref="JSONArea" @refresh="updateOption" />
    <ColumnData v-if="columnVisible" ref="columnData" :showType='showType'
      @columnList='columnList' />
  </div>
</template>
<script>
import JSONArea from '../../components/JSONArea'
import ColumnData from './ColumnData'
import { alignList } from '../../components/config'
//import InterfaceDialog from '@/components/Process/PropPanel/InterfaceDialog'
import Refresh from '../common/Refresh'
export default {
  components: { JSONArea
    //, InterfaceDialog
    , ColumnData, Refresh },
  props: ['activeData', 'showType'],
  data() {
    return {
      areaVisible: false,
      alignList,
      columnVisible: false,
      styleTypeOptions: [{ label: '表格', value: 1 },
      { label: '列表（横向）', value: 2 },
      { label: '列表（纵向）', value: 3 },],
    }
  },
  watch: {
  },
  methods: {
    showColumnData(option, type) {
      this.columnVisible = true
      this.$nextTick(() => {
        this.$refs.columnData.init(option, type)
      })
    },
    showData(option) {
      this.areaVisible = true
      this.$nextTick(() => {
        this.$refs.JSONArea.init(option)
      })
    },
    renderKeyChange() {
      this.activeData.renderKey = +new Date()
    },
    updateOption(data) {
      this.activeData.option.defaultValue = data ? JSON.parse(data) : []
      this.renderKeyChange()
    },
    columnList(data) {
      if (!data) return
      if (this.showType === 'app') {
        this.activeData.option.appColumnList = data
      } else {
        if (this.activeData.option.styleType == 1) {
          this.activeData.option.columnData = data
        } else {
          this.activeData.option.rowData = data
        }
      }
      this.renderKeyChange()
    },
    dataTypeChange() {
      this.activeData.propsApi = ''
      this.activeData.propsName = ''
      this.activeData.option.defaultValue = []
      this.renderKeyChange()
    },
    propsApiChange(val, item) {
      if (val) {
        this.activeData.propsApi = val
        this.activeData.propsName = item.fullName
        this.activeData.refresh.autoRefresh = false
      } else {
        this.activeData.propsApi = ''
        this.activeData.propsName = ''
      }
      this.renderKeyChange()
    },

  }
}
</script>