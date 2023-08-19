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
    <el-form-item label="远端数据">
      <interface-dialog :value="activeData.interfaceId" :title="activeData.interfaceName"
        popupTitle="远端数据" @change="onInterfaceIdChange" />
    </el-form-item>
    <el-form-item label="显示字段">
      <el-input v-model="activeData.relationField" placeholder="请输入显示字段" />
    </el-form-item>
    <el-table :data="activeData.templateJson" class="auto-table"
      v-if="activeData.templateJson && activeData.templateJson.length">
      <el-table-column type="index" width="50" label="序号" align="center" />
      <el-table-column prop="field" label="参数名称">
        <template slot-scope="scope">
          <span class="required-sign">{{scope.row.required?'*':''}}</span>
          {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
        </template>
      </el-table-column>
      <el-table-column prop="value" label="表单字段">
        <template slot-scope="scope">
          <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable filterable
            @change="onRelationFieldChange($event,scope.row)">
            <el-option v-for="item in formFieldsOptions" :key="item.realVModel"
              :label="item.realLabel" :value="item.realVModel">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <jnpf-form-tip-item label="显示条数" tipLabel="最大值只能设置为50">
      <el-input-number v-model="activeData.total" placeholder="请输入显示条数" :min="1" :max="50"
        :precision="activeData.precision" controls-position="right" />
    </jnpf-form-tip-item>
    <el-form-item label="能否清空">
      <el-switch v-model="activeData.clearable" />
    </el-form-item>
    <el-form-item label="能否搜索" v-if="activeData.__config__.jnpfKey==='popupTableSelect'">
      <el-switch v-model="activeData.filterable" />
    </el-form-item>
    <el-form-item label="能否多选" v-if="activeData.__config__.jnpfKey==='popupTableSelect'">
      <el-switch v-model="activeData.multiple" @change="multipleChange" />
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
import draggable from 'vuedraggable'
import InterfaceDialog from '@/components/extnProcess/PropPanel/InterfaceDialog'
import { noAllowRelationList } from '@/components/extnGenerator/generator/comConfig'
import { getDrawingList } from '@/components/extnGenerator/utils/db'
export default {
  props: ['activeData'],
  mixins: [comMixin],
  components: { draggable, InterfaceDialog },
  data() {
    return {
    }
  },
  computed: {
    formFieldsOptions() {
      let list = []
      list.push({ realVModel: '@keyword', realLabel: '@keyword', jnpfKey: '' })
      const loop = (data, parent) => {
        if (!data) return
        if (data.__config__ && this.isIncludesTable(data) && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__vModel__ && !noAllowRelationList.includes(data.__config__.jnpfKey) && data.__vModel__ !== this.activeData.__vModel__) {
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
    isIncludesTable(data) {
      if ((!data.__config__.layout || data.__config__.layout === 'rowFormItem') && data.__config__.jnpfKey !== 'table') return true
      if (this.activeData.__config__.isSubTable) return this.activeData.__config__.parentVModel === data.__vModel__
      return data.__config__.jnpfKey !== 'table'
    },
    onInterfaceIdChange(val, row) {
      if (!val) {
        this.activeData.interfaceId = ''
        this.activeData.interfaceName = ''
        this.activeData.templateJson = []
        this.activeData.__config__.defaultValue = ''
        return
      }
      this.activeData.interfaceId = val
      this.activeData.interfaceName = row.fullName
      this.activeData.templateJson = row.requestParameters ? JSON.parse(row.requestParameters) : []
      this.activeData.__config__.defaultValue = ''
    },
    onRelationFieldChange(val, row) {
      if (!val) return row.jnpfKey = ''
      if (val === '@keyword') return row.jnpfKey = ''
      let list = this.formFieldsOptions.filter(o => o.realVModel === val)
      if (!list.length) return row.jnpfKey = ''
      let item = list[0]
      row.jnpfKey = item.__config__.jnpfKey
    },
  }
}
</script>
<style lang="scss" scoped>
.auto-table {
  margin-bottom: 20px;
}
</style>