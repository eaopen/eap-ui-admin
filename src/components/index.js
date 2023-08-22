import DictTag from '@/components/DictTag'
import DocAlert from '@/components/DocAlert'
import Pagination from "@/components/Pagination";
import RightToolbar from "@/components/RightToolbar"
import ListAgGrid from '@/components/obpm/grid/index.vue'
import topOperation from '@/components/extn/topOperation/index'
import Tinymce from '@/components/tinymce/index.vue'

export default {
  install(Vue, options) {
    Vue.component('DictTag', DictTag)
    Vue.component('DocAlert', DocAlert)
    Vue.component('Pagination', Pagination)
    Vue.component('RightToolbar', RightToolbar)
    Vue.component('ListAgGrid', ListAgGrid)
    Vue.component('topOpts', topOperation)
    Vue.component('tinymce', Tinymce)
  }
}