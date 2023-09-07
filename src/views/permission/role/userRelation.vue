<template>
  <el-dialog :title="pageTitle" :close-on-click-modal="false" :close-on-press-escape="false"
    :visible.sync="visible" lock-scroll append-to-body
    class="JNPF-dialog JNPF-dialog_center transfer-dialog" width="800px">
    <div class="transfer__body" v-loading="allLoading">
      <div class="transfer-pane">
        <div class="transfer-pane__tools">
          <el-input placeholder="请输入关键词查询" v-model="keyword" @keyup.enter.native="search" clearable
            class="search-input">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </div>
        <div class="transfer-pane__body left-pane">
          <el-tree :data="treeData" :props="props" check-on-click-node @node-click="handleNodeClick"
            class="JNPF-common-el-tree" node-key="id" v-loading="loading" lazy :load="loadNode">
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
          <template v-if="selectedData.length">
            <div v-for="(item, index) in selectedData" :key=" index" class="selected-item">
              <span>{{item.fullName}}</span>
              <i class="el-icon-delete" @click="removeData(index)"></i>
            </div>
          </template>
          <el-empty description="暂无数据" :image-size="120" v-else></el-empty>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
        {{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getUserRelationList, createUserRelation } from '@/api/permission/userRelation'
import { getUserInfoList, getUsersByRoleId, getUsersByRoleOrgId } from '@/api/permission/user'

export default {
  data() {
    return {
      visible: false,
      btnLoading: false,
      allLoading: false,
      pageTitle: '',
      dataForm: {
        objectId: '',
        objectType: 'Role',
        userIds: []
      },
      selectedData: [],
      treeData: [],
      nodeId: '0',
      props: {
        children: 'children',
        label: 'fullName',
        isLeaf: 'isLeaf'
      },
      keyword: '',
      loading: true
    }
  },
  watch: {
    visible(val) {
      if (val) return
      this.$emit('closeDialog')
    }
  },
  methods: {
    init(id, fullName) {
      this.visible = true
      this.dataForm.objectId = id
      this.dataForm.userIds = []
      this.selectedData = []
      this.$nextTick(() => {
        this.pageTitle = this.$t(`role.roleMember`) + ' - ' + fullName
        this.allLoading = true
        this.initData()
        getUserRelationList(this.dataForm.objectId).then(res => {
          this.dataForm.userIds = res.data.ids
          this.getSelectList()
        })
      })
    },
    getSelectList() {
      if (!this.dataForm.userIds.length) return this.allLoading = false
      getUserInfoList(this.dataForm.userIds).then(res => {
        this.selectedData = res.data.list
        this.allLoading = false
      })
    },
    search() {
      this.initData()
    },
    initData() {
      this.loading = true
      if (this.keyword) this.nodeId = '0'
      const query = {
        keyword: this.keyword,
        organizeId: this.nodeId,
        roleId: this.dataForm.objectId
      }
      getUsersByRoleOrgId(query).then(res => {
        this.treeData = res.data
        this.loading = false
      })
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        this.nodeId = '0'
        return resolve(this.treeData)
      }
      this.nodeId = node.data.id
      const query = {
        keyword: this.keyword,
        organizeId: this.nodeId,
        roleId: this.dataForm.objectId
      }
      getUsersByRoleOrgId(query).then(res => {
        resolve(res.data)
      })
    },
    handleNodeClick(data) {
      if (data.type !== 'user') return
      const boo = this.selectedData.some(o => o.id === data.id)
      if (boo) return
      const item = {
        id: data.id,
        fullName: data.fullName
      }
      this.selectedData.push(item)
    },
    removeAll() {
      this.selectedData = []
    },
    removeData(index) {
      this.selectedData.splice(index, 1)
    },
    dataFormSubmit() {
      this.btnLoading = true
      this.dataForm.userIds = this.selectedData.map(o => o.id)
      createUserRelation(this.dataForm).then(res => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            this.visible = false
            this.btnLoading = false
          }
        })
      }).catch(() => {
        this.btnLoading = false
      })
    }
  }
}
</script>