<template>
  <div class="popupSelect-container">
    <el-popover placement="bottom-start" width="700" trigger="click" ref="popover"
      :disabled="selectDisabled" @after-enter="openDialog" class="popover-container">
      <div class="el-select" slot="reference">
        <div class="el-select__tags" v-if="multiple" ref="tags"
          :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%',cursor:'pointer' }">
          <span v-if="collapseTags && tagsList.length">
            <el-tag :closable="!selectDisabled" :size="collapseTagSize" type="info"
              @close="deleteTag($event, 0)" disable-transitions>
              <span class="el-select__tags-text">{{ tagsList[0][relationField] }}</span>
            </el-tag>
            <el-tag v-if="tagsList.length > 1" :closable="false" type="info" disable-transitions>
              <span class="el-select__tags-text">+ {{ tagsList.length - 1 }}</span>
            </el-tag>
          </span>
          <transition-group @after-leave="resetInputHeight" v-if="!collapseTags">
            <el-tag v-for="(item,i) in tagsList" :key="item[propsValue]" :size="collapseTagSize"
              :closable="!selectDisabled" type="info" @close="deleteTag($event, i)"
              disable-transitions>
              <span class="el-select__tags-text">{{ item[relationField] }}</span>
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
              @click.stop="handleClearClick"></i>
          </template>
        </el-input>
      </div>
      <template>
        <el-form @submit.native.prevent :inline="true" v-if="filterable">
          <el-form-item label="关键词">
            <el-input size="small" v-model="listQuery.keyword" placeholder="请输入关键词查询" clearable
              @keyup.enter.native="search()" />
          </el-form-item>
          <el-form-item>
            <el-row :gutter="5">
              <el-col :span="12">
                <el-button type="primary" size="small" icon="el-icon-search" @click="search()">
                  {{$t('common.search')}}
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-button size="small" icon="el-icon-refresh-right" @click="reset()">
                  {{$t('common.reset')}}
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <JNPF-table v-loading="listLoading" :data="list" :border="false" highlight-current-row
          @row-click="rowClick" :hasNO="false" height="300">
          <el-table-column width="35" v-if="multiple">
            <template slot-scope="scope">
              <el-checkbox :value="selectedIds.includes(scope.row[propsValue])" disabled
                class="table-checkbox">&nbsp;</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column width="35" v-if="!multiple">
            <template slot-scope="scope">
              <el-radio :label="scope.row[propsValue]" v-model="checked">&nbsp;</el-radio>
            </template>
          </el-table-column>
          <el-table-column type="index" width="50" label="序号" align="center" />
          <el-table-column :prop="item.value" :label="item.label" v-for="(item,i) in columnOptions"
            :key="i" />
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage" :pager-count="5"
          :limit.sync="listQuery.pageSize" @pagination="initData" v-if="hasPage" class="mb-10" />
        <div class="fr">
          <el-button @click="closePopover" size="small">{{$t('common.cancelBtn')}}
          </el-button>
          <el-button type="primary" @click="confirm()" size="small">{{$t('common.confirmBtn')}}
          </el-button>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script>
