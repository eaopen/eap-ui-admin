<template>
  <el-dialog title="字段设置" :close-on-click-modal="false" width="1000px"
    class="JNPF-dialog JNPF-dialog_center field-dialog" lock-scroll append-to-body
    :visible.sync="visible">
    <div class="main">
      <JNPF-table v-loading="listLoading" :data="list">
        <el-table-column prop="field" label="列名">
          <template slot-scope="scope">
            <span class="table-cell" v-if="scope.row.disabled">{{scope.row.field}}</span>
            <el-input v-model="scope.row.field" placeholder="请输入列名" maxlength="50" v-else />
          </template>
        </el-table-column>
        <el-table-column prop="dataType" label="类型">
          <template slot-scope="scope">
            <span class="table-cell"
              v-if="scope.row.disabled">{{scope.row.dataType|dataType}}</span>
            <el-select v-model="scope.row.dataType" placeholder="请选择" filterable v-else>
              <el-option v-for="item in options" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="dataLength" label="长度">
          <template slot-scope="scope">
            <span class="table-cell" v-if="scope.row.disabled">{{scope.row.dataLength}}</span>
            <el-input v-model="scope.row.dataLength" placeholder="请输入长度" v-else
              :disabled="scope.row.dataType!=='varchar'&&scope.row.dataType!=='decimal'" />
          </template>
        </el-table-column>
        <el-table-column prop="allowNull" label="允许空" width="60" align="center">
          <template slot-scope="scope">
            <el-checkbox :value='!!scope.row.allowNull' v-if="scope.row.disabled" />
            <el-checkbox v-model="scope.row.allowNull" :true-label="1" :false-label="0" v-else />
          </template>
        </el-table-column>
        <el-table-column prop="fieldName" label="说明">
          <template slot-scope="scope">
            <span class="table-cell" v-if="scope.row.disabled">{{scope.row.fieldName}}</span>
            <el-input v-model="scope.row.fieldName" placeholder="请输入说明" v-else />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="50">
          <template slot-scope="scope">
            <el-button class="OBPM-table-delBtn" size="mini" type="text" v-if="!scope.row.disabled"
              @click="handleDel(scope.$index)">删除
            </el-button>
          </template>
        </el-table-column>
      </JNPF-table>
      <div class="table-actions" @click="addHandle()">
        <el-button type="text" icon="el-icon-plus">新建字段</el-button>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">{{$t('common.cancelBtn')}}</el-button>
      <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
        {{$t('common.confirmBtn')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DataModelInfo, addTableFields } from '@/api/extn/dataModel'
export default {
  data() {
    return {
      visible: false,
      listLoading: true,
      btnLoading: false,
      options: [
        { label: '字符串', value: 'varchar' },
        { label: '整型', value: 'int' },
        { label: '日期时间', value: 'datetime' },
        { label: '浮点', value: 'decimal' },
        { label: '长整型', value: 'bigint' },
        { label: '文本', value: 'text' }
      ],
      list: [],
      dataForm: {},
      dataBase: '0'
    }
  },
  methods: {
    init(dataBase, table) {
      this.visible = true
      this.dataBase = dataBase
      if (!dataBase || !table) return
      this.initData(table)
    },
    closeDialog() {
      this.$emit('close')
      this.visible = false
    },
    initData(table) {
      this.listLoading = true
      DataModelInfo(this.dataBase, table).then(res => {
        this.dataForm = res.data.tableInfo
        this.$set(this.dataForm, 'newTable', this.dataForm.table)
        this.list = res.data.tableFieldList.map((o, i) => ({ disabled: true, ...o }))
        this.listLoading = false
      })
    },
    dataFormSubmit() {
      let tableFieldList = this.list.filter(o => !o.disabled)
      if (!tableFieldList.length) {
        this.$message({
          message: `请至少新增一个字段`,
          type: 'error',
          duration: 1000
        });
        return
      }
      if (!this.exist()) return
      this.btnLoading = true
      let query = {
        tableFieldList,
        tableInfo: this.dataForm
      }
      addTableFields(this.dataBase, query).then((res) => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            this.visible = false
            this.btnLoading = false
            this.$emit('updateOptions', this.list)
            this.$emit('close')
          }
        })
      }).catch(() => { this.btnLoading = false })
    },
    exist() {
      let isOk = true;
      //  遍历数组，判断非空
      for (let i = 0; i < this.list.length; i++) {
        const e = this.list[i];
        if (e.disabled) continue
        if (!e.field) {
          this.$message({
            message: `第${i + 1}行列名不能为空`,
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
        let reg = /(^_([a-zA-Z0-9]_?)*$)|(^[a-zA-Z](_?[a-zA-Z0-9])*_?$)/
        if (!reg.test(e.field)) {
          this.$message({
            message: `第${i + 1}行列名格式错误，请重新输入`,
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
        let num = this.list.filter(o => o.field == e.field)
        if (num.length > 1) {
          this.$message({
            message: `第${i + 1}行列名'${e.field}'已重复`,
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
        if (!e.fieldName) {
          this.$message({
            message: `第${i + 1}行说明不能为空`,
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
      }
      return isOk;
    },
    handleDel(index) {
      this.list.splice(index, 1)
    },
    addHandle(row) {
      let item = {}
      if (!row) {
        item = {
          field: "", dataType: "varchar", dataLength: 50, allowNull: 1, primaryKey: 0, fieldName: "", disabled: false
        }
      } else {
        item = {
          field: row.field,
          dataType: row.dataType,
          dataLength: row.dataLength,
          allowNull: row.allowNull,
          fieldName: row.fieldName,
          primaryKey: 0,
          disabled: false
        }
      }
      this.list.push(item)
    }
  }
}
</script>
<style lang="scss" scoped>
.field-dialog {
  >>> .el-dialog__body {
    height: 70vh;
    padding: 0 !important;
    .main {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .el-table {
      border-top: 0;
    }
    .table-cell {
      font-size: 13px;
    }
  }
}
</style>
