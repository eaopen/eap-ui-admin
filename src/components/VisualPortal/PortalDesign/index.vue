<template>
  <el-dialog :visible.sync="visible" fullscreen lock-scroll class="JNPF-full-dialog"
    :show-close="false" :modal="false">
    <div class="JNPF-full-dialog-header">
      <div class="header-title">
        <img src="@/assets/images/jnpf.png" class="header-logo" />
        <el-tooltip class="item" effect="dark" :content="fullName" placement="top">
          <p class="header-txt"> · {{fullName}}</p>
        </el-tooltip>
      </div>
      <el-radio-group v-model="showType" size="mini">
        <el-radio-button label="pc">
          <el-tooltip effect="dark" content="PC" placement="top">
            <i class="icon-ym icon-ym-pc" />
          </el-tooltip>
        </el-radio-button>
        <el-radio-button label="app">
          <el-tooltip effect="dark" content="APP" placement="top">
            <i class="icon-ym icon-ym-mobile" />
          </el-tooltip>
        </el-radio-button>
      </el-radio-group>
      <div class="options">
        <el-tooltip effect="dark" content="撤销" placement="top">
          <el-link icon="icon-ym icon-ym-report-icon-undo" :underline="false" class="active-btn"
            :disabled="!getCanUndo" @click="handleRedoAndUndo('handleUndo')" />
        </el-tooltip>
        <el-tooltip effect="dark" content="重做" placement="top">
          <el-link icon="icon-ym icon-ym-report-icon-restore" :underline="false" class="active-btn"
            :disabled="!getCanRedo" @click="handleRedoAndUndo('handleRedo')" />
        </el-tooltip>
        <el-tooltip effect="dark" content="清空" placement="top">
          <el-link icon="icon-ym icon-ym-clean" :underline="false" @click="empty"
            class="active-btn" />
        </el-tooltip>
        <el-tooltip effect="dark" content="预览" placement="top">
          <el-link icon="icon-ym el-icon-video-play" :underline="false" @click="preview()"
            class="active-btn" />
        </el-tooltip>
        <el-divider direction='vertical' class="divider"></el-divider>
        <el-button type="primary" @click="dataFormSubmit(1)" :loading="btnLoading">
          保存并发布</el-button>
        <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
          保 存</el-button>
        <el-button @click="closeDialog()">{{$t('common.cancelButton')}}</el-button>
      </div>
    </div>
    <ReleaseDialog :visible.sync="releaseDialog" ref="release" @release="closeDialog" />
    <div class="main" v-if="!loading">
      <PortalDesigner ref="portalDesigner" :conf="formData" :showType='showType'
        @addRecord="handleAddRecord" />
    </div>
  </el-dialog>
</template>

<script>
import { getPortalInfo, Update, Create } from '@/api/onlineDev/portal'
import PortalDesigner from './components'
import useRedoMixins from '@/components/VisualPortal/mixins/useRedo'
import ReleaseDialog from '@/views/onlineDev/visualPortal/releaseDialog'
export default {
  mixins: [useRedoMixins],
  components: { PortalDesigner, ReleaseDialog },
  data() {
    return {
      currRow: {},
      visible: false,
      loading: false,
      formVisible: false,
      btnLoading: false,
      formData: null,
      categoryList: [],
      showType: 'pc',
      fullName: '',
      id: '',
      key: false,
      showFullName: false,
      releaseDialog: false,
    }
  },
  methods: {
    init(row) {
      this.currRow = row
      this.visible = true
      this.loading = false
      this.formData = null
      this.fullName = row.fullName
      this.btnLoading = false
      this.showType = 'pc'
      this.initRedo()
      this.$nextTick(() => {
        if (this.currRow.id) {
          this.loading = true
          getPortalInfo(this.currRow.id).then(res => {
            this.loading = false
            this.formData = JSON.parse(res.data.formData)
          }).catch(() => { this.loading = false })
        }
      })
    },
    dataFormSubmit(type) {
      this.$refs['portalDesigner'].getData().then(res => {
        this.btnLoading = true
        this.formData = res.formData
        let query = {
          formData: JSON.stringify(this.formData),
          id: this.currRow.id
        }
        const formMethod = this.currRow.id ? Update : Create
        formMethod(query).then((res) => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.btnLoading = false
              if (type == 1) {
                this.$nextTick(() => {
                  this.releaseDialog = true
                  this.$refs.release.openRelease(this.currRow)
                })
              } else {
                this.closeDialog(true)
              }
            }
          })
        }).catch(() => { this.btnLoading = false })
      }).catch(err => {
        err.msg && this.$message.warning(err.msg)
      })
    },
    closeDialog(isRefresh) {
      this.visible = false
      this.$emit('close', isRefresh)
    },
    handleRedoAndUndo(func) {
      this[func](this.$refs.portalDesigner.handleData)
    },
    preview() {
      this.$refs.portalDesigner.preview()
    },
    empty() {
      this.$refs.portalDesigner.empty()
    },
    handleAddRecord(val) {
      this.addRecord(val)
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .options {
  width: 500px !important;
}
.unActive {
  width: 30px;
  height: 30px;
  line-height: 30px;
  border: 1px solid #dcdfe6;
  color: #606266 !important;
}
.selectActive {
  width: 30px;
  height: 30px;
  line-height: 30px;
  color: #fff !important;
  background: #1890ff !important;
}
.active-btn {
  >>> .icon-ym {
    font-size: 20px;
    margin-left: 15px;
  }
}
.divider {
  height: 28px;
  margin: 0 15px;
}
>>> .el-radio-button__inner {
  padding: 7px 10px !important;
}
</style>