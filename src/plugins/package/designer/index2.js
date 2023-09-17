import BpmnProcessViewer from "./ProcessViewer.vue";

BpmnProcessViewer.install = function(Vue) {
  Vue.component(BpmnProcessViewer.name, BpmnProcessViewer);
};

// 流程图的查看器，不可编辑
export default BpmnProcessViewer;
