<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.__config__.tipLabel"
        placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="占位提示">
      <el-input v-model="activeData.placeholder" placeholder="请输入占位提示" />
    </el-form-item>
    <el-form-item label="默认值">
      <JNPF-TreeSelect :options="activeData.options" v-model="activeData.__config__.defaultValue"
        placeholder="选择默认值" clearable :multiple="activeData.multiple"
        :props="activeData.props.props" :key="renderKey" />
    </el-form-item>
    <template>
      <el-divider>数据选项</el-divider>
      <el-form-item label="" label-width="40px">
        <el-radio-group v-model="activeData.__config__.dataType" size="small"
          style="text-align:center" @change="dataTypeChange">
          <el-radio-button label="static">静态数据</el-radio-button>
          <el-radio-button label="dictionary">数据字典</el-radio-button>
          <el-radio-button label="dynamic">远端数据</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <template v-if="activeData.__config__.dataType === 'static'">
        <!-- 级联选择静态树 -->
        <el-tree draggable :data="activeData.options" node-key="id" :expand-on-click-node="false"
          :render-content="renderContent" :props="activeData.props.props" />
        <div style="margin-left: 20px">
          <el-button style="padding-bottom: 0" icon="el-icon-circle-plus-outline" type="text"
            @click="addTreeItem">添加父级</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button style="padding-bottom: 0" type="text" @click="treeSelectItem">
            批量编辑
          </el-button>
        </div>
      </template>
      <template v-if="activeData.__config__.dataType === 'dictionary'">
        <el-form-item label="数据字典">
          <el-row class="OBPM-el-row">
            <el-col :span="18">
              <JNPF-TreeSelect :options="dicOptions" v-model="activeData.__config__.dictionaryType"
                placeholder="请选择数据字典" lastLevel clearable @change="dictionaryTypeChange"
                @selectChange="selectChange">
              </JNPF-TreeSelect>
            </el-col>
            <el-col :span="6">
              <el-button @click="goDictionary()" style="float: right;">
                添加</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="存储字段">
          <el-select v-model="activeData.props.props.value" placeholder="请选择存储字段">
            <el-option label="id" value="id"></el-option>
            <el-option label="enCode" value="enCode"></el-option>
          </el-select>
        </el-form-item>
      </template>
      <template v-if="activeData.__config__.dataType === 'dynamic'">
        <el-form-item label="远端数据">
          <interface-dialog :value="activeData.__config__.propsUrl"
            :title="activeData.__config__.propsName" popupTitle="远端数据" @change="propsUrlChange" />
        </el-form-item>
        <el-form-item label="存储字段">
          <el-input v-model="activeData.props.props.value" placeholder="请输入存储字段"
            @change="onChange" />
        </el-form-item>
        <el-form-item label="显示字段">
          <el-input v-model="activeData.props.props.label" placeholder="请输入显示字段"
            @change="onChange" />
        </el-form-item>
        <el-form-item label="子级字段">
          <el-input v-model="activeData.props.props.children" placeholder="请输入子级字段"
            @change="onChange" />
        </el-form-item>
        <el-table :data="activeData.__config__.templateJson"
          v-if="activeData.__config__.templateJson && activeData.__config__.templateJson.length">
          <el-table-column type="index" width="50" label="序号" align="center" />
          <el-table-column prop="field" label="参数名称">
            <template slot-scope="scope">
              <span class="required-sign">{{scope.row.required?'*':''}}</span>
              {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
            </template>
          </el-table-column>
          <el-table-column prop="value" label="表单字段">
            <template slot-scope="scope">
              <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable
                filterable @change="onRelationFieldChange($event,scope.row)">
                <el-option v-for="item in formFieldsOptions" :key="item.realVModel"
                  :label="item.realLabel" :value="item.realVModel">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <el-divider />
    </template>
    <el-form-item label="能否清空">
      <el-switch v-model="activeData.clearable" />
    </el-form-item>
    <el-form-item label="能否搜索">
      <el-switch v-model="activeData.filterable" />
    </el-form-item>
    <el-form-item label="能否多选">
      <el-switch v-model="activeData.multiple" @change="onChange" />
    </el-form-item>
    <el-form-item label="是否禁用">
      <el-switch v-model="activeData.disabled" />
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="activeData.__config__.required" />
    </el-form-item>
    <treeNode-dialog :visible.sync="dialogVisible" :title="currentNode.id?'编辑选项':'添加选项'"
      :currentNode="currentNode.id?currentNode:{}" @commit="addNode" />
    <div>
      <el-dialog :visible.sync="dicVisible" append-to-body
        class="OBPM-dialog JNPF-dialog_center JNPF-dialog-tree-select" lock-scroll width="80%"
        @close="defaultValueChange">
        <dicIndex ref="dicIndex"></dicIndex>
      </el-dialog>
      <TreeEditing v-if="updateVisible" ref="treeEditing" @change="handleSure" />
    </div>
  </el-row>
</template>
<script>

import comMixin from '../mixin';
import dynamicMixin from '../dynamicMixin';
import TreeNodeDialog from './TreeNodeDialog'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'
import dicIndex from '@/views/extn/dictionary/index.vue';
import TreeEditing from './TreeEditing'
export default {
  mixins: [comMixin, dynamicMixin],
  components: { TreeNodeDialog, dicIndex, TreeEditing },
  data() {
    return {
      dialogVisible: false,
      currentNode: {},
      props: {
        value: 'id',
        label: 'fullName',
        children: 'children',
      },
      renderKey: +new Date(),
      dicVisible: false,
      updateVisible: false,
      node: '',
      currentNodeId: "",
      formData: {
        fullName: '',
        id: ''
      },
    }
  },
  methods: {
    renderContent(h, { node, data, store }) {
      return (
        <div class="custom-tree-node">
          <span>{node.label}</span>
          <span class="node-operation">
            <i on-click={() => this.append(data)}
              class="el-icon-plus"
              title="添加"
            ></i>
            <i on-click={() => this.update(node, data)}
              class="el-icon-edit-outline"
              title="编辑"
            ></i>
            <i on-click={() => this.remove(node, data)}
              class="el-icon-delete"
              title="删除"
            ></i>
          </span>
        </div>
      )
    },
    selectChange() {
      this.$emit('changeSelect')
      this.dictionaryTypeChange(this.dictionaryId)
    },
    defaultValueChange() {
      this.selectChange()
    },
    goDictionary() {
      this.dicVisible = true
      this.$nextTick(() => {
        this.$refs.dicIndex.initData()
      })
    },
    addTreeItem() {
      this.currentNodeId = ''
      this.dialogVisible = true
      this.currentNode = this.activeData.options
    },
    addNode(data) {
      if (this.currentNodeId) {
        Object.keys(data).forEach(key => { this.node.data[key] = data[key] })
      } else {
        this.currentNode.push(data)
      }
    },
    update(node, data) {
      this.node = node
      this.currentNodeId = data.id
      this.dialogVisible = true
      this.currentNode = data
    },
    append(data) {
      this.currentNodeId = ''
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      this.dialogVisible = true
      this.currentNode = data.children
    },
    remove(node, data) {
      this.activeData.__config__.defaultValue = [] // 避免删除时报错
      const { parent } = node
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
    },
    onChange() {
      this.renderKey = +new Date()
      this.activeData.__config__.renderKey = +new Date()
      this.activeData.__config__.defaultValue = this.activeData.multiple ? [] : ''
    },
    dataTypeChange(val) {
      this.activeData.__config__.defaultValue = ''
      this.activeData.options = []
      this.activeData.props.props.value = 'id'
      this.activeData.props.props.label = 'fullName'
      this.activeData.props.props.children = 'children'
      this.activeData.__config__.dictionaryType = ''
      this.activeData.__config__.propsUrl = ''
      this.activeData.__config__.propsName = ''
      this.activeData.__config__.templateJson = []
    },
    dictionaryTypeChange(val) {
      this.activeData.__config__.defaultValue = []
      if (!val) {
        this.activeData.options = []
        return
      }
      getDictionaryDataSelector(val).then(res => {
        this.activeData.options = res.data.list
      })
    },
    propsUrlChange(val, row) {
      this.activeData.__config__.defaultValue = this.activeData.multiple ? [] : ''
      if (!val) {
        this.activeData.__config__.propsUrl = ''
        this.activeData.__config__.propsName = ''
        this.activeData.__config__.templateJson = []
        this.activeData.options = []
        return
      }
      let list = row.requestParameters ? JSON.parse(row.requestParameters) : []
      this.activeData.__config__.propsUrl = val
      this.activeData.__config__.propsName = row.fullName
      this.activeData.__config__.templateJson = list.map(o => ({ ...o, relationField: '' }))
      let query = {
        paramList: this.activeData.__config__.templateJson || [],
      }
      getDataInterfaceRes(val, query).then(res => {
        let data = res.data
        if (Array.isArray(data)) {
          this.activeData.options = data
        } else {
          this.activeData.options = []
        }
      }).catch(() => {
        this.activeData.__config__.propsUrl = ''
        this.activeData.__config__.propsName = ''
        this.activeData.__config__.templateJson = []
        this.activeData.options = []
      })
    },
    treeSelectItem() {
      this.updateVisible = true
      this.$nextTick(() => {
        this.$refs.treeEditing.init(this.activeData.options)
      })
    },
    handleSure(arr) {
      this.activeData.options = arr || []
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .custom-tree-node {
  width: 100%;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  .node-operation {
    float: right;
  }
  i[class*='el-icon'] + i[class*='el-icon'] {
    margin-left: 6px;
  }
  .el-icon-plus,
  .el-icon-edit-outline {
    color: #409eff;
  }

  .el-icon-delete {
    color: #f56c6c;
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