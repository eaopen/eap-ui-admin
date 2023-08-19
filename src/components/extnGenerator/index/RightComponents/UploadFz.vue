<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.__config__.tipLabel"
        placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="按钮文字">
      <el-input v-model="activeData.buttonText" placeholder="请输入按钮文字" />
    </el-form-item>
    <el-form-item label="上传提示">
      <el-input v-model="activeData.tipText" placeholder="请输入上传提示" type="textarea" />
    </el-form-item>
    <el-form-item label="文件类型">
      <el-select v-model="acceptArray" placeholder="不限制" clearable @change="onChange" multiple>
        <el-option label="图片" value="image/*" />
        <el-option label="视频" value="video/*" />
        <el-option label="音频" value="audio/*" />
        <el-option label="excel" value=".xls,.xlsx" />
        <el-option label="word" value=".doc,.docx" />
        <el-option label="pdf" value=".pdf" />
        <el-option label="txt" value=".txt" />
      </el-select>
    </el-form-item>
    <el-form-item label="文件大小">
      <el-input v-model.number="activeData.fileSize" placeholder="请输入文件大小" @change="onChange">
        <el-select slot="append" v-model="activeData.sizeUnit" :style="{ width: '66px' }"
          @change="onChange">
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
  computed: {
    acceptArray: {
      get() {
        if (!this.activeData.accept) return []
        const str = this.activeData.accept.replace('.xls,.xlsx', '.xls|.xlsx').replace('.doc,.docx', '.doc|.docx')
        const list = str.split(',').map(o => o.replace('|', ','))
        return list
      },
      set(val) {
        this.activeData.accept = val.join(',');
      }
    },
  },
  created() { },
  methods: {
    onChange() {
      this.activeData.__config__.renderKey = +new Date()
    }
  }
}
</script>