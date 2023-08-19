<template>
  <div class="UploadFile-container">
    <template v-if="fileList.length">
      <transition-group class="el-upload-list el-upload-list--picture-card" tag="ul" name="el-list">
        <li class="el-upload-list__item is-success" v-for="(file,index) in fileList"
          :key="file.fileId">
          <el-image :src="define.comUrl+file.url" class="el-upload-list__item-thumbnail"
            :preview-src-list="getImgList(fileList)" :z-index="10000" :ref="'image'+index">
          </el-image>
          <span class="el-upload-list__item-actions">
            <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(index)">
              <i class="el-icon-zoom-in"></i>
            </span>
            <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(index)">
              <i class="el-icon-delete"></i>
            </span>
          </span>
        </li>
      </transition-group>
    </template>
    <template v-if="!detailed">
      <el-upload :action="define.comUploadUrl+'/'+type" :headers="uploadHeaders" :data="params"
        ref="elUpload" :on-success="handleSuccess" :multiple="limit!==1" :show-file-list="false"
        accept="image/*" :before-upload="beforeUpload" :disabled="disabled" list-type="picture-card"
        class="upload-btn">
        <i class="el-icon-plus"></i>
      </el-upload>
    </template>
    <template>
      <div class="el-upload__tip" slot="tip" v-if="tipText">{{ tipText }}</div>
    </template>
  </div>
</template>

<script>
const units = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024
}
export default {
  name: 'UploadImg',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'annexpic'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    detailed: {
      type: Boolean,
      default: false
    },
    showTip: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 0
    },
    accept: {
      type: String,
      default: 'image/*'
    },
    sizeUnit: {
      type: String,
      default: 'MB'
    },
    pathType: {
      type: String,
      default: 'defaultPath'
    },
    isAccount: {
      type: Number,
      default: 0
    },
    folder: {
      type: String,
      default: ''
    },
    fileSize: {
      default: 10
    },
    tipText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fileList: [],
      uploadHeaders: { Authorization: this.$store.getters.token },
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.fileList = Array.isArray(val) ? val : []
      }
    }
  },
  computed: {
    params() {
      return {
        pathType: this.pathType,
        isAccount: this.isAccount,
        folder: this.folder
      }
    }
  },
  methods: {
    beforeUpload(file) {
      if (this.fileList.length >= this.limit) {
        this.handleExceed()
        return false
      }
      const unitNum = units[this.sizeUnit];
      if (!this.fileSize) return true
      let isRightSize = file.size / unitNum < this.fileSize
      if (!isRightSize) {
        this.$message.error(`图片大小超过${this.fileSize}${this.sizeUnit}`)
        return isRightSize;
      }
      let isAccept = new RegExp('image/*').test(file.type)
      if (!isAccept) {
        this.$message.error(`请上传图片`)
        return isAccept;
      }
      return isRightSize && isAccept;
    },
    handleSuccess(res, file, fileList) {
      if (this.fileList.length >= this.limit) return this.handleExceed()
      if (res.code == 200) {
        this.fileList.push({
          name: file.name,
          fileId: res.data.name,
          url: res.data.url
        })
        this.$emit('input', this.fileList)
        this.$emit('change', this.fileList)
      } else {
        this.$refs.elUpload.uploadFiles.splice(fileList.length - 1, 1)
        fileList.filter(o => o.uid != file.uid)
        this.$emit('input', this.fileList)
        this.$emit('change', this.fileList)
        this.$message({ message: res.msg, type: 'error', duration: 1500 })
      }
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制最多可以上传${this.limit}张图片`)
    },
    handlePictureCardPreview(index) {
      this.$refs['image' + index][0].clickHandler()
    },
    handleRemove(index) {
      this.fileList.splice(index, 1)
      this.$refs.elUpload.uploadFiles.splice(index, 1)
      this.$emit("input", this.fileList)
      this.$emit('change', this.fileList)
    },
    getImgList(list) {
      const newList = list.map(o => this.define.comUrl + o.url)
      return newList
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .el-upload-list--picture-card .el-upload-list__item {
  width: 120px;
  height: 120px;
}
>>> .el-upload--picture-card {
  width: 120px;
  height: 120px;
  line-height: 120px;
}
.upload-btn {
  display: inline-block;
}
.el-upload__tip {
  color: #a5a5a5;
  word-break: break-all;
  line-height: 1.3;
  margin-top: 5px;
}
// .el-upload-list--picture-card {
//   display: inline-block;
//   height: 0;
// }
</style>