<template>
  <el-dialog :visible.sync="visible" fullscreen lock-scroll class="OBPM-full-dialog"
    :show-close="false" :modal="false">
    <div class="OBPM-full-dialog-header">
      <div class="header-title">
        <img src="@/assets/images/extn/logo.png" class="header-logo" />
        <p class="header-txt" v-if="activeStep==0"> · 在线开发</p>
        <el-tooltip class="item" effect="dark" :content="dataForm.fullName" placement="bottom"
          v-else>
          <p class="header-txt"> · {{dataForm.fullName}}</p>
        </el-tooltip>
      </div>
      <el-steps :active="activeStep" finish-status="success" simple class="steps steps2"
        v-if="!loading">
        <el-step title="基础设置" @click.native="stepChick(0)" />
        <el-step title="列表设计" @click.native="stepChick(1)" />
      </el-steps>
      <div class="options">
        <el-button @click="prev" :disabled="activeStep<=0">{{$t('common.prev')}}</el-button>
        <el-button @click="next" :disabled="activeStep>=maxStep || loading">{{$t('common.next')}}
        </el-button>
        <el-button type="primary" @click="dataFormSubmit()" :disabled="loading"
          :loading="btnLoading">{{$t('common.saveBtn')}}</el-button>
        <el-button @click="closeDialog()">{{$t('common.cancelBtn')}}</el-button>
      </div>
    </div>
    <div class="main" v-loading="loading">
      <el-row type="flex" justify="center" align="middle" v-if="!activeStep" class="basic-box">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="10" class="basicForm">
          <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="80px"
            @submit.native.prevent label-position="right">
            <el-form-item label="视图名称" prop="fullName">
              <el-input v-model="dataForm.fullName" placeholder="视图名称" maxlength="100">
              </el-input>
            </el-form-item>
            <el-form-item label="视图编码" prop="enCode">
              <el-input v-model="dataForm.enCode" placeholder="视图编码" maxlength="50">
              </el-input>
            </el-form-item>
            <el-form-item label="视图分类" prop="category">
              <el-select v-model="dataForm.category" placeholder="选择分类">
                <el-option :key="item.value" :label="item.fullName" :value="item.value"
                  v-for="item in categoryList" />
              </el-select>
            </el-form-item>
            <el-form-item label="视图排序" prop="sortCode">
              <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
                controls-position="right" />
            </el-form-item>
            <el-form-item label="视图说明" prop="description">
              <el-input v-model="dataForm.description" placeholder="视图说明" type="textarea"
                :rows="3" />
            </el-form-item>
            <el-form-item label="数据接口" prop="interfaceId">
              <interface-dialog :value="dataForm.interfaceId" :title="dataForm.interfaceName"
                @change="onInterfaceChange" :hasPage="1" />
            </el-form-item>
            <el-table v-if="interfaceParam" :data="interfaceParam" style="margin-bottom: 18px;">
              <el-table-column type="index" width="50" label="序号" align="center" />
              <el-table-column prop="field" label="参数名称" width="200">
                <template slot-scope="scope">
                  <span class="required-sign">{{scope.row.required?'*':''}}</span>
                  {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
                </template>
              </el-table-column>
              <el-table-column prop="value" label="值">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.defaultValue" placeholder="请输入" clearable />
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </el-col>
      </el-row>
      <template v-if="activeStep==1">
        <columnDesign ref="columnDesign" :columnData="columnData" :appColumnData="appColumnData"
          :modelType="dataForm.type" :webType="dataForm.webType" :interfaceId="dataForm.interfaceId"
          :templateJson="interfaceParam" />
      </template>
    </div>
  </el-dialog>
</template>

<script>
import Generator from '@/components/extnGenerator/index/Home'
import ColumnDesign from '@/components/extn/ColumnDesign'
import TableForm from '@/views/extn/generator/TableForm'
import mixin from '@/mixins/extn-generator/form'
import InterfaceDialog from '@/components/extnProcess/PropPanel/InterfaceDialog'
export default {
  mixins: [mixin],
  components: { Generator, ColumnDesign, TableForm, InterfaceDialog },
  data() {
    return {
      dataRule: {
        fullName: [
          { required: true, message: '视图名称不能为空', trigger: 'blur' },
        ],
        enCode: [
          { required: true, message: '视图编码不能为空', trigger: 'blur' },
          { validator: this.formValidate('enCode'), trigger: 'blur' },
        ],
        category: [
          { required: true, message: '视图分类不能为空', trigger: 'change' },
        ],
        enableFlow: [
          { required: true },
        ],
        interfaceId: [
          { required: true, message: '数据接口不能为空', trigger: 'change' },
        ]
      }
    }
  }
}
</script>