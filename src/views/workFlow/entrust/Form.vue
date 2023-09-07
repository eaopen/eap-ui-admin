<template>
  <el-dialog :title="!dataForm.id ? '新建委托' : '编辑委托'" :close-on-click-modal="false"
    :visible.sync="visible" class="JNPF-dialog JNPF-dialog_center" lock-scroll width="600px">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="100px"
      v-loading="loading">
      <!-- <jnpf-form-tip-item label="委托人" prop="userId">
        <user-select v-model="dataForm.userId" placeholder="选择委托人" @change="onChangeUser"
          v-if="!dataForm.id&&isGradeUser==0" />
        <grade-user-select v-model="dataForm.userId" placeholder="选择委托人" @change="onChangeUser"
          v-if="!dataForm.id&&isGradeUser==1" />
        <el-input v-model="myNameAccount" v-if="dataForm.id||isGradeUser==2" disabled />
      </jnpf-form-tip-item> -->
      <jnpf-form-tip-item label="受委托人" prop="toUserId">
        <user-select v-model="dataForm.toUserId" placeholder="选择受委托人" @change="onChange" />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="委托类型" prop="type">
        <el-select v-model="dataForm.type" placeholder="请选择" filterable>
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="委托流程" prop="flowId" tip-label="未选择委托流程默认全部流程进行委托">
        <FlowSelect v-model="dataForm.flowId" placeholder="全部流程" :value='dataForm.flowId' multiple
          @changeName="changeName" clearable />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="开始时间" prop="startTime">
        <el-date-picker v-model="dataForm.startTime" type="datetime" placeholder="选择日期"
          value-format="timestamp" :editable='false' :picker-options="pickerOptions"
          format='yyyy-MM-dd HH:mm'>
        </el-date-picker>
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="结束时间" prop="endTime">
        <el-date-picker v-model="dataForm.endTime" type="datetime" placeholder="选择日期"
          value-format="timestamp" :editable='false' :picker-options="pickerOptions"
          format='yyyy-MM-dd HH:mm'>
        </el-date-picker>
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="委托说明" prop="description">
        <el-input v-model="dataForm.description" placeholder="委托说明" type="textarea" :rows="3" />
      </jnpf-form-tip-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
        {{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { FlowDelegateInfo, Create, Update } from '@/api/workFlow/FlowDelegate'
import { FlowEngineListAll } from '@/api/workFlow/FlowEngine'
import FlowSelect from '../components/FlowSelect.vue'
import { mapGetters } from "vuex";
import gradeUserSelect from "../../permission/gradeManage/GradeUserSelect"
import { getListByAuthorize } from '@/api/permission/user'

export default {
  components: { FlowSelect, gradeUserSelect },
  data() {
    var checkStartTime = (rule, value, callback) => {
      if (!this.dataForm.endTime) {
        callback()
      } else {
        if (this.dataForm.endTime < value) {
          callback(new Error('开始日期应该小于结束日期'));
        } else {
          this.$refs.dataForm.validateField('endTime');
          callback()
        }
      }
    }
    var checkEndTime = (rule, value, callback) => {
      if (!this.dataForm.startTime) {
        callback()
      } else {
        if (this.dataForm.startTime > value) {
          callback(new Error('结束日期应该大于开始日期'));
        } else {
          callback()
        }
      }
    }
    return {
      visible: false,
      pickerOptions: {
        disabledDate: time => {
          return new Date(time).getTime() < new Date().getTime() - 86400000;
        }
      },
      dataForm: {
        id: '',
        userId: '',
        toUserId: '',
        flowId: [],
        description: '',
        startTime: '',
        endTime: '',
        flowName: '',
        toUserName: '',
        type: [],
      },
      dataRule: {
        userId: [
          { required: true, message: '委托人不能为空', trigger: 'click' }
        ],
        toUserId: [
          { required: true, message: '受委托人不能为空', trigger: 'click' }
        ],
        type: [
          { required: true, message: '委托类型不能为空', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '开始时间不能为空', trigger: 'change' },
          { validator: checkStartTime, trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '结束时间不能为空', trigger: 'change' },
          { validator: checkEndTime, trigger: 'change' }
        ],
      },
      loading: false,
      btnLoading: false,
      flowEngineList: [],
      typeOptions: [{
        value: "0",
        label: '发起委托'
      }, {
        value: "1",
        label: '审批委托'
      }],
      isGradeUser: 2,//0管理员，1分级管理员，2普通用户
      myNameAccount: '',
    }
  },
  computed: {
    ...mapGetters(['userInfo'])

  },
  watch: {

  },
  created() {

  },
  methods: {


    init(id) {
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
      this.dataForm.id = id || ''
      this.visible = true
      this.loading = true
      this.myNameAccount = this.userInfo.userName + '/' + this.userInfo.userAccount
      this.dataForm.userId = this.userInfo.userAccount
      this.dataForm.userName = this.myNameAccount
      //初始化委托人组件
      // if (this.userInfo.isAdministrator) {
      //   this.isGradeUser = 0
      // } else {
      //   getListByAuthorize('0', null).then(res => {
      //     if (res.data.list.length) {
      //       this.isGradeUser = 1
      //     }
      //     if (this.isGradeUser == 2) {
      //       this.myNameAccount = this.userInfo.userName + '/' + this.userInfo.userAccount
      //       this.dataForm.userId = this.userInfo.userAccount
      //       this.dataForm.userName = this.myNameAccount
      //     }
      //   })
      // }
      //初始化流程列表
      this.getFlowEngineList()
    },
    getFlowEngineList() {
      FlowEngineListAll().then((res) => {
        this.flowEngineList = res.data.list
        //初始化数据
        if (this.dataForm.id) {
          FlowDelegateInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data
            this.dataForm.flowId = this.dataForm.flowId ? this.dataForm.flowId.split(",") : []
            this.myNameAccount = this.dataForm.userName
          })
        }
        this.loading = false
      })
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          const formMethod = this.dataForm.id ? Update : Create
          let params = {
            ...this.dataForm
          }
          params.flowId = this.dataForm.flowId ? this.dataForm.flowId.join(",") : ""
          if (this.isGradeUser == 2) {
            params.userId = this.userInfo.userId
            params.userName = this.myNameAccount
          }
          if (!params.flowId) {
            params.flowName = "全部流程"
          }
          formMethod(params).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1000,
              onClose: () => {
                this.visible = false
                this.btnLoading = false
                this.$emit('refreshDataList')
              }
            })
          }).catch(() => { this.btnLoading = false })
        }
      })
    },
    handleChange(val) {
      if (!val) {
        this.dataForm.flowName = ''
        return
      }
      let active = {}
      for (let i = 0; i < this.flowEngineList.length; i++) {
        const item = this.flowEngineList[i];
        if (item.children && item.children.length) {
          for (let j = 0; j < item.children.length; j++) {
            if (item.children[j].id === val) {
              active = item.children[j]
              break
            }
          }
        }
      }
      this.dataForm.flowName = active.fullName + '/' + active.enCode
    },
    onChange(id, selectedData) {
      if (!id) return this.dataForm.toUserName = ''
      this.dataForm.toUserName = selectedData.fullName
    },
    onChangeUser(id, selectedData) {
      if (!id) return this.dataForm.userName = ''
      this.dataForm.userName = selectedData.fullName
    },
    changeName(listData) {
      if (listData && listData.length) {
        let arr = []
        listData.forEach(item => {
          arr.push(item.fullName + "/" + item.enCode)
        })
        this.dataForm.flowName = arr.join(",")
      } else {
        this.dataForm.flowName = "全部流程"
      }
    },
  },


}
</script>