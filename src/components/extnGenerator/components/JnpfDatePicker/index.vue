<template>
  <el-date-picker :type="type" v-model="innerValue" placeholder="请选择" :value-format="valueFormat"
    :picker-options='pickerOptions' :format="format" @change="change" :disabled="disabled"
    @blur="onblur($event)" :clearable="clearable" :readonly="readOnly" :key="key"></el-date-picker>
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
    defaultCurrent: {
      type: Boolean,
      default: false
    },
    valueFormat: {
      type: String,
      default: 'datetime'
    },
    format: {
      type: String,
      default: 'yyyy-MM-dd HH:mm:ss'
    },
    startTime: {
      default: undefined
    },
    endTime: {
      default: undefined
    },
    type: {
      type: String,
      default: 'date'
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
      key: +new Date(),

    }
  },
  watch: {
    value: {
      handler(val) {
        this.innerValue = val
      },
      immediate: true
    },
    format() {
      this.key = +new Date()
    },
  },
  computed: {
    readOnly() {
      if (this.readonly) return true
      if (this.startTime && this.endTime && (this.startTime > this.endTime)) return true
      return false
    },
    realStartTime() {
      const format = this.format === 'yyyy' ? 'yyyy-01-01 00:00:00' : this.format === 'yyyy-MM' ? 'yyyy-MM-01 00:00:00' : 'yyyy-MM-dd 00:00:00'
      if (!this.startTime) return null
      const startTime = this.jnpf.toDate(this.startTime, format)
      return new Date(startTime).getTime()
    },
    realEndTime() {
      if (!this.endTime) return null
      const endTime = this.jnpf.toDate(this.endTime, 'yyyy-MM-dd 23:59:59')
      return new Date(endTime).getTime()
    },
    pickerOptions() {
      return {
        disabledDate: (time) => {
          const timeVal = time.getTime()
          if (!this.realStartTime && !this.realEndTime) return false
          if (this.realStartTime && this.realEndTime) return timeVal < this.realStartTime || timeVal > this.realEndTime
          if (this.realEndTime) return timeVal > this.realEndTime
          return timeVal < this.realStartTime
        }
      }
    }
  },
  methods: {
    change(val) {
      this.$emit('input', this.innerValue)
      this.$emit('change', this.innerValue)
    },
    onblur(event) {
      this.$emit('blur', event)
    }
  }
}
</script>
<style lang="scss">
.el-picker-panel__link-btn.el-button--text {
  display: none;
}
</style>