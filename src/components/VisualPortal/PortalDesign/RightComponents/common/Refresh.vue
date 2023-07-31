<template>
  <div>
    <el-form-item label="自动刷新">
      <el-switch v-model="refresh.autoRefresh" />
    </el-form-item>
    <el-form-item label="刷新间隔" v-if="refresh.autoRefresh">
      <el-input v-model.number="refresh.autoRefreshTime" placeholder="请输入" type="number" min="1"
        max="1440" onkeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))">
        <template slot="append">分钟</template>
      </el-input>
    </el-form-item>
  </div>
</template>
<script>
export default {
  props: ['refresh']
}
</script>
