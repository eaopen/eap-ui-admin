<template>
  <div class="transfer__body" v-loading="allLoading" :style="{height}">
    <div class="transfer-pane">
      <div class="transfer-pane__tools">
        <el-input placeholder="输入关键词进行搜索" v-model="pagination.keyword" @keyup.enter.native="search"
          clearable>
          <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
        </el-input>
      </div>
      <div class="transfer-pane__body left-pane">
        <el-tabs v-model="activeName" class="transfer-pane__body-tab hasSys-tab">
          <el-tab-pane label="部门" name="department">
            <el-tree :data="treeData" :props="props" check-on-click-node
              :expand-on-click-node="false" @node-click="handleNodeClick"
              class="JNPF-common-el-tree" node-key="id" v-loading="loading" lazy :load="loadNode"
              v-if="!this.isAsync">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <i :class="data.icon"></i>
                <span class="text">{{node.label}}</span>
              </span>
            </el-tree>
            <div class="single-list" ref="infiniteBody" v-if="this.isAsync"
              v-loading="loading && pagination.currentPage==1">
              <template v-if="treeData.length">
                <div v-for="(item,index) in treeData" :key="index" class="selected-item-user"
                  @click="handleNodeClick(item)">
                  <div class="selected-item-main">
                    <el-avatar :size="36" :src="define.comUrl+item.headIcon"
                      class="selected-item-headIcon">
                    </el-avatar>
                    <div class="selected-item-text">
                      <p class="name">{{item.fullName}}</p>
                      <p class="organize" :title="item.organize">{{item.organize}}</p>
                    </div>
                  </div>
                </div>
              </template>
              <el-empty description="暂无数据" :image-size="120" v-else></el-empty>
            </div>
          </el-tab-pane>
          <el-tab-pane label="角色" name="role" v-if="multiple">
            <el-tree :data="treeData2" :props="props" :expand-on-click-node="false"
              default-expand-all check-on-click-node @node-click="handleNodeClick"
              class="JNPF-common-el-tree" node-key="id" v-loading="roleLoading" ref="roleTree"
              :filter-node-method="filterNode">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <i :class="data.icon"></i>
                <span class="text">{{node.label}}</span>
              </span>
            </el-tree>
          </el-tab-pane>
          <el-tab-pane label="岗位" name="position" v-if="multiple">
            <el-tree :data="treeData3" :props="props" :expand-on-click-node="false"
              default-expand-all check-on-click-node @node-click="handleNodeClick"
              class="JNPF-common-el-tree" node-key="id" v-loading="positionLoading"
              ref="positionTree" :filter-node-method="filterNode">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <i :class="data.icon"></i>
                <span class="text">{{node.label}}</span>
              </span>
            </el-tree>
          </el-tab-pane>
          <el-tab-pane label="分组" name="group" v-if="multiple">
            <el-tree :data="treeData4" :props="props" :expand-on-click-node="false"
              default-expand-all check-on-click-node @node-click="handleNodeClick"
              class="JNPF-common-el-tree" node-key="id" v-loading="groupLoading" ref="groupTree"
              :filter-node-method="filterNode">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <i :class="data.icon"></i>
                <span class="text">{{node.label}}</span>
              </span>
            </el-tree>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="transfer-pane">
      <div class="transfer-pane__tools">
        <span>已选</span>
        <el-button @click="removeAll" type="text" class="removeAllBtn">清空列表</el-button>
      </div>
      <div class="transfer-pane__body shadow right-pane">
        <template v-if="selectedData.length">
          <div v-for="(item,index) in selectedData" :key="index" class="selected-item-user">
            <div class="selected-item-main">
              <el-avatar :size="36" :src="define.comUrl+item.headIcon"
                class="selected-item-headIcon" v-if="item.type==='user'">
              </el-avatar>
              <div class="selected-item-headIcon icon" v-else>
                <i :class="item.icon"></i>
              </div>
              <div class="selected-item-text">
                <p class="name">{{item.fullName}}</p>
                <p class="organize" :title="item.organize">{{item.organize}}</p>
              </div>
              <i class="el-icon-delete" @click="removeData(index)"></i>
            </div>
          </div>
        </template>
        <el-empty description="暂无数据" :image-size="120" v-else></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import { getImUserSelector, getSelectedList } from '@/api/extn/permission'
