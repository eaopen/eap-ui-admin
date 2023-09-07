<template>
  <div class="JNPF-common-layout">
    <flow v-if="flowVisible" ref="flow" @close="flowVisible=false" @choiceFlow="choiceFlow" />
    <FlowBox v-if="formVisible" ref="FlowBox" @close="closeForm" />
  </div>
</template>

<script>
import flow from '../flowLaunch/Flow'
import FlowBox from '../components/FlowBox'
export default {
  components: { flow, FlowBox },
  data() {
    return {
      flowVisible: false,
      formVisible: false
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.flowVisible = true
      this.$nextTick(() => {
        this.$refs.flow.init(true)
      })
    },
    choiceFlow(item) {
      let data = {
        id: '',
        enCode: item.enCode,
        flowId: item.id,
        opType: '-1'
      }
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.FlowBox.init(data)
      })
    },
    closeForm() {
      this.formVisible = false
    },
  }
}
</script>
<style lang="scss" scoped>
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #606266;
}
</style>