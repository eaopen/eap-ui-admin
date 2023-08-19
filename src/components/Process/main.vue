<script>
import FlowCard from "./FlowCard/index.vue";
import PropPanel from "./PropPanel/index.vue";
import { NodeUtils, getMockData } from "./FlowCard/util.js";
import { getDrawingList } from '@/components/Generator/utils/db'
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
  } else if (['select', 'depSelect', 'posSelect', 'userSelect', 'usersSelect', 'treeSelect', 'roleSelect', 'groupSelect'].includes(jnpfKey)) {
    if (data.multiple) return 'array'
  }
  return ''
}

export default {
  name: 'ProcessMain',
  props: ['conf', 'flowType', 'verifyMode', 'formInfo'],
  data() {
    let data = {}
    data = this.conf
    return {
      data, // 流程图数据
      scaleVal: 100, // 流程图缩放比例 100%
      step: 5, // 缩放步长
      updateId: 0, // key值 用于模拟$forceUpdate
      activeData: null, // 被激活的流程卡片数据，用于属性面板编辑
      isProcessCmp: true,
      // verifyMode: false
    };
  },
  methods: {
    updateFiled(flowTemplateJson) {
      const loop = data => {
        if (Array.isArray(data)) data.forEach(d => loop(d))
        if (data.type === 'approver' || data.type === 'start') {
          this.initFormOperates(data)
        }
        if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes)
        if (data.childNode) loop(data.childNode)
      }
      loop(flowTemplateJson)
    },
    initFormOperates(target) {
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
      const getRequiredById = (id) => {
        const arr = formOperates.filter(o => o.id === id)
        return arr.length ? arr[0].required : false
      }
      const loop = (data, parent) => {
        if (!data) return
        if (data.__vModel__) {
          const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table'
          const id = isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__
          res.push({
            id: id,
            name: isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label,
            required: data.__config__.required || getRequiredById(id),
            requiredDisabled: requiredDisabled(data.__config__.jnpfKey) || data.__config__.required,
            jnpfKey: data.__config__.jnpfKey,
            dataType: getDataType(data),
            read: getReadById(id),
            write: getWriteById(id)
          })
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
      }
      loop(getDrawingList())
      target.properties.formOperates = res
    },
    /**
     * 接收所有FlowCard事件触发
     * @param { Object } data - 含有event(事件名称)/args(参数)两个属性
     */
    eventReceiver({ event, args }) {
      if (event === "edit") {
        this.activeData = args[0]; // 打开属性面板
        return;
      }
      // 本实例只监听了第一层数据（startNode）变动
      // 为了实时更新  采用$forceUpdate刷新 但是由于某些条件下触发失效（未排除清除原因）
      // 使用key + 监听父组件updateId方式强制刷新
      NodeUtils[event](...args);
      this.forceUpdate();
    },

    forceUpdate() {
      this.updateId = this.updateId + 1;
    },
    /**
     * 控制流程图缩放
     * @param { Object } val - 缩放增量 是step的倍数 可正可负
     */
    changeScale(val) {
      if (this.scaleVal >= 0 && this.scaleVal <= 200) {
        if (this.scaleVal === 200 && this.scaleVal + val > 200) return
        if (this.scaleVal === 0 && this.scaleVal + val < 0) return
        // 缩放介于0%~200%
        this.scaleVal += val;
      }
    },
    /**
     * 属性面板提交事件
     * @param { Object } value - 被编辑的节点的properties属性对象
     */
    onPropEditConfirm(value, content) {
      this.activeData.content = content || '请设置条件'
      let oldProp = this.activeData.properties;
      this.activeData.properties = value;
      // 修改优先级
      if (NodeUtils.isConditionNode(this.activeData)) {
        value.priority !== oldProp.priority
          && NodeUtils.resortPrioByCNode(
            this.activeData,
            oldProp.priority,
            this.data
          );
        NodeUtils.setDefaultCondition(this.activeData, this.data)
      }
      if (NodeUtils.isStartNode(this.activeData)) this.$emit('startNodeChange', this.data)
      this.onClosePanel();
      this.forceUpdate();
    },
    /**
     * 属性面板取消事件
     */
    onClosePanel() {
      this.activeData = null;
    },

    // 传formIds 查询指定组件 未传时  判断所有组件
    isFilledPCon(formIds) {
      let res = false
      const loopChild = (parent, callback) => parent.childNode && loop(parent.childNode, callback)
      const loop = (data, callback) => {
        if (res || !data) return // 查找到就退出
        if (Array.isArray(data.conditionNodes)) {
          const uesd = data.conditionNodes.some(c => {
            const cons = c.properties.conditions || []
            return Array.isArray(formIds)
              ? cons.some(item => formIds.includes(item.formId)) // 查询特定组件
              : cons.length > 0 // 只要有节点设置了条件 说明就有组件作为条件被使用
          })
          uesd ? callback() : data.conditionNodes.forEach(t => loopChild(t, callback))
        }
        loopChild(data, callback)
      }
      loop(this.data, () => res = true)
      return res
    }
  },
  render: function (h) {
    return (
      <div class="flow-container">
        <div class="scale-slider">
          <i class="btn  el-icon-minus"
            onClick={this.changeScale.bind(this, -this.step)}></i>
          <span style="font-size:14px;">{this.scaleVal}%</span>
          <i class="btn  el-icon-plus "
            onClick={this.changeScale.bind(this, this.step)}></i>
        </div>
        <FlowCard
          verifyMode={this.verifyMode}
          key={this.updateId}
          data={this.data}
          onEmits={this.eventReceiver}
          style={{ transform: `scale(${this.scaleVal / 100})` }}
        />
        <PropPanel
          value={this.activeData}
          flowType={this.flowType || 0}
          processData={this.data}
          formInfo={this.formInfo}
          onConfirm={this.onPropEditConfirm}
          onCancel={this.onClosePanel}
        />
      </div>
    );
  }
};
</script>

<style scoped lang="scss">
$bg-color: #ebeef5;

.flow-container {
  display: inline-block;
  background: $bg-color;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  text-align: center;
  overflow: auto;
}

.scale-slider {
  position: fixed;
  right: 0;
  z-index: 99;

  .btn {
    display: inline-block;
    padding: 4px;
    border: 1px solid #cacaca;
    border-radius: 3px;
    background: #fff;
    margin-left: 10px;
    margin-right: 10px;
    cursor: pointer;
  }
}
</style>
