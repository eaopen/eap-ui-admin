import * as echarts from 'echarts';
import resize from '@/components/Charts/mixins/resize'
import { getDataInterfaceRes } from '@/api/systemData/dataInterface'
import { chartData } from '@/components/VisualPortal/PortalDesign/components/data'
import CardHeader from "../CardHeader"
export default {
  mixins: [resize],
  components: { CardHeader },
  props: {
    activeData: { type: Object, default: () => { } },
  },
  computed: {
    option() {
      return this.activeData.option
    },
    jnpfKey() {
      return this.activeData.jnpfKey
    }
  },
  data() {
    return {
      chart: null,
      currOption: {},
      chartData: [],
      isEmpty: false
    }
  },
  mounted() {
    if (this.activeData.dataType === 'dynamic') {
      if (!this.activeData.propsApi) return
      getDataInterfaceRes(this.activeData.propsApi).then(res => {
        this.chartData = res.data
        this.initChart()
      })
    } else {
      setTimeout(() => {
        this.chartData = this.option.defaultValue
        this.initChart()
      }, 0);
    }
    this.$eventBus.$on('eChart' + this.activeData.i, () => {
      this.$nextTick(() => {
        this.resize()
      })
    })
  },
  watch: {
    option: {
      handler(val) {
        this.resetChart()
      },
      deep: true
    },
    'activeData.dataType': {
      handler(val) {
        this.option.defaultValue = []
        this.chartData = []
        if (val == 'static') this.initStaticData(this.option.styleType)
      }
    },
    'option.styleType': {
      handler(val) {
        if (this.activeData.dataType == 'static') this.initStaticData(val)
      },
    },
    'option.defaultValue': {
      handler(val) {
        if (this.activeData.dataType !== 'static') return
        setTimeout(() => {
          this.chartData = val
          this.resetChart()
          this.initBarType()
        }, 0);
      },
    },
    'activeData.propsApi': {
      handler(val) {
        if (this.activeData.dataType === 'static' || !val) return
        getDataInterfaceRes(val).then(res => {
          this.chartData = res.data
          this.resetChart()
          this.initBarType();
        })
      },
    },
  },
  methods: {
    getType(title) {
      if (this.jnpfKey == 'barChart') {
        if (this.option.styleType == 7) {
          const arr = this.option.barType.find(ele => title == ele.title)
          if (arr && arr.type) return arr.type
        }
        return 'bar'
      } else if (this.jnpfKey == 'lineChart') {
        return 'line'
      } else if (this.jnpfKey == 'pieChart') {
        return 'pie'
      } else if (this.jnpfKey == 'radarChart') {
        return 'radar'
      }
    },
    initChartData() {
      const jnpfKey = this.jnpfKey
      const styleType = this.option.styleType
      const optionData = JSON.parse(JSON.stringify(this.chartData)) || []
      let typeArr = Array.from(new Set(optionData.map((item) => item.type)))
      let axisData = Array.from(new Set(optionData.map((item) => item.name)))
      let seriesData = []
      typeArr.forEach((title, index) => {
        const type = this.getType(title)
        let obj = {
          name: title,
          type: type,
          stack: styleType == 5 || styleType == 6 || styleType == 7 ? title : 'total'
        }
        let chartArr = optionData.filter((item) => title === item.type)
        if (jnpfKey == 'pieChart') {
          obj['data'] = chartArr.map((item) => {
            return {
              value: item.value,
              name: item.name,
            }
          })
          if (this.option.sortable) this.getPieData(obj['data'])
          if (this.option.showZero) obj['data'] = obj['data'].filter((item) => item.value != 0)
        } else if (jnpfKey == 'radarChart') {
          const typeList = chartArr.map((item) => item.type)
          const element = {
            value: chartArr.map((item) => item.value),
            name: typeList && typeList.length ? typeList[0] : '',
            areaStyle: {
              color: this.getColor(index),
              opacity: this.option.seriesAreaStyleOpacity
            }
          }
          obj['data'] = [element]
        } else {
          obj['data'] = chartArr.map((item) => item.value)
        }
        seriesData.push(obj)
      })
      let xAxis = {
        type: this.option.category == 'category' ? 'category' : 'value',
        show: this.option.xAxisShow,
        inverse: this.option.xAxisInverse,
        data: axisData,
        name: this.option.xAxisName,
        nameTextStyle: {
          color: this.option.xAxisNameTextStyleColor,
          fontSize: this.option.xAxisNameTextStyleFontSize,
          fontWeight: this.option.xAxisNameTextStyleFontWeight ? 'bolder' : '',
        },
        splitLine: {
          show: this.option.xAxisSplitLineShow,
          lineStyle: {
            color: this.option.xAxisSplitLineLineStyleColor
          }
        },
        axisLabel: {
          rotate: this.option.xAxisAxisLabelRotate,
          textStyle: {
            color: this.option.AxisTextStyleColor ? this.option.AxisTextStyleColor : this.option.xAxisAxisLabelTextStyleColor,
            fontSize: this.option.xAxisAxisLabelTextStyleFontSize,
            fontWeight: this.option.xAxisAxisLabelTextFontWeight ? 'bolder' : '',
          }
        },
        axisLine: {
          show: this.option.xAxisShow,
          lineStyle: {
            color: this.option.AxisLineStyleColor ? this.option.AxisLineStyleColor : this.option.xAxisAxisLineLineStyleColor
          }
        },
      }
      let yAxis = [
        {
          type: this.option.category == 'category' ? 'value' : 'category',
          show: this.option.yAxisShow,
          inverse: this.option.yAxisInverse,
          data: axisData,
          name: this.option.yAxisName,
          nameTextStyle: {
            color: this.option.yAxisNameTextStyleColor,
            fontSize: this.option.yAxisNameTextStyleFontSize,
            fontWeight: this.option.yAxisNameTextStyleFontWeight ? 'bolder' : '',
          },
          splitLine: {
            show: this.option.yAxisSplitLineShow,
            lineStyle: {
              color: this.option.yAxisSplitLineLineStyleColor
            }
          },
          axisLabel: {
            interval: this.option.yAxisAxisLabelInterval,
            rotate: this.option.yAxisAxisLabelRotate,
            textStyle: {
              color: this.option.AxisTextStyleColor ? this.option.AxisTextStyleColor : this.option.yAxisAxisLabelTextStyleColor,
              fontSize: this.option.yAxisAxisLabelTextStyleFontSize,
              fontWeight: this.option.yAxisAxisLabelTextFontWeight ? 'bolder' : '',
            }
          },
          axisLine: {
            show: this.option.yAxisShow,
            lineStyle: {
              color: this.option.AxisLineStyleColor ? this.option.AxisLineStyleColor : this.option.yAxisAxisLineLineStyleColor
            }
          },
        }
      ]
      let option = {
        //标题
        title: {
          text: this.option.titleText,
          textStyle: {
            color: this.option.titleTextStyleColor,
            fontSize: this.option.titleTextStyleFontSize,
            fontWeight: this.option.titleTextStyleFontWeight ? 'bolder' : '',
          },
          subtext: this.option.titleSubtext,
          subtextStyle: {
            color: this.option.titleSubtextStyleColor,
            fontSize: this.option.titleSubtextStyleFontSize,
            fontWeight: this.option.titleSubtextStyleFontWeight ? 'bolder' : '',
          },
          left: this.option.titleLeft,
          backgroundColor: this.option.titleText || this.option.titleSubtext ? this.option.titleBgColor || '#fff' : '#fff',
        },
        //提示
        tooltip: {
          show: this.option.tooltipShow,
          backgroundColor: this.option.tooltipBgColor,
          textStyle: {
            color: this.option.tooltipTextStyleColor,
            fontSize: this.option.tooltipTextStyleFontSize,
            fontWeight: this.option.tooltipTextStyleFontWeight ? 'bolder' : '',
          },
        },
        //网格
        grid: {
          left: this.option.gridLeft,
          top: this.option.gridTop,
          right: this.option.gridRight,
          bottom: this.option.gridBottom,
          containLabel: true
        },
        //图例
        legend: {
          show: this.option.legendShow,
          orient: this.option.legendOrient,
          textStyle: {
            fontSize: this.option.legendTextStyleFontSize || 12,
          },
          top: this.option.legendTop + '%',
          right: this.option.legendLeft + '%',
        },
        series: (() => {
          const list = (seriesData || []).map((ele, index) => {
            let label = {
              show: this.option.seriesLabelShow,
              position: jnpfKey == 'pieChart' ? this.option.seriesLabelPosition : 'top',
              fontSize: this.option.seriesLabelFontSize,
              fontWeight: this.option.seriesLabelFontWeight ? 'bolder' : 'normal',
              color: this.option.seriesLabelColor,
              backgroundColor: this.option.seriesLabelBgColor,
            }
            let itemStyle = {
              barBorderRadius: this.option.seriesItemStyleBarBorderRadius,
            }
            if (jnpfKey == 'barChart' || jnpfKey == 'lineChart' || jnpfKey == 'radarChart') itemStyle.color = this.getColor(index)
            if (jnpfKey == 'lineChart') {
              ele.smooth = styleType == 2
              ele.step = styleType == 3
              ele.lineStyle = {
                width: this.option.seriesLineStyleWidth
              }
              ele.symbolSize = this.option.seriesSymbolRotate
              if (this.option.areaStyle) ele.areaStyle = {}
            }
            if (jnpfKey == 'pieChart') {
              if (styleType == 1) ele.radius = '60%'
              if (styleType == 2) ele.radius = ['30%', '60%']
              if (this.option.roseType) ele.roseType = 'area'
              if (this.option.seriesLabelShowInfo && this.option.seriesLabelShowInfo.length) {
                if (this.option.seriesLabelShowInfo.includes('count') && this.option.seriesLabelShowInfo.includes('percent')) {
                  label.formatter = '{b}: {c} ({d}%)'
                } else if (this.option.seriesLabelShowInfo.includes('count')) {
                  label.formatter = '{b}: {c} '
                } else if (this.option.seriesLabelShowInfo.includes('percent')) {
                  label.formatter = '{b}: ({d}%) '
                }
              }
              if (this.option.colorList && this.option.colorList.length) {
                const colorList = []
                this.option.colorList.map((item, index) => {
                  const color = this.getColor(index) || '#71B6F5'
                  colorList.push(color)
                })
                ele.color = colorList
              }
              ele.center = [this.option.seriesCenterLeft + '%', this.option.seriesCenterTop + '%']
            }
            return Object.assign(ele, {
              name: ele.name,
              type: ele.type,
              data: ele.data,
              stack: ele.stack,
              showBackground: styleType == 4 ? true : false,
              barWidth: this.option.seriesBarWidth,
              itemStyle,
              label,
            })
          })
          return list
        })()
      };
      if (jnpfKey == 'barChart' || jnpfKey == 'lineChart') {
        if (jnpfKey == 'lineChart' && this.option.areaStyle) xAxis.boundaryGap = false
        option.xAxis = xAxis
        option.yAxis = yAxis
      } else if (jnpfKey == 'radarChart') {
        option.radar = []
        typeArr.map((item) => {
          const indicator = axisData.map(items => {
            const maxObj = optionData.find((element) => {
              return element.type == item && element.name == items
            })
            return {
              name: items,
              max: maxObj ? maxObj.max : ''
            }
          })
          const radarObj = {
            indicator: indicator,
            shape: this.option.styleType == 1 ? 'polygon' : 'circle',
            axisName: {
              fontSize: this.option.radarAxisNameFontSize,
              fontWeight: this.option.radarAxisNameFontWeight ? 'bolder' : 'normal',
              color: this.option.radarAxisNameColor,
            },
            center: [this.option.radarCenterLeft + '%', this.option.radarCenterTop + '%']
          }
          option.radar.push(radarObj)
        })
      } else if (jnpfKey == 'pieChart') {
        if (this.option.seriesLabelShowInfo.includes('count') && this.option.seriesLabelShowInfo.includes('percent')) {
          option.tooltip.formatter = '{b}: {c} ({d}%)'
        } else if (this.option.seriesLabelShowInfo.includes('count')) {
          option.tooltip.formatter = '{b}: {c}'
        } else if (this.option.seriesLabelShowInfo.includes('percent')) {
          option.tooltip.formatter = '{b}: {d}%'
        } else {
          option.tooltip.formatter = '{b}'
        }
      }
      this.currOption = option
    },
    initChart() {
      this.initChartData()
      this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption(this.currOption)
    },
    resetChart() {
      this.isEmpty = JSON.stringify(this.currOption) === "{}"
      this.chart && this.chart.dispose()
      this.chart = null
      if (!this.isEmpty) this.initChart()
    },
    getColor(index) {
      const barColor = this.option.colorList || [];
      if (barColor[index]) {
        const color1 = barColor[index].color1;
        const color2 = barColor[index].color2;
        if (color2 && color1) {
          return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color1 },
            { offset: 1, color: color2 }
          ])
        }
        return color1;
      }
    },
    initStaticData(val) {
      this.option.defaultValue = []
      if (this.jnpfKey == 'barChart') {
        if (val == 1 || val == 4) this.option.defaultValue = chartData.baseBarData
        if (val == 2 || val == 5) this.option.defaultValue = chartData.mulBarData
        if (val == 6) this.option.defaultValue = chartData.plusMinusBarData
        if (val == 7) {
          this.option.defaultValue = chartData.brokenColumnBarData
          this.initBarType()
        }
      } else if (this.jnpfKey == 'lineChart') {
        if (val == 1 || val == 2 || val == 3) this.option.defaultValue = chartData.baseBarData
        if (val == 4) this.option.defaultValue = chartData.mulBarData
      } else if (this.jnpfKey == 'pieChart') {
        this.option.defaultValue = chartData.baseBarData
      } else if (this.jnpfKey == 'radarChart') {
        this.option.defaultValue = chartData.radarData
      }
    },
    initBarType() {
      const optionData = this.option.defaultValue || []
      if (!Array.isArray(optionData)) return
      this.option.barType = []
      let typeArr = Array.from(new Set(optionData.map((item) => item.type)))
      typeArr.map((item, index) => {
        this.option.barType.push({
          title: item,
          type: index == 1 ? 'line' : 'bar'
        })
      })
    },
    getPieData(list) {
      for (let i = 0; i < list.length - 1; i++) {
        for (let j = 0; j < list.length - 1; j++) {
          if (list[j].value > list[j + 1].value) {
            let t = list[j];
            list[j] = list[j + 1];
            list[j + 1] = t;
          }
        }
      }
    }
  },
  beforeDestroy() {
    if (!this.chart) return
    this.chart.dispose()
    this.chart = null
  }
}