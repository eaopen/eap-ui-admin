<template>
  <el-row class="JNPF-common-search-box" :gutter="16" v-if="searchList.length">
    <el-form @submit.native.prevent>
      <el-col :span="6" v-for="(item, index) in searchList" :key="index">
        <el-form-item :label="item.__config__.label" v-show="index<3 || (index>=3 && showAll)">
          <template v-if="useInputList.indexOf(item.__config__.jnpfKey)>-1">
            <el-input v-model="item.value" :placeholder="'请输入'+item.__config__.label" clearable
              class="item">
            </el-input>
          </template>
          <template v-else-if="useDateList.indexOf(item.__config__.jnpfKey)>-1">
            <el-date-picker v-model="item.value" value-format="timestamp" format="yyyy-MM-dd"
              start-placeholder="开始日期" end-placeholder="结束日期" class="item" type="daterange"
              clearable />
          </template>
          <template v-else-if="useSelectList.indexOf(item.__config__.jnpfKey)>-1">
            <el-select v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
              filterable class="item" :multiple="item.searchMultiple">
              <el-option :label="oItem[item.props.props.label]" v-for="(oItem, i) in item.options"
                :value="oItem[item.props.props.value]" :key="i"></el-option>
            </el-select>
          </template>
          <template v-else>
            <template
              v-if="item.__config__.jnpfKey==='numInput'||item.__config__.jnpfKey==='calculate'">
              <num-range v-model="item.value"></num-range>
            </template>
            <template v-if="item.__config__.jnpfKey==='cascader'">
              <el-cascader v-model="item.value" :options="item.options" clearable
                :show-all-levels="item['show-all-levels']" :props="item.props.props" filterable
                :placeholder="'请选择'+item.__config__.label" class="item"></el-cascader>
            </template>
            <template
              v-if="item.__config__.jnpfKey==='time'|| item.__config__.jnpfKey==='timeRange'">
              <el-time-picker v-model="item.value" start-placeholder="开始时间" end-placeholder="结束时间"
                clearable :value-format="item['value-format']" :format="item.format" is-range
                class="item" />
            </template>
            <template v-if="item.__config__.jnpfKey==='date'">
              <JnpfDateRangePicker v-model="item.value" :type="item.type" clearable
                :valueFormat="item['value-format']" :format="item.format" startPlaceholder="开始日期"
                endPlaceholder="结束日期" class="item">
              </JnpfDateRangePicker>
            </template>
            <template v-if="item.__config__.jnpfKey==='dateRange'">
              <el-date-picker v-model="item.value" :type="item.type" clearable
                :value-format="item['value-format']" :format="item.format" start-placeholder="开始日期"
                end-placeholder="结束日期" class="item">
              </el-date-picker>
            </template>
            <template v-if="item.__config__.jnpfKey==='address'">
              <JNPFAddress v-model="item.value" :placeholder="'请选择'+item.__config__.label"
                :level="item.level" class="item" clearable />
            </template>
            <template v-if="item.__config__.jnpfKey==='treeSelect'">
              <JNPF-TreeSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label"
                :options="item.options" :props="item.props.props" class="item" clearable />
            </template>
            <template
              v-if="item.__config__.jnpfKey==='createUser'||item.__config__.jnpfKey==='modifyUser'">
              <userSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item" />
            </template>
            <template
              v-if="item.__config__.jnpfKey==='currOrganize'||item.__config__.jnpfKey==='comSelect'">
              <comSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item" :multiple="item.searchMultiple" />
            </template>
            <template v-if="item.__config__.jnpfKey==='currDept'">
              <depSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item" />
            </template>
            <template v-if="item.__config__.jnpfKey==='currPosition'">
              <posSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item" :multiple="item.searchMultiple" />
            </template>
            <template v-if="item.__config__.jnpfKey==='groupSelect'">
              <groupSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item" :multiple="item.searchMultiple" />
            </template>
            <template v-if="item.__config__.jnpfKey==='roleSelect'">
              <roleSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item" :multiple="item.searchMultiple" />
            </template>
            <template v-if="item.__config__.jnpfKey==='userSelect'">
              <userSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item"
                :selectType="(item.selectType!='all' && item.selectType!='custom')?'all':item.selectType"
                :ableDepIds="item.ableDepIds" :ablePosIds="item.ablePosIds"
                :ableUserIds="item.ableUserIds" :ableRoleIds="item.ableRoleIds"
                :ableGroupIds="item.ableGroupIds" :multiple="item.searchMultiple" />
            </template>
            <template v-if="item.__config__.jnpfKey==='usersSelect'">
              <usersSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item" :selectType="item.selectType" :ableIds="item.ableIds"
                :multiple="item.searchMultiple" />
            </template>
            <template v-if="item.__config__.jnpfKey==='posSelect'">
              <posSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item" :selectType="item.selectType" :ableDepIds="item.ableDepIds"
                :ablePosIds="item.ablePosIds" :multiple="item.searchMultiple" />
            </template>
            <template v-if="item.__config__.jnpfKey==='depSelect'">
              <depSelect v-model="item.value" :placeholder="'请选择'+item.__config__.label" clearable
                class="item" :selectType="item.selectType" :ableDepIds="item.ableDepIds"
                :multiple="item.searchMultiple" />
            </template>
            <template v-if="item.__config__.jnpfKey==='autoComplete'">
              <JnpfAutoComplete v-model="item.value" :placeholder="'请输入'+item.__config__.label"
                :total="item.total" clearable class="item" :relationField="item.relationField"
                :templateJson="item.templateJson" :interfaceId="item.interfaceId" />
            </template>
          </template>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="search()">{{$t('common.search')}}
          </el-button>
          <el-button icon="el-icon-refresh-right" @click="reset()">{{$t('common.reset')}}
          </el-button>
          <template v-if="searchList.length>3">
            <el-button type="text" icon="el-icon-arrow-down" @click="showAll=true" v-if="!showAll">
              展开
            </el-button>
            <el-button type="text" icon="el-icon-arrow-up" @click="showAll=false" v-else>
              收起</el-button>
          </template>
        </el-form-item>
      </el-col>
    </el-form>
  </el-row>