import { getDataInterfaceDataSelect, getDataInterfaceDataInfoByIds } from '@/api/extn/dataInterface'
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';
export default {
  name: 'PopupTableSelect',
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
      type: [String, Number, Array],
      default: ''
    },
    rowIndex: {
      default: null
    },
    formData: {
      type: Object
    },
    templateJson: {
      type: Array,
      default: () => []
    },
    interfaceId: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    propsValue: {
      type: String,
      default: 'id'
    },
    relationField: {
      type: String,
      default: 'fullName'
    },
    popupType: {
      type: String,
      default: 'popover'
    },
    popupTitle: {
      type: String,
      default: '选择数据'
    },
    popupWidth: {
      type: String,
      default: '800px'
    },
    field: {
      type: String,
      default: ''
    },
    columnOptions: {
      type: Array,
      default: () => []
    },
    hasPage: {
      type: Boolean,
      default: false
    },
    pageSize: {
      type: Number,
      default: 20
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    collapseTags: {
      type: Boolean,
      default: false
    },
    size: String,
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  data() {
    return {
      list: [],
      innerValue: '',
      listQuery: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      checked: '',
      checkedTxt: '',
      checkedRow: {},
      selectedData: [],
      selectedIds: [],
      tagsList: [],
      listLoading: false,
      inputHovering: false,
      inputWidth: 0,
      initialInputHeight: 0,
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
    this.listQuery.pageSize = this.hasPage ? this.pageSize : 10000
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
    closePopover() {
      this.$refs.popover.doClose()
    },
    initData() {
      if (!this.interfaceId) return
      this.listLoading = true
      const paramList = this.getParamList()
      const columnOptions = this.columnOptions.map(o => o.value)
      let query = {
        ...this.listQuery,
        interfaceId: this.interfaceId,
        propsValue: this.propsValue,
        relationField: this.relationField,
        columnOptions: columnOptions.join(','),
        paramList
      }
      getDataInterfaceDataSelect(this.interfaceId, query).then(res => {
        this.list = res.data.list
        this.total = res.data.pagination.total
        this.listLoading = false
      }).catch(() => { this.listLoading = false })
    },
    getParamList() {
      let templateJson = this.templateJson
      for (let i = 0; i < templateJson.length; i++) {
        if (templateJson[i].relationField && this.formData) {
          if (templateJson[i].relationField.includes('-')) {
            let tableVModel = templateJson[i].relationField.split('-')[0]
            let childVModel = templateJson[i].relationField.split('-')[1]
            templateJson[i].defaultValue = this.formData[tableVModel] && this.formData[tableVModel][this.rowIndex] && this.formData[tableVModel][this.rowIndex][childVModel] || ''
          } else {
            templateJson[i].defaultValue = this.formData[templateJson[i].relationField] || ''
          }
        }
      }
      return templateJson
    },
    interfaceDataHandler(data) {
      if (!data.dataProcessing) return data.list
      const dataHandler = this.jnpf.getScriptFunc.call(this, data.dataProcessing)
      if (!dataHandler) return data.list
      return dataHandler(data.list)
    },
    search() {
      this.initData()
      this.listQuery.currentPage = 1
      this.listQuery.pageSize = this.hasPage ? this.pageSize : 10000
    },
    reset() {
      this.listQuery.keyword = ''
      this.listQuery.currentPage = 1
      this.listQuery.pageSize = this.hasPage ? this.pageSize : 10000
      this.initData()
    },
    openDialog() {
      if (this.disabled) return
      this.reset()
    },
    confirm() {
      if (this.multiple) {
        this.innerValue = ''
        this.tagsList = JSON.parse(JSON.stringify(this.selectedData))
        this.selectedIds = this.selectedData.map(o => o[this.propsValue])
        this.$emit('input', this.selectedIds)
        this.$emit('change', this.selectedIds, this.selectedData)
      } else {
        if (!this.checked) {
          this.innerValue = ''
          this.checkedRow = {}
          this.$emit('input', '')
          this.$emit('change', '', {})
          this.closePopover()
          return
        }
        this.innerValue = this.checkedTxt
        this.$emit('input', this.checked)
        this.$emit('change', this.checked, this.checkedRow)
      }
      this.closePopover()
    },
    rowClick(row) {
      if (this.multiple) {
        const boo = this.selectedData.some(o => o[this.propsValue] === row[this.propsValue])
        if (boo) {
          this.selectedData = this.selectedData.filter(o => o[this.propsValue] !== row[this.propsValue])
          this.selectedIds = this.selectedIds.filter(o => o !== row[this.propsValue])
        } else {
          this.selectedData.push(row)
          this.selectedIds.push(row[this.propsValue])
        }
      } else {
        this.checked = row[this.propsValue]
        this.checkedTxt = row[this.relationField]
        this.checkedRow = row
      }
    },
    setDefault() {
      if (!this.value || (this.multiple && !this.value.length)) {
        this.innerValue = ''
        this.checked = ''
        this.selectedIds = []
        this.selectedData = []
        this.tagsList = []
        // if (!this.field) return
        // let relationData = this.$store.state.generator.relationData
        // this.$set(relationData, this.field, [])
        // this.$store.commit('generator/UPDATE_RELATION_DATA', relationData)
        return
      }
      if (!this.interfaceId) return
      const arr = this.multiple ? this.value : [this.value]
      if (this.multiple && !Array.isArray(this.value)) {
        this.value = []
        arr = []
      }
      const paramList = this.getParamList()
      let query = {
        ids: arr,
        interfaceId: this.interfaceId,
        propsValue: this.propsValue,
        relationField: this.relationField,
        paramList
      }
      getDataInterfaceDataInfoByIds(this.interfaceId, query).then(res => {
        this.selectedData = res.data
        this.selectedIds = this.selectedData.map(o => o[this.propsValue])
        if (this.multiple) {
          this.innerValue = ''
          this.tagsList = JSON.parse(JSON.stringify(this.selectedData))
        } else {
          this.checked = this.value
          this.innerValue = this.selectedData.length ? this.selectedData[0][this.relationField] : ''
          this.checkedRow = this.selectedData[0]
        }
        // if (!this.field) return
        // let relationData = this.$store.state.generator.relationData
        // this.$set(relationData, this.field, res.data)
        // this.$store.commit('generator/UPDATE_RELATION_DATA', relationData)
        this.$nextTick(() => {
          if (this.multiple) {
            this.resetInputHeight();
          }
        });
      })
    },
    deleteTag(event, index) {
      this.selectedData.splice(index, 1)
      this.confirm()
      event.stopPropagation();
    },
    handleClearClick(event) {
      this.checked = ''
      this.innerValue = ''
      this.checkedRow = {}
      this.selectedIds = []
      this.selectedData = []
      this.$emit('input', this.checked)
      this.$emit('change', this.checked, this.checkedRow)
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
<style lang="scss" scoped>
.fr {
  float: right;
}
</style>