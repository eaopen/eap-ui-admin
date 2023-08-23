<template>
  <div>
    <el-dialog title="选项设置" :close-on-click-modal="false" :visible.sync="visible"
      class="OBPM-dialog JNPF-dialog_center todoData" lock-scroll width="1000px" append-to-body>
      <div class="main">
        <JNPF-table :data="list" ref="dragTable" :hasNO="false" row-key="id">
          <el-table-column align="center" label="拖动" width="50">
            <template>
              <i class="drag-handler icon-ym icon-ym-darg" style="cursor: move;font-size:20px"
                title='点击拖动' />
            </template>
          </el-table-column>
          <el-table-column prop="field" label="图片来源" width="160px">
            <template slot-scope="scope">
              <el-select v-model="scope.row.dataType" placeholder="请选择数值类型" filterable
                @change="dataTypeChange(scope.$index)">
                <el-option v-for="(item, index) in imageStyleList" :key="index" :label="item.label"
                  :value="item.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="dataLength" width="200px">
            <template slot-scope="scope">
              <single-img v-if="scope.row.dataType==1" v-model="scope.row.imageUrl" />
              <el-input v-else-if="scope.row.dataType==2" v-model="scope.row.imageUrl"
                placeholder="请输入图片地址" />
              <interface-dialog v-else :value="scope.row.propsApi" :title="scope.row.propsName"
                popupTitle="数据接口" @change="propsApiChange(arguments,scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column prop="field" label="文本内容" width="180px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.textDefaultValue" placeholder="请输入名称" maxlength="50" />
            </template>
          </el-table-column>
          <el-table-column prop="dataLength" width="160px">
            <template slot="header">
              <p>
                链接类型
                <el-tooltip content="地址以http://或https://为开头" placement="top">
                  <a class="el-icon-question tooltip-question"></a>
                </el-tooltip>
              </p>
            </template>
            <template slot-scope="scope">
              <el-select v-model="scope.row.linkType" placeholder="请选择链接类型" clearable filterable>
                <el-option v-for="(item, index) in linkTypeList" :key="index" :label="item.label"
                  :value="item.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="dataLength" width="200px">
            <template slot-scope="scope">
              <JNPF-TreeSelect v-if="scope.row.linkType==1"
                :options="showType=='pc'?menuList:appMenuList" v-model="scope.row.moduleId"
                placeholder="请选择菜单" lastLevel clearable
                @change="getSelectVal(arguments,scope.$index)">
              </JNPF-TreeSelect>
              <el-input v-if="scope.row.linkType==2" v-model="scope.row.urlAddress"
                placeholder="请输入链接地址">
                <el-select slot="append" v-model="scope.row.linkTarget" style="width: 80px;"
                  v-if="showType == 'pc'">
                  <el-option label="_self" value="_self" />
                  <el-option label="_blank" value="_blank" />
                </el-select>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="50" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="text" class="OBPM-table-delBtn"
                @click="handleDel(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <div class="table-actions" @click="addHandle()">
          <el-button type="text" icon="el-icon-plus">添加</el-button>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="confirm">{{$t('common.confirmButton')}}</el-button>
      </span>
    </el-dialog>
    <iconBox :visible.sync="iconsVisible" :current="currentIcon" @choiceIcon="setIcon" />
  </div>
</template>

<script>
import iconBox from '@/components/extn/iconBox'
import Sortable from 'sortablejs'
import { linkTypeList, imageStyleList } from '../../components/config'
//import InterfaceDialog from '@/components/extnProcess/PropPanel/InterfaceDialog'
import singleImg from '@/components/extn/Upload/SingleImg'
import { validURL } from '@/utils/validate'
export default {
  components: { iconBox,
    //InterfaceDialog,
    singleImg },
  props: ['menuList', 'appMenuList', 'showType'],
  data() {
    return {
      visible: false,
      list: [],
      categoryList: [],
      iconsVisible: false,
      currentIcon: '',
      currentIndex: '',
      linkTypeList,
      imageStyleList
    }
  },
  methods: {
    init(data) {
      this.list = JSON.parse(JSON.stringify(data))
      this.getDictionaryData()
      this.visible = true
      this.$nextTick(() => {
        this.setSort()
      })
    },
    getDictionaryData() {
      this.$store.dispatch('dict/loadDictDatas', { sort: 'WorkFlowCategory' }).then((res) => {
        this.categoryList = res
      })
    },
    confirm() {
      for (let i = 0; i < this.list.length; i++) {
        const element = this.list[i];
        if ((element.dataType == 1 || element.dataType == 2) && !element.imageUrl) return this.$message.warning(element.dataType == 2 ? '图片地址不能为空' : '请上传图片')
        if (element.dataType == 2 && !validURL(element.imageUrl)) return this.$message.warning('请输入正确的图片地址')
        if (element.dataType == 3 && !element.propsApi) return this.$message.warning('请选择请选择数据接口')
        if (element.linkType == 1 && (!element.urlAddress && !element.moduleId)) return this.$message.warning('请选择菜单')
        if (element.linkType == 2 && !element.urlAddress) return this.$message.warning('链接地址不能为空')
        if (element.linkType == 2 && !validURL(element.urlAddress)) return this.$message.warning('请输入正确的链接地址')
      }
      this.visible = false
      this.$emit('refresh', this.list)
    },
    openIconsDialog(icon, index) {
      this.currentIcon = icon
      this.currentIndex = index
      this.iconsVisible = true
    },
    setIcon(val) {
      this.list[this.currentIndex].icon = val
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.list.splice(evt.oldIndex, 1)[0]
          this.list.splice(evt.newIndex, 0, targetRow)
        },
        handle: '.drag-handler',
      })
    },
    getSelectVal(data, index) {
      const item = data[1]
      this.list[index].type = item.type
      this.list[index].urlAddress = item.urlAddress
      if (item.linkTarget) this.list[index].linkTarget = item.linkTarget
      if (item.propertyJson) this.list[index].propertyJson = item.propertyJson
    },
    addHandle() {
      const item = {
        mageUrl: "",
        dataType: 2,
        propsApi: '',
        moduleId: "",
        linkType: '',
        urlAddress: '',
        linkTarget: '_self',
        textDefaultValue: "",
        id: this.jnpf.idGenerator()
      }
      this.list.push(item)
    },
    handleDel(index) {
      this.list.splice(index, 1)
    },
    dataTypeChange(index) {
      this.list[index].propsApi = ''
      this.list[index].propsName = ''
      this.list[index].imageUrl = ''
    },
    propsApiChange(data, index) {
      const val = data[0]
      const item = data[1]
      if (!val) {
        this.list[index].propsApi = ''
        this.list[index].propsName = ''
        return
      }
      this.list[index].propsApi = val
      this.list[index].propsName = item.fullName
    },
  }
}
</script>
<style lang="scss" scoped>
.todoData {
  >>> .el-dialog__body {
    padding: 0 !important;
    height: 50vh;

    .main {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
  .color-picker {
    display: flex;
  }
  >>> .singleImg-container {
    margin-bottom: 2px;
  }
}
</style>