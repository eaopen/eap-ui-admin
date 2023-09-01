import DictTag from '@/components/DictTag'
import DocAlert from '@/components/DocAlert'
import Pagination from "@/components/Pagination";
import RightToolbar from "@/components/RightToolbar"
import Tinymce from '@/components/tinymce/index.vue'

// obpm
import ListAgGrid from '@/components/obpm/grid/index.vue'

// extn
import topOperation from '@/components/extn/topOperation/index'
import tableOperation from '@/components/extn/tableOperation'
import uploadBtn from '@/components/extn/uploadBtn'
import JNPFTable from '@/components/extn/table'
import JNPFTreeSelect from '@/components/extn/treeSelect'
import jnpfFormTipItem from '@/components/extn/form-tip-item'


export default {
  install(Vue, options) {
    Vue.component('DictTag', DictTag)
    Vue.component('DocAlert', DocAlert)
    Vue.component('Pagination', Pagination)
    Vue.component('RightToolbar', RightToolbar)
    Vue.component('ListAgGrid', ListAgGrid)
    Vue.component('topOpts', topOperation)
    Vue.component('tableOpts', tableOperation)
    Vue.component('tinymce', Tinymce)
    Vue.component('JNPFTable', JNPFTable)
    Vue.component('JNPFTreeSelect', JNPFTreeSelect)
    Vue.component('uploadBtn', uploadBtn)
    Vue.component('jnpfFormTipItem', jnpfFormTipItem)
  }
}