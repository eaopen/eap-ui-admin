<template>
  <el-row>
    <el-form-item label="分组标题">
      <el-input v-model="activeData.content" placeholder="请输入分组标题" />
    </el-form-item>
    <el-form-item label="标题提示">
      <el-input type="textarea" :rows="2" v-model="activeData.tipLabel" placeholder="请输入标题提示" />
    </el-form-item>
    <el-form-item label="对齐方式">
      <el-radio-group v-model="activeData['content-position']">
        <el-radio-button label="left">左对齐</el-radio-button>
        <el-radio-button label="center">居中对齐</el-radio-button>
        <el-radio-button label="right">右对齐</el-radio-button>
      </el-radio-group>
    </el-form-item>
  </el-row>
</template>
<script>
export default {
  props: ['activeData']
}
</script>