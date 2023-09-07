<template>
  <div class="JNPF-common-layout">
    <JNPF-table :data="list" :hasNO="false" class="recordListTable" height="100%">
      <el-table-column prop="nodeName" label="节点名称" show-overflow-tooltip width="200"
        v-if="opType == 4">
        <template slot-scope="scope">
          <el-link type="primary" :underline="false" @click="handelNodeDetail(scope.row)">
            {{scope.row.nodeName}}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="nodeName" label="节点名称" width="200" v-else />
      <el-table-column prop="userName" label="操作人员" width="150" />
      <el-table-column prop="creatorTime" label="接收时间" width="150"
        :formatter="jnpf.tableDateFormat" />
      <el-table-column prop="handleTime" label="操作时间" width="150"
        :formatter="jnpf.tableDateFormat" />
      <el-table-column prop="handleStatus" label="执行动作" width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="item">
            <span :style="{background:colorList[scope.row.handleStatus||0]}"></span>
            {{statusList[scope.row.handleStatus||0]}}
            <div
              v-if="scope.row.handleStatus==5||scope.row.handleStatus==6||scope.row.handleStatus==7||scope.row.handleStatus==10">
              ：{{scope.row.operatorId}}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="signImg" label="签名" width="120" align="center">
        <template slot-scope="scope">
          <el-image v-if="scope.row.signImg" style="width: 80px" :src="scope.row.signImg"
            :preview-src-list="[scope.row.signImg]">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="fileList" label="附件" width="200" align="center">
        <template slot-scope="scope">
          <div v-for="(file,index) in JSON.parse(scope.row.fileList)" :key="index"
            @click="handlePreview(file)">
            <el-link type="primary" :underline="false">{{file.name}}</el-link>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="handleOpinion" label="备注" min-width="200" show-overflow-tooltip />
    </JNPF-table>
    <Preview :visible.sync="previewVisible" :file="activeFile" :showDownload="true" />
    <FormBox v-if="formVisible" ref="FormBox" @close="formVisible = false" />
  </div>
</template>
<script>
import Preview from '@/components/Generator/components/Upload/Preview'
import FormBox from '../components/FormBox'
export default {
  components: { Preview, FormBox },
  props: {
    list: { type: Array, default: [] },
    endTime: { type: Number, default: 0 },
    flowId: { type: String, default: '' },
    opType: { type: Number, default: 0 }
  },
  name: 'recordList',
  data() {
    return {
      colorList: ['rgba(242,68,68,0.39)', 'rgba(35,162,5,0.39)', 'rgba(0,0,255,0.39)', 'rgba(21,21,157,0.39)', 'rgba(186,33,33,0.39)',
        'rgba(25,185,185,0.39)', 'rgba(50,191,61,0.39)', 'rgba(49,151,214,0.39)', 'rgba(185,123,6,0.39)', 'rgba(45,94,186,0.39)', 'rgba(50,191,61,0.39)',
        'rgba(255,0,0,0.39)', 'rgba(0,128,0,0.39)'],
      statusList: ['退回', '同意', '发起', '撤回', '终止', '指派', '后加签', '转办', '变更', '复活', '前加签', '挂起', '恢复'],
      previewVisible: false,
      formVisible: false,
      activeFile: {},
    }
  },
  methods: {
    handlePreview(file) {
      this.activeFile = file
      this.previewVisible = true
    },
    handelNodeDetail(item) {
      let data = {
        id: item.taskId,
        taskNodeId: item.taskNodeId,
        enCode: item.flowCode,
        flowId: this.flowId,
        formType: item.formType,
        opType: 0,
        status: item.status,
        title: item.nodeName
      }
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.FormBox.init(data)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.recordListTable {
  .el-link {
    font-size: 12px;
  }
  .item {
    display: flex;
    align-items: center;
    width: 100%;
    span {
      width: 7px;
      height: 7px;
      margin-right: 6px;
      margin-bottom: 1px;
      border-radius: 50%;
      flex-shrink: 0;
    }
  }
  .signImg {
    width: 80px;
    cursor: pointer;
  }
}
</style>