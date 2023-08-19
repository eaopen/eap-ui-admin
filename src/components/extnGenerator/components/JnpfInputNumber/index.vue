<template>
  <div>
    <template v-if='!controlsPosition'>
      <div class="el-input el-input--small el-input-group el-input-group--prepend el-input--suffix">
        <div class="el-input-group__prepend" v-if="addonBefore">{{ addonBefore }}</div>
        <el-input-number v-model="innerValue" :placeholder="placeholder" :max="max" :min="min"
          :step="step" :precision="precision" :disabled="disabled" v-thousands
          :class="addonBefore&&addonAfter? 'addon':addonBefore?'addonBefore':addonAfter?'addonAfter':'input-number'"
          :controls-position="controlsPosition==='right'?'right':''" :key="key2"
          :controls="!controlsPosition?false:true" @change="change" @blur="onblur($event)">
        </el-input-number>
        <div class="el-input-group__append" v-if="addonAfter">{{ addonAfter }}</div>
      </div>
    </template>
    <template v-else>
      <el-input-number v-model="innerValue" :placeholder="placeholder" :max="max" :min="min"
        :step="step" :precision="precision" :disabled="disabled" class="work-number"
        :controls-position="controlsPosition==='right'?'right':''" @blur="onblur($event)"
        :controls="!controlsPosition?false:true" @change="change">
      </el-input-number>
    </template>
    <p v-if="isAmountChinese" class="amountChinese">{{ amountChineseName }}</p>
  </div>
</template>
<script>
import { getAmountChinese, thousandsFormat } from "@/components/extnGenerator/utils/index"

export default {
  name: 'JNPF-input-number',
  components: {},
  props: {
    controlsPosition: {
      type: String,
      default: ''
    },
    value: {
      type: [Number, String],
      default: undefined
    },
    max: {
      type: Number,
      default: Infinity
    },
    min: {
      type: Number,
      default: -Infinity
    },
    step: {
      type: Number,
      default: 1
    },
    precision: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
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
    placeholder: {
      type: String,
      default: '数字文本'
    },
    addonAfter: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerValue: this.value,
      amountChineseName: '',
      key2: ''
    }
  },
  watch: {
    innerValue: {
      handler(val) {
        this.$emit('input', val || 0)
        this.$emit('change', val || 0)
        this.amountChinese(val)
      },
      immediate: true,
      deep: true
    },
    value: {
      handler(val) {
        this.innerValue = val
        this.amountChinese(this.innerValue)
      },
      deep: true
    },
    isAmountChinese() {
      this.amountChinese(this.innerValue)
    },
    thousands(val) {
      this.key2 = +new Date()
    }
  },
  computed: {

  },
  created() {
    if (!this.innerValue) return this.innerValue = null
    this.amountChinese(this.innerValue)
  },
  directives: {
    thousands: {
      // 被绑定元素插入父节点时调用
      inserted: (el, binding, vnode) => {
        let precision = vnode.child.precision
        let thousands = vnode.context.thousands
        // 获取input节点
        if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
          el = el.getElementsByTagName('input')[0]
        }
        if (thousands) {
          // 千分位
          el.value = vnode.context.format_number_thousandth(el.value)
          // 聚焦转化为数字格式（去除千分位）
          el.onfocus = e => {
            let a = el.value.replace(/,/g, '') //去除千分号的','
            el.value = Number(parseFloat(a)).toFixed(precision)
          }
          el.onblur = e => {
            el.value = vnode.context.delcommafy(el.value)
            el.value = vnode.context.format_number_thousandth(el.value)
          }
        } else {
          el.value = el.value
        }
      },
      componentUpdated: (el, binding, vnode) => {
        // 聚焦转化为数字格式（去除千分位）
        el.focus()
        let precision = vnode.child.precision
        let thousands = vnode.context.thousands
        if (thousands) {
          if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
            el = el.getElementsByTagName('input')[0]
          }
          el.onblur = e => {
            el.value = vnode.context.delcommafy(el.value)
            el.value = vnode.context.format_number_thousandth(el.value)
          }
        }
        el.value = el.value ? el.value : null
      },
      unbind: (el, binding, vnode) => {
        // 聚焦转化为数字格式（去除千分位）
        if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
          el = el.getElementsByTagName('input')[0]
        }
        el.value = el.value ? el.value : null
      }
    }
  },
  mounted() {
  },
  methods: {
    amountChinese(val) {
      if (!this.isAmountChinese) return
      this.amountChineseName = getAmountChinese(val)
    },
    change() {
      if (typeof this.innerValue === 'undefined') this.innerValue = null
    },
    toNonExponential(num) {
      if (num.indexOf('E') !== -1 || num.indexOf('e') !== -1) {
        // 验证是否为科学计数法
        const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
        return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
      } else {
        return num
      }
    },
    format_number_thousandth(num) {
      return thousandsFormat(num)
    },
    delcommafy(num) {
      if (num === null) {
        return null
      }
      if ((num + '').trim() === '') {
        return ''
      }
      num = num.replace(/\$\s?|(,*)/g, '')
      return num
    },
    onblur(event) {
      this.$emit('blur', event)
    }
  }
}
</script>
<style lang="scss" scoped>
.input-number {
  width: 100%;
  border-radius: 4px !important;
  >>> .el-input__inner {
    border-radius: 4px !important;
    text-align: left;
  }
}
.addon {
  width: 100%;
  >>> .el-input__inner {
    border-radius: unset !important;
  }
}
.addonBefore {
  width: 100%;
  >>> .el-input__inner {
    border-top-left-radius: unset !important;
    border-bottom-left-radius: unset !important;
  }
}
.addonAfter {
  width: 100%;
  >>> .el-input__inner {
    border-bottom-right-radius: unset !important ;
    border-top-right-radius: unset !important ;
    border-top-left-radius: 4px !important;
    border-bottom-left-radius: 4px !important;
  }
}
.amountChinese {
  color: #c0c0c0;
}
</style>