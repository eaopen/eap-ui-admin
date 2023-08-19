<template>
  <el-autocomplete v-model="innerValue" :fetch-suggestions="querySearchAsync" style="width:100%"
    :placeholder="placeholder" @select="handleSelect" :disabled="disabled" :clearable="clearable"
    popper-class="sale-order-popper">
    <template slot-scope="{ item }">
      <div class="sale-order-popper-item">
        <span>{{ item[relationField] }}</span>
      </div>
    </template>
  </el-autocomplete>
</template>
<script>
import { getDataInterfaceDataSelect } from '@/api/extn/dataInterface'
export default {
  name: 'JnpfAutoComplete',
  components: {},
  props: {
    value: {
      type: String,
      default: ''
    },
    formData: {
      type: Object
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    templateJson: {
      type: Array,
      default: () => []
    },
    interfaceId: {
      type: String,
      default: ''
    },
    relationField: {
      type: String,
      default: 'fullName'
    },
    total: {
      type: Number,
      default: 50
    },
  },
  data() {
    return {
      innerValue: this.value,
      list: [],
      timeout: null
    }
  },
  watch: {
    value(val) {
      this.innerValue = val
    },
    innerValue(val) {
      this.$emit('input', this.innerValue)
      this.$emit('change', this.innerValue)
    }
  },
  mounted() {
  },
  created() {
  },
  mounted() { },
  methods: {
    getParamList() {
      let templateJson = this.templateJson
      for (let i = 0; i < templateJson.length; i++) {
        if (templateJson[i].relationField && this.formData) {
          if (templateJson[i].relationField.includes('-')) {
            let tableVModel = templateJson[i].relationField.split('-')[0]
            let childVModel = templateJson[i].relationField.split('-')[1]
            templateJson[i].defaultValue = this.formData[tableVModel] && this.formData[tableVModel][this.rowIndex] && this.formData[tableVModel][this.rowIndex][childVModel] || ''
          } else {
            templateJson[i].defaultValue = this.formData[templateJson[i].relationField] || ''
          }
        }
      }
      return templateJson
    },
    querySearchAsync(queryString, cb) {
      if (!this.interfaceId) return
      const paramList = this.getParamList()
      paramList.forEach(res => {
        res.defaultValue = res.relationField === '@keyword' ? queryString : res.defaultValue
      })
      let query = {
        interfaceId: this.interfaceId,
        propsValue: this.propsValue,
        relationField: this.relationField,
        pageSize: 10000,
        paramList
      }
      getDataInterfaceDataSelect(this.interfaceId, query).then(res => {
        this.list = res.data.list || []
        cb(this.list.splice(0, this.total))
      }).catch(() => { })

    },
    handleSelect(item) {
      this.innerValue = item[this.relationField] || ''
    }
  }

}
</script>
<style lang="scss" scoped>
.sale-order-popper {
  &.el-autocomplete-suggestion li {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
  .sale-order-popper-item {
    span {
      margin-right: 10px;
    }
    .name {
      color: #1890ff;
    }
  }
}
</style>