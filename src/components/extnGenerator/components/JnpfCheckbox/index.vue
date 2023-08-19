<template>
  <div>
    <el-checkbox-group v-model="innerValue" :size="size" v-if="optionType==='default'"
      :disabled="disabled">
      <p v-for="(item,i) in options" :key="i"
        :class="direction==='vertical'?border?'select-border':'select-item':'select-horizontal'">
        <el-checkbox :label="item[props.value]" :border="border" @change="onChange()">
          {{item[props.label]}}</el-checkbox>
      </p>
    </el-checkbox-group>
    <el-checkbox-group v-model="innerValue" :size="size" v-else :disabled="disabled">
      <template v-if="direction=='horizontal'">
        <el-checkbox-button v-for="(item,i) in options" :key="i" :label="item[props.value]"
          :border="border" @change="onChange()">
          {{item[props.label]}}</el-checkbox-button>
      </template>
      <template v-else>
        <p v-for="(item,i) in options" :key="i" class="vertical-button">
          <el-checkbox-button :label="item[props.value]" :border="border" @change="onChange()">
            {{item[props.label]}}</el-checkbox-button>
        </p>
      </template>
    </el-checkbox-group>
  </div>
</template>
<script>
export default {
  name: 'JNPF-Checkbox',
  components: {},
  props: {
    value: {
      type: Array,
      default: () => []
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
    value: {
      handler(val) {
        this.innerValue = val || []
      },
      immediate: true
    },
  },
  computed: {},
  mounted() { },
  methods: {
    onChange() {
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