<template>
  <el-card shadow="never" class="portal-notice-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-notice-box-body">
      <template>
        <template v-if="activeData.option.styleType==1">
          <JNPF-table :data="defaultValue" :show-header='activeData.option.showHeader'
            :hasNO="false" :border='activeData.border' :header-cell-style="{'font-size':activeData.option.headerFontSize+'px',
        'text-align':activeData.option.headerLeft, 
        background:activeData.option.headerBgColor,color:activeData.option.headerFontColor,
        'font-weight':activeData.option.headerFontWeight?'bolder':'normal'}"
            :cell-style="tableRowClassName" :default-sort="{prop: 'date', order: 'descending'}"
            :class="!activeData.border?'noticeList':''">
            <el-table-column type="index" width="50" v-if="activeData.option.tableIndex" label="序号"
              fixed='left' align="center" />
            <template v-for="(item, i) in list">
              <el-table-column :prop="item.filedName" :label="item.fullName" :align="item.align"
                :width="item.width" :key="i" :sortable="item.sortable"
                :fixed='item.fixed=="none"?"":item.fixed' v-if="item.id != 1">
                <template slot-scope="scope">
                  <a class="scope-a" @click="readInfo(scope.row)"
                    v-if="item.filedName === 'fullName'">
                    <span
                      v-if="list.filter(o=>o.id=='1')[0].show">{{ `【${scope.row.category}】` }}</span>
                    <span class="title">
                      {{ scope.row[item.filedName] }}
                    </span>
                  </a>
                  <span v-else>{{ scope.row[item.filedName] }}</span>
                </template>
              </el-table-column>
            </template>
          </JNPF-table>
        </template>
        <template v-if="activeData.option.styleType!=1">
          <template v-if="defaultValue.length">
            <div style="padding: 0 18px;">
              <div v-for="(item, i) in defaultValue" :key="i" class="portal-list-box"
                :style="{'border-bottom':i == defaultValue.length-1 ? 'none':'1px solid #ebeef5'}">
                <div v-if=' i% 2 == 0' class="portal-list-item"
                  :style="{'background': activeData.option.noticeOddLineColor ? activeData.option.noticeOddLineColor : activeData.option.noticeBgColor }">
                  <div class="item-image-box" v-if="activeData.option.showImage">
                    <img v-if="item.category == '公告'"
                      :src="item.coverImage ? (define.comUrl+item.coverImage) : coverImage" alt=""
                      class="item-image">
                    <img v-else
                      :src="item.coverImage ? (define.comUrl+item.coverImage) : coverImage2" alt=""
                      class="item-image">
                  </div>
                  <div class="item-r">
                    <div class="item-r-inner">
                      <div v-if="list[0].show" class="item-r-inner-type">
                        <el-tag v-if="item.category == '公告'" size="mini" :hit="false"
                          color="#ebe6ff" style="color: #9016f3;">公告</el-tag>
                        <el-tag v-else-if="item.category == '通知'" :hit="false"
                          size="mini">通知</el-tag>
                        <el-tag v-else :hit="false" size="mini" type="warning">其它</el-tag>
                      </div>
                      <a class="item-r-title" v-if="list[1].show" @click="readInfo(item)"
                        :style="{'color':list[1].fontColor,'font-size':list[1].fontSize+'px','font-weight':list[1].fontWeight?700:400}">
                        {{ item.fullName }}
                      </a>
                      <div v-if="activeData.option.styleType==2 && list[3].show">
                        <p v-if="list[3].timeClassify === '创建时间'"
                          :style="{'color':list[3].fontColor,'font-size':list[3].fontSize+'px','font-weight':list[3].fontWeight?700:400}">
                          {{ item.creatorTime| toDateValue()}}</p>
                        <p v-else
                          :style="{'color':list[3].fontColor,'font-size':list[3].fontSize+'px','font-weight':list[3].fontWeight?700:400}">
                          {{item.releaseTime| toDateValue()}}</p>
                      </div>
                    </div>
                    <p :style="{'color':list[2].fontColor,'font-size':list[2].fontSize+'px','font-weight':list[2].fontWeight?700:400}"
                      class="item-r-content" v-if="list[2].show">
                      {{ item.excerpt }}</p>
                    <div v-if="activeData.option.styleType==3 && list[3].show" class="item-r-time">
                      <p v-if="list[3].timeClassify === '创建时间'"
                        :style="{'color':list[3].fontColor,'font-size':list[3].fontSize+'px','font-weight':list[3].fontWeight?700:400}">
                        {{ item.creatorTime| toDateValue()}}</p>
                      <p v-else
                        :style="{'color':list[3].fontColor,'font-size':list[3].fontSize+'px','font-weight':list[3].fontWeight?700:400}">
                        {{item.releaseTime| toDateValue()}}</p>
                    </div>
                  </div>
                </div>
                <div v-else
                  :style="{background: activeData.option.noticeEventLineColor ? activeData.option.noticeEventLineColor : activeData.option.noticeBgColor }"
                  class="portal-list-item">
                  <div class="item-image-box" v-if="activeData.option.showImage">
                    <img v-if="item.category == '公告'"
                      :src="item.coverImage ? define.comUrl+item.coverImage : coverImage" alt=""
                      class="item-image">
                    <img v-else :src="item.coverImage ? define.comUrl+item.coverImage : coverImage2"
                      alt="" class="item-image">
                  </div>
                  <div class="item-r">
                    <div class="item-r-inner">
                      <div v-if="list[0].show" class="item-r-inner-type">
                        <el-tag v-if="item.category == '公告'" size="mini" :hit="false"
                          color="#ebe6ff" style="color: #9016f3;">公告</el-tag>
                        <el-tag v-else-if="item.category == '通知'" :hit="false"
                          size="mini">通知</el-tag>
                        <el-tag v-else :hit="false" size="mini" type="warning">其它</el-tag>
                      </div>
                      <a class="item-r-title" v-if="list[1].show" @click="readInfo(item)"
                        :style="{'color':list[1].fontColor,'font-size':list[1].fontSize+'px','font-weight':list[1].fontWeight?700:400}">
                        {{ item.fullName }}
                      </a>
                      <div v-if="activeData.option.styleType==2 && list[3].show">
                        <p v-if="list[3].timeClassify === '创建时间'"
                          :style="{'color':list[3].fontColor,'font-size':list[3].fontSize+'px','font-weight':list[3].fontWeight?700:400}">
                          {{ item.creatorTime| toDateValue()}}</p>
                        <p v-else
                          :style="{'color':list[3].fontColor,'font-size':list[3].fontSize+'px','font-weight':list[3].fontWeight?700:400}">
                          {{item.releaseTime| toDateValue()}}</p>
                      </div>
                    </div>
                    <p :style="{'color':list[2].fontColor,'font-size':list[2].fontSize+'px','font-weight':list[2].fontWeight?700:400}"
                      class="item-r-content" v-if="list[2].show">
                      {{ item.excerpt }}</p>
                    <div v-if="activeData.option.styleType==3 && list[3].show" class="item-r-time">
                      <p v-if="list[3].timeClassify === '创建时间'"
                        :style="{'color':list[3].fontColor,'font-size':list[3].fontSize+'px','font-weight':list[3].fontWeight?700:400}">
                        {{ item.creatorTime| toDateValue()}}</p>
                      <p v-else
                        :style="{'color':list[3].fontColor,'font-size':list[3].fontSize+'px','font-weight':list[3].fontWeight?700:400}">
                        {{item.releaseTime| toDateValue()}}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div class="portal-common-noData" v-else>
            <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
            <p class="noData-txt">暂无数据</p>
          </div>
        </template>
      </template>
    </div>
    <Form v-if="formVisible" ref="Form" />
  </el-card>
