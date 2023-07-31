<template>
  <el-card shadow="never"
    :class="activeData.option.styleType==1?'portal-eChart-box':'portal-table-box'">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-table-box-body">
      <template v-if="activeData.option.styleType==1">
        <JNPF-table :data="defaultValue" :show-header='activeData.option.showHeader' :hasNO="false"
          :border='activeData.border' :header-cell-style="{'font-size':activeData.option.headerFontSize+'px',
        'text-align':activeData.option.headerLeft, 
        background:activeData.option.headerBgColor,color:activeData.option.headerFontColor,
        'font-weight':activeData.option.headerFontWeight?'bolder':'normal'}"
          :cell-style="tableRowClassName" :default-sort="{prop: 'date', order: 'descending'}"
          :class="!activeData.border?'tableList':''">
          <el-table-column type="index" width="50" v-if="activeData.option.tableIndex" label="序号"
            fixed='left' align="center" />
          <template v-for="(item, i) in list">
            <el-table-column :prop="item.filedName" :label="item.fullName" :align="item.align"
              :width="item.width" :key="i" :sortable="item.sortable"
              :fixed='item.fixed=="none"?false:item.fixed' />
          </template>
        </JNPF-table>
      </template>
      <template v-if="activeData.option.styleType==2">
        <template v-if="defaultValue.length">
          <a class="item" v-for="(item, i) in defaultValue" :key="i">
            <div v-if=' i% 2 == 0'
              :style="{background: activeData.option.tableOddLineColor ? activeData.option.tableOddLineColor : activeData.option.tableBgColor }">
              <span class="name"
                :style="{'font-weight':list[0].fontWeight?'bolder':'normal','font-size':list[0].fontSize+'px',color:list[0].fontColor}">
                {{item[list[0].filedName]}}</span>
              <span class="time"
                :style="{'font-weight':list[2].fontWeight?'bolder':'normal','font-size':list[2].fontSize+'px',color:list[2].fontColor}">{{item[list[2].filedName]}}</span>
              <div class="content"
                :style="{'font-weight':list[1].fontWeight?'bolder':'normal','font-size':list[1].fontSize+'px',color:list[1].fontColor}">
                {{item[list[1].filedName]}}
              </div>
            </div>
            <div v-else
              :style="{background: activeData.option.tableEvenLineColor ? activeData.option.tableEvenLineColor : activeData.option.tableBgColor }">
              <span class="name"
                :style="{'font-weight':list[0].fontWeight?'bolder':'normal','font-size':list[0].fontSize+'px',color:list[0].fontColor}">
                {{item[list[0].filedName]}}</span>
              <span class="time"
                :style="{'font-weight':list[2].fontWeight?'bolder':'normal','font-size':list[2].fontSize+'px',color:list[2].fontColor}">{{item[list[2].filedName]}}</span>
              <div class="content"
                :style="{'font-weight':list[1].fontWeight?'bolder':'normal','font-size':list[1].fontSize+'px',color:list[1].fontColor}">
                {{item[list[1].filedName]}}
              </div>
            </div>
          </a>
        </template>
        <div class="portal-common-noData" v-else>
          <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
          <p class="noData-txt">暂无数据</p>
        </div>
      </template>
      <template v-if="activeData.option.styleType==3">
        <template v-if="defaultValue.length">
          <template v-for="(item, i) in defaultValue">
            <div :key="i" class="row-title" v-if=' i% 2 == 0'
              :style="{background: activeData.option.tableOddLineColor ? activeData.option.tableOddLineColor : activeData.option.tableBgColor }">
              <div class="title"
                :style="{'font-weight':list[0].fontWeight?'bolder':'normal','font-size':list[0].fontSize+'px',color:list[0].fontColor}">
                {{item[list[0].filedName]}}
              </div>
              <div class="content" v-if="activeData.option.describe"
                :style="{'font-weight':list[1].fontWeight?'bolder':'normal','font-size':list[1].fontSize+'px',color:list[1].fontColor}">
                {{item[list[1].filedName]}}
              </div>
              <div class="content"
                :style="{'font-weight':list[2].fontWeight?'bolder':'normal','font-size':list[2].fontSize+'px',color:list[2].fontColor}">
                {{item[list[2].filedName]}}
              </div>
            </div>
            <div :key="i" class="row-title" v-else
              :style="{background: activeData.option.tableEvenLineColor ? activeData.option.tableEvenLineColor : activeData.option.tableBgColor }">
              <div class="title"
                :style="{'font-weight':list[0].fontWeight?'bolder':'normal','font-size':list[0].fontSize+'px',color:list[0].fontColor}">
                {{item[list[0].filedName]}}
              </div>
              <div class="content" v-if="activeData.option.describe"
                :style="{'font-weight':list[1].fontWeight?'bolder':'normal','font-size':list[1].fontSize+'px',color:list[1].fontColor}">
                {{item[list[1].filedName]}}
              </div>
              <div class="content"
                :style="{'font-weight':list[2].fontWeight?'bolder':'normal','font-size':list[2].fontSize+'px',color:list[2].fontColor}">
                {{item[list[2].filedName]}}
              </div>
            </div>
          </template>
        </template>
        <div class="portal-common-noData" v-else>
          <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
          <p class="noData-txt">暂无数据</p>
        </div>
      </template>

    </div>
  </el-card>