</template>

<script>
import { deepClone } from '@/utils'
import { dyOptionsList, useInputList, useDateList, useSelectList } from '@/components/extnGenerator/generator/comConfig'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'

export default {
  props: ['list', 'initDataJson'],
  data() {
    return {
      showAll: false,
      searchList: [],
      useInputList,
      useDateList,
      useSelectList
    }
  },
  watch: {
    list: {
      handler: function (val) {
        this.searchList = deepClone(val)
        this.buildOptions(this.searchList)
      },
      deep: true,
      immediate: true
    },
    initDataJson: {
      handler: function (val) {
        if (val != '') {
          let initData = JSON.parse(val);
          if (Object.keys(initData).length > 0) {
            for (let key in initData) {
              for (let i = 0; i < this.searchList.length; i++) {
                if (this.searchList[i].__vModel__ === key) {
                  if (this.searchList[i].searchMultiple) {
                    if (this.searchList[i].jnpfKey == "comSelect") {
                      this.searchList[i].value = Array.isArray(initData[key]) && Array.isArray(initData[key][0]) ? initData[key] : [initData[key]]
                    } else {
                      this.searchList[i].value = Array.isArray(initData[key]) ? initData[key] : [initData[key]]
                    }
                  } else {
                    this.searchList[i].value = initData[key]
                  }
                  break;
                }
              }
            }
          }
        }
      }
    }
  },
  computed: {

  },
  methods: {
    buildOptions(componentList) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (config.jnpfKey === 'cascader') cur.props.props.multiple = false
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          let isTreeSelect = config.jnpfKey === 'treeSelect' || config.jnpfKey === 'cascader'
          if (config.dataType === 'dictionary') {
            if (!config.dictionaryType) return
            getDictionaryDataSelector(config.dictionaryType).then(res => {
              cur.options = res.data.list
            })
          }
          if (config.dataType === 'dynamic') {
            if (!config.propsUrl) return
            let query = {
              paramList: config.templateJson || [],
            }
            getDataInterfaceRes(config.propsUrl, query).then(res => {
              let data = res.data
              if (Array.isArray(data)) {
                cur.options = data
              } else {
                cur.options = []
              }
            })
          }
        }
      })
    },
    setProps(componentList) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (config.jnpfKey === 'cascader') cur.props.props.multiple = false
      })
    },
    search() {
      let obj = {}
      for (let i = 0; i < this.searchList.length; i++) {
        const e = this.searchList[i]
        if (e.value) {
          if (Array.isArray(e.value)) {
            if (e.value.length) obj[e.__vModel__] = e.value
          } else {
            obj[e.__vModel__] = e.value
          }
        }
      }
      let queryJson = JSON.stringify(obj) === "{}" ? '' : JSON.stringify(obj)
      this.$emit('search', queryJson)
    },
    reset() {
      this.treeReset()
      this.$emit('reset')
    },
    treeReset() {
      for (let i = 0; i < this.searchList.length; i++) {
        this.searchList[i].value = ''
      }
    }
  }
}
</script>
