<template>
  <el-upload :action="define.comUrl+url" :headers="{ Authorization: $store.getters.token}"
    :data="data" :on-success="handleSuccess" :before-upload="beforeUpload" :show-file-list="false"
    class="upload-btn">
    <el-button ref="uploadBtn" :type="buttonType" :icon="showIcon?'el-icon-upload2':''"
      :loading="loading">
      {{buttonText}}
    </el-button>
  </el-upload>
</template>

<script>
export default {
  name: 'JNPF-uploadBtn',
  data() {
    return {
      loading: false
    }
  },
  props: {
    url: {
      type: String,
      default: ""
    },
    buttonText: {
      type: String,
      default: '导入'
    },
    buttonType: {
      type: String,
      default: 'text'
    },
    data: {
      type: Object,
      default: () => { }
    },
    showIcon: {
      type: Boolean,
      default: true
    },
  },
  methods: {
    beforeUpload() {
      this.loading = true
    },
    handleSuccess(res) {
      this.loading = false
      if (res.code == 200) {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1000
        })
        this.$emit('on-success')
      } else {
        this.$message({
          message: res.msg,
          type: 'error',
          duration: 1000
        })
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.upload-btn {
  display: inline-block;
  margin: 0 10px;
}
</style>