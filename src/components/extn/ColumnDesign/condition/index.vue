<template>
  <section class="condition-pane pd-10">
    <el-row class="condition-list condition-list-header">
      <el-col :span="4">逻辑</el-col>
      <el-col :span="6" class="label">条件字段</el-col>
      <el-col :span="4">条件符号</el-col>
      <el-col :span="9">数据值</el-col>
      <el-col :span="1"></el-col>
    </el-row>
    <template>
      <el-row class="condition-list mt-10" v-for="(item, index) in pconditions" :key="index">
        <el-col :span="4" class="wrap">
          <el-select v-model="item.logic" placeholder="请选择" class="condition-select" filterable>
            <el-option v-for="item in logicOptions" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="6" class="label wrap">
          <el-col :span="24">
            <el-button size="mini" v-if="item.fieldType === 3" class="edit-script-btn">公式编辑
            </el-button>
            <el-select v-model="item.field" placeholder="请选择" filterable
              @change="fieldNameChange($event, item, index)" v-else>
              <el-option v-for="item in usedFormItems" :key="item.__vModel__"
                :label="item.__config__.label" :value="item.__vModel__">
              </el-option>
            </el-select>
          </el-col>
        </el-col>
        <el-col :span="4" class="wrap">
          <el-select v-model="item.symbol" placeholder="请选择" class="condition-select"
            @change="symbolChange($event, item, index)" filterable>
            <!-- 联动符号下拉框 -->
            <template v-if="
                [
                  'comInput',
                  'textarea',
                  'billRule',
                  'popupTableSelect',
                  'relationForm',
                  'relationFormAttr',
                  'popupSelect',
                  'popupAttr',
                  'autoComplete'
                ].includes(item.jnpfKey)
              ">
              <el-option v-for="item in symbolOptionsBase" :key="item.label" :label="item.label"
                :value="item.value">
              </el-option>
            </template>
            <template v-else-if="
                [
                  'calculate',
                  'numInput',
                  'date',
                  'time',
                  'createTime',
                  'modifyTime'
                ].includes(item.jnpfKey)
              ">
              <el-option v-for="item in symbolOptionsDateNum" :key="item.label" :label="item.label"
                :value="item.value">
              </el-option>
            </template>
            <template v-else>
              <el-option v-for="item in symbolOptionsSelect" :key="item.label" :label="item.label"
                :value="item.value">
              </el-option>
            </template>
          </el-select>
        </el-col>

        <el-col :span="9" class="fieldValue wrap">
          <el-col :span="24">
            <div v-if="item.fieldValueType === 2">
              <template v-if="item.jnpfKey === 'numInput'">
                <NumRange v-model="item.fieldValue" :disabled="item.disabled"
                  v-if="item.symbol == 'between'" :precision="item.precision"></NumRange>
                <el-input-number v-else v-model="item.fieldValue" placeholder="请输入"
                  :disabled="item.disabled" :precision="item.precision" :controls="false"
                  controls-position="right" />
              </template>
              <template v-else-if="item.jnpfKey === 'autoComplete'">
                <JnpfAutoComplete v-model="item.fieldValue" placeholder="请选择"
                  :interfaceId="item.interfaceId" clearable :disabled="item.disabled"
                  :propsValue="item.propsValue" :relationField="item.relationField"
                  :templateJson="item.templateJson" :total="item.total" />
              </template>
              <template v-else-if="
                  ['radio', 'checkbox', 'select'].includes(item.jnpfKey)
                ">
                <template v-if="['null','notNull'].includes(item.symbol)">
                  <el-input :disabled="item.disabled" v-model="item.fieldValue"
                    placeholder="请选择"></el-input>
                </template>
                <el-select v-else :disabled="item.disabled" v-model="item.fieldValue"
                  placeholder="请选择" :multiple="item.multiple" filterable>
                  <el-option v-for="(item, index) in item.dataOptions" :key="index"
                    :disabled="item.disabled" :label="item[item.dataLabel]"
                    :value="item[item.dataValue]"></el-option>
                </el-select>

              </template>
              <template v-else-if="['cascader'].includes(item.jnpfKey)">

                <el-cascader v-model="item.fieldValue" :options="item.dataOptions"
                  :props="getCasProps(item.props.props)" :placeholder="item.placeholder"
                  :clearable="item.clearable" :show-all-levels="item['show-all-levels']"
                  :separator="item.separator" :filterable="item.filterable"
                  :disabled="item.disabled" />
              </template>
              <template v-else-if="['treeSelect'].includes(item.jnpfKey)">
                <JNPF-TreeSelect v-model="item.fieldValue" conditionFilter
                  :options="item.dataOptions" :props="item.props.props"
                  :placeholder="item.placeholder" :clearable="item.clearable"
                  :multiple="item.multiple" :filterable="item.filterable"
                  :disabled="item.disabled" />
              </template>
              <template v-else-if="item.jnpfKey === 'calculate'">
                <NumRange v-model="item.fieldValue" v-if="item.symbol == 'between'"
                  :precision="item.precision" :disabled="item.disabled"></NumRange>
                <el-input-number v-else v-model="item.fieldValue" placeholder="请输入"
                  :precision="item.precision" :disabled="item.disabled" :controls="false"
                  controls-position="right" />
              </template>
              <template v-else-if="['rate', 'slider'].includes(item.jnpfKey)">
                <el-input-number v-model="item.fieldValue" placeholder="请输入"
                  :disabled="item.disabled" controls-position="right" />
              </template>
              <template v-else-if="item.jnpfKey === 'switch'">
                <el-switch v-model="item.fieldValue" :active-value="1" :disabled="item.disabled"
                  :inactive-value="0" />
              </template>
              <template v-else-if="item.jnpfKey === 'time'">
                <el-time-picker v-if="item.symbol == 'between'" :disabled="item.disabled"
                  v-model="item.fieldValue" key="time1" :picker-options="item['picker-options']"
                  placeholder="请选择" clearable :is-range="true" @input="input()"
                  :value-format="item['value-format']" :format="item.format">
                </el-time-picker>
                <el-time-picker v-else v-model="item.fieldValue" key="time2" @input="input()"
                  :picker-options="item['picker-options']" placeholder="请选择" clearable
                  :disabled="item.disabled" :value-format="item['value-format']"
                  :format="item.format">
                </el-time-picker>
              </template>
              <template v-else-if="
                  ['date', 'createTime', 'modifyTime'].includes(item.jnpfKey)
                ">
                <template v-if="item.symbol == 'between'">
                  <JnpfDateRangePicker v-model="item.fieldValue" clearable :disabled="item.disabled"
                    key="year1" placeholder="请选择" separator="至"
                    :type="item.jnpfKey==='createTime' ||item.jnpfKey==='modifyTime'?'datetime': item.type"
                    valueFormat="timestamp" @input="input()" startPlaceholder="开始日期"
                    endPlaceholder="结束日期" style="width: 100%;" :format="item.format">
                  </JnpfDateRangePicker>
                </template>
                <JnpfDatePicker v-else v-model="item.fieldValue" clearable :disabled="item.disabled"
                  key="year2" placeholder="请选择"
                  :type="item.jnpfKey==='createTime' ||item.jnpfKey==='modifyTime'?'datetime': item.type"
                  @input="input()" valueFormat="timestamp"
                  :format="item.format || 'yyyy-MM-dd HH:mm:ss'">
                </JnpfDatePicker>
              </template>
              <template v-else-if="['comSelect', 'currOrganize'].includes(item.jnpfKey)">
                <comSelect v-model="item.fieldValue" :disabled="item.disabled" placeholder="请选择"
                  ref="comselect" clearable :multiple="item.multiple" />
              </template>
              <template v-else-if="['depSelect'].includes(item.jnpfKey)">
                <depSelect v-model="item.fieldValue" placeholder="请选择" :selectType="item.selectType"
                  :ableDepIds="item.ableDepIds" :multiple="item.multiple" clearable
                  :disabled="item.disabled" />
              </template>
              <template v-else-if="item.jnpfKey === 'popupTableSelect'">
                <popupTableSelect v-model="item.fieldValue" :placeholder="item.placeholder"
                  :interfaceId="item.interfaceId" :multiple="item.multiple"
                  :columnOptions="item.columnOptions" :propsValue="item.propsValue"
                  :relationField="item.relationField" :hasPage="item.hasPage"
                  :pageSize="item.pageSize" :popupType="item.popupType"
                  :popupTitle="item.popupTitle" :popupWidth="item.popupWidth"
                  :filterable="item.filterable" :disabled="item.disabled" clearable />
              </template>
              <template v-else-if="item.jnpfKey === 'relationForm'">
                <relationForm v-model="item.fieldValue" placeholder="请选择" :modelId="item.modelId"
                  clearable :multiple="item.multiple" :columnOptions="item.columnOptions"
                  :relationField="item.relationField" :hasPage="item.hasPage"
                  :pageSize="item.pageSize" :disabled="item.disabled" />
              </template>
              <template v-else-if="item.jnpfKey === 'popupSelect'">
                <popupSelect v-model="item.fieldValue" placeholder="请选择"
                  :interfaceId="item.interfaceId" clearable :multiple="item.multiple"
                  :columnOptions="item.columnOptions" :propsValue="item.propsValue"
                  :relationField="item.relationField" :hasPage="item.hasPage"
                  :pageSize="item.pageSize" :popupType="item.popupType"
                  :popupTitle="item.popupTitle" :popupWidth="item.popupWidth"
                  :disabled="item.disabled" />
              </template>
              <template v-else-if="['userSelect'].includes(item.jnpfKey)">
                <userSelect v-model="item.fieldValue" :placeholder="'请选择' + item.__config__.label"
                  clearable class="item"
                  :selectType="item.selectType != 'all' || item.selectType != 'custom' ? 'all' : item.selectType"
                  :ableDepIds="item.ableDepIds" :ablePosIds="item.ablePosIds"
                  :ableUserIds="item.ableUserIds" :ableRoleIds="item.ableRoleIds"
                  :ableGroupIds="item.ableGroupIds" :multiple="item.multiple"
                  :disabled="item.disabled" />
              </template>
              <template v-else-if="['createUser', 'modifyUser'].includes(item.jnpfKey)">
                <userSelect v-model="item.fieldValue" placeholder="请选择" :multiple="item.multiple"
                  clearable :disabled="item.disabled" />
              </template>
              <template v-else-if="['posSelect'].includes(item.jnpfKey)">
                <posSelect v-model="item.fieldValue" :placeholder="'请选择'+item.__config__.label"
                  clearable class="item" :selectType="item.selectType" :ableDepIds="item.ableDepIds"
                  :ablePosIds="item.ablePosIds" :multiple="item.searchMultiple"
                  :disabled="item.disabled" />
              </template>
              <template v-else-if="[ 'currPosition'].includes(item.jnpfKey)">
                <posSelect v-model="item.fieldValue" :placeholder="'请选择'+item.__config__.label"
                  clearable class="item" :multiple="item.searchMultiple"
                  :disabled="item.disabled" />
              </template>
              <template v-else-if="item.jnpfKey === 'address'">
                <JNPFAddress v-model="item.fieldValue" placeholder="请选择" :level="item.level" :key="+new Date()"
                  :multiple="item.multiple" clearable :disabled="item.disabled" />
              </template>
              <template v-else-if="item.jnpfKey === 'groupSelect'">
                <groupSelect v-model="item.fieldValue" :multiple="item.multiple" placeholder="请选择"
                  clearable :disabled="item.disabled" />
              </template>
              <template v-else-if="item.jnpfKey === 'roleSelect'">
                <roleSelect v-model="item.fieldValue" :multiple="item.multiple" placeholder="请选择"
                  clearable :disabled="item.disabled" />
              </template>
              <!-- 其他情况 -->
              <template v-else>
                <el-input v-model="item.fieldValue" :disabled="item.disabled" placeholder="请输入"
                  @input="input"></el-input>
              </template>
            </div>
            <!-- 当数据值选择表单时 -->
            <el-select v-model="item.fieldValue" placeholder="请选择" :disabled="item.disabled"
              v-if="item.fieldValueType === 1" filterable>
              <el-option v-for="item in usedFormItems" :key="item.__vModel__"
                :label="item.__config__.label" :value="item.__vModel__">
              </el-option>
            </el-select>
          </el-col>
        </el-col>
        <el-col class="wrap" :span="1" style="text-align: right; font-size: 16px; z-index: 9999">
          <i class="el-icon-delete" @click="onDelCondition(index)"></i>
        </el-col>
      </el-row>
    </template>
    <div style="padding-left: 4px; margin-top: 10px">
      <el-button size="small" icon="el-icon-plus" @click="addCondition()">添加条件</el-button>
    </div>
  </section>
