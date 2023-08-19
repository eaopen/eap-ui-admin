<template>
  <el-select v-model="innerValue" :placeholder="placeholder" :clearable="clearable"
    @change="onChange()" :multiple="multiple" :disabled="disabled" :filterable="filterable">
    <el-option v-for="item in options" :key="item[props.value]" :label="item[props.label]"
      :value="item[props.value]">
    </el-option>
  </el-select>
</template>
<script>
export default {
  name: 'JnpfSelect',
  components: {},
  props: {
    value: {
      default: undefined
    },
    options: {
      type: Array,
      default: () => []
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
    props: {
      label: "fullName",
      value: "id"
    }
  },
  data() {
    return {
      innerValue: this.value,
    }
  },
  watch: {
    value: {
      handler(val) {
        this.innerValue = val
      },
      immediate: true
    },
  },
  computed: {},
  mounted() { },
  methods: {
    onChange() {
      if (this.multiple) this.innerValue = this.innerValue ? this.innerValue : []
      if (!this.multiple) this.innerValue = this.innerValue ? this.innerValue : ""
      this.$emit('input', this.innerValue)
      this.$emit('change', this.innerValue)
    },
  }

}
</script>
<style lang="scss" scoped>
.input-number {
  width: 100%;
  border-radius: 0px !important;
  >>> .el-input__inner {
    border-radius: 0px !important;
  }
}
.select-item {
  display: block;
  margin: 10px 0;
}
.select-border {
  display: block;
  margin: 8px 0;
}
.select-horizontal {
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
  margin: 0 10px;
}
.vertical-button {
  margin: 5px 0;
}
</style>