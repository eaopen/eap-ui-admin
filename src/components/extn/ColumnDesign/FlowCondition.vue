<template>
  <el-dialog class="OBPM-dialog JNPF-dialog_center" title="过滤规则配置" :visible.sync="dialogVisible"
    width="800px" append-to-body :before-close="handleClose">
    <Condition :value="pconditions" ref="base" :modelType="modelType" :columnDataMap="columnDataMap"
      :dataOptionMap="dataOptionMap" :columnOptions="columnOptions"></Condition>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script setup></script>

<script>
import { dyOptionsList } from '@/components/extnGenerator/generator/comConfig'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'
import Condition from "./condition";
export default {
  props: {
    modelType: {
      type: [String, Number],
      default: ""
    },
    value: {
      type: Array,
      default: () => []
    },
    columnData: {
      type: Object,
      default: {}
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tempCondition: [],
      columnDataMap: {},
      dataOptionMap: {},
      dialogVisible: false,
      pconditions: [],
      columnOptions: []
    };
  },
  watch: {
    columnData: {
      handler(val) {
        this.columnOptions = val.columnOptions;
        val.columnOptions.map(item => {
          this.columnDataMap[item.__vModel__] = item;
        });
        // 基本下拉数据
        let arr = val.columnOptions.filter(item =>
          ["radio", "checkbox", "select"].includes(item.__config__.jnpfKey)
        );
        arr.forEach(item => {
          let dataLabel = item.props.props.label;
          let dataValue = item.props.props.value;
          let options = item.options.map(i => {
            return {
              ...i,
              dataLabel: dataLabel,
              dataValue: dataValue
            };
          });
          this.dataOptionMap[item.__vModel__] = { options };
        });
        // 树型数据
        let arrTree = val.columnOptions.filter(item =>
          ["cascader", "treeSelect"].includes(item.__config__.jnpfKey)
        );
        arrTree.forEach(item => {
          this.dataOptionMap[item.__vModel__] = {
            options: item.options,
            props: item.props.props
          };
        });
      },
      deep: true
    }
  },
  methods: {
    init(data) {
      // 从缓存拿暂存数据
      let ruleData = this.$store.getters.ruleData;
      if(ruleData && ruleData.length > 0){
        this.pconditions = JSON.parse(JSON.stringify(ruleData));
      }else{
        this.$store.commit("generator/SET_FILTER_DATA",JSON.parse(JSON.stringify(data)))
        this.pconditions = data;
      }
      this.buildOptions(data)
      
    },
    buildOptions(componentList) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if(!config) return
        if (config.jnpfKey === 'cascader') cur.props.props.multiple = false
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          let isTreeSelect = config.jnpfKey === 'treeSelect' || config.jnpfKey === 'cascader'
          if (config.dataType === 'dictionary') {
            if (!config.dictionaryType) return
            getDictionaryDataSelector(config.dictionaryType).then(res => {
              isTreeSelect ? cur.options = res.data.list : cur.__slot__.options = res.data.list
            })
          }
          if (config.dataType === 'dynamic') {
            if (!config.propsUrl) return
            getDataInterfaceRes(config.propsUrl).then(res => {
              let data = res.data
              if (Array.isArray(data)) {
                isTreeSelect ? cur.options = data : cur.__slot__.options = data
              } else {
                isTreeSelect ? cur.options = [] : cur.__slot__.options = []
              }
            })
          }
        }
      })
      return componentList
    },
    validData() {
      let valid = true;
      this.pconditions.forEach(k => {
        if (!["null", "notNull"].includes(k.symbol)) {
          if (!k.field) {
            this.$message.warning("条件字段不能为空");
            valid = false;
            return;
          }
          if (!k.symbol) {
            this.$message.warning("条件符号不能为空");
            valid = false;
            return;
          }
          if (!k.fieldValue) {
            if ((k.jnpfKey == 'numInput' || k.jnpfKey == 'calculate') && k.fieldValue == 0) return valid = true;
            this.$message.warning("数据值不能为空");
            valid = false;
            return;
          }
          if (Array.isArray(k.fieldValue) && k.fieldValue.length == 0) {
            this.$message.warning("数据值不能为空");
            valid = false;
            return;
          }
        }
      });
      return valid;
    },
    confirm() {
      // 获取属性配置
      this.$nextTick(() => {
        this.pconditions = this.$refs.base.getData();

        if (!this.validData()) {
          return;
        }
        let cloneConditions = JSON.parse(JSON.stringify(this.pconditions));
        this.$emit("ruleConfig", cloneConditions);
        this.$store.commit("generator/SET_FILTER_DATA",cloneConditions)
        this.dialogVisible = false;
      });
    },
    handleClose() {
      this.$emit("ruleConfig", this.$store.getters.ruleData);
      this.dialogVisible = false;
    },
    show(data) {
      this.dialogVisible = true;
      if (data.length == 0) {
        this.pconditions = [];
        this.addCondition();
      } else {
        this.init(data);
      }
    },
    addCondition() {
      let item = {
        fieldName: "",
        symbolName: "",
        fieldValue: "",
        fieldType: 1,
        fieldValueType: 2,
        fieldLabel: "",
        logicName: "并且",
        field: "",
        symbol: "",
        logic: "&&",
        jnpfKey: ""
      };
      this.pconditions.push(item);
    }
  },
  components: {
    Condition
  }
};
</script>

<style lang="scss" scoped>
.title {
  font-size: 15px;
  color: black;
  font-weight: 400;
}
</style>
