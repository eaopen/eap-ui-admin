<template>
  <el-dialog title="批量导入" :close-on-click-modal="false" :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center JNPF-dialog-import" lock-scroll width="1000px">
    <el-steps :active="active" align-center>
      <el-step title="上传文件"></el-step>
      <el-step title="数据预览"></el-step>
      <el-step title="导入数据"></el-step>
    </el-steps>
    <div class="import-main" v-show="active==1">
      <div class="upload">
        <div class="up_left">
          <img src="@/assets/images/upload.png">
        </div>
        <div class="up_right">
          <p class="title">
            上传填好的数据表
          <p class="tip">文件后缀名必须是xls或xlsx，文件大小不超过500KB，最多支持导入1000条数据</p>
          <el-upload :action="actionUrl" :headers="{ Authorization: $store.getters.token}"
            :on-success="handleSuccess" :on-remove="handleRemove" :before-remove="beforeRemove"
            :on-change="handleChange" :file-list="fileList" accept=".xls,.xlsx"
            :before-upload="beforeUpload" class="upload-area">
            <el-button type="text">上传文件</el-button>
          </el-upload>
        </div>
      </div>
      <div class="upload">
        <div class="up_left">
          <img src="@/assets/images/import.png">
        </div>
        <div class="up_right">
          <p class="title">填写导入数据信息</p>
          <p class="tip">请按照数据模板的格式准备导入数据，模板中的表头名称不可更改，表头行不能删除</p>
          <el-button type="text" @click="templateDownload">下载模板</el-button>
        </div>
      </div>
    </div>
    <div class="import-main" v-show="active==2">
      <JNPF-table v-loading="listLoading" :data="list" :span-method="arraySpanMethod">
        <el-table-column :prop="item.id" :label="item.fullName" min-width="150"
          v-for="(item,index) in headerList" :key="index" :align="item.children?'center':'left'">
          <template slot-scope="scope" v-if="!item.children">
            <el-input v-model="scope.row[item.id]" />
          </template>
          <template v-if="item.children">
            <el-table-column :prop="item.id+'-'+it.id" :label="it.fullName"
              :width="it.id=='delete'?50:150" v-for="(it,i) in item.children" :key="i"
              class-name="child-table-box">>
              <template slot-scope="scope">
                <div class="child-table-column">
                  <tr v-for="(row,j) in scope.row[item.id]" :key="j"
                    class="child-table__row no-border-bottom">
                    <td v-for="(obj,k) in item.children" :key="k"
                      :class="obj.id=='delete'?'delete':'td-flex-1 m-0-10'">
                      <el-input v-model="row[obj.id]" v-if="obj.id!='delete'" />
                      <el-button v-else size="mini" type="text" class="JNPF-table-delBtn"
                        @click="handleTableDel(scope.$index,j,item)">删除</el-button>
                    </td>
                  </tr>
                </div>
              </template>
            </el-table-column>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="50">
          <template slot-scope="scope">
            <el-button size="mini" type="text" class="JNPF-table-delBtn"
              @click="handleDel(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </JNPF-table>
    </div>
    <div class="import-main import-main-overflow" v-show="active==3">
      <div class="success" v-if="!result.resultType">
        <img src="@/assets/images/success.png" alt="">
        <p class="success-title">批量导入成功</p>
        <p class="success-tip">您已成功导入{{result.snum}}条数据</p>
      </div>
      <div class="unsuccess" v-if="result.resultType">
        <el-alert title="错误提醒：导入失败数据展示" type="warning" show-icon :closable="false" />
        <div class="upload error-show">
          <div class="up_left">
            <img class="" src="@/assets/images/tip.png">
          </div>
          <div class="up_right">
            <p class="tip">正常数量条数：<el-link type="success" :underline="false">{{result.snum}}条
              </el-link>
            </p>
            <p class="tip">异常数量条数：<el-link type="danger" :underline="false">{{result.fnum}}条
              </el-link>
            </p>
          </div>
        </div>
        <div class="contips">
          <p>以下文件数据为导入异常数据</p>
          <el-button type="text" icon="el-icon-upload2" @click="exportExceptionData">导出异常数据
          </el-button>
        </div>
        <JNPF-table v-loading="listLoading" :data="resultList" :span-method="arraySpanMethod">
          <el-table-column :prop="item.id" :label="item.fullName" min-width="150"
            v-for="(item,index) in resultHeaderList" :key="index"
            :align="item.children?'center':'left'">
            <template slot-scope="scope" v-if="!item.children">
              {{scope.row[item.id]}}
            </template>
            <template v-if="item.children">
              <el-table-column :prop="item.id+'-'+it.id" :label="it.fullName"
                :width="it.id=='delete'?50:150" v-for="(it,i) in item.children" :key="i"
                class-name="child-table-box">>
                <template slot-scope="scope">
                  <div class="child-table-column">
                    <tr v-for="(row,j) in scope.row[item.id]" :key="j"
                      class="child-table__row no-border-bottom">
                      <td v-for="(obj,k) in item.children" :key="k"
                        :class="obj.id=='delete'?'delete':'td-flex-1 m-0-10'">
                        {{row[obj.id]}}
                      </td>
                    </tr>
                  </div>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
          <el-table-column label="异常原因" prop="errorsInfo" fixed="right" width="150">
          </el-table-column>
        </JNPF-table>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel()" v-if="active == 1">取 消</el-button>
      <el-button @click="prev" v-if="active == 2">上一步</el-button>
      <el-button @click="next" type="primary" v-if="active < 3" :loading="btnLoading"
        :disabled="active == 1 && !fileName">下一步
      </el-button>
      <el-button @click="cancel(true)" type="primary" v-else>关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getTemplateDownload, getImportPreview, importData, getImportExceptionData } from '@/api/common'