</template>

<script>
import { getDrawingList } from "@/components/extnGenerator/utils/db";

export default {
  props: {
    modelType: {
      type: [String, Number],
      default: ''
    },
    columnOptions: {
      type: Array,
      default: () => []
    },
    columnDataMap: {
      type: Object,
      default: {}
    },
    value: {
      type: Array,
      default: () => []
    },
    dataOptionMap: {
      type: Object,
      default: {}
    },
    options: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: "base"
    }
  },
  data() {
    return {
      nowJnpfKey: undefined,
      dialogVisible: false,
      symbolOptionsBase: [
        {
          label: "等于",
          value: "=="
        },
        {
          label: "不等于",
          value: "<>"
        },
        {
          label: "包含",
          value: "like"
        },
        {
          label: "不包含",
          value: "notLike"
        },
        {
          label: "为空",
          value: "null"
        },
        {
          label: "不为空",
          value: "notNull"
        },
      ],
      symbolOptionsDateNum: [
        {
          label: "大于等于",
          value: ">="
        },
        {
          label: "大于",
          value: ">"
        },
        {
          label: "等于",
          value: "=="
        },
        {
          label: "小于等于",
          value: "<="
        },
        {
          label: "小于",
          value: "<"
        },
        {
          label: "不等于",
          value: "<>"
        },
        {
          label: "介于",
          value: "between"
        },
        {
          label: "为空",
          value: "null"
        },
        {
          label: "不为空",
          value: "notNull"
        },
      ],
      symbolOptionsSelect: [
        {
          label: "包含任意一个",
          value: "in"
        },
        {
          label: "不包含任意一个",
          value: "notIn"
        },
        {
          label: "为空",
          value: "null"
        },
        {
          label: "不为空",
          value: "notNull"
        },
      ],
      symbolOptions: [
        {
          label: "大于等于",
          value: ">="
        },
        {
          label: "大于",
          value: ">"
        },
        {
          label: "等于",
          value: "=="
        },
        {
          label: "小于等于",
          value: "<="
        },
        {
          label: "小于",
          value: "<"
        },
        {
          label: "不等于",
          value: "<>"
        },
        {
          label: "介于",
          value: "between"
        },
        {
          label: "包含任意一个",
          value: "in"
        },
        {
          label: "不包含任意一个",
          value: "notIn"
        },
        {
          label: "包含",
          value: "like"
        },
        {
          label: "不包含",
          value: "notLike"
        },
        {
          label: "为空",
          value: "null"
        },
        {
          label: "不为空",
          value: "notNull"
        },
      ],
      logicOptions: [
        {
          label: "并且",
          value: "&&"
        },
        {
          label: "或者",
          value: "||"
        }
      ],
      pconditions: []
    };
  },
  computed: {
    usedFormItems() {
      let list = [];
      const loop = (data, parent) => {
        if (!data) return;
        if (
          data.__config__ &&
          !["switch", "table"].includes(data.__config__.jnpfKey) &&
          data.__config__.children &&
          Array.isArray(data.__config__.children)
        ) {
          loop(data.__config__.children, data);
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent));
        if (
          //下拉树形,关联表单 关联表单属性 弹窗选择 弹窗选择属性 下拉表格
          //不支持控件：开关、文件上传、图片上传、颜色选择、评分、滑块、富文本、链接、
          //按钮、文本、提示、二维码、条形码、用户组件、设计子表。
          data.__vModel__ &&
          ![
            "treeSelect",
            "relationForm",
            "relationFormAttr",
            "popupSelect",
            "popupAttr",
            "popupTableSelect",
            "switch",
            "uploadFz",
            "uploadImg",
            "colorPicker",
            "rate",
            "slider",
            "editor",
            "link",
            "button",
            "JNPFText",
            "alert",
            "usersSelect",
            "table"
          ].includes(data.__config__.jnpfKey)
        )
          list.push(data);
      };
      loop(this.columnOptions);
      const formItems = list;
      return formItems;
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.pconditions = val;
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    getCasProps(props) {
      props.multiple = true
      return props
    },
    input() {
      this.$forceUpdate();
    },
    getData() {
      return this.pconditions;
    },
    handleClose() {
      this.dialogVisible = false;
    },
    show(data) {
      this.dialogVisible = true;
      if (data != null) {
        this.init(data);
      }
    },
    addCondition() {
      let item = {
        fieldValue: "",
        props: {},
        fieldType: 1,
        fieldValueType: 2,
        fieldLabel: "",
        dataOptions: [],
        dataLabel: "",
        dataValue: "",
        field: "",
        symbol: "",
        logic: "&&",
        jnpfKey: ""
      };
      this.pconditions.push(item);
    },
    fieldNameChange(val, item, i) {
      let obj = this.usedFormItems.filter(o => o.__vModel__ == val)[0];
      item.fieldName = obj.__config__.label;
      item.jnpfKey = obj.__config__.jnpfKey;
      item = { ...item, ...obj };
      item.fieldValue = undefined;
      if (["radio", "checkbox", "select"].includes(item.jnpfKey)) {
        item.dataOptions = this.dataOptionMap[val].options;
      }
      if (["cascader", "treeSelect"].includes(item.jnpfKey)) {
        item.dataOptions = this.dataOptionMap[val].options;
        item.props = this.dataOptionMap[val].props;
      }
      item = { ...item, ...this.columnDataMap[val] };

      if (item.jnpfKey != this.nowJnpfKey) {
        item.symbol = undefined;
      }
      if (['null', 'notNull'].includes(item.symbol)) {
        item.disabled = true
      } else {
        item.disabled = false
      }
      // 清空数据
      item.symbol = undefined;

      this.$set(this.pconditions, i, item);
      this.nowJnpfKey = item.jnpfKey;
    },
    // 比较符号改变事件
    symbolChange(val, item, i) {
      item.fieldValue = undefined;

      if (['null', 'notNull'].includes(val)) {
        item.disabled = true
      } else {
        item.disabled = false
      }
      item.multiple = ["in", "notIn"].includes(val) ? true : false;
      if (['posSelect', 'currPosition'].includes(item.jnpfKey)) {
        if (["in", "notIn"].includes(val)) {
          item.searchMultiple = true
        } else {
          item.searchMultiple = false
        }

      }

      if (['cascader'].includes(item.jnpfKey)) {
        if (["in", "notIn"].includes(val)) {
          item.props.props.multiple = true
        } else {
          // item.props.props.multiple = false
        }

      }


      if (['select', 'radio', 'checkbox'].includes(item.jnpfKey)) {
        if (["in", "notIn"].includes(val)) {
          item.fieldValue = []
        } else {
          item.fieldValue = ''
        }
      }

      this.$set(this.pconditions, i, item);
    },
    /**
     * 删除条件
     */
    onDelCondition(index) {
      this.pconditions.splice(index, 1);
    }
  },
  components: {}
};
</script>

<style lang="scss" scoped>
.fieldValue {
  >>> .el-input__inner,
  .el-date-editor.el-input {
    width: 100%;
  }
}
.wrap {
  padding: 0 4px;
}

.title {
  font-size: 15px;
  color: black;
  font-weight: 400;
}
.el-select {
  width: 100%;
}
.el-cascader {
  width: 100%;
}
.el-input-number {
  width: 100%;
}
.el-icon-delete {
  line-height: 32px;
}
.numRange {
  max-width: inherit;
}
>>> .JNPF-selectTree {
  width: 100%;
}

>>> .popupSelect-container {
  width: 100%;
}
.condition-list-header {
  >>> .el-col {
    padding: 0 4px;
  }
}
</style>
