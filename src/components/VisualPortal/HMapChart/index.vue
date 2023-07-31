<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="eChart-box-body">
      <template v-if="!isEmpty">
        <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb"
          v-if="hashMap.size >1">
          <el-breadcrumb-item v-for="([key,value]) in hashMap" :key="key">
            <span :style="{'color':option.drillDownColor,'font-size':option.drillDownFontSize+'px',
              'font-weight':option.drillDownFontWeight?'bolder':'normal'}"
              @click="readyMap(key,value)">{{value.name}}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div ref="chart" id="chart" :style="{background:option.bgColor}"></div>
        <div class="bar-title-text" v-if="option.styleType==4&&showBarTitle" :style="{'color':option.barTitleTextStyleColor,'font-size':option.barTitleTextStyleFontSize+'px',
              'font-weight':option.barTitleTextStyleFontWeight?'bolder':'normal'}">
          {{option.barTitleText}}</div>
      </template>
      <div class="portal-common-noData portal-common-noData-eChart" v-show="isEmpty">
        <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
        <p class="noData-txt">暂无数据</p>
      </div>
    </div>
  </el-card>
</template>
<script>
import { getMapData, getAtlas } from '@/api/onlineDev/portal'
import CardHeader from "../CardHeader"
import { getDataInterfaceRes } from '@/api/systemData/dataInterface'
import resize from '@/components/Charts/mixins/resize'
import { mapChartData } from '@/components/VisualPortal/PortalDesign/components/data'
import { debounce } from 'throttle-debounce'
export default {
  mixins: [resize],
  components: { CardHeader },
  props: {
    activeData: { type: Object, default: () => { } },
  },
  data() {
    return {
      isEmpty: false,
      chart: null,
      currOption: {},
      currMapCode: null,
      geoJson: null,
      allAtlasList: [],
      chartData: [],
      mapData: [],
      timeTicket: null,
      count: 0,
      hashMap: new Map(),
      zoom: 1,
      showBarTitle: false,
      code: "",
      updateMapChart: debounce(200, function () {
        this.resetChart()
      }),
      updateBarChart: debounce(200, function () {
        this.setBarMapChart()
      })
    }
  },
  computed: {
    option() {
      return this.activeData.option
    },
    jnpfKey() {
      return this.activeData.jnpfKey
    }
  },
  watch: {
    'option': {
      handler() {
        this.clearHashMap()
        this.updateMapChart()
      },
      deep: true
    },
    'option.defaultValue': {
      handler(val) {
        setTimeout(() => {
          this.chartData = val
          this.resetChart()
        }, 0);
      },
    },
    'option.updateMapType': {
      handler(val) {
        const code = Array.isArray(this.option.mapType) ? this.option.mapType[this.option.mapType.length - 1] : this.option.mapType
        if (this.currMapCode != code) this.initMap()
      }
    },
    'activeData.dataType': {
      handler(val) {
        this.option.defaultValue = []
        this.chartData = []
        if (val == 'static') this.option.defaultValue = mapChartData
      }
    },
    'activeData.propsApi': {
      handler(val) {
        if (this.activeData.dataType === 'static' || !val) return
        getDataInterfaceRes(val).then(res => {
          this.chartData = res.data
          this.resetChart()
        })
      },
    },
  },
  mounted() {
    if (this.activeData.dataType === 'dynamic') {
      if (!this.activeData.propsApi) return
      getDataInterfaceRes(this.activeData.propsApi).then(res => {
        this.chartData = res.data
        this.initMap()
      })
    } else {
      setTimeout(() => {
        this.chartData = this.option.defaultValue
        this.initMap()
      }, 0);
    }
    this.$eventBus.$on('eChart' + this.activeData.i, () => {
      this.$nextTick(() => {
        this.resize()
        this.$nextTick(() => {
          this.setBarMapChart()
        })
      })
    })
    this.getAtlasList()
  },
  methods: {
    initMap() {
      const code = Array.isArray(this.option.mapType) ? this.option.mapType[this.option.mapType.length - 1] : this.option.mapType
      if (!code) return
      this.chart && this.chart.dispose()
      this.chart = null
      this.chart = echarts.init(this.$refs.chart)
      this.chart.showLoading();
      this.currMapCode = code
      getMapData(code).then(res => {
        this.chart.hideLoading();
        this.geoJson = res.data
        this.code = code
        this.initCurrOption()
        echarts.registerMap(code, this.geoJson);
        this.chart.setOption(this.currOption, true)
        this.setScatterMapChart()
        this.setBarMapChart()
        if (this.option.autoCarousel) this.handleDispatchAction()
        this.clearHashMap()
        this.chart.on('click', (param) => {
          if (!this.option.drillDown) return
          if (!this.allAtlasList.length) return
          const item = this.allAtlasList.find((i) => i.fullName === param.name)
          if (item) {
            if (this.currMapCode == item.id) return
            this.currMapCode = item.id
            getMapData(item.id).then(res => {
              this.code = item.enCode
              this.initCurrOption()
              echarts.registerMap(item.enCode, res.data);
              this.chart.setOption(this.currOption, true)
              this.setScatterMapChart()
              this.setBarMapChart()
              this.zoom += 1
              this.setHashMap(param.name, item.id, res.data)
            })
          }
        });
        this.chart.on('mouseover', (params) => {
          if (!this.option.autoCarousel) return
          clearInterval(this.timeTicket);
          this.chart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: params.dataIndex,
          });
        });
        this.chart.on('mouseout', () => {
          if (this.option.autoCarousel) this.handleDispatchAction()
        });
        this.chart.on('georoam', () => {
          this.updateBarChart()
        });
      })
    },
    resetChart() {
      if (!this.geoJson) return
      this.isEmpty = JSON.stringify(this.currOption) === "{}"
      if (!this.isEmpty) {
        this.initCurrOption()
        echarts.registerMap(this.code, this.geoJson);
        this.chart.setOption(this.currOption, true)
        this.setScatterMapChart()
        this.setBarMapChart()
        if (this.option.autoCarousel) this.handleDispatchAction()
      }
    },
    initCurrOption() {
      const option = this.option
      let title = {
        text: option.titleText,
        textStyle: {
          color: option.titleTextStyleColor,
          fontSize: option.titleTextStyleFontSize,
          fontWeight: option.titleTextStyleFontWeight ? 'bolder' : '',
        },
        subtext: option.titleSubtext,
        subtextStyle: {
          color: option.titleSubtextStyleColor,
          fontSize: option.titleSubtextStyleFontSize,
          fontWeight: option.titleSubtextStyleFontWeight ? 'bolder' : '',
        },
        left: option.titleLeft,
        backgroundColor: option.titleText || option.titleSubtext ? option.titleBgColor || '#fff' : '#fff',
      }
      let tooltip = {
        show: this.option.tooltipShow,
        backgroundColor: this.option.tooltipBgColor,
        textStyle: {
          color: this.option.tooltipTextStyleColor,
          fontSize: this.option.tooltipTextStyleFontSize,
          fontWeight: this.option.tooltipTextStyleFontWeight ? 'bolder' : '',
        },
      }
      let geo = {
        id: "china",
        map: this.code,
        show: true,
        roam: option.geoRoam,
        aspectScale: option.geoAspectScale || 0.75,
        layoutCenter: [option.seriesCenterLeft + '%', option.seriesCenterTop + '%'],
        layoutSize: '85%',
        itemStyle: {
          areaColor: option.geoAreaColor,
          borderWidth: option.geoBorderWidth / 2,
          borderColor: option.geoBorderColor,
          shadowOffsetX: option.geoShadowOffset,
          shadowOffsetY: option.geoShadowOffset,
          shadowColor: option.geoShadowColor,
        },
        zoom: option.mspScale,
        label: {
          show: option.geoLabelShow,
          color: option.geoLabelColor,
          fontWeight: option.geoLabelFontWeight ? 'bolder' : 'normal',
          fontSize: option.geoLabelFontSize,
        },
      }
      let visualMap = {
        min: option.visualMapMin,
        max: option.visualMapMax,
        type: option.visualMapType,
        showLabel: true,
        realtime: false,
        calculable: true,
        inRange: {
          color: ['#3BD9FF', '#0246FF']
        }
      }
      this.currOption = {
        title: title,
        tooltip: tooltip,
        geo: geo,
        visualMap: visualMap,
      }
    },
    setScatterMapChart() {
      const option = this.option
      if (option.styleType == 3) return
      this.mapData = []
      if (this.chartData && this.chartData.length) {
        this.chartData.map(ele => {
          const coord = this.chart.convertToPixel('geo', [ele.long, ele.lat]) || []
          const flag = this.chart.containPixel('geo', coord)
          if (flag) this.mapData.push({ name: ele.name, value: [ele.long, ele.lat, ele.value] })
        })
      }
      if (option.showNumber == null) {
        this.mapData = this.mapData
      } else {
        this.mapData = this.mapData.slice(0, option.showNumber)
      }
      this.currOption.series = [
        {
          type: option.styleType == 1 || option.styleType == 4 ? option.seriesType : 'heatmap',
          rippleEffect: {
            brushType: 'stroke'
          },
          coordinateSystem: "geo",
          itemStyle: {
            color: "#1890FF",
            opacity: option.seriesItemStyleOpacity
          },
          pointSize: option.seriesPointSize,
          blurSize: option.seriesBlurSize,
          maxOpacity: option.seriesMaxOpacity,
          tooltip: {
            show: true,
            formatter: function (params) {
              if (params.value.length < 3) return params.name
              let str = params.name + '&nbsp&nbsp' + params.value[2]
              return str
            },
          },
          symbolSize: (val) => {
            if (this.option.visualMapMax) {
              let num = Number(this.option.visualMapMax)
              let num1 = Number(val[2])
              let res = num1 / num * 15
              return res
            }
            return 10
          },
          clip: true,
          data: this.mapData
        }
      ]
      this.setBarRankMapChart()
      this.chart.setOption(this.currOption)
      if (this.timeTicket) clearInterval(this.timeTicket);
    },
    setBarMapChart() {
      if (this.option.styleType != 3) return
      const data = this.option.defaultValue
      if (data && data.length) {
        data.map((ele, idx) => {
          if (!ele.long || !ele.lat) return
          var coord = this.chart.convertToPixel('geo', [ele.long, ele.lat]) || [];
          const flag = this.chart.containPixel('geo', coord)
          if (!flag) return
          var curOption = {
            xAxis: [],
            yAxis: [],
            grid: [],
            series: [],
            tooltip: {
              trigger: 'item',
              axisPointer: {
                type: 'none'
              },
            }
          };
          curOption.xAxis.push({
            id: idx,
            gridId: idx,
            show: false,
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            data: [ele.name],
            z: 100
          });
          curOption.yAxis.push({
            id: idx,
            gridId: idx,
            show: false,
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            z: 100
          });
          // 配置柱状图绘制大小、位置
          curOption.grid.push(
            {
              id: idx,
              width: this.option.seriesBarWidth,
              height: 70,
              left: coord && coord[0],
              top: coord && coord[1] - 70,
              z: 100
            });
          // 生成柱状图数据
          curOption.series.push({
            id: idx,
            type: 'bar',
            xAxisId: idx,
            yAxisId: idx,
            barGap: 0,
            barCategoryGap: 0,
            data: [ele.value],
            z: 100,
            itemStyle: {
              normal: {
                borderRadius: this.option.seriesItemStyleBarBorderRadius,
                label: {
                  show: true,
                  position: 'insideBottom',
                  textStyle: {
                    color: '#fff',
                    fontSize: 10
                  },
                },
              }
            }
          });
          this.chart.setOption(curOption);
        })
      }
    },
    setBarRankMapChart() {
      const option = this.option
      if (option.styleType != 4) return
      let myData = [['value', 'name']];
      let mapData = JSON.parse(JSON.stringify(this.chartData))
      if (option.showNumber) {
        mapData = mapData.slice(0, option.showNumber)
      }
      var barData = mapData.sort(function (a, b) {
        return b.value - a.value;
      });
      for (var i = 0; i < barData.length; i++) {
        const ele = barData[i]
        myData.push([ele.value, ele.name]);
      }
      this.currOption.grid = {
        right: option.berGridRight,
        top: option.berGridTop,
        bottom: option.berGridBottom,
        width: '200',
      }
      this.currOption.xAxis = {
        name: 'value',
        show: false,
      }
      this.currOption.yAxis = {
        type: 'category',
        inverse: true,
        nameGap: 16,
        axisLine: {
          show: false,
          lineStyle: {
            color: '#303133'
          }
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          interval: 0,
          margin: 10,
          textStyle: {
            fontSize: 14
          },
        },
      }
      let series =
      {
        name: '柱状图',
        type: 'bar',
        roam: false,
        zlevel: 2,
        barGap: 0,
        encode: {
          x: 'value',
          y: 'name'
        },
        label: {
          normal: {
            show: true,
            position: 'right',
            textBorderWidth: 0
          }
        },
        itemStyle: {
          normal: {
            borderRadius: 2,
          }
        }
      }
      this.currOption.dataset = {
        source: myData
      }
      this.currOption.visualMap.dimension = 0
      this.currOption.series.push(series)
      this.showBarTitle = true
    },
    setHashMap(name, value, geoJson) {
      this.hashMap.set(1, this.getDefaultHashMap())
      this.hashMap.set(this.zoom, {
        name: name,
        value: value,
        geoJson: geoJson
      })
      this.hashMap.forEach((value, key, mapObj) => {
        if (key > this.zoom) this.hashMap.delete(key)
      })
      this.hashMap.delete(this.zoom + 1)
      this.hashMap = new Map(this.hashMap)
    },
    clearHashMap() {
      this.hashMap.clear()
      this.hashMap.set(1, { name: '中国', value: '10000', geoJson: this.geoJson })
      this.hashMap = new Map(this.hashMap)
    },
    getDefaultHashMap() {
      const code = Array.isArray(this.option.mapType) ? this.option.mapType[this.option.mapType.length - 1] : this.option.mapType
      const item = this.allAtlasList.find((i) => i.id === code)
      if (item) return { name: item.fullName, value: item.id, geoJson: this.geoJson }
      return { name: '中国', value: '10000', geoJson: this.geoJson }
    },
    readyMap(key, { name, value, geoJson }) {
      if (value == this.currMapCode) return
      this.code = value
      this.currMapCode = ''
      if (key == 1) {
        this.geoJson ? this.resetChart() : this.initMap()
        this.clearHashMap()
      } else {
        this.initCurrOption()
        echarts.registerMap(value, geoJson);
        this.chart.setOption(this.currOption, true)
        this.zoom = key
        this.setHashMap(name, value, geoJson)
      }
    },
    handleDispatchAction() {
      clearInterval(this.timeTicket);
      this.timeTicket = setInterval(() => {
        let total = this.mapData.length
        let curr = this.count % total;
        this.chart.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: curr
        });
        this.count += 1;
      }, this.option.autoCarouselTime || 3000);
    },
    getAtlasList() {
      this.allAtlasList = []
      getAtlas().then(res => {
        const loop = (data) => {
          if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
              const ele = data[i];
              this.allAtlasList.push(ele)
              if (ele.children && ele.children.length) loop(ele.children)
            }
          }
        }
        loop(res.data)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.breadcrumb {
  position: absolute;
  z-index: 9999;
  padding: 20px;
  cursor: pointer;
  >>> .el-breadcrumb__inner,
  .el-breadcrumb__inner span {
    cursor: pointer;
  }
}
.bar-title-text {
  position: absolute;
  top: 20px;
  right: 100px;
  color: #000;
  z-index: 500;
}
</style>