<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.__config__.tipLabel"
        placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="占位提示" v-if="activeData.__config__.jnpfKey !=='editor'">
      <el-input v-model="activeData.placeholder" placeholder="请输入占位提示" />
    </el-form-item>
    <el-form-item label="可选范围"
      v-if="['depSelect','posSelect','usersSelect'].includes(activeData.__config__.jnpfKey)">
      <el-select v-model="activeData.selectType" placeholder="请选择" @change="onTypeChange"
        filterable>
        <el-option v-for="item in selectTypeOptions" :key="item.value" :label="item.label"
          :value="item.value" />
      </el-select>
      <template v-if="activeData.selectType === 'custom'">
        <template v-if="activeData.__config__.jnpfKey==='depSelect'">
          <org-Select v-model="activeData.ableDepIds" title="添加部门" type="department"
            class="mt-10" />
        </template>
        <template v-if="activeData.__config__.jnpfKey==='posSelect'">
          <org-Select v-model="activeData.ableDepIds" title="添加部门" type="department"
            class="mt-10" />
          <org-Select v-model="activeData.ablePosIds" title="添加岗位" type="position" class="mt-10" />
        </template>
        <template v-if="activeData.__config__.jnpfKey==='usersSelect'">
          <org-Select v-model="activeData.ableIds" title="添加用户" type="users" class="mt-10" />
        </template>
      </template>
    </el-form-item>
    <el-form-item label="可选范围" v-if="activeData.__config__.jnpfKey==='userSelect'">
      <el-select v-model="activeData.selectType" placeholder="请选择" @change="onTypeChange"
        filterable>
        <el-option v-for="item in userSelectTypeOptions" :key="item.value" :label="item.label"
          :value="item.value" />
      </el-select>
      <template v-if="activeData.selectType==='custom'">
        <org-Select v-model="activeData.ableDepIds" title="添加部门" type="department" class="mt-10" />
        <org-Select v-model="activeData.ablePosIds" title="添加岗位" type="position" class="mt-10" />
        <org-Select v-model="activeData.ableUserIds" title="添加用户" type="user" class="mt-10" />
        <org-Select v-model="activeData.ableRoleIds" title="添加角色" type="role" class="mt-10" />
        <org-Select v-model="activeData.ableGroupIds" title="添加分组" type="group" class="mt-10" />
      </template>
      <template v-if="['dep','pos','role','group'].includes(activeData.selectType)">
        <el-radio-group v-model="activeData.relationField" class="relation-radio">
          <el-radio :label="item.realVModel" v-for="(item,i) in formFieldsOptions" :key="i">
            {{item.realLabel}}</el-radio>
        </el-radio-group>
      </template>
    </el-form-item>
    <el-form-item label="默认值"
      v-if="activeData.__config__.jnpfKey != 'userSelect' || (activeData.__config__.jnpfKey==='userSelect' && (activeData.selectType == 'all' || activeData.selectType == 'custom'))">
      <com-select v-model="activeData.__config__.defaultValue" placeholder="选择默认值" clearable
        v-if="activeData.__config__.jnpfKey==='comSelect'" :multiple="activeData.multiple"
        :key="key" :disabled="activeData.__config__.defaultCurrent" />
      <dep-select v-model="activeData.__config__.defaultValue" placeholder="选择默认值" clearable
        v-if="activeData.__config__.jnpfKey==='depSelect'" :multiple="activeData.multiple"
        :key="key" :selectType="activeData.selectType" :ableDepIds="activeData.ableDepIds"
        :disabled="activeData.__config__.defaultCurrent" />
      <pos-select v-model="activeData.__config__.defaultValue" placeholder="选择默认值" clearable
        v-if="activeData.__config__.jnpfKey==='posSelect'" :multiple="activeData.multiple"
        :key="key" :selectType="activeData.selectType" :ableDepIds="activeData.ableDepIds"
        :ablePosIds="activeData.ablePosIds" />
      <user-select v-model="activeData.__config__.defaultValue" placeholder="选择默认值" clearable
        v-if="activeData.__config__.jnpfKey==='userSelect'" :multiple="activeData.multiple"
        :key="key" :selectType="activeData.selectType" :ableDepIds="activeData.ableDepIds"
        :ablePosIds="activeData.ablePosIds" :ableUserIds="activeData.ableUserIds"
        :ableRoleIds="activeData.ableRoleIds" :ableGroupIds="activeData.ableGroupIds"
        :disabled="activeData.__config__.defaultCurrent" />
      <users-select v-model="activeData.__config__.defaultValue" placeholder="选择默认值" clearable
        v-if="activeData.__config__.jnpfKey==='usersSelect'" :multiple="activeData.multiple"
        :key="key" :selectType="activeData.selectType" :ableIds="activeData.ableIds" />
      <group-select v-model="activeData.__config__.defaultValue" placeholder="选择默认值" clearable
        v-if="activeData.__config__.jnpfKey==='groupSelect'" :multiple="activeData.multiple" />
      <role-select v-model="activeData.__config__.defaultValue" placeholder="选择默认值" clearable
        v-if="activeData.__config__.jnpfKey==='roleSelect'" :multiple="activeData.multiple"
        :key="key" />
      <el-input :value="setDefaultValue(activeData.__config__.defaultValue)" placeholder="请输入默认值"
        @input="onDefaultValueInput" v-if="activeData.__config__.jnpfKey==='editor'" />
    </el-form-item>
    <el-form-item
      v-if="(activeData.__config__.jnpfKey==='userSelect' && (activeData.selectType == 'all' || activeData.selectType == 'custom')) || activeData.__config__.jnpfKey==='depSelect' || activeData.__config__.jnpfKey==='comSelect' ">
      <el-checkbox label="true" v-model="activeData.__config__.defaultCurrent"
        @change="defaultCurrentChange(activeData.__config__.defaultCurrent, activeData.__config__.jnpfKey)"
        style="float: right;margin-top: -15px;">
        <span v-if="activeData.__config__.jnpfKey==='userSelect'">
          默认为当前登录用户
        </span>
        <span v-else-if="activeData.__config__.jnpfKey==='depSelect'">
          默认为当前登录部门
        </span>
        <span v-else>
          默认为当前登录组织
        </span>
      </el-checkbox>
    </el-form-item>
    <el-form-item label="能否清空" v-if="activeData.__config__.jnpfKey!=='editor'">
      <el-switch v-model="activeData.clearable" />
    </el-form-item>
    <el-form-item label="能否多选" v-if="activeData.__config__.jnpfKey!=='editor'">
      <el-switch v-model="activeData.multiple" @change="multipleChange" />
    </el-form-item>
    <el-form-item label="是否禁用" v-if="activeData.__config__.jnpfKey !=='editor'">
      <el-switch v-model="activeData.disabled" />
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="activeData.__config__.required" />
    </el-form-item>
  </el-row>
