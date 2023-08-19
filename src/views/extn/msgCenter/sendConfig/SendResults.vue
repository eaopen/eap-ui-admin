<template>
  <el-dialog title="发送测试" :close-on-click-modal="false" :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body width='800px'>
    <el-table :data="resultList" :border="false" highlight-current-row>
      <el-table-column prop="messageType" label="任务" show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="title">
            <i class="el-icon-success success icon" v-if="scope.row.isSuccess=='1'"></i>
            <i class="el-icon-error error icon" v-else></i>
            <span>{{scope.row.messageType}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="原因" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="error">{{scope.row.result}}</span>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('common.cancelButton')}}
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'sendConfig-SendResults',
  data() {
    return {
      visible: false,
      resultList: []
    }
  },
  methods: {
    init(resultList) {
      this.resultList = resultList
      this.visible = true
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 0 !important;
}
.title {
  display: flex;
  align-items: center;
  .success {
    color: #67c23a;
  }
  .icon {
    font-size: 15px;
    padding-right: 5px;
  }
}
.error {
  color: #f56c6c;
}
</style>