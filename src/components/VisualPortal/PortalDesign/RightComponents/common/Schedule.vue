<template>
  <el-collapse-item title="日程设置" name="14">
    <el-form-item label="默认视图">
      <el-radio-group v-model="activeData.defaultView" @change="renderKeyChange">
        <el-radio-button label="timeGridDay">日</el-radio-button>
        <el-radio-button label="timeGridWeek">周</el-radio-button>
        <el-radio-button label="dayGridMonth">月</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="显示农历">
      <el-switch v-model="activeData.showLunarCalendar">
      </el-switch>
    </el-form-item>
    <el-form-item label="周第一天">
      <el-select v-model="activeData.firstDay" placeholder="请选择" filterable>
        <el-option v-for="item in firstDayOptions" :key="item.value" :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <Refresh :refresh="activeData.refresh" />
  </el-collapse-item>
</template>
<script>
import Refresh from '../common/Refresh'
export default {
  components: { Refresh },
  props: ['activeData'],
  data() {
    return {
      defaultViewOptions: [{
        value: 'dayGridMonth',
        label: '月'
      }, {
        value: 'timeGridWeek',
        label: '周'
      }, {
        value: 'timeGridDay',
        label: '日'
      }],
      firstDayOptions: [{
        value: 1,
        label: '一'
      },
      {
        value: 2,
        label: '二'
      },
      {
        value: 3,
        label: '三'
      },
      {
        value: 4,
        label: '四'
      },
      {
        value: 5,
        label: '五'
      },
      {
        value: 6,
        label: '六'
      },
      {
        value: 0,
        label: '日'
      }],
    }
  },
  methods: {
    renderKeyChange() {
      this.activeData.renderKey = +new Date()
    },
  }
}
</script>