export default {
  data() {
    return {
      visible: false,
      btnLoading: false,
      listLoading: false,
      fileName: '',
      fileList: [],
      active: 1,
      list: [],
      headerList: [],
      resultHeaderList: [],
      resultList: [],
      result: {
        resultType: 0,
        snum: 0,
        fnum: 0
      },
      modelId: "",
      url: '',
      actionUrl: '',
      mergeList: []
    }
  },
  methods: {
    init(modelId, url) {
      this.active = 1
      this.fileList = []
      this.fileName = ''
      this.visible = true
      this.modelId = modelId || ''
      this.actionUrl = `${this.define.comUrl}/api/${url ? url : 'visualdev/OnlineDev'}/Uploader`
      this.url = url ? url : `visualdev/OnlineDev/${this.modelId}`
    },
    beforeUpload(file) {
      let isRightSize = file.size / 1024 < 500
      if (!isRightSize) this.$message.error(`文件大小不能超过500KB`)
      return isRightSize
    },
    handleRemove(file, fileList) {
      this.fileList = []
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`).then(() => { })
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1)
    },
    handleSuccess(res, file, fileList) {
      if (res.code == 200) {
        this.fileList = fileList.slice(-1)
        this.fileName = res.data.name
      } else {
        this.fileList = fileList.filter(o => o.uid != file.uid)
        this.$message({ message: res.msg, type: 'error', duration: 1000 })
      }
    },
    templateDownload() {
      getTemplateDownload(this.modelId, this.url).then(res => {
        this.jnpf.downloadFile(res.data.url)
      })
    },
    prev() {
      if (this.active == 1) return
      this.active--
    },
    next() {
      if (this.active == 2) {
        if (!this.list.length) return this.$message({ message: '导入数据为空', type: 'warning' })
        this.btnLoading = true
        importData(this.modelId, { list: this.list }, this.url).then(res => {
          this.result = res.data
          this.resultList = res.data.failResult
          this.btnLoading = false
          this.active++
          this.getMergeList(this.resultHeaderList)
        }).catch(() => { this.btnLoading = false })
      }
      if (this.active == 1) {
        if (!this.fileList.length || !this.fileName) return this.$message({ message: '请先上传文件', type: 'warning' })
        this.btnLoading = true
        getImportPreview(this.modelId, { fileName: this.fileName }, this.url).then(res => {
          this.list = res.data.dataRow
          this.resultHeaderList = JSON.parse(JSON.stringify(res.data.headerRow))
          for (let index = 0; index < res.data.headerRow.length; index++) {
            const item = res.data.headerRow[index];
            if (item.children && item.children.length) {
              item.children.push({
                fullName: "操作",
                id: 'delete'
              })
            }
          }
          this.headerList = JSON.parse(JSON.stringify(res.data.headerRow))
          this.btnLoading = false
          this.active++
          this.getMergeList(this.headerList)
        }).catch(() => { this.btnLoading = false })
      }
    },
    getMergeList(list) {
      this.mergeList = []
      list.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.children.forEach((child, index) => {
            if (index == 0) {
              this.mergeList.push({
                prop: item.id + '-' + child.id,
                rowspan: 1,
                colspan: item.children.length
              })
            } else {
              this.mergeList.push({
                prop: item.id + '-' + child.id,
                rowspan: 0,
                colspan: 0
              })
            }
          })
        } else {
          this.mergeList.push({
            prop: item.id,
            rowspan: 1,
            colspan: 1
          })
        }
      })
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      for (let i = 0; i < this.mergeList.length; i++) {
        if (column.property == this.mergeList[i].prop) {
          return [this.mergeList[i].rowspan, this.mergeList[i].colspan]
        }
      }
    },
    handleDel(index) {
      this.list.splice(index, 1)
    },
    handleTableDel(index, i, item) {
      this.list[index] && this.list[index][item.id] && this.list[index][item.id].splice(i, 1)
    },
    cancel(isRefresh) {
      this.visible = false
      if (isRefresh) this.$emit('refresh')
    },
    exportExceptionData() {
      getImportExceptionData(this.modelId, { list: this.resultList }, this.url).then(res => {
        this.jnpf.downloadFile(res.data.url)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.delete {
  width: 50px;
  text-align: center;
}
.no-border-bottom {
  border-bottom: unset;
}
.import-main-overflow {
  overflow: unset;
}
</style>