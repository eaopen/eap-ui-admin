<template>
  <div>
    <el-form-item label="地图选择">
      <el-cascader :options="cascaderOptions" :show-all-levels="false"
        :props="{ checkStrictly: true,value:'id', label:'fullName'}"
        v-model="activeData.option.mapType" @change="cascaderChange"></el-cascader>
    </el-form-item>
    <el-form-item label="背景色" style="height:32px">
      <el-color-picker v-model="activeData.option.bgColor" />
    </el-form-item>
    <el-form-item label="区域颜色" style="height:32px">
      <el-color-picker v-model="activeData.option.geoAreaColor" />
    </el-form-item>
    <el-form-item label="区域名称">
      <el-switch v-model="activeData.option.geoLabelShow" />
    </el-form-item>
    <template v-if="activeData.option.geoLabelShow">
      <el-form-item label="字体大小">
        <el-input-number v-model="activeData.option.geoLabelFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="字体加粗" v-if="showType == 'pc'">
        <el-switch v-model="activeData.option.geoLabelFontWeight" />
      </el-form-item>
      <el-form-item label="字体颜色">
        <el-color-picker v-model="activeData.option.geoLabelColor" />
      </el-form-item>
    </template>
    <el-form-item label="区域线">
      <el-slider v-model="activeData.option.geoBorderWidth" :min="0" :max="10" :step="1" />
    </el-form-item>
    <el-form-item label="区域线颜色" style="height:32px">
      <el-color-picker v-model="activeData.option.geoBorderColor" />
    </el-form-item>
    <template v-if="showType == 'pc'">
      <el-form-item label="阴影大小">
        <el-slider v-model="activeData.option.geoShadowOffset" :min="0" :max="5" :step="1" />
      </el-form-item>
      <el-form-item label="阴影颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.geoShadowColor" />
      </el-form-item>
      <el-form-item label="鼠标缩放">
        <el-switch v-model="activeData.option.geoRoam" />
      </el-form-item>
      <el-form-item label="缩放比例">
        <el-slider v-model="activeData.option.mspScale" :min="0.5" :max="5" :step="0.1" />
      </el-form-item>
      <el-form-item label="地图长宽比">
        <el-slider v-model="activeData.option.geoAspectScale" :min="0.25" :max="1.5" :step="0.05" />
      </el-form-item>
    </template>
    <el-form-item label="钻取">
      <el-switch v-model="activeData.option.drillDown" />
    </el-form-item>
    <template v-if="activeData.option.drillDown">
      <el-form-item label="字体大小">
        <el-input-number v-model="activeData.option.drillDownFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="字体加粗">
        <el-switch v-model="activeData.option.drillDownFontWeight" />
      </el-form-item>
      <el-form-item label="字体颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.drillDownColor" />
      </el-form-item>
    </template>
    <template v-if="showType == 'pc'">
      <el-divider>视觉设置</el-divider>
      <el-form-item label="视觉类型">
        <el-radio-group v-model="activeData.option.visualMapType" size="small">
          <el-radio-button label="continuous" key="continuous">连续</el-radio-button>
          <el-radio-button label="piecewise" key="piecewise">分段</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="最小值">
        <el-input-number v-model="activeData.option.visualMapMin" controls-position="right" :min="0"
          @change="onVisualMapMinChange" />
      </el-form-item>
      <el-form-item label="最大值">
        <el-input-number v-model="activeData.option.visualMapMax" controls-position="right" :min="0"
          @change="onVisualMapMaxChange" />
      </el-form-item>
    </template>
    <template v-if="activeData.option.styleType==1||activeData.option.styleType==4">
      <el-divider>散点设置</el-divider>
      <el-form-item label="散点类型" v-show="showType == 'pc'">
        <el-radio-group v-model="activeData.option.seriesType" size="small">
          <el-radio-button label="scatter" key="scatter">散点</el-radio-button>
          <el-radio-button label="effectScatter" key="effectScatter">涟漪散点</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <jnpf-form-tip-item label="显示数量" tip-label="置空时，则显示全部数据">
        <el-input-number v-model="activeData.option.showNumber" controls-position="right" :min="0"
          :max="2000" />
      </jnpf-form-tip-item>
      <el-form-item label="透明度" v-show="showType == 'pc'">
        <el-slider v-model="activeData.option.seriesItemStyleOpacity" :min="0" :max="1"
          :step="0.1" />
      </el-form-item>
    </template>
    <template v-if="activeData.option.styleType==4&&showType == 'pc'">
      <el-divider>柱形排名设置</el-divider>
      <el-form-item label="标题名称">
        <el-input v-model="activeData.option.barTitleText" placeholder="请输入标题名称" />
      </el-form-item>
      <el-form-item label="字体大小">
        <el-input-number v-model="activeData.option.barTitleTextStyleFontSize"
          controls-position="right" :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="字体加粗">
        <el-switch v-model="activeData.option.barTitleTextStyleFontWeight" />
      </el-form-item>
      <el-form-item label="字体颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.barTitleTextStyleColor" />
      </el-form-item>
      <el-form-item label="底边距">
        <el-slider v-model="activeData.option.berGridBottom" :min="0" :max="600" :step="1" />
      </el-form-item>
      <el-form-item label="右边距">
        <el-slider v-model="activeData.option.berGridRight" :min="0" :max="100" :step="1" />
      </el-form-item>
      <el-form-item label="顶边距">
        <el-slider v-model="activeData.option.berGridTop" :min="0" :max="100" :step="1" />
      </el-form-item>
    </template>
    <template
      v-if="(activeData.option.styleType==1||activeData.option.styleType==4)&&showType == 'pc'">
      <el-divider>轮播设置</el-divider>
      <el-form-item label="开启轮播">
        <el-switch v-model="activeData.option.autoCarousel" />
      </el-form-item>
      <el-form-item label="轮播间隔" v-if="activeData.option.autoCarousel">
        <el-input v-model="activeData.option.autoCarouselTime" placeholder="请输入轮播间隔" type="number"
          :min="100" :max="500000">
          <template slot="append">ms</template>
        </el-input>
      </el-form-item>
    </template>
    <template v-if="activeData.option.styleType==2&&showType == 'pc'">
      <el-divider>热力设置</el-divider>
      <el-form-item label=" 点大小">
        <el-input-number v-model="activeData.option.seriesPointSize" controls-position="right"
          :min="0" />
      </el-form-item>
      <el-form-item label="点模糊大小">
        <el-input-number v-model="activeData.option.seriesBlurSize" controls-position="right"
          :min="0" />
      </el-form-item>
      <el-form-item label="透明度">
        <el-slider v-model="activeData.option.seriesMaxOpacity" :min="0" :max="5" :step="0.1" />
      </el-form-item>
    </template>
    <template v-if="activeData.option.styleType==3&&showType == 'pc'">
      <el-divider>柱形设置</el-divider>
      <el-form-item label="宽度">
        <el-input-number v-model="activeData.option.seriesBarWidth" controls-position="right"
          :min="0" :max="100" />
      </el-form-item>
      <el-form-item label="弧度">
        <el-input-number v-model="activeData.option.seriesItemStyleBarBorderRadius"
          controls-position="right" :min="0" :max="100" />
      </el-form-item>
    </template>
  </div>
</template>
<script>
export default {
  props: ['activeData', 'cascaderOptions', 'showType'],
  methods: {
    cascaderChange() {
      this.activeData.option.updateMapType = +new Date()
    },
    onVisualMapMinChange(val) {
      if (val > this.activeData.option.visualMapMax) this.$message.warning("最小值不能超过最大值，请重新输入")
    },
    onVisualMapMaxChange(val) {
      if (val < this.activeData.option.visualMapMin) this.$message.warning("最大值不能小于最小值，请重新输入")
    }
  }
}
</script>
