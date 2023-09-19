import DictTag from '@/components/DictTag'
import DocAlert from '@/components/DocAlert'
import Pagination from "@/components/Pagination";
import RightToolbar from "@/components/RightToolbar"
import Tinymce from '@/components/tinymce/index.vue'

// obpm
import ListAgGrid from '@/components/obpm/grid/index.vue'

// extend common
import topOperation from '@/components/extn/topOperation/index'
import tableOperation from '@/components/extn/tableOperation'

import uploadBtn from '@/components/extn/uploadBtn'
import JNPFTable from '@/components/extn/table'
import JNPFTreeSelect from '@/components/extn/treeSelect'
import JnpfFormTipItem from '@/components/extn/form-tip-item'



// extend generator
// 暂时隐藏
import UserSelect from '@/components/extnGenerator/components/JNPF-userSelect'
// import UsersSelect from '@/components/extnGenerator/components/JNPF-usersSelect'

import JNPFQuill from '@/components/extnGenerator/components/JNPFEditor/quill'
// import UserSelect from '@/components/extnGenerator/components/JNPFText'
import UsersSelect from '@/components/extnGenerator/components/JNPFText'

import JnpfDatePicker from '@/components/extnGenerator/components/JnpfDatePicker'
import JNPFText from '@/components/extnGenerator/components/JNPFText'
import JnpfLink from '@/components/extnGenerator/components/JnpfLink'
import JnpfBarcode from '@/components/extnGenerator/components/JnpfBarcode'
import JnpfQrcode from '@/components/extnGenerator/components/JnpfQrcode'
import JnpfButton from '@/components/extnGenerator/components/JnpfButton'
import JNPFUploadFz from '@/components/extnGenerator/components/Upload/UploadFz'
import JNPFUploadImg from '@/components/extnGenerator/components/Upload/UploadImg'
import PopupSelect from '@/components/extnGenerator/components/PopupSelect'
import PopupTableSelect from '@/components/extnGenerator/components/PopupTableSelect'
import PopupAttr from '@/components/extnGenerator/components/PopupAttr'
import NumRange from '@/components/extnGenerator/components/NumRange'
import ComSelect from '@/components/extnGenerator/components/ComSelect'
import GroupSelect from '@/components/extnGenerator/components/GroupSelect'
import DepSelect from '@/components/extnGenerator/components/DepSelect'
import PosSelect from '@/components/extnGenerator/components/PosSelect'
import DicSelect from '@/components/extnGenerator/components/DicSelect'
import BillRule from '@/components/extnGenerator/components/BillRule'
import JNPFInputTable from '@/components/extnGenerator/components/InputTable'
import RoleSelect from '@/components/extnGenerator/components/RoleSelect'
import JNPFAddress from '@/components/extnGenerator/components/Address'
import GroupTitle from '@/components/extnGenerator/components/GroupTitle'
import RelationForm from '@/components/extnGenerator/components/RelationForm'
import RelationFormAttr from '@/components/extnGenerator/components/RelationFormAttr'
import Calculate from '@/components/extnGenerator/components/Calculate'
import JnpfInputNumber from '@/components/extnGenerator/components/JnpfInputNumber'
import JnpfNumber from '@/components/extnGenerator/components/JnpfNumber'
import JnpfDateRangePicker from '@/components/extnGenerator/components/JnpfDateRangePicker'
import JnpfRadio from '@/components/extnGenerator/components/JnpfRadio'
import JnpfCheckbox from '@/components/extnGenerator/components/JnpfCheckbox'
import JnpfSelect from '@/components/extnGenerator/components/JnpfSelect'
import JnpfAutoComplete from '@/components/extnGenerator/components/JnpfAutoComplete'
import JnpfTimePicker from '@/components/extnGenerator/components/JnpfTimePicker'


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
    Vue.component('JnpfFormTipItem', JnpfFormTipItem)
    Vue.component('JNPFText', JNPFText)
    Vue.component('JnpfLink', JnpfLink)
    Vue.component('JnpfBarcode', JnpfBarcode)
    Vue.component('JnpfQrcode', JnpfQrcode)
    Vue.component('JnpfButton', JnpfButton)
    Vue.component('JNPFUploadFz', JNPFUploadFz)
    Vue.component('JNPFUploadImg', JNPFUploadImg)
    Vue.component('PopupSelect', PopupSelect)
    Vue.component('PopupTableSelect', PopupTableSelect)
    Vue.component('PopupAttr', PopupAttr)
    Vue.component('NumRange', NumRange)
    Vue.component('ComSelect', ComSelect)
    Vue.component('GroupSelect', GroupSelect)
    Vue.component('DepSelect', DepSelect)
    Vue.component('PosSelect', PosSelect)
    Vue.component('UserSelect', UserSelect)
    Vue.component('UsersSelect', UsersSelect)
    Vue.component('RoleSelect', RoleSelect)
    Vue.component('DicSelect', DicSelect)
    Vue.component('BillRule', BillRule)
    Vue.component('JNPFInputTable', JNPFInputTable)
    Vue.component('JNPFAddress', JNPFAddress)
    Vue.component('GroupTitle', GroupTitle)
    Vue.component('RelationForm', RelationForm)
    Vue.component('RelationFormAttr', RelationFormAttr)
    Vue.component('Calculate', Calculate)
    Vue.component('JNPFQuill', JNPFQuill)
    // Vue.component('Screenfull', Screenfull)
    // Vue.component('ColumnSettings', ColumnSettings)
    // Vue.component('ImportBox', ImportBox)
    Vue.component('JnpfInputNumber', JnpfInputNumber)
    Vue.component('JnpfNumber', JnpfNumber)
    Vue.component('JnpfDatePicker', JnpfDatePicker)
    Vue.component('JnpfRadio', JnpfRadio)
    Vue.component('JnpfCheckbox', JnpfCheckbox)
    Vue.component('JnpfSelect', JnpfSelect)
    Vue.component('JnpfAutoComplete', JnpfAutoComplete)
    Vue.component('JnpfTimePicker', JnpfTimePicker)
    Vue.component('JnpfDateRangePicker', JnpfDateRangePicker)
  }
}