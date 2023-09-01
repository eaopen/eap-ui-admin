<template>
  <div class="JNPF-preview-main">
    <div class="JNPF-common-page-header">
      <el-page-header @back="goBack()" :content="dataForm.appName" />
      <div class="options">
        <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
      </div>
    </div>
    <el-row class="main">
      <el-col :span="22" :offset="1">
        <group-title content="基本信息" />
      </el-col>
      <el-col :span="14" :offset="5" class="mb-10">
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" class="mt-20" label-width="120px" @submit.native.prevent>
          <jnpf-form-tip-item label="appId" prop="appId">
            <el-input v-model="dataForm.appId" placeholder="输入appId" maxlength="100" readonly>
            </el-input>
          </jnpf-form-tip-item>
          <!-- <jnpf-form-tip-item label="应用名称" prop="appName">
            <el-input v-model="dataForm.appName" placeholder="输入应用名称" readonly></el-input>
          </jnpf-form-tip-item> -->
          <jnpf-form-tip-item label="appSecret" prop="appSecret">
            <el-input v-model="dataForm.appSecret" placeholder="输入appSecret" show-password readOnly>
            </el-input>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="验证签名" prop="verifySignature">
            <el-row>
              <el-col :span="12">
                <el-switch v-model="dataForm.verifySignature" :active-value="1" :inactive-value="0" disabled>
                </el-switch>
              </el-col>
              <el-col :span="12" align="right">
                <el-link :underline="false" @click="showVerify()">验证签名使用说明</el-link>
              </el-col>
            </el-row>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="使用期限" prop="usefulLife">
            <el-date-picker v-model="dataForm.usefulLife" type="date" placeholder="请选择" style="width:100%" readonly></el-date-picker>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="白名单" prop="whiteList">
            <el-input v-model="dataForm.whiteList" placeholder="" type="textarea" :rows="5" readonly />
            <!-- <span style="color:#C0C4CC">多个IP设置，用英文符号隔开，如192.168.0.1,192.168.0.2</span> -->
          </jnpf-form-tip-item>
          <!-- <jnpf-form-tip-item label="黑名单" prop="blackList">
            <el-input v-model="dataForm.blackList" placeholder="" type="textarea" :rows="5" readonly />
            <span style="color:#C0C4CC">多个IP设置，用英文符号隔开，如192.168.0.1,192.168.0.2</span>
          </jnpf-form-tip-item> -->
          <jnpf-form-tip-item label="排序" prop="sortCode">
            <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode" controls-position="right" readonly />
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="状态" prop="enabledMark">
            <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" disabled>
            </el-switch>
          </jnpf-form-tip-item>
          <jnpf-form-tip-item label="说明" prop="description">
            <el-input v-model="dataForm.description" placeholder="" type="textarea" :rows="5" readonly />
          </jnpf-form-tip-item>
        </el-form>
      </el-col>
      <el-col :span="22" :offset="1">
        <group-title content="接口集合" />
      </el-col>
      <el-col :span="20" :offset="2" class="mt-20">
        <el-table v-loading="listLoading" :data="tableList" @cell-dblclick="cellDblclick">
          <el-table-column type="expand" align="left">
            <template slot-scope="props">
              <el-col :span="24">
                <JNPF-table v-loading="listLoading2" :data="props.row.paramList">
                  <el-table-column prop="field" label="参数名称" width="200" align="center" />
                  <el-table-column prop="dataType" label="参数类型" width="200" align="center" />
                  <el-table-column prop="defaultValue" label="默认值" min-width="300" align="left" />
                </JNPF-table>
              </el-col>
            </template>
          </el-table-column>
          <el-table-column prop="fullName" label="接口名称" width="200" />
          <el-table-column prop="enCode" label="接口编码" width="200" />
          <el-table-column prop="url" label="接口地址" min-width="300" show-overflow-tooltip />
          <el-table-column prop="type" label="接口类型" width="120" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.dataType">POST</el-tag>
              <!-- <el-tag type="success" v-if="scope.row.dataType==2">SQL操作</el-tag>
              <el-tag type="warning" v-if="scope.row.dataType==3">API操作</el-tag> -->
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col class="mt-50"></el-col>
    </el-row>
    <VerifySignatureInfo v-if="verifySignatureVisible" ref="VerifySignatureInfo" @close="verifySignatureVisible=false" />
  </div>
</template>

<script>
import { getInfo } from '@/api/extn/interfaceOauth.js'
import VerifySignatureInfo from './VerifySignatureInfo'
export default {
  components: { VerifySignatureInfo },
  data() {
    return {
      btnLoading: false,
      verifySignatureVisible: false,
      dataForm: {
        sortCode: 0,
        enabledMark: 1,
      },
      dataRule: {
        appId: [
          {
            required: true,
            message: '名称不能为空',
            trigger: 'blur'
          }
        ],
        appName: [
          {
            required: true,
            message: '应用名称不能为空',
            trigger: 'blur'
          }
        ],
        appSecret: [
          {
            required: true,
            message: 'appSecret不能为空',
            trigger: 'blur'
          }
        ],
      },
      listLoading: false,
      listLoading2: false,
      tableList: [],
      tenantId: '',
      options: [
        { label: '字符串', value: 'varchar' },
        { label: '整型', value: 'int' },
        { label: '日期时间', value: 'datetime' },
        { label: '浮点', value: 'decimal' },
        { label: '长整型', value: 'bigint' },
        { label: '文本', value: 'text' }
      ],
    }
  },
  methods: {
    goBack(isRefresh) {
      this.$emit('close', isRefresh)
    },
    init(id) {
      if (id) {
        this.initData(id)
      }
    },
    initData(id) {
      this.dataForm.id = id
      this.setInterfaceData()
    },
    setInterfaceData() {

      getInfo(this.dataForm.id).then(res => {
        if (res.data) {
          this.dataForm = res.data
          this.tenantId = this.dataForm.tenantId ? this.dataForm.tenantId : ''
        }
        if (res.data.list) {
          let arr = []
          res.data.list.forEach(item => {
            item.url = `${this.define.comUrl}/api/system/DataInterface/${item.id}/Actions/Response` + (this.tenantId ? '?tenantId=' + this.tenantId : '')
            if (item.requestParameters) {
              item.paramList = [...JSON.parse(item.requestParameters)]
            }

            if (item.paramList.length > 0) {
              item.paramList.forEach(elem => {
                this.options.forEach(elm2 => {
                  if (elm2.value == elem.dataType) {
                    elem.dataType = elm2.label
                  }
                })

              })
            }
          })
          this.tableList = res.data.list
        }
      })
    },
    showVerify() {
      this.verifySignatureVisible = true
      this.$nextTick(() => {
        this.$refs.VerifySignatureInfo.init()
      })
    },
    cellDblclick(row, column, cell, event) {
      if (event.type == "dblclick") {
        var save = function (e) {
          e.clipboardData.setData("text/plain", event.target.innerText)
          e.preventDefault()
        }
        document.addEventListener("copy", save)
        document.execCommand("copy")
        document.removeEventListener("copy", save)
      }
      this.$message({ message: '复制成功', type: 'success' })
    },
  }
}
</script>
<style lang="scss" scoped>
.main {
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 0 0 10px;
  >>> .el-table {
    flex: 1;
    border-top: none;
  }
}
.demo-table-expand {
  font-size: 0;
}
.mt-50 {
  margin-top: 50px;
}
</style>