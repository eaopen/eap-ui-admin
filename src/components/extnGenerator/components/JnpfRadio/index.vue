<template>
  <div>
    <el-radio-group v-model="innerValue" :size="size" v-if="optionType==='default'"
      :disabled="disabled">
      <p v-for="(item,i) in options" :key="i"
        :class="direction==='vertical'?border?'select-border':'select-item':'select-horizontal'">
        <el-radio :label="item[props.value]" :border="border">
          {{item[props.label]}}</el-radio>
      </p>
    </el-radio-group>
    <el-radio-group v-model="innerValue" :size="size" v-else :disabled="disabled">
      <template v-if="direction=='horizontal'">
        <el-radio-button v-for="(item,i) in options" :key="i" :label="item[props.value]"
          :border="border">
          {{item[props.label]}}</el-radio-button>
      </template>
      <template v-else>
        <p v-for="(item,i) in options" :key="i" class="vertical-button">
          <el-radio-button :label="item[props.value]" :border="border">
            {{item[props.label]}}</el-radio-button>
        </p>
      </template>
    </el-radio-group>
  </div>
</template>
<script>
export default {
  name: 'JNPF-Radio',
  components: {},
  props: {
    value: {
      default: undefined
    },
    options: {
      type: Array,
      default: () => []
    },
    direction: {
      type: String,
      default: 'horizontal'
    },
    border: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'small'
    },
    optionType: {
      type: String,
      default: 'small'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    props: {
      value: "id",
      label: "fullName",
    }
  },
  data() {
    return {
      innerValue: this.value,
    }
  },
  watch: {
    innerValue(val) {
      this.$emit('input', val)
      this.$emit('change', val)
    },
    value: {
      handler(val) {
        this.innerValue = val
      },
      immediate: true
    },
  },
  computed: {},
  mounted() { },
  methods: {}

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
  margin-right: 20px;
}
.vertical-button {
  margin: 5px 0;
}
</style>