import { getPositionSelector } from '@/api/extn/permission'
import { getRoleSelector } from '@/api/extn/permission'
import { getGroupSelector } from '@/api/extn/permission'
export default {
  name: 'JNPF-userTransfer',
  data() {
    return {
      allLoading: false,
      loading: false,
      roleLoading: true,
      positionLoading: true,
      groupLoading: true,
      activeName: '',
      treeData: [],
      treeData2: [],
      treeData3: [],
      treeData4: [],
      selectedData: [],
      props: {
        children: 'children',
        label: 'fullName',
        isLeaf: 'isLeaf'
      },
      nodeId: '0',
      ids: [],
      total: 0,
      isAsync: false,
      finish: false,
      pagination: {
        keyword: '',
        currentPage: 1,
        pageSize: 20,
      }
    }
  },
  props: {
    height: {
      type: String,
      default: "400px"
    },
    // allLoading: {
    //   type: Boolean,
    //   default: false
    // },
    value: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
  },
  watch: {
    activeName(val) {
      this.pagination.keyword = ''
      this.isAsync = false
      if (!val) return
      this.nodeId = '0'
      this.treeData = []
      this.getData()
    }
  },
  methods: {
    init() {
      this.getOtherData()
      this.selectedData = []
      this.ids = []
      this.pagination.keyword = ''
      this.activeName = ''
      this.nodeId = '0'
      this.isAsync = false
      this.finish = false
      this.$nextTick(() => {
        this.activeName = 'department'
        this.getSelectList()
      })
    },
    bindScroll() {
      let _this = this,
        vBody = _this.$refs.infiniteBody;
      vBody.addEventListener("scroll", function () {
        if (vBody.scrollHeight - vBody.clientHeight - vBody.scrollTop <= 200 && !_this.loading && !_this.finish) {
          _this.pagination.currentPage += 1
          _this.getList()
        }
      });
    },
    getData() {
      if (this.activeName === 'department') {
        this.getList()
      } else if (['role', 'position', 'group'].includes(this.activeName)) {
        this.$refs[this.activeName + 'Tree'] && this.$refs[this.activeName + 'Tree'].filter(this.pagination.keyword)
      } else {
        this.loading = false
      }
    },
    getSelectList() {
      this.allLoading = true
      if (!this.value.length) return this.allLoading = false
      getSelectedList(this.value).then(res => {
        this.selectedData = res.data.list.map(o => ({ ...o, id: o.type ? o.id + '--' + o.type : o.id }))
        this.ids = this.selectedData.map(o => o.id)
        this.allLoading = false
      })
    },
    getOtherData() {
      this.roleLoading = true
      this.positionLoading = true
      this.groupLoading = true
      getRoleSelector().then(res => {
        this.treeData2 = res.data.list
        this.roleLoading = false
      })
      getPositionSelector().then(res => {
        this.treeData3 = res.data.list
        this.positionLoading = false
      })
      getGroupSelector().then(res => {
        this.treeData4 = res.data
        this.groupLoading = false
      })
    },
    search() {
      this.nodeId = '0'
      this.treeData = []
      this.pagination.currentPage = 1
      this.isAsync = !!this.pagination.keyword
      this.finish = false
      if (this.isAsync && this.activeName === 'department') {
        this.$nextTick(() => {
          this.bindScroll()
        })
      }
      this.getData()
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.props.label].indexOf(value) !== -1;
    },
    getList() {
      this.loading = true
      if (this.pagination.keyword) this.nodeId = '0'
      getImUserSelector(this.nodeId, this.pagination).then(res => {
        if (this.pagination.keyword) {
          if (res.data.list.length < this.pagination.pageSize) {
            this.finish = true
          }
          this.treeData = [...this.treeData, ...res.data.list]
          this.total = res.data.pagination.total
        } else {
          this.treeData = res.data.list
        }
        this.loading = false
      })
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        this.nodeId = '0'
        return resolve(this.treeData)
      }
      this.nodeId = node.data.id
      getImUserSelector(this.nodeId).then(res => {
        resolve(res.data.list)
      })
    },
    handleNodeClick(data) {
      const usableList = this.multiple ? ['company', 'department', 'role', 'position', 'group', 'user'] : ['user']
      if (!usableList.includes(data.type)) return
      const boo = this.selectedData.some(o => o.id === data.id + '--' + data.type)
      let item = JSON.parse(JSON.stringify(data))
      item.id += '--' + item.type
      if (boo) return
      this.multiple ? this.selectedData.push(item) : this.selectedData = [item]
      this.multiple ? this.ids.push(item.id) : this.ids = [item.id]
      this.$emit('input', this.ids)
      this.$emit('getValue', this.ids, this.selectedData)
    },
    removeAll() {
      this.selectedData = []
      this.ids = []
      this.$emit('input', this.ids)
      this.$emit('getValue', this.ids, this.selectedData)
    },
    removeData(index) {
      this.selectedData.splice(index, 1)
      this.ids.splice(index, 1)
      this.$emit('input', this.ids)
      this.$emit('getValue', this.ids, this.selectedData)
    },
  }
};
</script>