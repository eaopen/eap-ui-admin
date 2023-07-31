import CardHeader from "../CardHeader"
import webLink from '../Link'
import { getDataInterfaceRes } from '@/api/systemData/dataInterface'
const arrayList = ['carousel', 'rankList', 'timeAxis']
export default {
  components: { CardHeader, webLink },
  props: {
    activeData: { type: Object, default: () => { } }
  },
  data() {
    return {
      marqueeKey: +new Date(),
      key: +new Date(),
      fistData: {},
      secondData: {},
      thirdData: {},
      otherDataList: [],
      listLoading: false,
      value: '',
      list: [],
      timeList: [],
    }
  },
  watch: {
    'option.styleType': {
      handler(val) {
        if (this.jnpfKey == 'rankList' && (val == 3 || val == 4)) this.handleRankList()
      }
    },
    'activeData.dataType': {
      handler(val) {
        if (!this.activeData || this.activeData == {}) return
        if (arrayList.includes(this.jnpfKey)) {
          this.option.defaultValue = []
          this.list = []
        }
      }
    },
    'option.defaultValue': {
      handler(val) {
        if (!this.activeData || this.activeData == {}) return
        if (arrayList.includes(this.jnpfKey)) {
          this.list = JSON.parse(JSON.stringify(val))
        } else {
          this.value = JSON.parse(JSON.stringify(val))
        }
        if (this.jnpfKey == 'rankList' && (this.option.styleType == 3 || this.option.styleType == 4)) this.handleRankList()
        if (this.jnpfKey == 'timeAxis') this.initTimeAxis()
        if (this.jnpfKey == 'video' && this.option.styleType == 1 && val.url) this.value = this.define.comUrl + val.url
      },
      immediate: true,
      deep: true
    },
    'activeData.propsApi': {
      handler(val) {
        if (!this.activeData || this.activeData == {}) return
        if (this.activeData.dataType === 'static' || !val) return
        getDataInterfaceRes(val).then(res => {
          if (arrayList.includes(this.jnpfKey)) {
            this.list = []
            if (Array.isArray(res.data)) this.list = res.data
            if (this.jnpfKey == 'rankList' && (this.option.styleType == 3 || this.option.styleType == 4)) this.handleRankList()
            if (this.jnpfKey == 'timeAxis') this.initTimeAxis()
          } else {
            this.value = ''
            this.value = res.data
          }
          this.key = +new Date()
        })
      },
      immediate: true,
      deep: true
    },
    'option.showNumber': {
      handler(val) {
        this.initTimeAxis()
      }
    },
    'option.sortable': {
      handler(val) {
        this.initTimeAxis()
      }
    }
  },
  computed: {
    option() {
      return this.activeData.option
    },
    jnpfKey() {
      return this.activeData.jnpfKey
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      if (this.activeData.dataType === 'dynamic') {
        const propsApi = this.activeData.propsApi
        if (!propsApi) return
        getDataInterfaceRes(propsApi).then(res => {
          this.handleData(res.data)
        })
      } else {
        this.handleData(this.activeData.option.defaultValue)
      }
    },
    handleData(val) {
      const option = this.activeData.option
      const jnpfKey = this.activeData.jnpfKey
      if (arrayList.includes(this.jnpfKey)) {
        this.list = JSON.parse(JSON.stringify(val))
      } else {
        this.value = JSON.parse(JSON.stringify(val))
      }
      if (jnpfKey == 'rankList' && (option.styleType == 3 || option.styleType == 4)) this.handleRankList()
      if (jnpfKey == 'timeAxis') this.initTimeAxis()
      if (jnpfKey == 'video' && option.styleType == 1 && val.url) this.value = this.define.comUrl + val.url
    },
    handleRankList() {
      this.fistData = {}
      this.secondData = {}
      this.thirdData = {}
      this.otherDataList = []
      if (this.list && this.list.length) this.fistData = this.list[0]
      if (this.list && this.list.length && this.list.length >= 2) this.secondData = this.list[1]
      if (this.list && this.list.length && this.list.length >= 3) this.thirdData = this.list[2]
      this.otherDataList = JSON.parse(JSON.stringify(this.list)).slice(3, this.list.length)
    },
    async handleCarousel() {
      for (let i = 0; i < this.list.length; i++) {
        const ele = this.list[i];
        if (ele.dataType == 1) ele.imageUrl = this.define.comUrl + ele.imageUrl
        if (ele.dataType == 3) {
          let res = await getDataInterfaceRes(ele.propsApi)
          ele.imageUrl = res.data
        }
      }
    },
    handleRowStyle({ row, rowIndex }) {
      const style = { height: '55px' }
      if (rowIndex == 0) style.color = '#CE7C1F'
      if (rowIndex == 1) style.color = '#6F89AC'
      if (rowIndex == 2) style.color = '#8D4112'
      return style
    },
    initTimeAxis() {
      const showNumber = this.option.showNumber
      const list = showNumber && Number.isInteger(showNumber) ? this.list.slice(0, showNumber) : this.list
      this.timeList = JSON.parse(JSON.stringify(list))
      if (this.activeData.option.sortable == 2) this.timeList.reverse()
    },
    getColor(index) {
      if (index == 0) return '#3ED538'
      if (this.timeList.length - 1 == index) return '#1990FA'
      return '';
    }
  }
}
