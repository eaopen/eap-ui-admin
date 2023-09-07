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
        <el-tabs v-model="activeName" class="transfer-pane__body-tab">
          <el-tab-pane label="全部数据" name="all">
            <el-tree :data="treeData" :props="props" check-on-click-node
              @node-click="handleNodeClick" class="JNPF-common-el-tree" node-key="id"
              v-loading="loading" lazy :load="loadNode" v-if="!this.isAsync">
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
          <el-tab-pane label="当前组织" name="department">
            <div class="single-list" v-loading="loading">
              <template v-if="treeData2.length">
                <div v-for="(item,index) in treeData2" :key="index" class="selected-item-user"
                  @click="handleNodeClick2(item)">
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
          <el-tab-pane label="我的下属" name="subordinates">
            <div class="single-list" v-loading="loading">
              <template v-if="treeData3.length">
                <div v-for="(item,index) in treeData3" :key="index" class="selected-item-user"
                  @click="handleNodeClick2(item)">
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
                class="selected-item-headIcon">
              </el-avatar>
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
import { getImUserSelector, getUserInfoList, getSubordinates, getOrganization } from '@/api/extn/permission'
import { throttle } from 'throttle-debounce'
export default {
  name: 'JNPF-userTransfer',
  data() {
    return {
      allLoading: false,
      loading: false,
      activeName: '',
      treeData: [],
      treeData2: [],
      treeData3: [],
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
      listLoading: false,
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
      this.treeData2 = []
      this.treeData3 = []
      this.getData()
    }
  },
  methods: {
    init() {
      this.selectedData = []
      this.ids = []
      this.pagination.keyword = ''
      this.activeName = ''
      this.nodeId = '0'
      this.isAsync = false
      this.finish = false
      this.$nextTick(() => {
        this.activeName = 'all'
        this.getSelectList()
      })
    },
    bindScroll() {
      let _this = this,
        vBody = _this.$refs.infiniteBody;
      vBody.addEventListener("scroll", throttle(300, function () {
        if (vBody.scrollHeight - vBody.clientHeight - vBody.scrollTop <= 200 && !_this.listLoading && !_this.finish) {
          _this.pagination.currentPage += 1
          _this.getList()
        }
      }));
    },
    getData() {
      if (this.activeName === 'all') {
        this.getList()
      } else if (this.activeName === 'department') {
        this.loading = true
        this.treeData2 = []
        getOrganization({ keyword: this.pagination.keyword, organizeId: '0' }).then(res => {
          this.treeData2 = res.data
          this.loading = false
        })
      } else {
        this.loading = true
        this.treeData3 = []
        getSubordinates(this.pagination.keyword).then(res => {
          this.treeData3 = res.data
          this.loading = false
        })
      }
    },
    getSelectList() {
      this.allLoading = true
      if (!this.value.length) return this.allLoading = false
      getUserInfoList(this.value).then(res => {
        this.selectedData = res.data.list
        this.ids = this.selectedData.map(o => o.id)
        this.allLoading = false
      })
    },
    search() {
      this.nodeId = '0'
      this.treeData = []
      this.pagination.currentPage = 1
      this.isAsync = !!this.pagination.keyword
      this.finish = false
      if (this.isAsync && this.activeName === 'all') {
        this.$nextTick(() => {
          this.bindScroll()
        })
      }
      this.getData()
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
      if (data.type !== 'user') return
      this.handleNodeClick2(data)
    },
    handleNodeClick2(data) {
      const boo = this.selectedData.some(o => o.id === data.id)
      if (boo) return
      this.multiple ? this.selectedData.push(data) : this.selectedData = [data]
      this.multiple ? this.ids.push(data.id) : this.ids = [data.id]
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