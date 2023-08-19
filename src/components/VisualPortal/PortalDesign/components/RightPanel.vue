<template>
  <el-aside width="340px" class="right-box">
    <el-tabs v-model="currentTab" class="center-tabs">
      <el-tab-pane label="控件属性" name="1" />
      <el-tab-pane label="门户属性" name="2" />
    </el-tabs>
    <el-scrollbar class="aside-scrollbar">
      <el-form v-show="currentTab==1" size="small" label-width="86px" labelPosition="left">
        <template v-if="activeData&&activeData.jnpfKey">
          <el-collapse v-model="activeNames" accordion>
            <Card :activeData="activeData" :showType="showType" :menuList="menuList"
              :appMenuList="appMenuList"
              v-if="activeData.jnpfKey!='tab'&&activeData.jnpfKey!='collapse'" />
            <Chart :activeData="activeData" :showType="showType" :menuList="menuList"
              :appMenuList="appMenuList" v-if="!noNeedTypeSetList.includes(activeData.jnpfKey)" />
            <MainTitle :activeData="activeData" :showType="showType"
              v-if="chartList.includes(activeData.jnpfKey)||activeData.jnpfKey=='mapChart'" />
            <SubTitle :activeData="activeData" :showType="showType"
              v-if="chartList.includes(activeData.jnpfKey)||activeData.jnpfKey=='mapChart'" />
            <BarStyle :activeData="activeData" :showType="showType"
              v-if="activeData.jnpfKey=='barChart'" />
            <XAxis :activeData="activeData" :showType="showType"
              v-if="activeData.jnpfKey=='barChart'||activeData.jnpfKey=='lineChart'" />
            <YAxis :activeData="activeData" :showType="showType"
              v-if="activeData.jnpfKey=='barChart'||activeData.jnpfKey=='lineChart'" />
            <Label :activeData="activeData" :showType="showType"
              v-if="chartList.includes(activeData.jnpfKey)" />
            <Tooltip :activeData="activeData" :showType="showType"
              v-if="chartList.includes(activeData.jnpfKey)||activeData.jnpfKey=='mapChart'" />
            <Margin :activeData="activeData" :showType="showType"
              v-if="(chartList.includes(activeData.jnpfKey)||activeData.jnpfKey=='mapChart')&&showType=='pc'" />
            <Legend :activeData="activeData" :showType="showType"
              v-if="chartList.includes(activeData.jnpfKey)" />
            <Color :activeData="activeData" :showType="showType"
              v-if="chartList.includes(activeData.jnpfKey)" />
            <Data :activeData="activeData" :showType="showType"
              v-if="needDataSetList.includes(activeData.jnpfKey)" />
            <Tab :activeData="activeData" :showType="showType" v-if="activeData.jnpfKey=='tab'" />
            <Collapse :activeData="activeData" :showType="showType"
              v-if="activeData.jnpfKey=='collapse'" />
            <Schedule :activeData="activeData" :showType="showType"
              v-if="activeData.jnpfKey=='schedule'" />
            <Notice :activeData="activeData" :showType="showType"
              v-if="activeData.jnpfKey=='notice'" />
          </el-collapse>
          <el-form-item label="多端显示" style="margin-top:10px">
            <el-checkbox-group v-model="activeData.visibility" size="mini">
              <el-checkbox label="pc">Web</el-checkbox>
              <el-checkbox label="app" :disabled="activeData.jnpfKey=='iframe'">App</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>
      </el-form>
      <el-form v-show="currentTab==2" size="small" label-width="86px" labelPosition="left"
        class="portal-attr">
        <Refresh :refresh="refresh" />
      </el-form>
    </el-scrollbar>
    <iconBox :visible.sync="iconsVisible" :current="current" @choiceIcon="setIcon" />
  </el-aside>
