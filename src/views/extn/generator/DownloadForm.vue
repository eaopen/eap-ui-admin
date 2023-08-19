<template>
  <el-dialog title="输出设置" :close-on-click-modal="false" :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center release-dialog" lock-scroll width="600px">
    <el-alert title="注意：以下只能包含数字、字母、下划线、小圆点..但不能用数字开头，不能是关键字或保留字。" type="warning" :closable="false"
      show-icon style="margin-bottom: 12px;" />
    <el-form ref="dataForm" label-width="100px" :model="dataForm">
      <jnpf-form-tip-item label="模块命名" prop="module" v-if="type!=3"
        :rules="[{ required: true,message: '请选择模块命名', trigger: 'change' }]">
        <el-select v-model="dataForm.module" placeholder="请选择模块命名" filterable allow-create
          default-first-option clearable>
          <el-option v-for="(item,i) in moduleList" :key="i" :label="item.fullName"
            :value="item.id" />
        </el-select>
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="模块包名" prop="description" v-if="hasPackage"
        tipLabel="修改包名需要调整controller和mapper扫描配置"
        :rules="[{ required: true,message: '模块包名不能为空', trigger: 'blur' }]">
        <el-input v-model="dataForm.modulePackageName" placeholder="功能描述" />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="功能描述" prop="description"
        :rules="[{ required: true,message: '功能描述不能为空', trigger: 'blur' }]">
        <el-input v-model="dataForm.description" placeholder="功能描述" />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="功能类名" prop="className"
        :rules="[{ required: true,message: '功能类名不能为空', trigger: 'blur' }]">
        <el-input v-model="dataForm.className" placeholder="功能类名" />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item :label="item.placeholderText" :prop="'subClassName.' + i + '.fullName'"
        v-for="(item,i) in dataForm.subClassName" :key="i" :rules="item.rules">
        <el-input v-model="item.fullName" :placeholder="item.placeholderText" />
      </jnpf-form-tip-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="dataFormSubmit()" :loading="loading">下载代码</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DownloadCode } from '@/api/onlineDev/visualDev'
export default {
  data() {
    return {
      visible: false,
      loading: false,
      dataForm: {
        module: '',
        description: '',
        subClassName: [],
        className: '',
        modulePackageName: 'jnpf'
      },
      id: '',
      type: '',
      tables: [],
      moduleList: [],
      hasPackage: true
    }
  },
  methods: {
    init(tables, id, type, hasPackage) {
      if (!tables || !id) {
        this.visible = false
        return
      }
      this.id = id
      this.type = type || 0
      this.hasPackage = hasPackage
      this.tables = JSON.parse(tables)
      this.getDictionaryData()
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        let mainTable = this.tables.filter(o => o.typeId == '1')[0].table
        this.dataForm.className = mainTable
        this.dataForm.description = mainTable
        let subClassName = this.tables.filter(o => o.typeId != '1')
        this.dataForm.subClassName = subClassName.map(o => ({
          fullName: o.table,
          placeholderText: '子表类名',
          rules: { required: true, message: `${o.placeholderText}不能为空`, trigger: 'blur' }
        }))
      })
    },
    getDictionaryData() {
      this.$store.dispatch('base/getDictionaryData', { sort: 'createModule' }).then((res) => {
        this.moduleList = res
        if (this.moduleList.length) this.dataForm.module = this.moduleList[0].id
      })
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          let subClassName = this.dataForm.subClassName.map(o => o.fullName)
          let query = {
            module: this.dataForm.module,
            className: this.dataForm.className,
            subClassName: subClassName.join(','),
            description: this.dataForm.description,
            modulePackageName: this.dataForm.modulePackageName
          }
          DownloadCode(this.id, query).then(res => {
            if (!res.data || !res.data.url) return this.loading = false
            this.jnpf.downloadFile(res.data.url)
            this.loading = false
            this.$emit('close')
          }).catch(() => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.release-dialog {
  >>> .el-dialog {
    .el-dialog__body {
      padding: 12px 55px;
    }
  }
}
</style>