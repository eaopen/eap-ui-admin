<template>
  <div class="process-container" v-loading="loading">
    <div class="left-container">
      <draggable :list="flowList" :animation="340" group="selectItem" handle=".option-drag"
        class="left-list">
        <div class="left-item" @click="changeFlow(item)" v-for="(item,i) in flowList"
          :key="item.flowId" :class="{'active':activeConf.flowId===item.flowId}">
          <div class="option-drag">
            <i class="icon-ym icon-ym-darg" />
          </div>
          <p class="name">{{item.fullName}}</p>
          <el-dropdown @click.stop>
            <i class="icon el-icon-more"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="copyFlow(item)">复制</el-dropdown-item>
              <el-dropdown-item @click.native="editFlow(item)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="delFlow(i,item.isDelete)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </draggable>
      <div class="add-btn" @click="addFlow">
        <el-button type="text" icon="el-icon-plus">添加流程</el-button>
      </div>
    </div>
    <div class="center-container">
      <process-main :conf="activeConf.flowTemplateJson" :flowType="flowType" :formInfo="formInfo"
        v-if="activeConf && activeConf.flowTemplateJson" :verifyMode="verifyMode" :key="key" />
    </div>
    <el-dialog :title="handleType === 'add' ? '新建流程' : '编辑流程'" :close-on-click-modal="false"
      append-to-body :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center" lock-scroll
      width="600px">
      <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="100px">
        <el-form-item label="流程名称" prop="fullName">
          <el-input v-model="dataForm.fullName" placeholder="流程名称" maxlength="50" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="dataFormSubmit()">
          {{$t('common.confirmButton')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import ProcessMain from "./main"
import { NodeUtils, getMockData } from "./FlowCard/util.js";
import draggable from 'vuedraggable'
import { getFormInfo } from '@/api/workFlow/FormDesign'
const requiredDisabled = (jnpfKey) => {
  return ['billRule', 'createUser', 'createTime', 'modifyTime', 'modifyUser', 'currPosition', 'currOrganize', 'table'].includes(jnpfKey)
}
const getDataType = (data) => {
  if (!data.__config__ || !data.__config__.jnpfKey) return ''
  const jnpfKey = data.__config__.jnpfKey
  if (['numInput', 'date', 'rate', 'slider'].includes(jnpfKey)) {
    return 'number'
  } else if (['checkbox', 'uploadFz', 'uploadImg', 'cascader', 'comSelect', 'address'].includes(jnpfKey)) {
    return 'array'
  } else if (['select', 'depSelect', 'posSelect', 'userSelect', 'treeSelect', 'roleSelect', 'groupSelect'].includes(jnpfKey)) {
    if (data.multiple) return 'array'
  }
  return ''
}

export default {
  name: 'Process',
  props: ['tabName', 'conf', 'flowType', 'formInfo'],
  data() {
    return {
      activeConf: null,
      key: + new Date(),
      loading: false,
      verifyMode: false,
      flowList: [],
      visible: false,
      handleType: '',
      defaultData: {},
      formFieldList: {},
      dataForm: {
        fullName: '',
        id: '',
        flowId: ''
      },
      dataRule: {
        fullName: [
          { required: true, message: '请输入流程名称', trigger: 'blur' }
        ]
      }
    };
  },
  components: {
    ProcessMain,
    draggable
  },
  created() {
    this.$store.dispatch('base/getPositionList')
    this.$store.dispatch('base/getRoleList')
    this.$store.dispatch('generator/getDepTree')
    this.$store.dispatch('generator/getGroupTree')
    this.loading = true
    if (this.formInfo.onlineDev && this.formInfo.onlineFormId) {
      getFormInfo(this.formInfo.onlineFormId).then(res => {
        const defaultData = getMockData()
        defaultData.properties.formName = res.data.fullName
        defaultData.properties.formId = res.data.id
        let { propertyJson } = res.data
        let formJson = {}, fieldList = []
        if (propertyJson) formJson = JSON.parse(propertyJson)
        fieldList = formJson.fields
        this.formFieldList = this.transformFieldList(fieldList)
        defaultData.properties.formFieldList = this.formFieldList
        defaultData.properties.formOperates = this.initFormOperates(defaultData)
        this.defaultData = defaultData
        this.initData()
      })
    } else {
      this.defaultData = getMockData()
      this.initData()
    }
  },
  methods: {
    initData() {
      if (Array.isArray(this.conf) && this.conf !== null && JSON.stringify(this.conf) !== '[]') {
        this.flowList = this.conf
        this.updateData()
      } else {
        let item = {
          id: '',
          flowId: this.jnpf.idGenerator(),
          fullName: this.formInfo.fullName,
          flowTemplateJson: JSON.parse(JSON.stringify(this.defaultData))
        }
        this.flowList = [item]
      }
      this.activeConf = this.flowList[0]
      this.$nextTick(() => {
        this.loading = false
      })
    },
    // 给父级组件提供的获取流程数据得方法
    getData() {
      this.verifyMode = true
      let boo = true
      let errorItem = {}
      for (let i = 0; i < this.flowList.length; i++) {
        boo = NodeUtils.checkAllNode(this.flowList[i].flowTemplateJson)
        errorItem = this.flowList[i]
        if (!boo) break;
      }
      if (boo) {
        return Promise.resolve({ formData: this.flowList })
      } else {
        return Promise.reject({ target: 2, msg: `请完善${errorItem.fullName}的流程设计` })
      }
    },
    addFlow() {
      this.handleType = 'add'
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.dataForm = {
          id: '',
          flowId: this.jnpf.idGenerator(),
          fullName: '',
          flowTemplateJson: JSON.parse(JSON.stringify(this.defaultData))
        }
      })
    },
    editFlow(item) {
      this.handleType = 'edit'
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.dataForm = JSON.parse(JSON.stringify(item))
      })
    },
    delFlow(index, isDelete) {
      if (this.flowList.length === 1) return this.$message.warning(`最后一个流程不能删除`);
      if (isDelete) return this.$message.warning(`流程已被使用，不能删除`);
      this.$confirm('此操作将永久删除该流程，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.flowList.splice(index, 1)
        this.activeConf = this.flowList[this.flowList.length - 1]
        this.key = +new Date()
      }).catch(() => { })
    },
    copyFlow(item) {
      let itemCopy = JSON.parse(JSON.stringify(item))
      this.$confirm('您确定要复制该流程，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        let flowId = this.jnpf.idGenerator()
        let fullName = itemCopy.fullName + flowId
        if (fullName.length > 50) {
          fullName = fullName.substring(fullName.length - 50)
        }
        const data = {
          id: '',
          flowId,
          fullName,
          flowTemplateJson: itemCopy.flowTemplateJson
        }
        this.flowList.push(data)
      }).catch(() => { })
    },
    changeFlow(item) {
      if (item.flowId === this.activeConf.flowId) return
      this.activeConf = item
      this.key = +new Date()
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.handleType === 'add') {
            let boo = this.flowList.some(o => o.fullName === this.dataForm.fullName)
            if (boo) return this.$message.warning('流程名称重复，请重新输入')
            this.flowList.push(JSON.parse(JSON.stringify(this.dataForm)))
            this.activeConf = this.flowList[this.flowList.length - 1]
            this.key = +new Date()
          } else {
            let boo = this.flowList.some(o => o.fullName === this.dataForm.fullName && o.flowId !== this.dataForm.flowId)
            if (boo) return this.$message.warning('流程名称重复，请重新输入')
            for (let i = 0; i < this.flowList.length; i++) {
              if (this.dataForm.flowId === this.flowList[i].flowId) {
                this.$set(this.flowList[i], 'fullName', this.dataForm.fullName)
                break
              }
            }
          }
          this.visible = false
        }
      })
    },
    transformFieldList(formFieldList) {
      let list = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__vModel__) {
          const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table'
          let obj = JSON.parse(JSON.stringify(data))
          if (isTableChild) {
            obj.__vModel__ = parent.__vModel__ + '-' + data.__vModel__
            obj.__config__.label = parent.__config__.label + '-' + data.__config__.label
          }
          list.push(obj)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
      }
      loop(formFieldList)
      return list
    },
    initFormOperates(target, isUpdate, isSameForm) {
      const formOperates = target.properties && target.properties.formOperates || []
      let res = []
      const getWriteById = id => {
        const arr = formOperates.filter(o => o.id === id)
        return arr.length ? arr[0].write : NodeUtils.isStartNode(target)
      }
      const getReadById = id => {
        const arr = formOperates.filter(o => o.id === id)
        return arr.length ? arr[0].read : true
      }
      const getRequiredById = id => {
        const arr = formOperates.filter(o => o.id === id)
        return arr.length ? arr[0].required : false
      }
      if (!formOperates.length || isUpdate) {
        for (let i = 0; i < this.formFieldList.length; i++) {
          const data = this.formFieldList[i];
          res.push({
            id: data.__vModel__,
            name: data.__config__.label,
            required: !isSameForm ? data.__config__.required : data.__config__.required || getRequiredById(data.__vModel__),
            requiredDisabled: requiredDisabled(data.__config__.jnpfKey) || data.__config__.required,
            jnpfKey: data.__config__.jnpfKey,
            dataType: getDataType(data),
            read: !isSameForm ? true : getReadById(data.__vModel__),
            write: !isSameForm ? NodeUtils.isStartNode(target) : getWriteById(data.__vModel__),
          })
        }
      } else {
        res = formOperates
      }
      return res
    },
    updateData() {
      for (let i = 0; i < this.flowList.length; i++) {
        this.flowList[i].flowTemplateJson = Object.assign(NodeUtils.createNode('start'), this.flowList[i].flowTemplateJson)
        if (this.formInfo.onlineDev && this.formInfo.onlineFormId) this.updateFiled(this.flowList[i].flowTemplateJson)
      }
    },
    updateFiled(flowTemplateJson) {
      const loop = data => {
        if (Array.isArray(data)) data.forEach(d => loop(d))
        if (data.type === 'approver' || data.type === 'start') {
          data.properties.formOperates = this.initFormOperates(data, true, true)
        }
        if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes)
        if (data.childNode) loop(data.childNode)
      }
      loop(flowTemplateJson)
    },
  }
};
</script>

<style scoped lang="scss">
.process-container {
  display: flex;
  height: 100%;

  .left-container {
    flex-shrink: 0;
    width: 220px;
    margin-right: 10px;
    background: #fff;
    border-radius: 4px;
    height: 100%;
    .left-list {
      padding: 10px;
      height: calc(100% - 40px);
      border-bottom: 1px solid #dcdfe6;
      overflow: auto;
      .left-item {
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid #dcdfe6;
        padding: 0 10px;
        border-radius: 4px;
        margin-bottom: 10px;
        .option-drag {
          margin-right: 6px;
          cursor: move;
        }
        .icon {
          cursor: pointer;
        }
        &.active {
          border: 1px solid #1890ff;
          background: #1890ff;
          .name {
            color: #fff;
          }
          .icon {
            color: #fff;
          }
          .option-drag {
            color: #fff;
          }
        }
        .name {
          width: 160px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
        }
      }
    }
    .add-btn {
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }
  .center-container {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
}
</style>
