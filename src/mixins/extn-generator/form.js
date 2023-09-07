import { getVisualDevInfo, Update, Create } from '@/api/onlineDev/visualDev'
import commonMixin from '@/mixins/extn-generator/common'
export default {
  mixins: [commonMixin],
  data() {
    return {
      visible: false,
      loading: false,
      activeStep: 0,
      dataForm: {
        id: '',
        fullName: '',
        enCode: '',
        type: 1,
        webType: 2,
        dbLinkId: '0',
        sortCode: 0,
        enableFlow: 0,
        state: 1,
        category: '',
        description: "",
        tables: '',
        interfaceId: '',
        interfaceName: ''
      },
      dataRule: {
        fullName: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
        ],
        enCode: [
          { required: true, message: '编码不能为空', trigger: 'blur' },
          { validator: this.formValidate('enCode'), trigger: 'blur' },
        ],
        category: [
          { required: true, message: '分类不能为空', trigger: 'change' },
        ]
      },
      stepLoading: false,
      maxStep: 2,
      tables: [],
      interfaceParam: [],
      defaultTable: [],
      formVisible: false,
      btnLoading: false,
      formData: null,
      columnData: null,
      appColumnData: null,
      categoryList: [],
      dbOptions: [],
      dbType: "MySQL",
      mainTableFields: [],
      relationTable: ""
    }
  },
  methods: {
    init(categoryList, id, type, webType, isToggle) {
      this.categoryList = categoryList
      this.activeStep = 0
      this.tables = []
      this.defaultTable = []
      this.dataForm.id = id || ''
      this.getDbOptions()
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.loading = true
          getVisualDevInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data
            this.dataForm.webType = this.dataForm.webType || 2
            if (isToggle) this.dataForm.webType = webType
            if (parseInt(this.dataForm.webType) == 4) {
              this.maxStep = 1
            } else {
              this.maxStep = 2
            }
            this.formData = this.dataForm.formData && JSON.parse(this.dataForm.formData)
            this.columnData = this.dataForm.columnData && JSON.parse(this.dataForm.columnData)
            this.appColumnData = this.dataForm.appColumnData && JSON.parse(this.dataForm.appColumnData)
            this.tables = this.dataForm.tables && JSON.parse(this.dataForm.tables) || []
            this.interfaceParam = this.dataForm.interfaceParam && JSON.parse(this.dataForm.interfaceParam) || []
            this.defaultTable = this.dataForm.tables && JSON.parse(this.dataForm.tables) || []
            this.updateFields()
          }).catch(() => { this.loading = false })
        } else {
          this.dataForm.type = type
          this.dataForm.webType = webType || 2
          if (parseInt(this.dataForm.webType) == 4) {
            this.maxStep = 1
          } else {
            this.maxStep = 2
          }
        }
      })
    },
    dataFormSubmit() {
      const getData = () => {
        this.dataForm.tables = JSON.stringify(this.tables)
        this.dataForm.formData = this.formData ? JSON.stringify(this.formData) : null
        this.dataForm.columnData = this.columnData ? JSON.stringify(this.columnData) : null
        this.dataForm.appColumnData = this.appColumnData ? JSON.stringify(this.appColumnData) : null
        this.dataForm.interfaceParam = this.interfaceParam ? JSON.stringify(this.interfaceParam) : null
        this.$store.state.extnGenerator.ruleData = []
      }
      if (!this.activeStep) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            if (!this.tables.length) {
              const type = this.dataForm.type
              if (this.defaultTable.length || type == 3 || type == 4) {
                this.$message.warning('请至少选择一个数据表')
                return
              }
            }
            getData()
            this.formSubmit()
          }
        })
      } else if (this.activeStep == 1) {
        if (this.dataForm.webType == 4) {
          this.$refs['columnDesign'].getData().then(res => {
            this.columnData = res.columnData
            this.appColumnData = res.appColumnData
            for (let i = 0; i < this.columnData.searchList.length; i++) {
              const element = this.columnData.searchList[i];
              if (!element.__config__.label) return this.$message({ message: '查询字段列名不能为空', type: 'warning' })
            }
            for (let i = 0; i < this.columnData.columnList.length; i++) {
              const element = this.columnData.columnList[i];
              if (!element.label) return this.$message({ message: '列表字段列名不能为空', type: 'warning' })
            }
            for (let i = 0; i < this.appColumnData.searchList.length; i++) {
              const element = this.appColumnData.searchList[i];
              if (!element.label) return this.$message({ message: '查询字段列名不能为空', type: 'warning' })
            }
            for (let i = 0; i < this.appColumnData.sortList.length; i++) {
              const element = this.appColumnData.sortList[i];
              if (!element.label) return this.$message({ message: '排序字段列名不能为空', type: 'warning' })
            }
            for (let i = 0; i < this.appColumnData.columnList.length; i++) {
              const element = this.appColumnData.columnList[i];
              if (!element.label) return this.$message({ message: '列表字段列名不能为空', type: 'warning' })
            }
            getData()
            this.formSubmit()
          }).catch(err => {
            err.msg && this.$message.warning(err.msg)
          })
          return
        }
        this.$refs['generator'].getData().then(res => {
          this.formData = res.formData
          getData()
          this.formSubmit()
        }).catch(err => {
          err.msg && this.$message.warning(err.msg)
        })
      } else if (this.activeStep == 2) {
        if (this.dataForm.webType == 1) {
          getData()
          this.formSubmit()
        } else {
          this.$refs['columnDesign'].getData().then(res => {
            this.columnData = res.columnData
            this.appColumnData = res.appColumnData
            getData()
            this.formSubmit()
          }).catch(err => {
            err.msg && this.$message.warning(err.msg)
          })
        }
      }
    },
    formSubmit() {
      this.btnLoading = true
      const formMethod = this.dataForm.id ? Update : Create
      formMethod(this.dataForm).then((res) => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            this.btnLoading = false
            this.closeDialog(true)
          }
        })
      }).catch(() => { this.btnLoading = false })
    },
    next() {
      if (this.activeStep < 1) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.getDbType()
            const type = this.dataForm.type
            if (!this.tables.length) {
              if (this.defaultTable.length || type == 3 || type == 4) {
                this.$message.warning('请至少选择一个数据表')
                return
              }
              this.$store.commit('extnGenerator/SET_TABLE', false)
              this.$store.commit('extnGenerator/SET_ALL_TABLE', [])
              this.$store.commit('extnGenerator/UPDATE_FORMITEM_LIST', [])
              this.activeStep += 1
            } else {
              if (!this.exist()) return
              let subTable = this.tables.filter(o => o.typeId == '0')
              this.$store.commit('extnGenerator/UPDATE_SUB_TABLE', subTable)
              this.$store.commit('extnGenerator/SET_ALL_TABLE', this.tables)
              this.$store.commit('extnGenerator/SET_DATABASE', this.dataForm.dbLinkId)
              this.$store.commit('extnGenerator/SET_TABLE', true)
              this.$store.commit('extnGenerator/UPDATE_FORMITEM_LIST', this.mainTableFields)
              this.activeStep += 1
            }
          }
        })
      } else if (this.activeStep == 1) {
        this.$refs['generator'].getData().then(res => {
          this.formData = res.formData
          this.activeStep += 1
        }).catch(err => {
          err.msg && this.$message.warning(err.msg)
        })
      } else {
        this.$refs['columnDesign'].getData().then(res => {
          this.columnData = res.columnData
          this.appColumnData = res.appColumnData
          this.activeStep += 1
        }).catch(err => {
          err.msg && this.$message.warning(err.msg)
        })
      }
    },
    changeList(type) {
      this.$confirm(type == 1 ? '关闭后，将切换为纯表单模式' : '开启后，将切换为表单+列表模式', '提示', { type: 'warning' }).then(() => {
        this.dataForm.webType = type == 1 ? 1 : 2
      }).catch(() => { })
    },
    onInterfaceChange(id, row) {
      if (!id) {
        this.dataForm.interfaceId = ''
        this.dataForm.interfaceName = ''
        this.interfaceParam = []
        return
      }
      if (this.dataForm.interfaceId === id) return
      this.dataForm.interfaceId = id
      this.dataForm.interfaceName = row.fullName
      this.interfaceParam = row.templateJson || []
    }
  }
}