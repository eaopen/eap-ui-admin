<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.__config__.tipLabel"
        placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="占位提示">
      <el-input v-model="activeData.placeholder" placeholder="请输入占位提示" />
    </el-form-item>
    <el-form-item label="格式">
      <el-select v-model="activeData.format" placeholder="请选择日期类型" @change="dateTypeChange"
        filterable>
        <el-option v-for="(item, index) in formatOptions" :key="index" :label="item.label"
          :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="默认值">
      <el-date-picker v-model="activeData.__config__.defaultValue" :type="activeData.type"
        placeholder="选择默认值" :value-format="activeData['value-format']" :format="activeData.format"
        :disabled="activeData.__config__.defaultCurrent">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="">
      <el-checkbox label="true" v-model="activeData.__config__.defaultCurrent"
        @change="defaultCurrentChange" style="float: right;margin-top: -15px;">默认为当前系统时间
      </el-checkbox>
    </el-form-item>
    <el-divider>规则</el-divider>
    <jnpf-form-tip-item label="开始时间" tip-label="系统会限制填写者填写此字段的当天起始日期范围（包含该日期）。该功能不做有效性验证，请自行保证。">
      <el-switch v-model="activeData.__config__.startTimeRule" @change="startTimeRuleChange" />
    </jnpf-form-tip-item>
    <template v-if="activeData.__config__.startTimeRule">
      <el-form-item label="类型">
        <el-select v-model="activeData.__config__.startTimeType" placeholder="请选择类型"
          @change="startType" filterable>
          <el-option v-for="(item, index) in typeOptions" :key="index" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="spacing" label="" v-if="activeData.__config__.startTimeType==1">
        <JnpfDatePicker v-model="activeData.__config__.startTimeValue" :type="activeData.type"
          placeholder="请选择时间" :kay="key2" :valueFormat="activeData['value-format']" clearable
          :format="activeData.format">
        </JnpfDatePicker>
      </el-form-item>
      <el-form-item label="" class="spacing"
        v-else-if="activeData.__config__.startTimeType==4 ||activeData.__config__.startTimeType==5">
        <el-input type="number" v-model="activeData.__config__.startTimeValue" placeholder="请输入"
          min="1" @change="startValue">
          <el-select slot="append" v-model="activeData.__config__.startTimeTarget"
            style="width: 70px;" placeholder="请选择" filterable>
            <el-option v-for="(item, index) in targetOptions" :key="index" :label="item.label"
              :value="item.value" />
          </el-select>
        </el-input>
      </el-form-item>
      <el-form-item label="" class="spacing" v-else-if="activeData.__config__.startTimeType==2">
        <el-select v-model="activeData.__config__.startRelationField" placeholder="请选择关联日期字段"
          filterable>
          <el-option v-for="(item,i) in formFieldsOptions" :key="i" :label="item.realLabel"
            :value="item.realVModel" />
        </el-select>
      </el-form-item>
    </template>
    <jnpf-form-tip-item label="结束时间" tip-label="系统会限制填写者填写此字段的当天起始日期范围（包含该日期）。该功能不做有效性验证，请自行保证。">
      <el-switch v-model="activeData.__config__.endTimeRule" @change="endTimeRuleChange" />
    </jnpf-form-tip-item>
    <template v-if="activeData.__config__.endTimeRule">
      <el-form-item label="类型">
        <el-select v-model="activeData.__config__.endTimeType" placeholder="请选择类型" @change="endType"
          filterable>
          <el-option v-for="(item, index) in typeOptions" :key="index" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="spacing" label="" v-if="activeData.__config__.endTimeType==1">
        <JnpfDatePicker v-model="activeData.__config__.endTimeValue" :type="activeData.type"
          :format="activeData.format" placeholder="请选择时间" :kay="key2" clearable
          :valueFormat="activeData['value-format']">
        </JnpfDatePicker>
      </el-form-item>
      <el-form-item label="" class="spacing"
        v-else-if="activeData.__config__.endTimeType==4 ||activeData.__config__.endTimeType==5">
        <el-input type="number" v-model="activeData.__config__.endTimeValue" placeholder="请输入"
          min="1" @change="endValue">
          <el-select slot="append" v-model="activeData.__config__.endTimeTarget"
            style="width: 70px;" placeholder="请选择" filterable>
            <el-option v-for="(item, index) in targetOptions" :key="index" :label="item.label"
              :value="item.value" />
          </el-select>
        </el-input>
      </el-form-item>
      <el-form-item class="spacing" label="" v-else-if="activeData.__config__.endTimeType==2">
        <el-select v-model="activeData.__config__.endRelationField" placeholder="请选择关联日期字段"
          filterable>
          <el-option v-for="(item,i) in formFieldsOptions" :key="i" :label="item.realLabel"
            :value="item.realVModel" filterable />
        </el-select>
      </el-form-item>
    </template>
    <el-form-item label="能否清空" v-show="showType==='pc'">
      <el-switch v-model="activeData.clearable" />
    </el-form-item>
    <el-form-item label="是否只读" v-show="showType==='pc'">
      <el-switch v-model="activeData.readonly" />
    </el-form-item>
    <el-form-item label="是否禁用">
      <el-switch v-model="activeData.disabled" />
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="activeData.__config__.required" />
    </el-form-item>
  </el-row>
