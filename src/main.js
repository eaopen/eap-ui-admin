import Vue from 'vue'

import Element from 'element-ui'
import './assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/obpm.scss' // global css
import '@/assets/styles/ruoyi.scss' // ruoyi css
import './assets/icons' // icon
import './assets/obpm/font-awesome.min.css'
import '@/styles/index.scss'
import "@/assets/icons/ym/iconfont.css"

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive
import plugins from './plugins' // plugins
import i18n from './lang' // internationalization

// extn 组件引入

import './permission' // permission control
import { parseTime, resetForm, handleTree, addBeginAndEndTime, divide} from "@/utils/ruoyi";
import {DICT_TYPE, getDictDataLabel, getDictDatas, getDictDatas2} from "@/utils/dict";



Object.assign(Vue.prototype, {
  define: require('./utils/define'),
  formValidate: require('./utils/formValidate').default,
  obpm: require('./utils/extn').obpm,
  jnpf: require('./utils/extn').jnpf,
  getDicts: require('./utils/extn').getDicts,
  getConfigKey: require('@/api/infra/config').getConfigKey,
  $axios: require('@/utils/request').request,
  DICT_TYPE,
  getDictDataLabel,
  getDictDatas,
  getDictDatas2,
  parseTime, 
  resetForm, 
  handleTree, 
  addBeginAndEndTime, 
  divide
})

// 全局组件挂载


import VueMeta from 'vue-meta'
import components from './components'

Vue.use(components)
Vue.use(directive)
Vue.use(plugins)
Vue.use(VueMeta)




// bpm will change
// bpmnProcessDesigner 需要引入
import MyPD from "@/plugins/package/index.js";
Vue.use(MyPD);
import "@/plugins/package/theme/index.scss";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import '@/plugins/package/highlight';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
import vuePlugin from "@highlightjs/vue-plugin";
Vue.use(vuePlugin);

// Form Generator 组件需要使用到 tinymce


// 默认点击背景不关闭弹窗
import ElementUI from 'element-ui'
ElementUI.Dialog.props.closeOnClickModal.default = false

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: localStorage.getItem("size") || "small", // set element-ui default size
});

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app")
