<template>
  <div class="comSelect-container">
    <el-row class="OBPM-el-row">
      <el-col :span="18">
        <JNPF-TreeSelect :options="treeData" v-model="innerValue" :placeholder="placeholder"
          clearable :disabled="disabled" v-on="$listeners" lastLevel>
        </JNPF-TreeSelect>
      </el-col>
      <el-col :span="6">
        <el-button @click="goDictionary()">
          添加</el-button>
      </el-col>
    </el-row>
    <div>
      <el-dialog :visible.sync="dicVisible" append-to-body
        class="OBPM-dialog JNPF-dialog_center JNPF-dialog-tree-select" lock-scroll width="80%"
        @close="closeDic()">
        <dicIndex ref="dicIndex"></dicIndex>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import dicIndex from '@/views/extn/dictionary/index.vue';
export default {
  components: {
    dicIndex
  },
  name: 'dicSelect',
  props: ["value", "disabled", "placeholder"],
  model: {
    prop: 'value',
    event: 'input'
  },
  data() {
    return {
      treeData: [],
      innerValue: this.value,
      dicVisible: false,
    }
  },
  methods: {
    async getData() {
      this.treeData = await this.$store.dispatch('extnGenerator/getDicTree')
    },
    async getNewData() {
      this.$store.commit('extnGenerator/SET_DIC_TREE', [])
      this.treeData = await this.$store.dispatch('extnGenerator/getDicTree')
    },
    closeDic() {
      this.getNewData()
    },
    goDictionary() {
      this.dicVisible = true
      this.$nextTick(() => {
        this.$refs.dicIndex.initData()
      })
    },
  },
  created() {
    this.getData()
  },
  watch: {
    innerValue(val) {
      val && this.$emit('change', val)
    },
    value(val) {
      this.innerValue = val
    }
  }
}
</script>
<style lang="scss" scoped>
.comSelect-container {
  .el-select {
    width: 100%;
  }
}
.jnpf-el-row {
  >>> .el-input__inner {
    border-radius: 4px 0 0 4px !important;
  }

  >>> .el-button {
    border-left: 0;
    background-color: #f5f7fa;
    font-size: 13px;
    color: #909399;
    border-radius: 0 4px 4px 0;
    line-height: 12px;
  }
  >>> .el-button:hover {
    border-color: #dcdfe6;
  }
}
</style>