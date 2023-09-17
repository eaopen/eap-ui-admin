import BpmnProcessDesigner from "./designer";
import BpmnProcessViewer from './designer/index2';
import BpmnPropertiesPanel from "./penal";
import BpmnProcessPalette from './palette/ProcessPalette';

const components = [BpmnProcessDesigner,
  BpmnPropertiesPanel,
  BpmnProcessViewer,
  BpmnProcessPalette];

const install = function (Vue){
  components.forEach(component => {
    Vue.component(component.name, component);
  });
};

if(typeof window !== "undefined" && window.Vue){
  install(window.Vue);
}

export default {
  //version: "0.0.1",
  install,
  ...components
};