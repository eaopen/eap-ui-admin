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
    <el-dialog title="选择岗位" :close-on-click-modal="false" :visible.sync="visible"
      class="JNPF-dialog JNPF-dialog_center transfer-dialog" lock-scroll append-to-body
      width="800px" :modal-append-to-body="false" @close="onClose">
      <div class="transfer__body">
        <div class="transfer-pane">
          <div class="transfer-pane__tools">
            <el-input placeholder="请输入关键词查询" v-model="keyword" @keyup.enter.native="search"
              clearable class="search-input">
              <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
            </el-input>
          </div>
          <div class="transfer-pane__body">
            <el-tree :data="treeData" :props="props" check-on-click-node
              :expand-on-click-node="false" default-expand-all @node-click="handleNodeClick"
              class="JNPF-common-el-tree" node-key="id" v-loading="loading" ref="tree"
              :filter-node-method="filterNode">
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
              <div v-for="(item, index) in selectedData" :key="index" class="selected-item">
                <span>{{item.fullName}}</span>
                <i class="el-icon-delete" @click="removeData(index)"></i>
              </div>
            </template>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDefault(),visible=false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="confirm">{{$t('common.confirmButton')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
import { getPositionByPositionCondition } from '@/api/permission/position'

export default {
  name: 'groupSelect',
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
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择'
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
      default: false
    },
    selectType: {
      type: String,
      default: 'all'
    },
    ableDepIds: {
      type: Array,
      default: () => []
    },
    ablePosIds: {
      type: Array,
      default: () => []
    },
    size: String,
  },
  data() {
    return {
      treeData: [],
      allList: [],
      keyword: '',
      innerValue: '',
      visible: false,
      loading: false,
      props: {
        children: 'children',
        label: 'fullName',
        isLeaf: 'isLeaf'
      },
      selectedData: [],
      tagsList: [],
      inputHovering: false,
      inputWidth: 0,
      initialInputHeight: 0,
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
    this.getData()
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
  watch: {
    value(val) {
      this.setDefault()
    },
    selectDisabled() {
      this.$nextTick(() => {
        this.resetInputHeight();
      });
    },
    allList: {
      handler: function (val) {
        this.setDefault()
      },
      deep: true
    }
  },
  methods: {
    async getData() {
      this.allList = await this.$store.dispatch('base/getPositionList')
      if (this.selectType === 'all') {
        this.treeData = await this.$store.dispatch('base/getPositionTree')
      }
      if (this.selectType === 'custom') {
        this.getAbleList()
      }
    },
    getAbleList() {
      let query = {
        keyword: "",
        departIds: this.ableDepIds,
        positionIds: this.ablePosIds
      }
      getPositionByPositionCondition(query).then(res => {
        this.treeData = res.data.list
      })
    },
    onClose() { },
    openDialog() {
      if (this.selectDisabled) return
      this.keyword = ''
      this.search()
      this.visible = true
      if (this.selectType === 'all') {
        this.setDefault()
      }
      if (this.selectType === 'custom') {
        this.getData()
        this.$nextTick(() => {
          this.setDefault()
        })
      }
    },
    search() {
      this.$refs.tree && this.$refs.tree.filter(this.keyword)
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.props.label].indexOf(value) !== -1;
    },
    handleNodeClick(data) {
      if (data.type !== 'position') return
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
        let selectedIds = this.selectedData[0].id
        this.$emit('input', selectedIds)
        this.$emit('change', selectedIds, this.selectedData[0])
      }
      this.visible = false
    },
    setDefault() {
      if (!this.value || !this.value.length) {
        this.innerValue = ''
        this.selectedData = []
        this.tagsList = []
        return
      }
      const arr = this.multiple ? this.value : [this.value]
      let selectedData = []
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        inner: for (let j = 0; j < this.allList.length; j++) {
          if (item === this.allList[j].id) {
            selectedData.push(this.allList[j])
            break inner
          }
        }
      }
      this.selectedData = selectedData
      if (this.multiple) {
        this.innerValue = ''
        this.tagsList = JSON.parse(JSON.stringify(this.selectedData))
        this.$nextTick(() => {
          this.resetInputHeight();
        })
      } else {
        if (!this.selectedData.length) return this.innerValue = ''
        this.innerValue = this.selectedData[0].fullName
      }
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
  }
}
</script>