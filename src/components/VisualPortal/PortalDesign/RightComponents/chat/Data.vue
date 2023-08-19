<template>
  <el-row>
    <el-collapse-item title="数据设置" name="12">
      <el-form-item label="数据类型">
        <el-radio-group v-model="activeData.dataType" size="small" @change="dataTypeChange">
          <el-radio-button label="static">静态数据</el-radio-button>
          <el-radio-button label="dynamic">远端数据</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="数据设置" v-if="activeData.dataType==='static'">
        <el-button @click="showData(activeData.option.defaultValue)">查看</el-button>
      </el-form-item>
      <el-form-item label="数据接口" v-if="activeData.dataType==='dynamic'">
        <interface-dialog :value="activeData.propsApi" :title="activeData.propsName"
          popupTitle="数据接口" @change="propsApiChange" />
      </el-form-item>
      <div v-if="activeData.option.styleType==7&&activeData.jnpfKey=='barChart'">
        <el-table :data="activeData.option.barType">
          <el-table-column prop="title" label="系列" />
          <el-table-column prop="type" label="类型">
            <template slot-scope="scope">
              <el-select v-model="scope.row.type" placeholder="请选择分格类型" filterable>
                <el-option v-for="(item, index) in barTypeList" :key="index" :label="item.label"
                  :value="item.value" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <Refresh v-if="activeData.dataType==='dynamic'&&activeData.propsApi"
        :refresh="activeData.refresh" />
    </el-collapse-item>
    <JSONArea v-if="areaVisible" ref="JSONArea" @refresh="updateOption" />
  </el-row>
</template>
<script>
const barTypeList = [
  { label: '柱体', value: 'bar' },
  { label: '折线', value: 'line' }
]

import JSONArea from '../../components/JSONArea'
//import InterfaceDialog from '@/components/extnProcess/PropPanel/InterfaceDialog'
import Refresh from '../common/Refresh'
export default {
  props: ['activeData'],
  components: {
    JSONArea,
    //InterfaceDialog,
    Refresh
  },
  data() {
    return {
      areaVisible: false,
      barTypeList: barTypeList
    }
  },
  methods: {
    showData(option) {
      this.areaVisible = true
      this.$nextTick(() => {
        this.$refs.JSONArea.init(option)
      })
    },
    updateOption(data) {
      this.activeData.option.defaultValue = data ? JSON.parse(data) : []
    },
    dataTypeChange() {
      this.activeData.propsApi = ''
      this.activeData.propsName = ''
    },
    propsApiChange(val, item) {
      if (val) {
        this.activeData.propsApi = val
        this.activeData.propsName = item.fullName
      } else {
        this.activeData.propsApi = ''
        this.activeData.propsName = ''
      }
    },
  }
}
</script>