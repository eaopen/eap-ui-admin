<template>
  <el-dialog title="查看日程" :close-on-press-escape="false" :close-on-click-modal="false"
    :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center" lock-scroll width="600px"
    append-to-body>
    <el-form ref="dataForm" :model="dataForm" label-width="100px">
      <el-form-item label="类型" prop="type">
        <p>{{dataForm.type}}</p>
      </el-form-item>
      <el-form-item label="紧急程度" prop="urgent">
        <p>{{dataForm.urgent}}</p>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <p>{{dataForm.title}}</p>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <p>{{dataForm.content}}</p>
      </el-form-item>
      <el-form-item label="开始时间" prop="startDay">
        <p>{{dataForm.startDay|toDate('yyyy-MM-dd HH:mm')}}</p>
      </el-form-item>
      <el-form-item label="结束时间" prop="endDay">
        <p>{{dataForm.endDay|toDate('yyyy-MM-dd HH:mm')}}</p>
      </el-form-item>
      <el-form-item label="创建人" prop="creatorUserId">
        <p>{{dataForm.creatorUserId}}</p>
      </el-form-item>
      <el-form-item label="参与人" prop="toUserIds">
        <p>{{dataForm.toUserIds}}</p>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="danger" @click="handleDel()" v-if="type==1">删 除</el-button>
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
    </span>
    <el-dialog title="删除确认" :close-on-click-modal="false" :visible.sync="delVisible"
      class="JNPF-dialog JNPF-dialog_center dialog-form" lock-scroll width="380px" append-to-body>
      <div style="margin-bottom: 10px;">此为重复日程，将删除应用于</div>
      <template v-for="(item, i) in tableList">
        <div :key="i" style="margin-bottom: 10px;">
          <el-radio :label="item.id" v-model="checked">&nbsp;</el-radio>{{item.fullName}}
        </div>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="handleDel()" :loading="btnLoading">
          {{$t('common.confirmButton')}}</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>
<script>
import { ScheduleDetail, ScheduleDelete } from '@/api/onlineDev/schedule'
export default {
  data() {
    return {
      visible: false,
      loading: false,
      files: [],
      dataForm: {
        id: 0,
        type: '',
        urgent: '',
        startDay: '',
        endDay: '',
        content: '',
        title: '',
        toUserIds: '',
      },
      type: '',
      checked: '',
      btnLoading: false,
      delVisible: false,
      groupId: '',
      tableList: [
        {
          id: 1,
          fullName: '此日程'
        }, {
          id: 2,
          fullName: '此日程及后续'
        }, {
          id: 3,
          fullName: '所有日程'
        }
      ],
    }
  },
  methods: {
    init(id, type, groupId) {
      this.type = type
      this.dataForm.id = id || 0
      this.groupId = groupId || 0
      this.loading = true
      this.$nextTick(() => {
        ScheduleDetail(this.groupId, this.dataForm.id).then(res => {
          this.dataForm = res.data || {}
          this.visible = true
        }).catch(() => {
          this.loading = false
          this.visible = false
        })
      })
    },
    handleDel() {
      if (this.dataForm.repetition != "1") {
        if (!this.delVisible) {
          this.delVisible = true
        } else {
          this.btnLoading = true
          if (!this.checked) return this.$message('请选择日程')
          ScheduleDelete(this.dataForm.id, this.checked).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
            })
            this.btnLoading = false
            this.delVisible = false
            this.visible = false
            this.$emit('refreshDataList')
          }).catch(() => { this.btnLoading = false });
        }
      } else {
        this.$confirm('此操作将删除日程，是否继续？', '提示', {
          type: 'warning'
        }).then(() => {
          ScheduleDelete(this.dataForm.id, 3).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
            })
            this.visible = false
            this.$emit('refreshDataList')
          })
        }).catch(() => { });
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.main >>> a {
  color: #06c !important;
}
.dialog-form {
  >>> .el-dialog__body {
    padding: 20px 21px 2px !important;
  }
}
</style>