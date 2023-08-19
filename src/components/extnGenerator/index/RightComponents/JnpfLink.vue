<template>
  <el-row>
    <el-form-item label="链接文本">
      <el-input v-model="activeData.content" placeholder="请输入链接文本" />
    </el-form-item>
    <jnpf-form-tip-item label="链接地址" tip-label="地址以http://或https://为开头">
      <el-input v-model="activeData.href" placeholder="请输入链接地址">
        <el-select slot="append" v-model="activeData.target" style="width: 85px;" placeholder="请选择">
          <el-option label="_self" value="_self" />
          <el-option label="_blank" value="_blank" />
        </el-select>
      </el-input>
    </jnpf-form-tip-item>
    <el-form-item label="对齐方式">
      <el-radio-group v-model="activeData.textStyle['text-align']">
        <el-radio-button label="left">左对齐</el-radio-button>
        <el-radio-button label="center">居中对齐</el-radio-button>
        <el-radio-button label="right">右对齐</el-radio-button>
      </el-radio-group>
    </el-form-item>
  </el-row>
</template>
<script>
import comMixin from "./mixin";
export default {
  props: ["activeData"],
  mixins: [comMixin],
  data() {
    return {};
  },
  created() { },
  methods: {}
};
</script>