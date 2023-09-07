<template>
  <div class="comment-container">
    <div class="comment-list" v-loading="listLoading && listQuery.currentPage==1"
      ref="infiniteBody">
      <template v-if="list.length">
        <div v-for="(item,i) in list" :key="i" class="item">
          <div class="head">
            <el-avatar :size="40" :src="define.comUrl + item.creatorUserHeadIcon" class="avatar" />
            <p class="username">{{item.creatorUser}}</p>
            <el-link :underline="false" class="del-btn" @click="delComment(item.id,i)" type="danger"
              v-if="item.isDel">删除</el-link>
            <span class="time">{{item.creatorTime|toDate()}}</span>
          </div>
          <div class="content">
            <p class="text">{{item.text}}</p>
            <div class="img-list" v-if="item.imageList.length">
              <el-image :src="define.comUrl+cItem.url" class="img-item"
                v-for="(cItem,ci) in item.imageList" :key="ci"
                :preview-src-list="getImgList(item.imageList)" :z-index="10000">
              </el-image>
            </div>
            <div class="file-List" v-if="item.fileList.length">
              <JNPF-UploadFz v-model="item.fileList" detailed disabled></JNPF-UploadFz>
            </div>
          </div>
        </div>
      </template>
      <el-empty description="暂无数据" :image-size="120" v-else></el-empty>
    </div>
    <el-dialog title="流程评论" :visible.sync="dialogVisible" :close-on-click-modal="false"
      class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body width="600px">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="0">
        <el-form-item prop="text">
          <el-input v-model="dataForm.text" placeholder="请输入评论" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item>
          <el-upload :action="define.comUploadUrl+'/annexpic'" :headers="uploadHeaders"
            ref="elUploadImg" :on-success="handleImgSuccess" multiple :show-file-list="false"
            accept="image/*" :before-upload="beforeImgUpload" :on-exceed="handleImgExceed"
            :limit="9" class="upload-btn">
            <el-button size="small" icon="el-icon-picture">图片</el-button>
          </el-upload>
          <el-button size="small" icon="el-icon-upload" @click="uploadFile">附件</el-button>
        </el-form-item>
        <el-form-item prop="image" v-if="dataForm.image.length">
          <div class="img-list">
            <div class="img-item" v-for="(item,i) in dataForm.image" :key="i">
              <el-image :src="define.comUrl+item.url" class=""
                :preview-src-list="getImgList(dataForm.image)" :z-index="100">
              </el-image>
              <div class="badge" @click.stop="handleImgRemove(i)">
                <i class="el-icon-close"></i>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item prop="file">
          <ul class="el-upload-list el-upload-list el-upload-list--text">
            <li class="el-upload-list__item is-success" v-for="(file,index) in dataForm.file"
              :key="file.fileId">
              <a class="el-upload-list__item-name">
                <i class="el-icon-paperclip"></i>
                {{file.name}}{{file.fileSize?`（${jnpf.toFileSize(file.fileSize)}）`:''}}
              </a>
              <i class="el-icon-view" title="查看" @click="handleFilePreview(file)"></i>
              <i class="el-icon-download" title="下载" @click="handleFileClick(file)"></i>
              <label class="el-upload-list__item-status-label">
                <i class="el-icon-upload-success el-icon-circle-check"></i>
              </label>
              <i class="el-icon-close" title="删除" @click="handleFileRemove(index)"></i>
            </li>
          </ul>
          <fileUploader ref="fileUploader" :limit="2" :fileSize="50" type="annex"
            :accept="fileAccept" @fileSuccess="fileSuccess" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">{{$t('common.cancelButton')}}
        </el-button>
        <el-button type="primary" @click="addComment()" :loading="btnLoading">
          {{$t('common.confirmButton')}}</el-button>
      </span>
    </el-dialog>
    <Preview :visible.sync="previewVisible" :file="activeFile" />
  </div>
</template>

<script>
import { getCommentList, createComment, delComment } from '@/api/workFlow/FlowEngine'
import { getDownloadUrl } from '@/api/common'
import Preview from '@/components/Generator/components/Upload/Preview'
import FileUploader from './FileUploader'

