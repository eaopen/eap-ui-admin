<template>
  <el-dialog title="高级查询" :close-on-click-modal="false" :visible.sync="visible"
    class="OBPM-dialog JNPF-dialog_center superQuery-dialog" lock-scroll width="800px">
    <div class="superQuery-main" v-loading="loading">
      <template v-if="conditionList.length">
        <div class="matchLogic">
          <span>匹配逻辑：</span>
          <el-select v-model="matchLogic" placeholder="请选择">
            <el-option label="AND(所有条件都要求匹配)" value="AND"></el-option>
            <el-option label="OR(条件中的任意一个匹配)" value="OR"></el-option>
          </el-select>
        </div>
        <div>
          <template v-for="(item, index) in conditionList">
            <el-row class="condition-list" :key="index" :gutter="20">
              <el-col :span="8">
                <el-select v-model="item.field" placeholder="请选择查询字段" filterable
                  @change="onFieldChange($event,item,index)" clearable>
                  <el-option v-for="item in fieldOptions" :key="item.__vModel__"
                    :label="item.__config__.label" :value="item.__vModel__">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-select v-model="item.symbol" placeholder="请选择">
                  <el-option v-for="item in symbolOptions" :key="item.value" :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="8">
                <template v-if="item.jnpfKey==='numInput'">
                  <el-input-number v-model="item.fieldValue" placeholder="请输入"
                    :precision="item.attr.precision" controls-position="right" style="width:100%" />
                </template>
                <template v-else-if="item.jnpfKey==='calculate'">
                  <el-input-number v-model="item.fieldValue" placeholder="请输入"
                    controls-position="right" style="width:100%"
                    :precision="item.attr.precision||0" />
                </template>
                <template v-else-if="['rate','slider'].includes(item.jnpfKey)">
                  <el-input-number v-model="item.fieldValue" placeholder="请输入"
                    controls-position="right" style="width:100%" />
                </template>
                <div v-else-if="item.jnpfKey==='switch'" style="padding-top: 5px;">
                  <el-switch v-model="item.fieldValue" :active-value="1" :inactive-value="0" />
                </div>
                <template v-else-if="item.jnpfKey==='time'">
                  <el-time-picker v-model="item.fieldValue" style="width:100%" :key="item.cellKey"
                    :picker-options="item.attr['picker-options']" placeholder="请选择" clearable
                    :value-format="item.attr['value-format']" :format="item.attr.format">
                  </el-time-picker>
                </template>
                <template v-else-if="['date','createTime', 'modifyTime'].includes(item.jnpfKey)">
                  <el-date-picker v-model="item.fieldValue" clearable placeholder="请选择"
                    :type="item.jnpfKey==='date'&&item.attr.type?item.attr.type:'datetime'"
                    :value-format="item.attr['value-format']" style="width:100%" :key="item.cellKey"
                    :format="item.attr.format||'yyyy-MM-dd HH:mm:ss'">
                  </el-date-picker>
                </template>
                <template v-else-if="['comSelect','currOrganize'].includes(item.jnpfKey)">
                  <comSelect v-model="item.fieldValue" placeholder="请选择" clearable />
                </template>
                <template v-else-if="['depSelect'].includes(item.jnpfKey)">
                  <depSelect v-model="item.fieldValue" placeholder="请选择" clearable
                    :selectType="item.attr.selectType" :ableDepIds="item.attr.ableDepIds" />
                </template>
                <template v-else-if="['createUser','modifyUser'].includes(item.jnpfKey)">
                  <userSelect v-model="item.fieldValue" placeholder="请选择" clearable />
                </template>
                <template v-else-if="['userSelect'].includes(item.jnpfKey)">
                  <userSelect v-model="item.fieldValue" placeholder="请选择" clearable
                    :selectType="item.attr.selectType!='all'||item.attr.selectType!='custom'?'all':item.attr.selectType"
                    :ableDepIds="item.attr.ableDepIds" :ablePosIds="item.attr.ablePosIds"
                    :ableUserIds="item.attr.ableUserIds" :ableRoleIds="item.attr.ableRoleIds"
                    :ableGroupIds="item.attr.ableGroupIds" />
                </template>
                <template v-else-if="['usersSelect'].includes(item.jnpfKey)">
                  <usersSelect v-model="item.fieldValue" placeholder="请选择" clearable
                    :selectType="item.attr.selectType" :ableIds="item.attr.ableIds" />
                </template>
                <template v-else-if="['currPosition'].includes(item.jnpfKey)">
                  <posSelect v-model="item.fieldValue" placeholder="请选择" clearable />
                </template>
                <template v-else-if="['posSelect'].includes(item.jnpfKey)">
                  <posSelect v-model="item.fieldValue" placeholder="请选择" clearable
                    :selectType="item.attr.selectType" :ableDepIds="item.attr.ableDepIds"
                    :ablePosIds="item.attr.ablePosIds" />
                </template>
                <template v-else-if="item.jnpfKey==='groupSelect'">
                  <groupSelect v-model="item.fieldValue" placeholder="请选择" clearable />
                </template>
                <template v-else-if="item.jnpfKey==='roleSelect'">
                  <roleSelect v-model="item.fieldValue" placeholder="请选择" clearable />
                </template>
                <template v-else-if="item.jnpfKey==='address'">
                  <JNPFAddress v-model="item.fieldValue" placeholder="请选择" :level="item.attr.level"
                    clearable :key="item.cellKey" />
                </template>
                <template v-else-if="['select','radio','checkbox'].includes(item.jnpfKey)">
                  <el-select v-model="item.fieldValue" placeholder="请选择" clearable filterable>
                    <el-option :label="oItem[item.attr.props.props.label]"
                      v-for="(oItem, i) in item.attr.options"
                      :value="oItem[item.attr.props.props.value]" :key="i"></el-option>
                  </el-select>
                </template>
                <template v-else-if="item.jnpfKey==='cascader'">
                  <el-cascader v-model="item.fieldValue" :options="item.attr.options" clearable
                    :show-all-levels="item.attr['show-all-levels']" :props="item.attr.props.props"
                    filterable placeholder="请选择" style="width:100%">
                  </el-cascader>
                </template>
                <template v-else-if="item.jnpfKey==='treeSelect'">
                  <JNPF-TreeSelect v-model="item.fieldValue" placeholder="请选择"
                    :options="item.attr.options" :props="item.attr.props.props" clearable />
                </template>
                <template v-else-if="item.jnpfKey==='relationForm'">
                  <relationForm v-model="item.fieldValue" placeholder="请选择"
                    :modelId="item.attr.modelId" clearable :columnOptions="item.attr.columnOptions"
                    :relationField="item.attr.relationField" :hasPage="item.attr.hasPage"
                    :pageSize="item.attr.pageSize" />
                </template>
                <template v-else-if="item.jnpfKey==='popupSelect'">
                  <popupSelect v-model="item.fieldValue" placeholder="请选择"
                    :interfaceId="item.attr.interfaceId" clearable
                    :columnOptions="item.attr.columnOptions" :propsValue="item.attr.propsValue"
                    :relationField="item.attr.relationField" :hasPage="item.attr.hasPage"
                    :pageSize="item.attr.pageSize" :popupType="item.attr.popupType"
                    :popupTitle="item.attr.popupTitle" :popupWidth="item.attr.popupWidth" />
                </template>
                <template v-else-if="item.jnpfKey==='popupTableSelect'">
                  <popupTableSelect v-model="item.fieldValue" :placeholder="item.attr.placeholder"
                    :interfaceId="item.attr.interfaceId" :columnOptions="item.attr.columnOptions"
                    :propsValue="item.attr.propsValue" :relationField="item.attr.relationField"
                    :hasPage="item.attr.hasPage" :pageSize="item.attr.pageSize"
                    :popupType="item.attr.popupType" :popupTitle="item.attr.popupTitle"
                    :popupWidth="item.attr.popupWidth" :filterable="item.attr.filterable"
                    clearable />
                </template>
                <template v-else-if="item.jnpfKey==='autoComplete'">
                  <JnpfAutoComplete v-model="item.fieldValue" :placeholder="item.attr.placeholder"
                    :interfaceId="item.attr.interfaceId" :templateJson="item.attr.templateJson"
                    :total="item.attr.total" :relationField="item.attr.relationField" clearable />
                </template>
                <template v-else>
                  <el-input v-model="item.fieldValue" placeholder="请输入" clearable />
                </template>
              </el-col>
              <el-col :span="4">
                <el-button @click="addCondition" icon="el-icon-plus"></el-button>
                <el-button @click="delCondition(index)" icon="el-icon-minus"></el-button>
              </el-col>
            </el-row>
          </template>
        </div>
      </template>
      <div class="query-noData" v-else>
        <img src="@/assets/images/extn/query-noData.png" alt="" class="noData-img">
        <div class="noData-txt">
          <span>没有任何查询条件</span>
          <el-divider direction="vertical"></el-divider>
          <el-link type="primary" :underline="false" @click="addCondition">点击新增</el-link>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <div class="footer-options">
        <el-button @click="addPlan" class="add-btn">保存方案</el-button>
        <el-popover width="240" trigger="click" popper-class="plan-popper" ref="planPopper">
          <el-button slot="reference">方案选择<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <div class="plan-list" v-if="planList.length">
            <div class="plan-list-item" v-for="(item,i) in planList" :key="i"
              @click="selectPlan(item)">
              <el-link type="primary" :underline="false" class="plan-list-name">{{item.fullName}}
              </el-link>
              <i class="el-icon-close" @click.stop="delPlan(item.id,i)"></i>
            </div>
          </div>
          <div class="noData-txt" v-else>暂无数据</div>
        </el-popover>
      </div>
      <el-button @click="visible = false">{{$t('common.cancelBtn')}}</el-button>
      <el-button type="primary" :loading="btnLoading" @click="query()">查 询</el-button>
    </span>
    <el-dialog title="保存方案" :visible.sync="addPlanVisible" width="600px" append-to-body lock-scroll
      class="OBPM-dialog JNPF-dialog_center">
      <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px">
        <el-form-item label="方案名称" prop="fullName">
          <el-input v-model="dataForm.fullName" placeholder="请输入保存的方案名称" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addPlanVisible = false">{{$t('common.cancelBtn')}}</el-button>
        <el-button type="primary" :loading="saveBtnLoading" @click="savePlan()">
          {{$t('common.confirmBtn')}}</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>

