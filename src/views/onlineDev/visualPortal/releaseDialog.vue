<template>
  <el-dialog title="同步门户" :visible.sync="releaseDialogVisible" append-to-body
    class="JNPF-dialog JNPF-dialog_center release-dialog" lock-scroll width="600px">
    <el-alert title="将该门户同步至应用门户，是否继续？" type="warning" :closable="false" show-icon />
    <div class="dialog-main">
      <div class="item" :class="{'active':releaseQuery.pc===1}" @click="selectToggle('pc')">
        <i class="item-icon icon-ym icon-ym-pc"></i>
        <p class="item-title">同步Web端门户</p>
        <div class="icon-checked">
          <i class="el-icon-check"></i>
        </div>
      </div>
      <div class="item" :class="{'active':releaseQuery.app===1}" @click="selectToggle('app')">
        <i class="item-icon icon-ym icon-ym-mobile"></i>
        <p class="item-title">同步APP端门户</p>
        <div class="icon-checked">
          <i class="el-icon-check"></i>
        </div>
      </div>
    </div>
    <el-form class="dialog-form-main" :model="releaseQuery" :rules="releaseQueryRule"
      label-position="right" label-width="50px" ref="releaseForm">
      <template v-if="!currRow.pcIsRelease">
        <el-form-item label="应用" prop="pcModuleParentId" v-if="releaseQuery.pc">
          <el-select v-model="releaseQuery.pcModuleParentId" multiple placeholder="选择应用">
            <el-option v-for="item in treeData" :key="item.id" :label="item.fullName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </template>
      <template v-if="!currRow.appIsRelease">
        <el-form-item label="" v-if="(!releaseQuery.pc||currRow.pcIsRelease) && releaseQuery.app">
        </el-form-item>
        <el-form-item label="应用" prop="appModuleParentId" v-if="releaseQuery.app">
          <el-select v-model="releaseQuery.appModuleParentId" multiple placeholder="选择应用">
            <el-option v-for="item in treeData" :key="item.id" :label="item.fullName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </template>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="releaseDialogVisible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" :loading="releaseBtnLoading" @click="releaseModel">
        {{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {
  Release
} from "@/api/system/portal";
import { mapGetters } from "vuex";
import { getSystem } from "@/api/system/system";
export default {
  props: [],
  name: 'releaseDialog',
  data() {
    return {
      releaseDialogVisible: false,
      releaseBtnLoading: false,
      currRow: {},
      releaseQuery: {
        pc: 1,
        app: 1,
        pcModuleParentId: '',
        appModuleParentId: '',
        systemId: ''
      },
      releaseQueryRule: {
        pcModuleParentId: [
          { required: true, message: '应用不能为空', trigger: 'change' }
        ],
        appModuleParentId: [
          { required: true, message: '应用不能为空', trigger: 'change' }
        ],
      },
      treeData: [],
      appTreeData: [],
      pcSystemId: "",
      appSystemId: "",
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  methods: {
    releaseModel() {
      this.$refs['releaseForm'].validate((valid) => {
        if (!valid) return
        this.$confirm('发布确定后会覆盖当前线上版本且进行门户同步，是否继续？', '提示', {
          type: 'warning'
        }).then(() => {
          setTimeout(() => {
            this.release()
          }, 200)
        })
      })
    },
    openRelease(row) {
      this.currRow = row
      this.releaseDialogVisible = true
      this.pcSystemId = ""
      this.appSystemId = ""
      this.releaseQuery = {
        pc: 1,
        app: 1,
        pcModuleParentId: '',
        appModuleParentId: '',
      }
      this.$nextTick(() => {
        this.$refs['releaseForm'] && this.$refs['releaseForm'].resetFields()
      })
      getSystem({ enableMark: 1 }).then((res) => {
        this.treeData = res.data.list;
      }).catch(() => { });
    },
    selectToggle(key) {
      this.releaseQuery[key] = this.releaseQuery[key] === 1 ? 0 : 1
      const type = key == 'pc' ? 'pcModuleParentId' : 'appModuleParentId'
      this.$refs.releaseForm.clearValidate(type)
    },
    // 发布菜单
    release() {
      if (!this.releaseQuery.pc && !this.releaseQuery.app) return this.$message.error('请至少选择一种门户同步方式')
      this.releaseBtnLoading = true
      this.releaseQuery.pcSystemId = this.releaseQuery.pcModuleParentId.toString()
      this.releaseQuery.appSystemId = this.releaseQuery.appModuleParentId.toString()
      Release(this.currRow.id, this.releaseQuery).then(res => {
        this.$message({
          type: 'success',
          message: res.msg,
          duration: 1000,
          onClose: () => {
            this.releaseBtnLoading = false
            this.releaseDialogVisible = false
            this.$emit('release', true)
          }
        });

      }).catch(() => { this.releaseBtnLoading = false })
    },
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
  .dialog-form-main {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    >>> .el-form-item {
      width: 215px;
    }
  }
  .dialog-main {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    .item {
      position: relative;
      width: 215px;
      height: 127px;
      cursor: pointer;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      text-align: center;
      padding-top: 20px;
      color: #606266;
      &.active {
        border-color: #1890ff;
        color: #1890ff;
        box-shadow: 0 0 6px rgba(6, 58, 108, 0.1);
        .item-icon {
          border-color: #1890ff;
        }
        .icon-checked {
          display: block;
        }
      }
      .item-icon {
        display: inline-block;
        width: 44px;
        height: 44px;
        margin-bottom: 16px;
        border: 2px solid #606266;
        line-height: 40px;
        font-size: 24px;
        text-align: center;
        border-radius: 50%;
      }
      .item-title {
        font-size: 16px;
        font-weight: 400;
      }
      .icon-checked {
        display: none;
        width: 18px;
        height: 18px;
        border: 18px solid #1890ff;
        border-left: 18px solid transparent;
        border-top: 18px solid transparent;
        border-bottom-right-radius: 4px;
        position: absolute;
        right: 0px;
        bottom: 0px;

        i {
          font-size: 16px;
          position: absolute;
          top: 0;
          left: -2px;
          color: #fff;
        }
      }
    }
  }
}
</style>