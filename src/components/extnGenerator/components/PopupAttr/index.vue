<template>
  <div>
    <template v-if="!isDetail">
      <el-input v-model="innerValue" placeholder="用于展示关联弹窗的属性，且数据不会保存" readonly
        v-if="isStorage==1" />
      <el-input v-model="innerValue" placeholder="用于展示关联弹窗的属性，且数据同时会保存入库" readonly
        v-else-if="isStorage==2" />
    </template>
    <p v-else>{{innerValue}}</p>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'input'
  },
  name: 'popupAttr',
  props: ["showField", "relationField", 'isDetail', 'isStorage', 'defaultValue'],
  data() {
    return {
      innerValue: this.value,
    }
  },
  computed: {
    relationData() {
      if (this.isStorage == 2 && this.defaultValue) {
        this.$emit('input', this.defaultValue)
        return this.innerValue = this.defaultValue
      }
      return this.$store.state.generator.relationData
    }
  },
  created() {
    this.$eventBus.$on('popupAttrEventBus', (val, vModel) => {
      if (!this.showField || !this.relationField || this.relationField != vModel) return
      let obj = val[this.relationField] || {}
      this.innerValue = obj[this.showField] ? obj[this.showField] : ''
      this.$emit('input', this.innerValue)
    })
  },
  watch: {
    relationData: {
      handler(val) {
        if (this.isStorage == 2) return
        if (!this.showField || !this.relationField) return
        let obj = val[this.relationField] || {}
        this.innerValue = obj[this.showField] ? obj[this.showField] : ''
        this.$emit('input', this.innerValue)
      },
      deep: true
    }
  }
}
</script>