<template>
  <el-date-picker :type="type === 'year' ? 'monthrange' : (type + 'range')" v-model="innerValue"
    placeholder="请选择" :value-format="valueFormat" :range-separator="separator"
    :picker-options='pickerOptions' style="width:100%" :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder" :format="format"></el-date-picker>
</template>
<script>
export default {
  name: 'JNPF-date-picker',
  components: {},
  props: {
    activeData: {
      default: undefined
    },
    value: {
      default: undefined
    },
    valueFormat: {

      default: undefined
    },
    format: {
      type: String,
      default: 'yyyy-MM-dd HH:mm:ss'
    },
    separator: {
      type: String,
      default: '-'
    },
    startTime: {
      default: undefined
    },
    endTime: {
      default: undefined
    },
    'startPlaceholder': {
      type: String,
      default: '开始日期'
    },
    'endPlaceholder': {
      type: String,
      default: '结束日期'
    },
    type: {
      type: String,
      default: 'datetime'
    }
  },
  data() {
    return {
      innerValue: this.value,
      pickerOptions: {
        disabledDate: (time) => {
          if (!this.startTime && !this.endTime) return false
          if (this.endTime) {
            return time.getTime() < this.startTime || time.getTime() > this.endTime
          } else {
            return time.getTime() < this.startTime
          }
        },
      }
    }
  },
  watch: {
    innerValue(val) {
      this.$emit('input', val)
      this.$emit('change', val)
    },
    value(val) {
      this.innerValue = val
    },
  },
  computed: {
  },
  created() {

  },
  mounted() {
  },
  methods: {

  }

}
</script>
<style lang="scss" scoped>
</style>