</template>
<script>
import comMixin from './mixin';
import OrgSelect from '@/components/extnProcess/OrgSelect'
import { getDrawingList } from '@/components/extnGenerator/utils/db'
const selectTypeOptions = [{
  value: 'all',
  label: '全部'
}, {
  value: 'custom',
  label: '自定义'
}]
const userSelectTypeOptions = [
  ...selectTypeOptions,
  {
    value: 'dep',
    label: '部门组件联动'
  },
  {
    value: 'pos',
    label: '岗位组件联动'
  },
  {
    value: 'role',
    label: '角色组件联动'
  },
  {
    value: 'group',
    label: '分组组件联动'
  },
]
export default {
  props: ['activeData'],
  mixins: [comMixin],
  components: {
    OrgSelect
  },
  data() {
    return {
      selectTypeOptions,
      userSelectTypeOptions,
      relationOptions: [],
      key: +new Date()
    }
  },
  computed: {
    formFieldsOptions() {
      if (this.activeData.selectType === 'all' || this.activeData.selectType === 'custom') return []
      let list = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__config__ && this.isIncludesTable(data) && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__vModel__ && data.__config__.jnpfKey === `${this.activeData.selectType}Select` && data.__vModel__ !== this.activeData.__vModel__) {
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
  created() { },
  methods: {
    onTypeChange() {
      this.$set(this.activeData.__config__, 'defaultValue', this.activeData.multiple ? [] : '')
      this.activeData.ableDepIds = []
      if (this.activeData.__config__.jnpfKey === 'posSelect') {
        this.activeData.ablePosIds = []
      }
      if (this.activeData.__config__.jnpfKey === 'userSelect') {
        this.activeData.ablePosIds = []
        this.activeData.ableUserIds = []
        this.activeData.ableRoleIds = []
        this.activeData.ableGroupIds = []
        this.activeData.relationField = ''
        if (this.activeData.selectType != 'all' && this.activeData.selectType != 'custom') {
          this.$set(this.activeData.__config__, 'defaultValue', null)
          this.$set(this.activeData.__config__, 'defaultCurrent', false)
        }
      }
      this.activeData.__config__.renderKey = +new Date()
      this.key = +new Date()
    },
    isIncludesTable(data) {
      if ((!data.__config__.layout || data.__config__.layout === 'rowFormItem') && data.__config__.jnpfKey !== 'table') return true
      if (this.activeData.__config__.isSubTable) return this.activeData.__config__.parentVModel === data.__vModel__
      return data.__config__.jnpfKey !== 'table'
    },
    multipleChange(val) {
      this.$set(this.activeData.__config__, 'defaultValue', val ? [] : '')
      this.activeData.__config__.renderKey = +new Date()
      this.key = +new Date()
    },
    defaultCurrentChange(val, jnpfKey) {
      if (val) {
        if (jnpfKey === 'comSelect') {
          this.$set(this.activeData.__config__, 'defaultValue', [])
        } else {
          this.$set(this.activeData.__config__, 'defaultValue', null)
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.relation-radio {
  .el-radio {
    margin: 10px 0 0;
    display: block;
  }
}
</style>
