<template>
  <el-collapse-item title="自定义配色设置" name="11">
    <template
      v-if="activeData.jnpfKey != 'pieChart'&&activeData.jnpfKey != 'radarChart'&&showType=='pc'">
      <el-form-item label="文字颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.AxisTextStyleColor" />
      </el-form-item>
      <el-form-item label="轴线颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.AxisLineStyleColor" />
      </el-form-item>
    </template>
    <el-table :data="activeData.option.colorList">
      <el-table-column prop="fullName" label="颜色">
        <template slot-scope="scope">
          <el-color-picker v-model="scope.row.color1" />
        </template>
      </el-table-column>
      <el-table-column prop="fullName" label="渐变色" v-if="showType=='pc'">
        <template slot-scope="scope">
          <el-color-picker v-model="scope.row.color2" />
        </template>
      </el-table-column>
      <el-table-column width="70" prop="enCode" label="操作">
        <template slot-scope="scope">
          <el-link @click="deleteBarColor(scope.$index)" :underline="false" type="danger"
            icon="el-icon-delete"></el-link>
        </template>
      </el-table-column>
    </el-table>
    <div class="table-actions" @click="addHandle()">
      <el-button type="text" icon="el-icon-plus">新增</el-button>
    </div>
  </el-collapse-item>
</template>
<script>
export default {
  props: ['activeData', 'showType'],
  methods: {
    addHandle() {
      this.activeData.option.colorList.push({ color1: "#1890ff", color2: "#4696DD" })
    },
    deleteBarColor(index) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        this.activeData.option.colorList.splice(index, 1)
        this.$message({
          type: 'success',
          message: '删除成功'
        })
      }).catch(() => { });
    },
  }
}
</script>