import { getAdvancedQueryList, Delete, Create, Update } from "@/api/extn/advancedQuery";
import { dyOptionsList } from '@/components/extnGenerator/generator/comConfig'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'

export default {
  props: {
    columnOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      addPlanVisible: false,
      loading: false,
      btnLoading: false,
      saveBtnLoading: false,
      matchLogic: 'AND',
      conditionList: [{
        field: '',
        fieldValue: '',
        symbol: '==',
        jnpfKey: '',
        attr: {}
      }],
      key2: +new Date(),
      planList: [],
      fieldOptions: [],
      symbolOptions: [
        {
          label: '大于等于',
          value: ">="
        },
        {
          label: '大于',
          value: ">"
        },
        {
          label: '等于',
          value: "=="
        },
        {
          label: '小于等于',
          value: "<="
        },
        {
          label: '小于',
          value: "<"
        },
        {
          label: '不等于',
          value: "<>"
        },
        {
          label: '包含',
          value: "like"
        },
        {
          label: '不包含',
          value: "notLike"
        }],
      dataForm: {
        fullName: ''
      },
      dataRule: {
        fullName: [
          { required: true, message: '请输入保存的方案名称', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    currMenuId() {
      return this.$route.meta.modelId || ''
    }
  },
  methods: {
    init() {
      this.visible = true
      this.loading = true
      let componentList = JSON.parse(JSON.stringify(this.columnOptions))
      this.fieldOptions = componentList
      this.getAdvancedQueryList()
      this.$nextTick(() => {
        this.loading = false
      })
    },
    buildOptions(componentList) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (config.jnpfKey === 'cascader') cur.props.props.multiple = false
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          let isTreeSelect = config.jnpfKey === 'treeSelect' || config.jnpfKey === 'cascader'
          if (config.dataType === 'dictionary') {
            if (!config.dictionaryType) return
            getDictionaryDataSelector(config.dictionaryType).then(res => {
              cur.options = res.data.list
            })
          }
          if (config.dataType === 'dynamic') {
            if (!config.propsUrl) return
            getDataInterfaceRes(config.propsUrl).then(res => {
              let data = res.data
              if (Array.isArray(data)) {
                cur.options = data
              } else {
                cur.options = []
              }
            })
          }
        }
      })
      return componentList
    },
    getAdvancedQueryList() {
      if (!this.currMenuId) return
      getAdvancedQueryList(this.currMenuId).then(res => {
        this.planList = res.data.list
      })
    },
    onFieldChange(val, item, i) {
      item.cellKey = +new Date()
      if (!val) {
        item.jnpfKey = ''
        item.fieldValue = undefined
        item.attr = {}
        return
      }
      let obj = this.columnOptions.filter(o => o.__vModel__ == val)[0]
      item.jnpfKey = obj.__config__.jnpfKey
      item.attr = obj
      item.formMultiple = item.jnpfKey === 'cascader' ? obj.props.props.multiple : obj.multiple
      if (item.jnpfKey === 'cascader') item.attr.props.props.multiple = false
      let config = item.attr.__config__
      if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
        let isTreeSelect = config.jnpfKey === 'treeSelect' || config.jnpfKey === 'cascader'
        if (config.dataType === 'dictionary') {
          if (!config.dictionaryType) return
          getDictionaryDataSelector(config.dictionaryType).then(res => {
            item.attr.options = res.data.list
          })
        }
        if (config.dataType === 'dynamic') {
          if (!config.propsUrl) return
          getDataInterfaceRes(config.propsUrl).then(res => {
            let data = res.data
            if (Array.isArray(data)) {
              item.attr.options = data
            } else {
              item.attr.options = []
            }
          })
        }
      }
      item.fieldValue = undefined
      this.$set(this.conditionList, i, item)
    },
    addCondition() {
      let item = {
        field: '',
        fieldValue: '',
        symbol: '==',
        jnpfKey: '',
        cellKey: +new Date(),
        attr: {}
      }
      this.conditionList.push(item)
    },
    delCondition(index) {
      this.conditionList.splice(index, 1)
    },
    delPlan(id, i) {
      Delete(id).then(res => {
        this.$message({
          type: 'success',
          message: res.msg,
          duration: 1500,
          onClose: () => {
            this.planList.splice(i, 1)
          }
        })
      })
    },
    selectPlan(item) {
      this.matchLogic = item.matchLogic
      this.conditionList = item.conditionJson ? JSON.parse(item.conditionJson) : []
      this.$refs.planPopper.doClose()
    },
    addPlan() {
      if (!this.conditionList.length) return this.$message.warning('请添加条件')
      if (!this.exist()) return
      this.addPlanVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
    },
    savePlan() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let boo = this.planList.some(o => o.fullName === this.dataForm.fullName)
          if (!boo) return this.submit()
          let list = this.planList.filter(o => o.fullName === this.dataForm.fullName)
          this.$confirm(`${list[0].fullName}已存在, 是否覆盖方案?`, '', {
            type: 'warning'
          }).then(() => {
            this.submit(list[0].id)
          }).catch(() => { });
        }
      })
    },
    submit(id) {
      this.saveBtnLoading = true
      let query = {
        id: id || '',
        ...this.dataForm,
        matchLogic: this.matchLogic,
        moduleId: this.currMenuId,
        conditionJson: JSON.stringify(this.conditionList)
      }
      const formMethod = query.id ? Update : Create
      formMethod(query).then(res => {
        this.getAdvancedQueryList()
        this.addPlanVisible = false
        this.saveBtnLoading = false
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500
        })
      }).catch(() => {
        this.saveBtnLoading = false
      })
    },
    getDataType(jnpfKey) {
      if (!jnpfKey) return ''
      if (['numInput', 'date', 'rate', 'slider'].includes(jnpfKey)) {
        return 'number'
      } else if (['uploadFz', 'uploadImg', 'cascader', 'comSelect', 'address'].includes(jnpfKey)) {
        return 'array'
      }
      return ''
    },
    exist(type) {
      let isOk = true
      for (let i = 0; i < this.conditionList.length; i++) {
        const e = this.conditionList[i];
        if (!e.field) {
          this.$message({
            message: `请选择查询字段`,
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
        let flag = false
        if (this.getDataType(e.jnpfKey) === 'array') {
          flag = this.jnpf.isEmptyArray(e.fieldValue)
        } else {
          flag = this.jnpf.isEmpty(e.fieldValue)
        }
        if (flag) {
          const mes = type == 'query' ? '查询' : '保存'
          this.$message({
            message: `空条件不能${mes}`,
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
      }
      return isOk
    },
    query() {
      if (!this.exist('query')) return
      let query = {
        matchLogic: this.matchLogic,
        conditionJson: JSON.stringify(this.conditionList)
      }
      query = JSON.stringify(query)
      if (!this.conditionList.length) query = ""
      this.$emit('superQuery', query)
      this.visible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.superQuery-dialog {
  >>> .el-dialog {
    .el-dialog__body {
      padding: 20px 20px 10px 24px;
    }
    .footer-options {
      float: left;
      .add-btn {
        margin-right: 10px;
      }
    }
  }
  .superQuery-main {
    .query-noData {
      text-align: center;
      padding: 20px 0;
      .noData-img {
        width: 160px;
        margin-bottom: 10px;
      }
      .noData-txt {
        color: #909399;
      }
    }
    .matchLogic {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      line-height: 32px;
      .el-select {
        width: 220px;
      }
    }
    .condition-list {
      margin-bottom: 10px;
    }
  }
}
</style>
<style lang="scss">
.plan-popper {
  padding: 0 !important;
  .plan-list {
    padding: 6px 0;
    max-height: 182px;
    overflow: auto;
    &-item {
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #606266;
      font-size: 14px;
      cursor: pointer;
      padding: 0 20px;
      &:hover {
        background-color: #f5f7fa;
      }
    }
    .plan-list-name {
      .el-link--inner {
        width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .el-icon-close:hover {
      color: #f56c6c;
    }
  }
  .noData-txt {
    height: 34px;
    color: #999;
    font-size: 14px;
    line-height: 34px;
    text-align: center;
  }
}
</style>