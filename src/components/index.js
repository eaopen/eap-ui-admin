import DictTag from '@/components/DictTag'
import DocAlert from '@/components/DocAlert'
import Pagination from "@/components/Pagination";
import RightToolbar from "@/components/RightToolbar"
import ListAgGrid from '@/components/obpm/grid/index.vue'
import topOperation from '@/components/extn/topOperation/index'
import Tinymce from '@/components/tinymce/index.vue'

import JNPFTable from '@/components/extn/JNPF-table'
import JNPFTreeSelect from '@/components/extn/JNPF-treeSelect'
import uploadBtn from '@/components/extn/JNPF-uploadBtn'
import jnpfFormTipItem from '@/components/extn/jnpf-form-tip-item'


export default {
  install(Vue, options) {
    Vue.component('DictTag', DictTag)
    Vue.component('DocAlert', DocAlert)
    Vue.component('Pagination', Pagination)
    Vue.component('RightToolbar', RightToolbar)
    Vue.component('ListAgGrid', ListAgGrid)
    Vue.component('topOpts', topOperation)
    Vue.component('tinymce', Tinymce)
    Vue.component('JNPFTable', JNPFTable)
    Vue.component('JNPFTreeSelect', JNPFTreeSelect)
    Vue.component('uploadBtn', uploadBtn)
    Vue.component('jnpfFormTipItem', jnpfFormTipItem)
  }
}