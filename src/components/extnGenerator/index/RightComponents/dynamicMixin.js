import { noAllowRelationList } from '@/components/extnGenerator/generator/comConfig'
import { getDrawingList } from '@/components/extnGenerator/utils/db'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'
import draggable from 'vuedraggable'
import InterfaceDialog from '@/components/extnProcess/PropPanel/InterfaceDialog'
export default {
  props: ['activeData', 'dictionaryOptions', 'dataInterfaceOptions'],
  components: { draggable, InterfaceDialog },
  data() {
    return {
      dictionaryId: ''
    }
  },
  computed: {
    dicOptions() {
      return this.dictionaryOptions
    },
    interfaceOptions() {
      return this.dataInterfaceOptions
    },
    defaultValue() {
      let defaultValue = ''
      if (this.activeData.__config__.jnpfKey === 'checkbox' || this.activeData.multiple) defaultValue = []
      return defaultValue
    },
    formFieldsOptions() {
      let list = []
      const loop = (data, parent) => {
        if (!data) return
        if (data.__config__ && this.isIncludesTable(data) && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data)
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent))
        if (data.__vModel__ && !noAllowRelationList.includes(data.__config__.jnpfKey) && data.__vModel__ !== this.activeData.__vModel__) {
          const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table'
          list.push({
            realVModel: isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__,
            realLabel: isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label,
            ...data
          })
        }
      }
      loop(getDrawingList())
      return list
    },
  },
  methods: {
    isIncludesTable(data) {
      if ((!data.__config__.layout || data.__config__.layout === 'rowFormItem') && data.__config__.jnpfKey !== 'table') return true
      if (this.activeData.__config__.isSubTable) return this.activeData.__config__.parentVModel === data.__vModel__
      return data.__config__.jnpfKey !== 'table'
    },
    onRelationFieldChange(val, row) {
      if (!val) return row.jnpfKey = ''
      let list = this.formFieldsOptions.filter(o => o.realVModel === val)
      if (!list.length) return row.jnpfKey = ''
      let item = list[0]
      row.jnpfKey = item.__config__.jnpfKey
    },
    multipleChange(val) {
      this.$set(this.activeData.__config__, 'defaultValue', val ? [] : '')
    },
    addSelectItem() {
      const id = this.jnpf.idGenerator()
      this.activeData.options.push({
        id: id,
        fullName: '选项' + id,
      })
    },
    dataTypeChange(val) {
      this.activeData.__config__.defaultValue = this.defaultValue
      this.activeData.options = []
      this.activeData.__config__.props.value = 'id'
      this.activeData.__config__.props.label = 'fullName'
      this.activeData.__config__.dictionaryType = ''
      this.activeData.__config__.propsUrl = ''
      this.activeData.__config__.propsName = ''
      this.activeData.__config__.templateJson = []
    },
    dictionaryTypeChange(val) {
      this.dictionaryId = val
      this.activeData.__config__.defaultValue = this.defaultValue
      if (!val) {
        this.activeData.options = []
        return
      }
      getDictionaryDataSelector(val).then(res => {
        this.activeData.options = res.data.list
      })
    },
    propsUrlChange(val, row) {
      this.activeData.__config__.defaultValue = this.defaultValue
      if (!val) {
        this.activeData.__config__.propsUrl = ''
        this.activeData.__config__.propsName = ''
        this.activeData.__config__.templateJson = []
        this.activeData.options = []
        return
      }
      let list = row.requestParameters ? JSON.parse(row.requestParameters) : []
      this.activeData.__config__.propsUrl = val
      this.activeData.__config__.propsName = row.fullName
      this.activeData.__config__.templateJson = list.map(o => ({ ...o, relationField: '' }))
      let query = {
        paramList: this.activeData.__config__.templateJson || [],
      }
      getDataInterfaceRes(val, query).then(res => {
        let data = res.data
        if (Array.isArray(data)) {
          this.activeData.options = data
        } else {
          this.activeData.options = []
        }
      }).catch(() => {
        this.activeData.__config__.propsUrl = ''
        this.activeData.__config__.propsName = ''
        this.activeData.__config__.templateJson = []
        this.activeData.options = []
      })
    }
  }
}