</template>
<script>
import comMixin from './mixin';
import { getDrawingList } from '@/components/extnGenerator/utils/db'
export default {
  props: ['activeData'],
  mixins: [comMixin],
  data() {
    return {
      formatOptions: [
        {
          label: 'yyyy',
          value: 'yyyy'
        },
        {
          label: 'yyyy-MM',
          value: 'yyyy-MM'
        },
        {
          label: 'yyyy-MM-dd',
          value: 'yyyy-MM-dd'
        },
        {
          label: 'yyyy-MM-dd HH:mm',
          value: 'yyyy-MM-dd HH:mm'
        },
        {
          label: 'yyyy-MM-dd HH:mm:ss',
          value: 'yyyy-MM-dd HH:mm:ss'
        }
      ],
      typeOptions: [
        {
          label: '特定时间',
          value: 1
        },
        {
          label: '表单字段',
          value: 2
        },
        {
          label: '填写当前时间',
          value: 3
        },
        {
          label: '当前时间前',
          value: 4
        },
        {
          label: '当前时间后',
          value: 5
        },
      ],
      type: 'date',
      targetOptions: [],
      key2: ''
    }
  },
  watch: {
    'activeData.__config__.startTimeRule'(val) {
      if (!val) {
        this.activeData.__config__.__vModel__startRelationField = ''
        this.activeData.startTime = ''
        this.activeData.__config__.startTimeValue = ''
      }
    },
    'activeData.__config__.endTimeRule'(val) {
      if (!val) {
        this.activeData.__config__.endRelationField = ''
        this.activeData.endTime = ''
        this.activeData.__config__.endTimeValue = ''
      }
    },
    'activeData.format'() {
      this.getTargetOptions()
      this.key2 = +new Date()
    },
  },
  created() {
    this.getTargetOptions()
  },
  mounted() {
  },
  computed: {
    formFieldsOptions() {
      let list = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__config__ && this.isIncludesTable(data) && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__vModel__ && data.__config__.jnpfKey === 'date' && this.isIncludesField(data)) {
          const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table'
          list.push({
            realVModel: isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__,
            realLabel: isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label,
            ...data
          })
        }
      }
      loop(getDrawingList())
      return list
    }
  },
  methods: {
    startValue(val) {
      if (val < 1) this.activeData.__config__.startTimeValue = 1
    },
    endValue(val) {
      if (val < 1) this.activeData.__config__.endTimeValue = 1
    },
    endTimeRuleChange() {
      if (!this.activeData.__config__.endTimeRule) {
        return this.activeData.__config__.endRelationField = ''
      } else {
        return this.activeData.__config__.endTimeType = 1
      }
    },
    startTimeRuleChange() {
      if (!this.activeData.__config__.startTimeRule) {
        return this.activeData.__config__.startRelationField = ''
      } else {
        return this.activeData.__config__.startTimeType = 1
      }
    },
    isIncludesField(data) {
      let vModel = data.__vModel__
      let fieldModal = this.activeData.__vModel__
      if (vModel !== fieldModal) return true
      if (data.__config__.relationTable && !data.__config__.isSubTable) {
        if (vModel === fieldModal) return true
      } else if (data.__config__.isSubTable) {
        if (vModel === fieldModal && this.activeData.__config__.tableName != data.__config__.tableName) return true
      } else if (this.activeData.__config__.isSubTable) {
        if (vModel === fieldModal) return true
      }
      return false
    },
    isIncludesTable(data) {
      if ((!data.__config__.layout || data.__config__.layout === 'rowFormItem') && data.__config__.jnpfKey !== 'table') return true
      if (this.activeData.__config__.isSubTable) return this.activeData.__config__.parentVModel === data.__vModel__
      return data.__config__.jnpfKey !== 'table'
    },
    dateTypeChange(val) {
      this.getTargetOptions()
    },
    startType(val) {
      this.activeData.startTime = null
      this.activeData.__config__.startRelationField = ''
      if (val == 4 || val == 5) {
        this.activeData.__config__.startTimeValue = 1
        this.activeData.__config__.startTimeTarget = 1
      } else if (val == 2) {
        this.activeData.__config__.startTimeValue = ''
      } else {
        this.activeData.__config__.startTimeValue = ''
      }
    },
    endType(val) {
      this.activeData.endTime = null
      this.activeData.__config__.endRelationField = ''
      if (val == 4 || val == 5) {
        this.activeData.__config__.endTimeValue = 1
        this.activeData.__config__.endTimeTarget = 1
      } else {
        this.activeData.__config__.endTimeValue = ''
      }
    },
    getTargetOptions() {
      if (this.activeData.format === 'yyyy') {
        this.targetOptions = [{ label: '年', value: 1 }]
      } else if (this.activeData.format === 'yyyy-MM') {
        this.targetOptions = [{ label: '年', value: 1 }, { label: '月', value: 2 }]
      } else {
        this.targetOptions = [{ label: '年', value: 1 }, { label: '月', value: 2 }, { label: '日', value: 3 }]
      }
      this.activeData.type = this.activeData.format === 'yyyy' ? 'year' : this.activeData.format === 'yyyy-MM' ? 'month' : this.activeData.format === 'yyyy-MM-dd' ? 'date' : 'datetime'
      if (this.activeData.format === 'yyyy' || this.activeData.format === 'yyyy-MM' || this.activeData.format === 'yyyy-MM-dd') return this.type = 'date'
      return this.type = 'datetime'
    },
    defaultCurrentChange(val) {
      if (val) this.activeData.__config__.defaultValue = ''
    }
  }
}
</script>
<style lang="scss" scoped>
.spacing {
  >>> .el-form-item__content {
    margin-top: -10px;
  }
}
</style>
