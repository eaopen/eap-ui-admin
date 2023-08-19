<template>
  <el-time-picker v-model="innerValue" :placeholder="placeholder" :value-format="valueFormat"
    :picker-options='pickerOptions' :format="format" :disabled="disabled" :clearable="clearable"
    @change="change" :readonly="readOnly" @blur="onblur($event)"></el-time-picker>
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
    placeholder: {
      type: String,
      default: '请选择'
    },
    valueFormat: {
      default: undefined
    },
    format: {
      default: undefined
    },
    startTime: {
      type: String,
      default: undefined
    },
    endTime: {
      type: String,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
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
    readonly(val) {
      this.readOnly = val
    },
  },
  computed: {
    realStartTime() {
      if (!this.startTime) return null
      if (this.startTime.split(':').length == 3) {
        return this.startTime
      } else {
        return this.startTime + ':00'
      }
    },
    realEndTime() {
      if (!this.endTime) return null
      if (this.endTime.split(':').length == 3) {
        return this.endTime
      } else {
        return this.endTime + ':00'
      }
    },
    pickerOptions() {
      return { selectableRange: [`${this.realStartTime || '00:00:00'} - ${this.realEndTime || '23:59:59'}`] }
    },
    readOnly() {
      if (this.readonly) return true
      if (this.startTime && this.endTime && (this.startTime > this.endTime)) return true
      return false
    }
  },
  created() { },
  mounted() { },
  methods: {
    change() {
      this.$emit('input', this.innerValue)
      this.$emit('change', this.innerValue)
    },
    onblur(event) {
      this.$emit('blur', event)
    }
  }
}
</script>