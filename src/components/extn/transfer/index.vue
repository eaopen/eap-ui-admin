<template>
  <div class="transfer__body" v-loading="loading" :style="{height}">
    <div class="transfer-pane">
      <div class="transfer-pane__tools">
        <el-input placeholder="输入关键词进行搜索" v-model="filterText" @keyup.enter.native="search"
          clearable>
          <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
        </el-input>
      </div>
      <div class="transfer-pane__body">
        <el-tree :data="treeData" :props="props" default-expand-all ref="treeBox"
          :expand-on-click-node="false" class="JNPF-common-el-tree" node-key="id"
          v-loading="loading" :filter-node-method="filterNode" @node-click="handleNodeClick">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <i :class="data.icon"></i>
            <span class="text">{{node.label}}</span>
          </span>
        </el-tree>
      </div>
    </div>
    <div class="transfer-pane">
      <div class="transfer-pane__tools">
        <span>已选</span>
        <el-button @click="removeAll" type="text" class="removeAllBtn">清空列表</el-button>
      </div>
      <div class="transfer-pane__body shadow right-pane">
        <template>
          <div v-for="(item, index) in selectedTextData" :key=" index" class="selected-item">
            <span>{{ item.fullName}}</span>
            <i class="el-icon-delete" @click="removeData(item,index)"></i>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JNPF-transfer',
  data() {
    return {
      selectedData: [],
      selectedTextData: [],
      filterText: ''
    }
  },
  props: {
    height: {
      type: String,
      default: "400px"
    },
    loading: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    treeData: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    },
    props: {
      type: Object,
      default: () => {
        return { value: "id", label: "fullName", children: "children" };
      }
    },
    type: {
      type: String,
      default: ''
    }
  },
  computed: {
    allList() {
      if (!this.type) return []
      return this.$store.getters[this.type + 'List'] || []
    }
  },
  watch: {
    value(val) {
      this.initHandle()
    },
  },
  methods: {
    initHandle() {
      if (!this.value || !this.value.length) {
        this.selectedTextData = []
        this.selectedData = []
        return
      }
      const arr = this.multiple ? this.value : [this.value]
      let selectedTextData = []
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        inner: for (let j = 0; j < this.allList.length; j++) {
          if (item === this.allList[j].id) {
            selectedTextData.push(this.allList[j])
            break inner
          }
        }
      }
      this.selectedTextData = selectedTextData
      this.selectedData = this.selectedTextData.map(o => o.id)
    },
    search() {
      this.$refs.treeBox.filter(this.filterText);
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.fullName.indexOf(value) !== -1;
    },
    handleNodeClick(data) {
      if (data.type !== this.type) return
      const boo = this.selectedTextData.some(o => o.id === data.id)
      if (boo) return
      this.multiple ? this.selectedTextData.push(data) : this.selectedTextData = [data]
      this.selectedData = this.selectedTextData.map(o => o.id)
      this.$emit('input', this.selectedData)
      this.$emit('getValue', this.selectedData, this.selectedTextData)
    },
    removeData(item, index) {
      this.selectedData.splice(index, 1)
      this.selectedTextData.splice(index, 1)
      this.$emit('input', this.selectedData)
      this.$emit('getValue', this.selectedData, this.selectedTextData)
    },
    removeAll() {
      this.selectedData = []
      this.selectedTextData = []
      this.$emit('input', this.selectedData)
      this.$emit('getValue', this.selectedData, this.selectedTextData)
    },
  }
};
</script>