</template>
<script>
import CardHeader from "../CardHeader"
import { getDataInterfaceRes } from '@/api/systemData/dataInterface'
export default {
  components: { CardHeader },
  props: {
    showType: { type: String, default: 'pc' },
    activeData: { type: Object, default: () => { } },
  },
  data() {
    return {
      key: +new Date(),
      defaultValue: [],
      list: []
    }
  },
  watch: {

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
        styleJson.background = this.activeData.option.tableOddLineColor ? this.activeData.option.tableOddLineColor : this.activeData.option.tableBgColor
        return styleJson
      } else {
        styleJson.background = this.activeData.option.tableEvenLineColor ? this.activeData.option.tableEvenLineColor : this.activeData.option.tableBgColor
        return styleJson
      }
    },
    initData() {
      this.defaultValue = JSON.parse(JSON.stringify(this.activeData.option.defaultValue))
      this.defaultValue = this.defaultValue.slice(0, this.activeData.option.tableCount)
      if (this.activeData.option.styleType == 1) {
        this.list = this.activeData.option.columnData
      } else {
        this.list = this.activeData.option.rowData
      }
      if (this.activeData.dataType === 'dynamic') {
        const propsApi = this.activeData.propsApi
        if (!propsApi) return this.option.defaultValue = ''
        getDataInterfaceRes(propsApi).then(res => {
          this.defaultValue = res.data
          this.defaultValue = this.defaultValue.slice(0, this.activeData.option.tableCount)
        })
      }
    },
    sliceCount() {
      let defaultValue = JSON.parse(JSON.stringify(this.activeData.option.defaultValue))
      return defaultValue
    }
  }
}
</script>
<style lang="scss" scoped>
.portal-box-body {
  height: 100%;
  overflow: auto;
  .text {
    margin: 15px;
  }
}
.row-title {
  margin: 0 20px;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    border-bottom: unset;
  }

  .title {
    padding: 12px 0 8px;
  }
  .content {
    padding-bottom: 8px;
  }
}
.divider-margin {
  margin: 0px 0px;
}
.app-title {
  width: 100%;
  padding-top: 5px;
}
.portal-table-box-body {
  height: 100%;
  overflow: auto;
}
.portal-table-box {
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

  .portal-table-box-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;

    .item {
      display: block;
      line-height: 20px;
      font-size: 0;
      margin: 0 20px;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: unset;
      }

      .name {
        padding: 12px 0 8px;
      }
      .time {
        padding: 12px 0 8px;
        font-size: 14px;
        display: inline-block;
        color: #999;
        width: 120px;
        text-align: right;
      }
      .content {
        padding-bottom: 8px;
      }
    }
  }
}
.tableList {
  height: 100%;
  >>> .el-table tr:last-child td {
    border-bottom: unset;
  }
}
.name {
  font-size: 14px;
  display: inline-block;
  width: calc(100% - 120px);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  vertical-align: top;
}
.app-name {
  font-size: 14px;
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  vertical-align: top;
}
</style>