</template>
<script>
import draggable from 'vuedraggable'
import { getSelectorAll } from '@/api/system/menu'
import { getFeatureSelector } from '@/api/onlineDev/visualDev'
import { getDataInterfaceSelector } from '@/api/extn/dataInterface'
import iconBox from '@/components/extn/iconBox'
import JSONArea from './JSONArea'
//import InterfaceDialog from '@/components/extnProcess/PropPanel/InterfaceDialog'
import Card from '../RightComponents/common/Card'
import Chart from '../RightComponents/chat/Chart'
import MainTitle from '../RightComponents/chat/MainTitle'
import SubTitle from '../RightComponents/chat/SubTitle'
import BarStyle from '../RightComponents/chat/BarStyle'
import XAxis from '../RightComponents/chat/XAxis'
import YAxis from '../RightComponents/chat/YAxis'
import Label from '../RightComponents/chat/Label'
import Tooltip from '../RightComponents/chat/Tooltip'
import Margin from '../RightComponents/chat/Margin'
import Legend from '../RightComponents/chat/Legend'
import Color from '../RightComponents/chat/Color'
import Data from '../RightComponents/chat/Data'
import Tab from '../RightComponents/common/Tab'
import Collapse from '../RightComponents/common/Collapse'
import Schedule from '../RightComponents/common/Schedule'
import Notice from '../RightComponents/common/Notice'
import Refresh from '../RightComponents/common/Refresh'
import { chartList, needDataSetList, systemList, layoutList } from './config'
export default {
  props: ['activeData', 'showType', 'refresh'],
  components: {
    draggable,
    iconBox,
    JSONArea,
    //InterfaceDialog,
    Card,
    Chart,
    MainTitle,
    SubTitle,
    BarStyle,
    XAxis,
    YAxis,
    Label,
    Tooltip,
    Margin,
    Legend,
    Color,
    Data,
    Tab,
    Collapse,
    Schedule,
    Refresh,
    Notice
  },
  data() {
    return {
      iconsVisible: false,
      areaVisible: false,
      currentIndex: 0,
      current: '',
      menuList: [],
      appMenuList: [],
      dataInterfaceOptions: [],
      activeNames: [],
      chartList,
      needDataSetList,
      noNeedTypeSetList: [...layoutList, ...systemList, 'schedule'],
      currentTab: '1'
    }
  },
  created() {
    this.getMenuList()
    this.getDataInterfaceSelector()
  },
  methods: {
    getMenuList() {
      getSelectorAll({ category: 'Web' }).then(res => {
        this.menuList = (res.data.list || []).filter(o => o.children && o.children.length)
      })
      getSelectorAll({ category: 'App' }).then(res => {
        this.appMenuList = (res.data.list || []).filter(o => o.children && o.children.length)
      })
    },
    getDataInterfaceSelector() {
      getDataInterfaceSelector().then(res => {
        this.dataInterfaceOptions = res.data
      })
    },
    getSelectValue(data, i) {
      if (!data[0]) {
        this.$set(this.activeData.list, i, {
          fullName: '',
          id: '',
          urlAddress: '',
          icon: '',
          iconBackgroundColor: '',
          type: '',
          propertyJson: '',
          linkTarget: '_self',
          enCode: ''
        })
      } else {
        let iconBackgroundColor = ''
        if (data[1].propertyJson) {
          let propertyJson = JSON.parse(data[1].propertyJson)
          iconBackgroundColor = propertyJson.iconBackgroundColor || ''
        }
        this.$set(this.activeData.list, i, {
          fullName: data[1].fullName,
          id: data[1].id,
          urlAddress: data[1].urlAddress,
          type: data[1].type,
          propertyJson: data[1].propertyJson,
          linkTarget: data[1].linkTarget,
          enCode: data[1].enCode,
          icon: data[1].icon,
          iconBackgroundColor: iconBackgroundColor
        })
      }
    },
    addSelectItem() {
      this.activeData.list.push({
        fullName: '',
        id: '',
        urlAddress: '',
        icon: '',
        iconBackgroundColor: '',
        type: '',
        propertyJson: '',
        linkTarget: '_self',
        enCode: ''
      })
    },
    delSelectItem(index) {
      if (this.activeData.list.length < 3) {
        this.$message({
          message: '选项最少要保留两项',
          type: 'warning'
        });
        return
      }
      this.activeData.list.splice(index, 1)
    },
    addDataBoardItem() {
      this.activeData.list.push({ fullName: "", num: '', dataType: 'static', propsApi: '', icon: "" })
    },
    delDataBoardItem(index) {
      if (this.activeData.list.length < 3) {
        this.$message({
          message: '选项最少要保留两项',
          type: 'warning'
        });
        return
      }
      this.activeData.list.splice(index, 1)
    },
    openIconsDialog(index) {
      this.iconsVisible = true
      this.currentIndex = index
      this.current = this.activeData.list[this.currentIndex].icon
    },
    setIcon(val) {
      this.activeData.list[this.currentIndex].icon = val
    },
    propsUrlChange(data, index) {
      if (!data || !data.length) {
        this.activeData.list[index].propsApi = ''
        this.activeData.list[index].propsName = ''
        return
      }
      this.activeData.list[index].propsApi = data[0]
      this.activeData.list[index].propsName = data[1].fullName
    },
  }
}
</script>
<style lang="scss" scoped>
.right-box {
  background: #fff;
  .center-tabs {
    >>> .el-tabs__header {
      margin-bottom: 0 !important;
    }
    >>> .el-tabs__nav {
      width: 100%;
    }
    >>> .el-tabs__item {
      width: 50%;
      text-align: center;
    }
  }
  >>> .el-scrollbar__view {
    padding: 0 15px 15px;
    .el-input-number,
    .el-select,
    .el-cascader {
      width: 100%;
    }
    .el-slider {
      margin-right: 10px;
    }
  }
  .portal-attr {
    margin-top: 15px;
  }
}

>>> .el-collapse-item__content {
  padding-bottom: unset !important;
}
>>> .el-radio-button__inner {
  padding: 9px !important;
  min-width: 55px;
}
>>> .select-item,
.select-item {
  display: flex;
  border: 1px dashed #fff;
  box-sizing: border-box;
  &.el-input + .el-input {
    margin-left: 4px;
  }
  & + .select-item {
    margin-top: 4px;
  }
  &.sortable-chosen {
    border: 1px dashed #409eff;
  }
  .select-line-icon {
    line-height: 32px;
    font-size: 22px;
    padding: 0 4px;
    color: #606266;
    .icon-ym-darg {
      font-size: 20px;
      line-height: 31px;
      display: inline-block;
    }
  }
  .close-btn {
    cursor: pointer;
    color: #f56c6c;
  }
  .option-drag {
    cursor: move;
  }
}
</style>