</template>
<script>
import CardHeader from "../CardHeader"
import { getNotice } from '@/api/home'
import Form from '@/views/basic/messageRecord/Form'
export default {
  components: { CardHeader, Form },
  props: {
    showType: { type: String, default: 'pc' },
    activeData: { type: Object, default: () => { } },
  },
  data() {
    return {
      coverImage: require("@/assets/images/gg.png"),
      coverImage2: require('@/assets/images/tz.png'),
      key: +new Date(),
      defaultValue: [],
      list: [],
      typeList: [],
      formVisible: false,
    }
  },
  watch: {
    'activeData.option.noticeCount'() {
      this.initData()
    }
  },
  created() {
    this.initData()
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      let styleJson = {}
      styleJson['font-size'] = this.activeData.option.tableFontSize + 'px'
      styleJson['color'] = this.activeData.option.tableFontColor
      if (rowIndex % 2 == 0) {
        styleJson.background = this.activeData.option.noticeOddLineColor ? this.activeData.option.noticeOddLineColor : this.activeData.option.noticeBgColor
        return styleJson
      } else {
        styleJson.background = this.activeData.option.noticeEventLineColor ? this.activeData.option.noticeEventLineColor : this.activeData.option.noticeBgColor
        return styleJson
      }
    },
    readInfo(row) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(row.id)
      })
    },
    initData() {
      let sysType = this.showType === 'app' ? 'appColumnList' : this.showType === 'pc' && this.activeData.option.styleType != 1 ? 'rowData' : 'columnData'
      this.activeData.option[sysType].forEach((o, i) => {
        if (o.classify && o.classify.length) {
          this.typeList = o.classify
        }
      });
      let data = {
        typeList: this.typeList
      }
      getNotice(data).then(res => {
        this.defaultValue = JSON.parse(JSON.stringify(res.data.list)) || []
        this.defaultValue = this.defaultValue.slice(0, this.activeData.option.noticeCount)
        if (this.activeData.option.styleType == 1) {
          this.defaultValue.map(o => {
            o.creatorTime = this.jnpf.toDate(o.creatorTime)
            o.releaseTime = this.jnpf.toDate(o.releaseTime)
          })
          this.list = this.activeData.option.columnData.filter(o => o.show || !o.show && o.id == 1)
        } else {
          this.list = this.activeData.option.rowData
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.noticeList {
  >>> .el-table tr:last-child td {
    border-bottom: unset;
  }
}
.portal-table-box-body {
  height: 100%;
  overflow: auto;
}
.portal-notice-box {
  display: flex;
  flex-direction: column;

  >>> .el-card__header {
    height: 55px;
    padding: 0;
  }
  >>> .el-card__body {
    width: 100%;
    flex: 1;
    overflow: hidden;
  }
  .portal-notice-box-body {
    height: 100%;
    overflow: auto;
    .scope-a:hover {
      color: #189eff;
    }
    .portal-list-box {
      display: flex;
      flex-direction: column;
      .portal-list-item {
        display: flex;
        height: 100%;
        width: 100%;
        padding: 12px 0;
        align-items: center;
        .item-image-box {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          .item-image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }
        .item-r {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin-left: 10px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          .item-r-inner {
            display: flex;
            margin-bottom: 5px;
            align-items: center;
            .item-r-inner-type {
              padding-right: 10px;
            }
            .item-r-title {
              overflow: hidden;
              flex: 1;
              white-space: nowrap;
              text-overflow: ellipsis;
              padding-right: 10px;
            }
            .item-r-title:hover {
              color: #189eff !important;
            }
          }
          .item-r-content {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-top: 5px;
          }
          .item-r-time {
            margin-top: 5px;
          }
        }
      }
    }
  }
}
</style>