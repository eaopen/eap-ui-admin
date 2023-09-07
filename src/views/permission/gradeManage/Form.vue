<template>
  <el-dialog :title="!dataForm.id?'新建分管':'编辑分管'" :close-on-click-modal="false"
    :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center" lock-scroll width="900px">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" v-loading="formLoading"
      label-width="100px">
      <el-alert title="设置当前组织部门的管理员和相关操作权限" type="warning" :closable="false" show-icon
        class="mb-20">
      </el-alert>
      <el-form-item label="设置管理员" prop="userId" v-if="!dataForm.id && userInfo.isAdministrator">
        <user-select v-model="dataForm.userId" placeholder="请选择管理员" @change="onChange" />
      </el-form-item>
      <el-form-item label="设置管理员" prop="userId" v-if="!dataForm.id && !userInfo.isAdministrator">
        <grade-user-select v-model="dataForm.userId" placeholder="请选择管理员" @change="onChange" />
      </el-form-item>
      <el-form-item label="设置管理员" prop="userId" v-if="dataForm.id">
        <user-select v-model="dataForm.userId" placeholder="请选择管理员" @change="onChange" disabled />
      </el-form-item>
      <el-table v-loading="listLoading" :data="treeList" row-key="organizeId" default-expand-all
        :tree-props="{children: 'children', hasChildren: ''}" style="height:400px;overflow: auto">
        <el-table-column prop="fullName" label="组织架构">
          <template slot-scope="scope">
            <i :class=scope.row.icon></i>
            {{scope.row.fullName}}
          </template>
        </el-table-column>
        <el-table-column label="组织操作权限(本层级)" width="280">
          <template slot-scope="scope">
            <template v-if="scope.row.thisLayerSelect===2">
              <el-checkbox checked disabled>查看</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerSelect===3">
              <el-checkbox disabled>查看</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerSelect===0 ||scope.row.thisLayerSelect===1">
              <el-checkbox v-model="scope.row.thisLayerSelect" :true-label="1" :false-label="0"
                @change="onThisLayerSelectChange($event,scope.row)">查看</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerAdd===2">
              <el-checkbox checked disabled>添加</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerAdd===3">
              <el-checkbox disabled>添加</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerAdd===0 ||scope.row.thisLayerAdd===1">
              <el-checkbox v-model="scope.row.thisLayerAdd" :true-label="1" :false-label="0"
                :disabled="scope.row.thisLayerSelect===0">添加</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerEdit===2">
              <el-checkbox checked disabled>编辑</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerEdit===3">
              <el-checkbox disabled>编辑</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerEdit===0 ||scope.row.thisLayerEdit===1">
              <el-checkbox v-model="scope.row.thisLayerEdit" :true-label="1" :false-label="0"
                :disabled="scope.row.thisLayerSelect===0">编辑</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerDelete===2">
              <el-checkbox checked disabled>删除</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerDelete===3">
              <el-checkbox disabled>删除</el-checkbox>
            </template>
            <template v-if="scope.row.thisLayerDelete===0 ||scope.row.thisLayerDelete===1">
              <el-checkbox v-model="scope.row.thisLayerDelete" :true-label="1" :false-label="0"
                :disabled="scope.row.thisLayerSelect===0">删除</el-checkbox>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="子组织操作权限(子层级)" width="280">
          <template slot-scope="scope">
            <template v-if="scope.row.subLayerSelect===2">
              <el-checkbox checked disabled>查看</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerSelect===3">
              <el-checkbox disabled>查看</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerSelect===0 ||scope.row.subLayerSelect===1">
              <el-checkbox v-model="scope.row.subLayerSelect" :true-label="1" :false-label="0"
                @change="onSubLayerSelectChange($event,scope.row)">查看</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerAdd===2">
              <el-checkbox checked disabled>添加</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerAdd===3">
              <el-checkbox disabled>添加</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerAdd===0 ||scope.row.subLayerAdd===1">
              <el-checkbox v-model="scope.row.subLayerAdd" :true-label="1" :false-label="0"
                :disabled="scope.row.subLayerSelect===0">添加</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerEdit===2">
              <el-checkbox checked disabled>编辑</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerEdit===3">
              <el-checkbox disabled>编辑</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerEdit===0 ||scope.row.subLayerEdit===1">
              <el-checkbox v-model="scope.row.subLayerEdit" :true-label="1" :false-label="0"
                :disabled="scope.row.subLayerSelect===0">编辑</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerDelete===2">
              <el-checkbox checked disabled>删除</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerDelete===3">
              <el-checkbox disabled>删除</el-checkbox>
            </template>
            <template v-if="scope.row.subLayerDelete===0 ||scope.row.subLayerDelete===1">
              <el-checkbox v-model="scope.row.subLayerDelete" :true-label="1" :false-label="0"
                :disabled="scope.row.subLayerSelect===0">删除</el-checkbox>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
        {{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import gradeUserSelect from "./GradeUserSelect"
import { mapGetters } from "vuex";
import { getSelectorOrgList, saveGradeManage } from '@/api/permission/gradeManage'
export default {
  components: { gradeUserSelect },
  data() {
    return {
      visible: false,
      formLoading: false,
      btnLoading: false,
      dataForm: {
        id: '',
        userId: ''
      },
      listLoading: false,
      refreshTable: true,
      treeList: [],
      dataRule: {
        userId: [
          { required: true, message: '请选择管理员', trigger: 'click' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  methods: {
    onChange(val) {
      if (!val) return
      this.initData()
    },
    initData() {
      this.listLoading = true
      if (this.dataForm.id) {
        getSelectorOrgList(this.dataForm.userId || '').then(res => {
          this.treeList = res.data.list || []
          this.listLoading = false
          this.btnLoading = false
        }).catch(() => {
          this.listLoading = false
          this.btnLoading = false
        })
      } else {
        getSelectorOrgList('').then(res => {
          this.treeList = res.data.list || []
          this.listLoading = false
          this.btnLoading = false
        }).catch(() => {
          this.listLoading = false
          this.btnLoading = false
        })
      }
    },
    onThisLayerSelectChange(val, row) {
      if (val) return
      if (row.thisLayerAdd === 1) this.$set(row, 'thisLayerAdd', 0)
      if (row.thisLayerEdit === 1) this.$set(row, 'thisLayerEdit', 0)
      if (row.thisLayerDelete === 1) this.$set(row, 'thisLayerDelete', 0)
    },
    onSubLayerSelectChange(val, row) {
      if (val) return
      if (row.subLayerAdd === 1) this.$set(row, 'subLayerAdd', 0)
      if (row.subLayerEdit === 1) this.$set(row, 'subLayerEdit', 0)
      if (row.subLayerDelete === 1) this.$set(row, 'subLayerDelete', 0)
    },
    init(id) {
      this.treeList = []
      this.dataForm.id = id || ""
      if (!this.dataForm.id) {
        this.dataForm.userId = ""
      }
      this.visible = true
      this.formLoading = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.dataForm.userId = id || ""
        this.initData()
      })
      this.formLoading = false
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let query = {
            ...this.dataForm, orgAdminModel: this.treeList
          }
          this.btnLoading = true
          saveGradeManage(query).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.btnLoading = false
                this.$emit('refreshDataList')
              }
            })
          }).catch(() => {
            this.btnLoading = false
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-checkbox {
  margin-right: 0;
}
.el-checkbox + .el-checkbox {
  margin-left: 10px;
}
>>> .el-dialog .el-dialog__body {
  padding: 20px 20px 2px !important;
}
</style>