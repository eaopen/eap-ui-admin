<template>
  <div class="popupSelect-container">
    <div class="el-select" @click.stop="openDialog">
      <div class="el-select__tags" v-if="multiple" ref="tags"
        :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%',cursor:'pointer' }">
        <span v-if="collapseTags && tagsList.length">
          <el-tag :closable="!selectDisabled" :size="collapseTagSize" type="info"
            @close="deleteTag($event, 0)" disable-transitions>
            <span class="el-select__tags-text">{{ tagsList[0].fullName }}</span>
          </el-tag>
          <el-tag v-if="tagsList.length > 1" :closable="false" type="info" disable-transitions>
            <span class="el-select__tags-text">+ {{ tagsList.length - 1 }}</span>
          </el-tag>
        </span>
        <transition-group @after-leave="resetInputHeight" v-if="!collapseTags">
          <el-tag v-for="(item,i) in tagsList" :key="item.id" :size="collapseTagSize"
            :closable="!selectDisabled" type="info" @close="deleteTag($event, i)"
            disable-transitions>
            <span class="el-select__tags-text">{{ item.fullName }}</span>
          </el-tag>
        </transition-group>
      </div>
      <el-input ref="reference" v-model="innerValue" type="text" :placeholder="currentPlaceholder"
        :disabled="selectDisabled" readonly :validate-event="false"
        :tabindex="(multiple) ? '-1' : null" @mouseenter.native="inputHovering = true"
        @mouseleave.native="inputHovering = false">
        <template slot="suffix">
          <i v-show="!showClose"
            :class="['el-select__caret', 'el-input__icon', 'el-icon-arrow-up']"></i>
          <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close"
            @click="handleClearClick"></i>
        </template>
      </el-input>
    </div>
    <el-dialog :title="title" :close-on-click-modal="false" :visible.sync="visible"
      class="JNPF-dialog JNPF-dialog_center transfer-dialog" lock-scroll append-to-body
      width="800px" :modal-append-to-body="false" @close="onClose">
      <div class="transfer__body">
        <div class="transfer-pane">
          <div class="transfer-pane__tools">
            <el-input placeholder="请输入关键词查询" v-model="pagination.keyword"
              @keyup.enter.native="search" clearable class="search-input">
              <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
            </el-input>
          </div>
          <div class="transfer-pane__body left-pane">
            <el-tabs v-model="activeName" class="transfer-pane__body-tab"
              :class="{'hasSys-tab':hasSys}" v-if="selectType==='all'">
              <el-tab-pane label="全部数据" name="all">
                <el-tree :data="treeData" :props="props" check-on-click-node
                  @node-click="handleNodeClick" class="JNPF-common-el-tree" node-key="id"
                  v-loading="loading" lazy :load="loadNode" v-if="!isAsync"
                  :default-expanded-keys="defaultExpandedKeys">
                  <span class="custom-tree-node" slot-scope="{ node, data }">
                    <i :class="data.icon"></i>
                    <span class="text">{{node.label}}</span>
                  </span>
                </el-tree>
                <div class="single-list" ref="infiniteBody" v-if="isAsync"
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
              <el-tab-pane label="系统变量" name="system">
                <el-tree :data="treeData4" :props="props" :expand-on-click-node="false"
                  check-on-click-node @node-click="handleNodeClick2" class="JNPF-common-el-tree"
                  node-key="id" v-loading="loading">
                  <span class="custom-tree-node" slot-scope="{ node }">
                    <i class="icon-ym icon-ym-tree-user2"></i>
                    <span class="text">{{node.label}}</span>
                  </span>
                </el-tree>
              </el-tab-pane>
            </el-tabs>
            <template v-else>
              <div class="custom-title">全部数据</div>
              <div class="single-list" ref="infiniteBody">
                <template v-if="ableList.length">
                  <div v-for="(item,index) in ableList" :key="index" class="selected-item-user"
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
            </template>
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDefault(),visible=false">{{$t('common.cancelBtn')}}</el-button>
        <el-button type="primary" @click="confirm">{{$t('common.confirmBtn')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getImUserSelector, getUserInfoList, getSubordinates, getOrganization, getUsersByUserCondition } from '@/api/extn/permission'
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
export default {
  name: 'userSelect',
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  props: {
    value: {
      type: [String, Array],
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    title: {
      type: String,
      default: '选择用户'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    collapseTags: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    hasSys: {
      type: Boolean,
      default: false
    },
    selectType: {
      type: String,
      default: 'all'
    },
    ableRelationIds: {
      type: [Array, String],
      default: () => []
    },
    ableDepIds: {
      type: Array,
      default: () => []
    },
    ablePosIds: {
      type: Array,
      default: () => []
    },
    ableUserIds: {
      type: Array,
      default: () => []
    },
    ableRoleIds: {
      type: Array,
      default: () => []
    },
    ableGroupIds: {
      type: Array,
      default: () => []
    },
    size: String,
  },
  data() {
    return {
      visible: false,
      activeName: '',
      nodeId: '',
      innerValue: '',
      loading: false,
      props: {
        children: 'children',
        label: 'fullName',
        isLeaf: 'isLeaf'
      },
      defaultExpandedKeys: [],
      treeData: [],
      treeData2: [],
      treeData3: [],
      treeData4: [{
        id: 'currentUser',
        fullName: '当前用户',
        headIcon: '/api/file/Image/userAvatar/001.png'
      }],
      ableList: [],
      selectedData: [],
      tagsList: [],
      inputHovering: false,
      inputWidth: 0,
      initialInputHeight: 0,
      isAsync: false,
      finish: false,
      pagination: {
        keyword: '',
        currentPage: 1,
        pageSize: 20,
      },
      ableQuery: {
        departIds: [],
        positionIds: [],
        userIds: [],
        roleIds: [],
        groupIds: []
      }
    }
  },
  watch: {
    value(val) {
      this.setDefault()
    },
    selectDisabled() {
      this.$nextTick(() => {
        this.resetInputHeight();
      });
    },
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
  computed: {
    showClose() {
      let hasValue = this.multiple
        ? Array.isArray(this.value) && this.value.length > 0
        : this.value !== undefined && this.value !== null && this.value !== '';
      let criteria = this.clearable &&
        !this.selectDisabled &&
        this.inputHovering &&
        hasValue;
      return criteria;
    },
    currentPlaceholder() {
      if (this.multiple && Array.isArray(this.value) && this.value.length) {
        return ''
      } else {
        return this.placeholder
      }
    },
    selectDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },
    selectSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    },
    collapseTagSize() {
      return ['small', 'mini'].indexOf(this.selectSize) > -1
        ? 'mini'
        : 'small';
    },
  },
  created() {
    this.setDefault()
  },
  mounted() {
    addResizeListener(this.$el, this.handleResize);

    const reference = this.$refs.reference;
    if (reference && reference.$el) {
      const sizeMap = {
        medium: 36,
        small: 32,
        mini: 28
      };
      const input = reference.$el.querySelector('input');
      this.initialInputHeight = input.getBoundingClientRect().height || sizeMap[this.selectSize];
    }
    if (this.multiple) {
      this.resetInputHeight();
    }
    this.$nextTick(() => {
      if (reference && reference.$el) {
        this.inputWidth = reference.$el.getBoundingClientRect().width;
      }
    });
    this.setDefault()
  },
  beforeDestroy() {
    if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize);
  },
  methods: {
    getAbleList() {
      this.loading = true
      let query = {
        pagination: this.pagination,
        ...this.ableQuery
      }
      getUsersByUserCondition(query).then(res => {
        if (res.data.list.length < this.pagination.pageSize) {
          this.finish = true
        }
        this.ableList = [...this.ableList, ...res.data.list]
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    bindScroll() {
      let _this = this,
        vBody = _this.$refs.infiniteBody;
      vBody.addEventListener("scroll", function () {
        if (vBody.scrollHeight - vBody.clientHeight - vBody.scrollTop <= 200 && !_this.loading && !_this.finish) {
          _this.pagination.currentPage += 1
          if (_this.selectType === 'all') {
            _this.getAllList()
          } else {
            _this.getAbleList()
          }
        }
      });
    },
    onClose() {
      this.activeName = ''
    },
    openDialog() {
      if (this.selectDisabled) return
      this.visible = true
      this.pagination.keyword = ''
      this.nodeId = '0'
      this.isAsync = false
      this.finish = false
      this.selectedData = []
      if (this.selectType === 'all') {
        this.activeName = 'all'
        this.setDefault()
      } else {
        if (this.selectType === 'custom') {
          this.ableQuery = {
            departIds: this.ableDepIds,
            positionIds: this.ablePosIds,
            userIds: this.ableUserIds,
            roleIds: this.ableRoleIds,
            groupIds: this.ableGroupIds,
          }
        } else {
          const id = this.getAbleKey(this.selectType)
          this.ableQuery = {
            departIds: [],
            positionIds: [],
            userIds: [],
            roleIds: [],
            groupIds: []
          }
          this.ableQuery[id] = Array.isArray(this.ableRelationIds) ? this.ableRelationIds : this.ableRelationIds ? [this.ableRelationIds] : []
        }
        this.getData()
        this.$nextTick(() => {
          this.bindScroll()
          this.setDefault()
        })
      }
    },
    getAbleKey(selectType) {
      if (selectType === 'dep') return 'departIds'
      if (selectType === 'pos') return 'positionIds'
      if (selectType === 'role') return 'roleIds'
      if (selectType === 'group') return 'groupIds'
    },
    confirm() {
      if (this.multiple) {
        this.innerValue = ''
        this.tagsList = JSON.parse(JSON.stringify(this.selectedData))
        let selectedIds = this.selectedData.map(o => o.id)
        this.$emit('input', selectedIds)
        this.$emit('change', selectedIds, this.selectedData)
      } else {
        if (!this.selectedData.length) {
          this.innerValue = ''
          this.$emit('input', '')
          this.$emit('change', '', {})
          this.visible = false
          return
        }
        this.innerValue = this.selectedData[0].fullName
        let selectedIds = this.selectedData.map(o => o.id)
        this.$emit('input', selectedIds[0])
        this.$emit('change', selectedIds[0], this.selectedData[0])
      }
      this.visible = false
    },
    setDefault() {
      if (!this.value || !this.value.length) {
        this.innerValue = ''
        this.selectedData = []
        this.tagsList = []
        this.$nextTick(() => {
          this.resetInputHeight();
        }) 
        return
      }
      const arr = this.multiple ? this.value : [this.value]
      const hasSysItem = arr.some(o => o === 'currentUser')
      getUserInfoList(arr).then(res => {
        this.selectedData = res.data.list
        if (hasSysItem) {
          this.selectedData.push({
            id: 'currentUser',
            fullName: '当前用户',
            headIcon: '/api/file/Image/userAvatar/001.png'
          })
        }
        if (this.multiple) {
          this.innerValue = ''
          this.tagsList = JSON.parse(JSON.stringify(this.selectedData))
        } else {
          this.innerValue = this.selectedData.length ? this.selectedData[0].fullName : ''
        }
        this.$nextTick(() => {
          if (this.multiple) {
            this.resetInputHeight();
          }
        });
      })
    },
    getData() {
      if (this.selectType === 'all') {
        if (this.activeName === 'all') {
          this.getAllList()
        } else if (this.activeName === 'department') {
          this.loading = true
          getOrganization({ keyword: this.pagination.keyword, organizeId: '0' }).then(res => {
            this.treeData2 = res.data
            this.loading = false
          })
        } else if (this.activeName === 'subordinates') {
          this.loading = true
          getSubordinates(this.pagination.keyword).then(res => {
            this.treeData3 = res.data
            this.loading = false
          })
        } else {
          this.loading = false
        }
      } else {
        this.pagination.currentPage = 1
        this.finish = false
        this.ableList = []
        this.getAbleList()
      }
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
      if (this.selectType === 'all') {
        this.getData()
      } else {
        this.ableList = []
        this.getAbleList()
      }
    },
    getAllList() {
      this.loading = true
      if (this.pagination.keyword) this.nodeId = '0'
      getImUserSelector(this.nodeId, this.pagination).then(res => {
        if (this.pagination.keyword) {
          if (res.data.list.length < this.pagination.pageSize) {
            this.finish = true
          }
          this.treeData = [...this.treeData, ...res.data.list]
        } else {
          this.treeData = res.data.list
        }
        this.loading = false
        if (!this.pagination.keyword && this.treeData.length && this.nodeId == '0') {
          this.defaultExpandedKeys = [this.treeData[0].id]
        }
      })
    },
    loadNode(node, resolve) {
      if (this.visible === false) return []
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
    },
    removeAll() {
      this.selectedData = []
    },
    removeData(index) {
      this.selectedData.splice(index, 1)
    },
    deleteTag(event, index) {
      this.selectedData.splice(index, 1)
      this.confirm()
      event.stopPropagation();
    },
    handleClearClick(event) {
      this.selectedData = []
      this.confirm()
      event.stopPropagation();
    },
    resetInputWidth() {
      this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
    },
    handleResize() {
      this.resetInputWidth();
      if (this.multiple) this.resetInputHeight();
    },
    resetInputHeight() {
      if (this.collapseTags) return;
      this.$nextTick(() => {
        if (!this.$refs.reference) return;
        let inputChildNodes = this.$refs.reference.$el.childNodes;
        let input = [].filter.call(inputChildNodes, item => item.tagName === 'INPUT')[0];
        const tags = this.$refs.tags;
        const tagsHeight = tags ? Math.round(tags.getBoundingClientRect().height) : 0;
        const sizeInMap = this.initialInputHeight || 40;
        input.style.height = this.selectedData.length === 0
          ? sizeInMap + 'px'
          : Math.max(
            tags ? (tagsHeight + (tagsHeight > sizeInMap ? 6 : 0)) : 0,
            sizeInMap
          ) + 'px';
      });
    },
    resetInputWidth() {
      this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
    },
    handleResize() {
      this.resetInputWidth();
      if (this.multiple) this.resetInputHeight();
    }
  },
}
</script>