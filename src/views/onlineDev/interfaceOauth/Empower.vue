<template>
  <el-dialog title="接口授权" :visible.sync="visible" :modal-append-to-body="false" class="JNPF-dialog JNPF-dialog_center transfer-dialog" lock-scroll append-to-body width="800px">
    <div class="transfer__body">
      <div class="transfer-pane">
        <div class="transfer-pane__tools">
          <el-input placeholder="请输入关键词查询" v-model="keyword" @keyup.enter.native="searchData" clearable class="search-input">
            <el-button slot="append" icon="el-icon-search" @click="searchData"></el-button>
          </el-input>
        </div>
        <div class="transfer-pane__body">
          <el-tree :data="treeData" :props="prop" highlight-current check-on-click-node @node-click="handleNodeClick" class="JNPF-common-el-tree" node-key="id" v-loading="loading" default-expand-all :filter-node-method="filterNode" ref="tree">
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
            <div v-for="(item, index) in selectedData" :key=" index" class="selected-item">
              <span>{{ item.fullName}}</span>
              <i class="el-icon-delete" @click="removeData(index)"></i>
            </div>
          </template>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="confirm">{{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>@/api/extn/interfaceOauth

<script>
import { getDataInterfaceSelector } from '@/api/extn/dataInterface'
import { saveInterfaceList, getInfo } from '@/api/extn/interfaceOauth'

export default {
  data() {
    return {
      visible: false,
      keyword: '',
      loading: false,
      props: {
        children: 'children',
        label: 'fullName',
        isLeaf: 'isLeaf'
      },
      treeData: [],
      selectedData: [],
      identId: '',
    }
  },
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    prop: {
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
  created() {

  },
  methods: {
    init(data) {
      this.identId = data.id
      this.openDialog()
    },
    openDialog() {
      this.visible = true
      this.keyword = ''
      this.selectedData = []
      this.getData()
      this.setDefault()
    },
    confirm() {
      let arr = []
      this.selectedData.forEach(item => { arr.push(item.id) })
      let body = {
        interfaceIdentId: this.identId,
        dataInterfaceIds: arr.join(",")
      }
      saveInterfaceList(body).then(res => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1000,
          onClose: () => {
            this.visible = false
            this.$emit('close')
          }
        })
      })
    },
    setDefault() {
      getInfo(this.identId).then(res => {
        this.selectedData = res.data.list || []
      })
    },
    searchData() {
      this.$refs.tree && this.$refs.tree.filter(this.keyword)
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.props.label].indexOf(value) !== -1;
    },
    getData() {
      this.getAllList()
    },
    getAllList() {
      this.expands = []
      this.loading = true
      getDataInterfaceSelector().then(res => {
        this.treeData = res.data
        this.loading = false
      })
    },
    handleNodeClick(data) {
      if (data.hasChildren) return
      const boo = this.selectedData.some(o => o.id === data.id)
      if (boo) return
      this.multiple ? this.selectedData.push(data) : this.selectedData = [data]
    },
    removeAll() {
      this.selectedData = []
    },
    removeData(index) {
      this.selectedData.splice(index, 1)
    }
  }
}
</script>