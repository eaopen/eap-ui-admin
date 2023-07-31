<template>
  <div class="notice_r">
    <el-collapse-item title="公告通知设置" name="14">
      <el-form-item label="风格类型" v-if="showType=='pc'" height="32px">
        <el-select v-model="activeData.option.styleType" placeholder="请选择风格类型"
          @change="renderKeyChange" filterable>
          <el-option v-for="(item, index) in styleTypeOptions" :key="index" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="风格类型" v-if="showType=='app'">
        <el-select v-model="activeData.option.appStyleType" placeholder="请选择风格类型"
          @change="renderKeyChange" filterable>
          <el-option v-for="(item, index) in appStyleTypeOptions" :key="index" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <template v-if="showType=='pc'">
        <template v-if="activeData.option.styleType==1">
          <el-form-item label="显示边框">
            <el-switch v-model="activeData.border">
            </el-switch>
          </el-form-item>
          <el-divider>表头设置</el-divider>
          <el-form-item label="显示表头">
            <el-switch v-model="activeData.option.showHeader" @change="renderKeyChange">
            </el-switch>
          </el-form-item>
          <template v-if="activeData.option.showHeader">
            <el-form-item label="字体大小">
              <el-input-number v-model="activeData.option.headerFontSize" controls-position="right"
                :min="12" :max="25" />
            </el-form-item>
            <el-form-item label="字体加粗">
              <el-switch v-model="activeData.option.headerFontWeight" />
            </el-form-item>
            <el-form-item label="字体颜色">
              <el-color-picker v-model="activeData.option.headerFontColor" />
            </el-form-item>
            <el-form-item label="字体位置">
              <el-radio-group v-model="activeData.option.headerLeft" size="small">
                <el-radio-button :label="item.value" v-for="(item,index) in alignList" :key="index">
                  {{item.label}}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="背景色">
              <el-color-picker v-model="activeData.option.headerBgColor" />
            </el-form-item>
          </template>

          <el-divider>表格设置</el-divider>
          <el-form-item label="显示序号">
            <el-switch v-model="activeData.option.tableIndex">
            </el-switch>
          </el-form-item>
          <jnpf-form-tip-item label="显示条数" tipLabel="置空时，则显示全部数据">
            <el-input-number v-model="activeData.option.noticeCount" controls-position="right"
              :min="1" :max="99999" />
          </jnpf-form-tip-item>
          <el-form-item label="字体大小">
            <el-input-number v-model="activeData.option.tableFontSize" controls-position="right"
              :min="12" :max="25" />
          </el-form-item>
          <el-form-item label="字体颜色">
            <el-color-picker v-model="activeData.option.tableFontColor" />
          </el-form-item>
          <el-form-item label="背景色">
            <el-color-picker v-model="activeData.option.noticeBgColor" />
          </el-form-item>
          <el-form-item label="奇行颜色">
            <el-color-picker v-model="activeData.option.noticeOddLineColor" />
          </el-form-item>
          <el-form-item label="偶行颜色">
            <el-color-picker v-model="activeData.option.noticeEventLineColor" />
          </el-form-item>
          <el-divider v-if="activeData.option.styleType==1">列数据设置</el-divider>
          <el-form-item :label="activeData.option.styleType==1?'列数据':'行数据'">
            <el-button
              @click="showColumnData(activeData.option.styleType==1?activeData.option.columnData:activeData.option.rowData,activeData.option.styleType)">
              设置</el-button>
          </el-form-item>
          <Refresh v-if="activeData.propsApi" :refresh="activeData.refresh" />
        </template>
        <template v-if="activeData.option.styleType!=1">
          <el-form-item label="显示图片">
            <el-switch v-model="activeData.option.showImage">
            </el-switch>
          </el-form-item>
          <jnpf-form-tip-item label="显示条数" tipLabel="置空时，则显示全部数据">
            <el-input-number v-model="activeData.option.noticeCount" controls-position="right"
              :min="1" :max="99999" />
          </jnpf-form-tip-item>
          <el-form-item label="背景色">
            <el-color-picker v-model="activeData.option.noticeBgColor" />
          </el-form-item>
          <el-form-item label="奇行颜色">
            <el-color-picker v-model="activeData.option.noticeOddLineColor" />
          </el-form-item>
          <el-form-item label="偶行颜色">
            <el-color-picker v-model="activeData.option.noticeEventLineColor" />
          </el-form-item>
          <el-form-item :label="activeData.option.styleType==1?'列数据':'行数据'">
            <el-button
              @click="showColumnData(activeData.option.styleType==1?activeData.option.columnData:activeData.option.rowData,activeData.option.styleType)">
              设置</el-button>
          </el-form-item>
          <Refresh v-if="activeData.propsApi" :refresh="activeData.refresh" />
        </template>
      </template>
      <template v-if="showType=='app'">
        <el-form-item label="显示图片" v-if="activeData.option.appStyleType!=3">
          <el-switch v-model="activeData.option.showImage">
          </el-switch>
        </el-form-item>
        <el-form-item label="行数据">
          <el-button
            @click="showColumnData(activeData.option.appColumnList,activeData.option.appStyleType)">设置</el-button>
        </el-form-item>
        <Refresh :refresh="activeData.refresh" />
        <jnpf-form-tip-item label="显示条数" tipLabel="置空时，则显示全部数据">
          <el-input-number v-model="activeData.option.appCount" controls-position="right" :min="1"
            :max="99999" @change="renderKeyChange" />
        </jnpf-form-tip-item>
      </template>
      <NoticeColumnData v-if="columnVisible" ref="noticeColumnData" :showType='showType'
        @columnList='columnList' />
    </el-collapse-item>
  </div>
</template>
<script>
import NoticeColumnData from './NoticeColumnData'
import Refresh from '../common/Refresh'
import { alignList } from '../../components/config'
export default {
  components: { Refresh, NoticeColumnData },
  props: ['activeData', 'showType'],
  data() {
    return {
      areaVisible: false,
      columnVisible: false,
      alignList,
      appStyleTypeOptions: [{ label: '纵向1', value: 1 },
      { label: '纵向2', value: 2 },
      { label: '横向', value: 3 },],
      styleTypeOptions: [{ label: '表格', value: 1 },
      { label: '列表（横向）', value: 2 },
      { label: '列表（纵向）', value: 3 },]
    }
  },
  watch: {

  },
  methods: {
    columnList(data) {
      if (!data) return
      if (this.showType === 'app') {
        this.activeData.option.appColumnList = data
      } else {
        if (this.activeData.option.styleType == 1) {
          this.activeData.option.columnData = data
        } else {
          this.activeData.option.rowData = data
        }
      }
      this.renderKeyChange()
    },
    renderKeyChange() {
      this.activeData.renderKey = +new Date()
    },
    showColumnData(option, type) {
      this.columnVisible = true
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs.noticeColumnData.init(option, type)
        })
      }, 300)
    },
  }
}
</script>
<style lang="scss">
.notice_r {
  .el-form-item,
  .el-form-item--small {
    height: 32px;
    .el-form-item__content {
      height: 32px;
    }
  }
}
</style>