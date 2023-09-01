<template>
  <div class="DbCopy-container app-container nohead JNPF-flex-main">
    <el-alert title="温馨提示：数据同步是由A数据库同步到B数据库。" type="warning" :closable="false" show-icon
      class="mb-20">
    </el-alert>
    <el-form ref="dataForm" :model="dataForm" label-width="140px" :rules="dataRule"
      @submit.native.prevent class="mt-10">
      <el-form-item label="数据库连接 From" prop="dbConnectionFrom">
        <el-select v-model="dataForm.dbConnectionFrom" placeholder="请选择连接" filterable>
          <el-option-group v-for="group in dbOptions" :key="group.fullName" :label="group.fullName">
            <el-option v-for="item in group.children" :key="item.id" :label="item.fullName"
              :value="item.id" />
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-form-item label="数据库连接 To" prop="dbConnectionTo">
        <el-select v-model="dataForm.dbConnectionTo" placeholder="请选择连接" filterable>
          <el-option-group v-for="group in dbOptions" :key="group.fullName" :label="group.fullName">
            <el-option v-for="item in group.children" :key="item.id" :label="item.fullName"
              :value="item.id" />
          </el-option-group>
        </el-select>
        <el-button type="primary" @click="check" style="margin-left:10px">验证连接</el-button>
        <el-button icon="el-icon-plus" @click="addConfigure">规则配置</el-button>
      </el-form-item>
    </el-form>
    <div class="JNPF-common-title">
      <h2>数据库表</h2>
      <el-button size="primary" type="text" @click="batch">批量同步</el-button>
    </div>
    <JNPF-table v-loading="listLoading" ref="multipleTable" :data="list"
      @selection-change="handleSelectionChange" :hasNO="false">
      <el-table-column type="selection" width="70" align="center" />
      <el-table-column type="index" width="50" label="序号" align="center" />
      <el-table-column prop="table" label="表名" show-overflow-tooltip />
      <el-table-column prop="sum" label="总数" />
      <el-table-column prop="result" label="结果" />
      <el-table-column label="操作" fixed="right" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="copy(scope.row)"
            :loading="scope.row.btnLoading">数据同步
          </el-button>
        </template>
      </el-table-column>
    </JNPF-table>
    <el-dialog title="规则配置" :close-on-click-modal="false" :visible.sync="dialogVisible"
      class="JNPF-dialog JNPF-dialog_center rule-dialog" lock-scroll append-to-body width="600px">
      <div class="option-box-tip">
        设置数据库之间的字段转换规则，规则设置错误会导致同步的功能数据转换失败
      </div>
      <template v-for="(item, i) in configureList">
        <el-row :key="i" class="mb-10">
          <el-col :span="3" class="rule-cell">字段类型</el-col>
          <el-col :span="7" class="rule-cell">
            <el-select v-model="item.beforeConversion" placeholder="请选择类型"
              @change="changeConversion($event,i)">
              <el-option v-for="(item,index) in beforeConversionList" :key="index" :label="item.val"
                :value="item.val" />
            </el-select>
          </el-col>
          <el-col :span="2" class="rule-cell mid">转换</el-col>
          <el-col :span="3" class="rule-cell">字段类型</el-col>
          <el-col :span="7" class="rule-cell">
            <el-select v-model="item.afterConversion" placeholder="请选择类型">
              <el-option v-for="item in item.afterConversionList" :key="item" :label="item"
                :value="item" />
            </el-select>
          </el-col>
          <el-col :span="2" class="rule-cell">
            <el-button type="danger" icon="el-icon-close" style="margin-left: 10px"
              @click="delRule(i)">
            </el-button>
          </el-col>
        </el-row>
      </template>
      <div class="table-actions" @click="addRule">
        <el-button type="text" icon="el-icon-plus">新增规则</el-button>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="saveRule">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getDataSourceListAll, Execute, DataSync, batchExecute, checkDbLink } from '@/api/extn/dataSource'

