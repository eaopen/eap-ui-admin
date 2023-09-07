<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main authorize-bd">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack" :content="title" />
        <div class="options">
          <el-dropdown style="margin-right: 8px">
            <el-button plain>
              {{$t('authorize.operation')}}<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleCheck('checkAll')">
                {{$t('authorize.checkAll')}}</el-dropdown-item>
              <el-dropdown-item @click.native="handleCheck('cancelCheckAll')">
                {{$t('authorize.deselectAll')}}
              </el-dropdown-item>
              <el-dropdown-item @click.native="setAllExpand('open')">{{$t('authorize.expandAll')}}
              </el-dropdown-item>
              <el-dropdown-item @click.native="setAllExpand('close')">{{$t('authorize.foldAll')}}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button :disabled="active <= 0 || treeLoading" @click="handlePrevStep">
            {{$t('common.prev')}}
          </el-button>
          <el-button :disabled="active >= 5 || treeLoading" @click="handleNextStep">
            {{$t('common.next')}}
          </el-button>
          <el-button type="primary" :loading="btnLoading" :disabled="active < 5"
            @click="handleConfirm()">{{$t('common.confirmButton')}}</el-button>
          <el-button @click="goBack">{{$t('common.cancelButton')}}</el-button>
        </div>
      </div>
      <el-steps :active="active" finish-status="success" simple>
        <el-step :title="$t('authorize.systemPermission')"></el-step>
        <el-step :title="$t('authorize.menuPermission')"></el-step>
        <el-step :title="$t('authorize.buttonPermission')"></el-step>
        <el-step :title="$t('authorize.listPermission')"></el-step>
        <el-step :title="$t('authorize.formPermission')"></el-step>
        <el-step :title="$t('authorize.dataPermission')"></el-step>
      </el-steps>
      <div class="main">
        <el-form ref="dataForm" :model="dataForm" @keyup.enter.native="handleConfirm()">
          <el-form-item>
            <el-tree :data="authorizeTreeData" ref="authorizeTree" v-loading="treeLoading"
              show-checkbox default-expand-all node-key="id" :check-strictly="checkStrictly"
              check-on-click-node :props="defaultProps" :expand-on-click-node="false"
              @check-change="selectTreeNodeClick">
              <div slot-scope="{ node, data }">
                <i :class="data.icon" />
                <span style="padding-left: 4px;">{{ node.label }}</span>
              </div>
            </el-tree>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  getAuthorizeValues,
  updateAuthorizeList
} from '@/api/permission/authorize'