export default {
  name: 'comments',
  components: { Preview, FileUploader },
  props: {
    id: { type: String, default: '' },
  },
  data() {
    return {
      list: [],
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      total: 0,
      listLoading: false,
      btnLoading: false,
      dataRule: {},
      dataForm: {
        text: '',
        file: [],
        image: [],
      },
      dialogVisible: false,
      finish: false,
      uploadHeaders: { Authorization: this.$store.getters.token },
      imgUploading: false,
      previewVisible: false,
      fileAccept: '.xls,.xlsx,.doc,.docx,.pdf,.txt,.ppt,.pptx',
      activeFile: {}
    }
  },
  methods: {
    init() {
      this.list = []
      this.listQuery = {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      this.finish = false
      this.initData()
      this.$nextTick(() => {
        this.bindScroll()
      })
    },
    bindScroll() {
      let _this = this,
        vBody = _this.$refs.infiniteBody;
      vBody.addEventListener("scroll", function () {
        if (vBody.scrollHeight - vBody.clientHeight - vBody.scrollTop <= 600 && !_this.listLoading && !_this.finish) {
          _this.listQuery.currentPage += 1
          _this.initData()
        }
      });
    },
    initData() {
      this.listLoading = true
      let query = {
        ...this.listQuery,
        taskId: this.id
      }
      getCommentList(query).then(res => {
        let list = res.data.list.map(o => ({
          ...o,
          fileList: o.file ? JSON.parse(o.file) : [],
          imageList: o.image ? JSON.parse(o.image) : [],
        }))
        if (res.data.list.length < this.listQuery.pageSize) {
          this.finish = true
        }
        this.list = [...this.list, ...list]
        this.total = res.data.pagination.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    showCommentDialog() {
      this.dialogVisible = true
      this.dataForm.image = []
      this.dataForm.file = []
      this.$nextTick(() => {
        this.$refs.elUploadImg.uploadFiles = []
        this.$refs['dataForm'].resetFields()
      })
    },
    getImgList(list) {
      const newList = list.map(o => this.define.comUrl + o.url)
      return newList
    },
    addComment() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          let query = {
            text: this.dataForm.text,
            file: JSON.stringify(this.dataForm.file),
            image: JSON.stringify(this.dataForm.image),
            taskId: this.id
          }
          createComment(query).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.dialogVisible = false
                this.btnLoading = false
                this.init()
              }
            })
          }).catch(() => { this.btnLoading = false })
        }
      })
    },
    delComment(id, index) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        delComment(id).then(res => {
          this.list.splice(index, 1)
          this.$message({
            type: 'success',
            message: res.msg
          })
        })
      }).catch(() => { });
    },
    beforeImgUpload(file) {
      let isRightSize = file.size < 50 * 1024 * 1024
      if (!isRightSize) {
        this.$message.error(`图片大小超过50MB`)
        return isRightSize;
      }
      let isAccept = new RegExp('image/*').test(file.type)
      if (!isAccept) {
        this.$message.error(`请上传图片`)
        return isAccept;
      }
      if (isRightSize && isAccept) this.imgUploading = true
      return isRightSize && isAccept;
    },
    handleImgSuccess(res, file, fileList) {
      if (res.code == 200) {
        this.dataForm.image.push({
          name: file.name,
          fileId: res.data.name,
          url: res.data.url
        })
      } else {
        this.$refs.elUploadImg.uploadFiles.splice(fileList.length - 1, 1)
        fileList.filter(o => o.uid != file.uid)
        this.$message({ message: res.msg, type: 'error', duration: 1500 })
      }
      this.imgUploading = false
    },
    handleImgExceed(files, fileList) {
      this.$message.warning(`当前限制最多可以上传9张图片`)
    },
    handleImgRemove(index) {
      this.dataForm.image.splice(index, 1)
      this.$refs.elUploadImg.uploadFiles.splice(index, 1)
    },
    uploadFile() {
      const isTopLimit = this.dataForm.file.length >= 2
      if (isTopLimit) {
        this.$message.error(`当前限制最多可以上传2个文件`)
        return false
      }
      this.$refs.fileUploader && this.$refs.fileUploader.openUploader()
    },
    fileSuccess(data) {
      const isTopLimit = this.dataForm.file.length >= 2
      if (isTopLimit) {
        this.$message.error(`当前限制最多可以上传2个文件`)
        return false
      }
      this.dataForm.file.push(data)
    },
    handleFileRemove(index) {
      this.dataForm.file.splice(index, 1)
    },
    handleFileClick(file) {
      if (!file.fileId) return
      getDownloadUrl('annex', file.fileId).then(res => {
        this.jnpf.downloadFile(res.data.url, file.name)
      })
    },
    handleFilePreview(file) {
      this.activeFile = file
      this.previewVisible = true
    }
  }
}
</script>
<style lang="scss" scoped>
.comment-container {
  height: 100%;
  overflow: hidden;
  .comment-list {
    height: 100%;
    overflow: auto;
    .item {
      padding: 0 30px;
      margin-bottom: 20px;
      .head {
        display: flex;
        align-items: center;
        .avatar {
          flex-shrink: 0;
          margin-right: 20px;
        }
        .username {
          line-height: 40px;
          color: #333;
          flex: 1;
        }
        .head-right {
          flex-shrink: 0;
        }
        .time {
          flex-shrink: 0;
          font-size: 14px;
          color: #666;
          margin-left: 20px;
        }
      }

      .content {
        font-size: 14px;
        padding-left: 60px;
        .text {
          line-height: 30px;
          color: #666;
        }
        .img-list {
          margin-top: 6px;
          .img-item {
            width: 80px;
            height: 80px;
            overflow: hidden;
            margin: 0 6px 6px 0;
            // border: 1px solid #c0ccda;
            border-radius: 6px;
          }
        }
      }
    }
  }
}
.JNPF-dialog {
  .upload-btn {
    display: inline-block;
    margin-right: 20px;
  }
  .img-list {
    display: flex;

    .img-item {
      width: 40px;
      height: 40px;
      position: relative;
      margin-right: 10px;
      .el-image {
        width: 100%;
        height: 100%;
      }
      .badge {
        background-color: #f56c6c;
        border-radius: 10px;
        color: #fff;
        display: block;
        font-size: 12px;
        height: 18px;
        width: 18px;
        line-height: 18px;
        text-align: center;
        border: 1px solid #fff;
        position: absolute;
        right: -9px;
        top: -9px;
        cursor: pointer;
        z-index: 10001;
      }
    }
  }
  .el-upload-list__item {
    .el-upload-list__item-name {
      margin-right: 70px;
      .el-icon-paperclip {
        line-height: 25px;
      }
    }
    .el-icon-download {
      display: inline-block;
      position: absolute;
      top: 5px;
      right: 25px;
      cursor: pointer;
      opacity: 0.75;
      color: #606266;
    }
    .el-icon-view {
      display: inline-block;
      position: absolute;
      top: 5px;
      right: 45px;
      cursor: pointer;
      opacity: 0.75;
      color: #606266;
    }
  }
}
</style>