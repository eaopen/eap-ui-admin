<template>
  <div>
    <p class="OBPM-detail-text">
      <span v-if="addonBefore" class="addonBefore">{{ addonBefore }} </span>
      <span class="innerValue">{{ innerValue }}</span>
      <span v-if="addonAfter" class="addonAfter">{{ addonAfter }}</span>
    </p>
    <p v-if="isAmountChinese" class="input-color">{{ amountChineseName }}</p>
  </div>
</template>
<script>
import { getAmountChinese, thousandsFormat } from "@/components/extnGenerator/utils/index"
export default {
  name: 'JNPF-number',
  components: {},
  props: {
    value: {
      type: [Number, String],
      default: undefined
    },
    thousands: {
      type: Boolean,
      default: false
    },
    isAmountChinese: {
      type: Boolean,
      default: false
    },
    addonBefore: {
      type: String,
      default: ''
    },
    addonAfter: {
      type: String,
      default: ''
    },
    precision: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      innerValue: 0,
      amountChineseName: ''
    }
  },
  watch: {
    value: {
      handler(val) {
        this.innerValue = val
        this.thousandSeparator()
      },
      immediate: true
    }
  },
  computed: {},
  created() { },
  mounted() {
  },
  methods: {
    thousandSeparator() {
      if (this.isAmountChinese) this.amountChineseName = getAmountChinese(this.innerValue)
      if (this.thousands) {
        this.innerValue = thousandsFormat(this.innerValue)
      } else {
        this.innerValue = Number(this.innerValue).toFixed(this.precision || 0)
      }
      return this.innerValue
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
.addonBefore {
  padding-right: 8px;
  color: #303133;
}
.addonAfter {
  padding-left: 8px;
  color: #303133;
}
.innerValue {
  color: #606266;
}
.input-color {
  color: #c0c0c0;
}
</style>