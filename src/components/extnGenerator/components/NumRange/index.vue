<template>
  <div class="numRange">
    <el-input-number v-model="min" :controls="false" :precision="precision" placeholder="最小值" @change="onChange" />
    <span class="separator">-</span>
    <el-input-number v-model="max" :controls="false" :precision="precision" placeholder="最大值" @change="onChange" />
  </div>
</template>
<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: ["value","precision"],
  name: 'numRange',
  data() {
    return {
      min: undefined,
      max: undefined
    }
  },
  watch: {
    value(val) {
      this.setDefault()
    },
  },
  created() {
    this.setDefault()
  },
  methods: {
    onChange() {
      if (!this.min && this.min !== 0 && !this.max && this.max !== 0)
        return this.$emit("change", []);
      this.$emit("change", [this.min, this.max])
    },
    setDefault() {
      if (Array.isArray(this.value) && this.value.length === 2) {
        this.min = this.value[0]
        this.max = this.value[1]
      } else {
        this.min = undefined
        this.max = undefined
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.numRange {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 220px;
  .el-input-number {
    flex: 1;
    width: auto;
    >>> .el-input__inner {
      text-align: left;
    }
  }
  .separator {
    margin: 0 5px;
    flex-shrink: 0;
  }
}
</style>