export default {
  name: 'systemData-dataSync',
  data() {
    return {
      key: '',
      dataForm: {
        dbConnectionFrom: '',
        dbConnectionTo: ''
      },
      dbOptions: [],
      dataRule: {
        dbConnectionFrom: [
          { required: true, message: '数据库连接 From不能为空', trigger: 'blur' }
        ],
        dbConnectionTo: [
          { required: true, message: '数据库连接 To不能为空', trigger: 'blur' }
        ]
      },
      list: [],
      listLoading: false,
      dialogVisible: false,//规则配置弹窗
      configureList: [],
      defaultConfigureList: [],
      beforeConversion: '',//转换前
      beforeConversionList: [],//转换前
      afterConversion: '',//转换后
      afterConversionList: [],//转换后
      verification: false,
      convertRuleMap: {},
      batchList: []
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      getDataSourceListAll().then(res => {
        this.dbOptions = res.data.list.filter(o => o.children && o.children.length)
      })
    },
    check() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dataForm.dbConnectionFrom === this.dataForm.dbConnectionTo) {
            this.$message({
              message: '数据库连接不能相同',
              type: 'error',
              duration: 1000,
            })
            return this.list = []
          }
          this.listLoading = true
          checkDbLink(this.dataForm).then((res) => {
            this.beforeConversionList = []
            this.convertRuleMap = res.data.convertRuleMap
            for (var key in this.convertRuleMap) {
              this.beforeConversionList.push({ val: key, value: this.convertRuleMap[key] })
            }
            this.defaultConfigureList = []
            for (let index = 0; index < this.beforeConversionList.length; index++) {
              const element = this.beforeConversionList[index];
              this.defaultConfigureList.push({
                beforeConversion: element.val,
                afterConversion: element.value[0]
              })
              this.defaultConfigureList[index].afterConversionList = element.value
            }
            this.configureList = JSON.parse(JSON.stringify(this.defaultConfigureList))
            this.verification = res.data.checkDbFlag
            this.list = res.data.tableList
            for (let i = 0; i < this.list.length; i++) {
              const e = this.list[i];
              this.$set(this.list[i], 'result', '')
              this.$set(this.list[i], 'btnLoading', false)
            }
            this.listLoading = false
          }).catch(res => {
            this.listLoading = false
            this.list = []
          })
        }
      })
    },
    changeConversion(val, i) {
      this.afterConversionList = []
      this.configureList[i].afterConversion = ''
      this.configureList[i].afterConversionList = this.convertRuleMap[val]
    },
    saveRule() {//保存
      this.defaultConfigureList = JSON.parse(JSON.stringify(this.configureList))
      this.dialogVisible = false
    },
    addRule() {   //规则配置新增
      this.configureList.push({
        beforeConversion: '',
        afterConversion: ''
      })
    },
    delRule(i) {  //规则配置删除
      this.configureList.splice(i, 1)
    },
    batch() {//批量同步
      if (!this.batchList.length) return this.$message.error('请先选择数据')
      var map = {};
      let data = {
        dbConnectionFrom: this.dataForm.dbConnectionFrom,
        dbConnectionTo: this.dataForm.dbConnectionTo,
        dbTableList: this.batchList,
      }
      if (this.configureList && this.configureList.length) {
        for (var index in this.configureList) {
          map[this.configureList[index].beforeConversion] = this.configureList[index].afterConversion;
        }
        data = { ...data, convertRuleMap: map }
      }
      this.listLoading = true
      this.$confirm('批量同步，将覆盖您原有表内的数据。请确认操作', {
        type: 'warning'
      }).then(() => {
        batchExecute(data).then(res => {
          if (res.msg == 1) {
            this.$message({
              message: '批量同步成功!',
              type: 'success',
              duration: 1000
            })
          } else {
            this.$message({
              message: res.msg,
              type: 'error',
              duration: 1000
            })
          }
          for (const key in res.data) {
            for (let index = 0; index < this.list.length; index++) {
              const element = this.list[index];
              if (element.table == key) {
                element.result = res.data[key] == 1 ? '成功' : '失败'
              }
            }
          }
          this.listLoading = false
          this.toggleSelection()
        }).catch(() => { this.listLoading = false })
      }).catch(() => { this.listLoading = false })
    },
    toggleSelection() {
      this.$refs.multipleTable.$refs.JNPFTable.clearSelection();
    },
    addConfigure() {  //添加规则配置
      if (!this.verification) return this.$message.error('请验证连接')
      this.dialogVisible = true
      this.configureList = JSON.parse(JSON.stringify(this.defaultConfigureList))
    },
    handleSelectionChange(val) {   //多选框
      let list = []
      val.forEach(element => {
        list.push(element.table)
      })
      this.batchList = list
    },
    copy(row) {
      var map = {};
      row.btnLoading = true
      row.result = ''
      let data = {
        dbConnectionFrom: this.dataForm.dbConnectionFrom,
        dbConnectionTo: this.dataForm.dbConnectionTo,
        dbTable: row.table,
      }
      if (this.configureList.length) {
        for (var index in this.configureList) {
          map[this.configureList[index].beforeConversion] = this.configureList[index].afterConversion;
        }
        data = { ...data, convertRuleMap: map }
      }
      DataSync(data).then((res) => {
        if (res.data == 0) {
          this.execute(row, res.data)
        } else if (res.data == 1) {
          this.$message({
            message: '初始库表中没有数据',
            type: 'warning',
            duration: 1000,
          })
          row.btnLoading = false
        } else if (res.data == 2) {
          this.$confirm('目标库中该表不存在，是否在目标库中创建该表，并同步数据?', '提示', {
            type: 'warning'
          }).then(() => {
            this.execute(row, res.data)
          }).catch(() => { row.btnLoading = false });
        } else if (res.data == 3) {
          this.$confirm('目标表存在数据,是否自动清除并同步数据?', '提示', {
            type: 'warning'
          }).then(() => {
            this.execute(row, res.data)
          }).catch(() => { row.btnLoading = false });
        }
      }).catch(() => { row.btnLoading = false });
    },
    execute(row, type) {
      row.result = ''
      var map = {};
      let data = {
        type,
        dbConnectionFrom: this.dataForm.dbConnectionFrom,
        dbConnectionTo: this.dataForm.dbConnectionTo,
        dbTable: row.table
      }
      if (this.configureList.length) {
        for (var index in this.configureList) {
          map[this.configureList[index].beforeConversion] = this.configureList[index].afterConversion;
        }
        data = { ...data, convertRuleMap: map }
      }
      Execute(data).then((res) => {
        row.result = res.msg
        row.btnLoading = false
      }).catch(() => {
        row.btnLoading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.rule-dialog {
  >>> .el-dialog__body {
    min-height: 300px !important;
    padding: 20px 20px 10px !important;
  }
  .option-box-tip {
    margin-bottom: 20px;
  }
  .rule-cell {
    line-height: 32px;
    &.mid {
      color: #1890ff;
      text-align: center;
    }
  }
}
.DbCopy-container {
  .JNPF-common-title {
    justify-content: left;
    h2 {
      margin-right: 10px;
    }
  }
}
</style>
