<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.__config__.tipLabel"
        placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="上传提示">
      <el-input v-model="activeData.tipText" :rows="2" placeholder="请输入上传提示" type="textarea" />
    </el-form-item>
    <el-form-item label="文件大小">
      <el-input v-model.number="activeData.fileSize" placeholder="请输入文件大小">
        <el-select slot="append" v-model="activeData.sizeUnit" :style="{ width: '66px' }">
          <el-option label="KB" value="KB" />
          <el-option label="MB" value="MB" />
        </el-select>
      </el-input>
    </el-form-item>
    <el-form-item label="最大上传数">
      <el-input-number v-model="activeData.limit" :min="0" placeholder="最大上传数" :step="1"
        :precision="0" controls-position="right" />
    </el-form-item>
    <el-form-item label="上传路径">
      <el-radio-group v-model="activeData.pathType" size="small" style="text-align:center">
        <el-radio-button label="defaultPath">默认路径</el-radio-button>
        <el-radio-button label="selfPath">自定义路径</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <template v-if="activeData.pathType === 'selfPath'">
      <el-form-item label="分用户存储">
        <el-switch v-model="activeData.isAccount" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="文件夹名">
        <el-input v-model="activeData.folder" placeholder="请输入显示字段" />
      </el-form-item>
    </template>
    <!-- <el-form-item label="显示提示">
      <el-switch v-model="activeData.showTip" />
    </el-form-item> -->
    <el-form-item label="是否禁用">
      <el-switch v-model="activeData.disabled" />
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="activeData.__config__.required" />
    </el-form-item>
    <!-- <el-form-item label="显示标签">
      <el-switch v-model="activeData.__config__.showLabel" />
    </el-form-item> -->
  </el-row>
</template>
<script>
import comMixin from './mixin';
export default {
  props: ['activeData'],
  mixins: [comMixin],
  data() {
    return {
    }
  },
  created() { },
  methods: {


  }
}
</script>