export default {
  data() {
    return {
      visible: false,
      treeLoading: false,
      btnLoading: false,
      checkStrictly: true,
      objectId: '',
      dataForm: {
        objectType: '',
        module: [],
        systemIds: [],
        button: [],
        column: [],
        form: [],
        resource: []
      },
      params: {
        type: 'system',
        moduleIds: ''
      },
      systemIds: '',
      title: '',
      active: 0,
      systemAllData: [],
      authorizeTreeData: [],
      moduleAuthorizeTree: [],
      buttonAuthorizeTree: [],
      columnAuthorizeTree: [],
      formAuthorizeTree: [],
      resourceAuthorizeTree: [],
      systemAllData: [],
      moduleAllData: [],
      buttonAllData: [],
      columnAllData: [],
      formAllData: [],
      resourceAllData: [],
      moduleIdsTemp: [],
      defaultProps: { // 配置项（必选）
        value: 'id',
        label: 'fullName',
        children: 'children'
      }
    }
  },
  methods: {
    init(id, fullName, type) {
      Object.assign(this.$data, this.$options.data())
      this.visible = true
      this.objectId = id
      this.dataForm.objectType = type
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (type === 'User') {
          this.title = this.$t(`user.userPermission`) + ' - ' + fullName
        } else if (type === 'Position') {
          this.title = this.$t(`position.postPermission`) + '- ' + fullName
        } else if (type === 'Role') {
          this.title = this.$t(`role.rolePermission`) + ' - ' + fullName
        }
        this.getAuthorizeList()
      })
    },
    getAuthorizeList() {
      this.treeLoading = true
      this.authorizeTreeData = []
      getAuthorizeValues(this.objectId, this.params).then(res => {
        switch (this.active) {
          case 0:
            this.systemAuthorizeTree = res.data.list
            this.systemAllData = res.data.all
            this.authorizeTreeData = this.systemAuthorizeTree
            this.dataForm.systemIds = [...this.moduleIdsTemp, ...res.data.ids]
            this.dataForm.systemIds = [...new Set(this.dataForm.systemIds)]
            this.moduleIdsTemp = this.dataForm.systemIds
            this.systemIds = this.moduleIdsTemp
            this.$refs.authorizeTree.setCheckedKeys(this.dataForm.systemIds)
            break
          case 1:
            this.moduleAuthorizeTree = res.data.list
            this.moduleAllData = res.data.all
            this.authorizeTreeData = this.moduleAuthorizeTree
            const moduleIds = [...res.data.ids, ...this.moduleIdsTemp]
            this.dataForm.module = [...new Set(moduleIds)]
            this.moduleIdsTemp = this.dataForm.module
            this.$refs.authorizeTree.setCheckedKeys(this.dataForm.module)
            break
          case 2:
            this.buttonAuthorizeTree = res.data.list
            this.buttonAllData = res.data.all
            this.authorizeTreeData = this.buttonAuthorizeTree
            this.dataForm.button = [...this.dataForm.button, ...res.data.ids, ...this.moduleIdsTemp]
            this.dataForm.button = [...new Set(this.dataForm.button)]
            this.$refs.authorizeTree.setCheckedKeys(this.dataForm.button)
            break
          case 3:
            this.columnAuthorizeTree = res.data.list
            this.columnAllData = res.data.all
            this.authorizeTreeData = this.columnAuthorizeTree
            this.dataForm.column = [...this.dataForm.column, ...res.data.ids, ...this.moduleIdsTemp]
            this.dataForm.column = [...new Set(this.dataForm.column)]
            this.$refs.authorizeTree.setCheckedKeys(this.dataForm.column)
            break
          case 4:
            this.formAuthorizeTree = res.data.list
            this.formAllData = res.data.all
            this.authorizeTreeData = this.formAuthorizeTree
            this.dataForm.form = [...this.dataForm.form, ...res.data.ids, ...this.moduleIdsTemp]
            this.dataForm.form = [...new Set(this.dataForm.form)]
            this.$refs.authorizeTree.setCheckedKeys(this.dataForm.form)
            break
          case 5:
            this.resourceAuthorizeTree = res.data.list
            this.resourceAllData = res.data.all
            this.authorizeTreeData = this.resourceAuthorizeTree
            this.dataForm.resource = [...this.dataForm.resource, ...res.data.ids, ...this.moduleIdsTemp]
            this.dataForm.resource = [...new Set(this.dataForm.resource)]
            this.$refs.authorizeTree.setCheckedKeys(this.dataForm.resource)
            break
        }
        this.checkStrictly = false
        this.treeLoading = false
      }).catch(() => {
        this.treeLoading = false
      })
    },
    goBack() {
      this.$emit('close')
    },
    // 全选/全不选
    handleCheck(val) {
      if (val === 'checkAll') {
        switch (this.active) {
          case 0:
            this.$refs.authorizeTree.setCheckedKeys(this.systemAllData)
            break
          case 1:
            this.$refs.authorizeTree.setCheckedKeys(this.moduleAllData)
            break
          case 2:
            this.$refs.authorizeTree.setCheckedKeys(this.buttonAllData)
            break
          case 3:
            this.$refs.authorizeTree.setCheckedKeys(this.columnAllData)
            break
          case 4:
            this.$refs.authorizeTree.setCheckedKeys(this.formAllData)
            break
          case 5:
            this.$refs.authorizeTree.setCheckedKeys(this.resourceAllData)
            break
        }
      }
      if (val === 'cancelCheckAll') {
        this.$refs.authorizeTree.setCheckedKeys([])
      }
    },
    // 折叠 展开
    setAllExpand(state) {
      let result
      if (state === 'open') {
        result = true
      }
      if (state === 'close') {
        result = false
      }
      const nodes = this.$refs.authorizeTree.store.nodesMap
      for (let i in nodes) {
        nodes[i].expanded = result
      }
    },
    // 上一步
    handlePrevStep() {
      this.active -= 1
      this.handelInitData()
    },
    // 下一步
    handleNextStep() {
      if (this.active++ > 4) this.active = 0
      this.handelInitData()
    },
    handelInitData() {
      this.checkStrictly = true
      this.treeLoading = true
      switch (this.active) {
        case 0:
          this.params.type = 'system'
          this.params.moduleIds = (this.moduleIdsTemp).toString()
          break
        case 1:
          this.params.type = 'module'
          this.params.moduleIds = (this.systemIds).toString()
          break
        case 2:
          this.params.type = 'button'
          this.params.moduleIds = (this.moduleIdsTemp).toString()
          break
        case 3:
          this.params.type = 'column'
          this.params.moduleIds = (this.moduleIdsTemp).toString()
          break
        case 4:
          this.params.type = 'form'
          this.params.moduleIds = (this.moduleIdsTemp).toString()
          break
        case 5:
          this.params.type = 'resource'
          this.params.moduleIds = (this.moduleIdsTemp).toString()
          break
      }
      this.getAuthorizeList()
    },
    // 设置数据
    selectTreeNodeClick() {
      const parentIds = this.$refs.authorizeTree.getHalfCheckedKeys()
      const childrenIds = this.$refs.authorizeTree.getCheckedKeys()
      const newIds = [...parentIds, ...childrenIds]
      const dataIds = [...new Set(newIds)]
      switch (this.active) {
        case 0:
          this.dataForm.systemIds = dataIds
          this.moduleIdsTemp = this.dataForm.systemIds
          this.systemIds = this.moduleIdsTemp
          break
        case 1:
          this.dataForm.module = dataIds
          this.moduleIdsTemp = this.dataForm.module
          break
        case 2:
          this.dataForm.button = dataIds
          break
        case 3:
          this.dataForm.column = dataIds
          break
        case 4:
          this.dataForm.form = dataIds
          break
        case 5:
          this.dataForm.resource = dataIds
          break
      }
    },
    handleConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          updateAuthorizeList(this.objectId, this.dataForm).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.btnLoading = false
                this.$emit('close', true)
              }
            })
          }).catch(() => {
            this.btnLoading = false
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.authorize-bd {
  .JNPF-common-page-header {
    border-bottom: none;
  }
  .el-steps {
    border-radius: 0;
    padding: 13px 45px !important;
  }
}
.main {
  padding: 20px;
}
</style>
