<template>
  <div style="width: calc(100% - 120px)" id="top-buttons">
    <el-button
      v-for="button in list"
      v-show="isShowButton(button)"
      :key="button.alias"
      :icon="getButtonIcon(button.icon)"
      :type="getButtonType(button.btncss)"
      size="mini"
      @click="handleClick(button)"
    >
      {{ button.name }}
    </el-button>
  </div>
</template>
<script>
  import easyForm from "@/components/obpm/form/easyForm/dialogForm.vue"
  export default {
    name: 'ButtonPage',
    props: ['list', 'req',  'listId', 'code'],
    components:{ easyForm },
    data() {
      return {
        onsave: false,
      }
    },
    computed: {
      buttonList() {
        //權限排除后的按鈕
        return this.list
      }
    },
    methods: {
      getButtonType(t){
        let type = 'primary'
        if(t){type = t.split('-')[1]}
        return type
      },
      getButtonIcon(t){
        if(t){
          return t.replace('fa','el-icon')
        }else
        return ''
      },
      isShowButton(button) {
        if (!button.exp) {
          return true
        } else {
          // {path}为req中参数，{selected}为选中参数
          let exp = button.exp.replaceAll('{path}', 'this.req && this.req')
          return eval(exp)
        }
      },
      // 点击发生后先判定选中状态和按钮提醒
      handleClick(btn) {
        // 新增按钮过滤功能
        let selects = this.$store.state.list.configs[this.code]&&this.$store.state.list.configs[this.code].selects?this.$store.state.list.configs[this.code].selects: []
        if(btn.mustSelect == 1 && (!selects|| !selects.length)){
          this.$alert("请选择数据后再操作")
          return
        }
        if(btn.warnTxt){
          this.$confirm(btn.warnTxt,"注意").then(()=>{
            this.hasFilters(btn, selects)
          }).catch(()=>{
            console.log('cancel')
          })
        }else {
          this.hasFilters(btn, selects)
        }
      },
      // 判定是否过滤
      hasFilters(btn, selects){
        // 过滤条件样子
        let filters = [
          // {
          //   condition: "{statusid}!= 3",
          //   warning: "测试不能操作非执行中的项目"
          // },
          // {
          //   condition: "{country}!='中国 && {dutyid}==5'",
          //   warning: "测试不能操作非中国且dutyid==5的项目"
          // }
        ]
        let flag = true, warning=""
        let data = selects[0]
        if(filters && filters.length){
          for(let i=0;i<filters.length; i++){
            let str = filters[i].condition.replace(/{/g, 'data.').replace(/}/,'')
            if(eval(str)){
              flag = false
              warning = filters[i].warning
              break
            }
          }
        }
        if(!flag){
          this.$alert(warning, "注意")
        }else {
          this.clickAction(btn, selects)
        }
      },
      // 确定生效
      clickAction(btn, selects){
        if(btn.alias === 'preProject:editBasic'){
          this.$tab.openPage(btn.name, "/demo/first/taskDetail").then(res=>{

          })
        }else if(btn.clickType === '3' || btn.clickType === '4'){
          const { hrefSetting } = btn.expand?JSON.parse(btn.expand):{}
          if(btn.url.startsWith('/form/formDef/vueFormDefPreview.html')){
            const component = easyForm
            let newUrl = this.obpm.formatString(btn.url, selects)
            let params = this.obpm.getParams(newUrl)
            params.async = true
            console.log('newUrl', newUrl)
            console.log(selects)
            console.log('params',params)
            let dialogWidth = hrefSetting&&hrefSetting.width?hrefSetting.width: 600
            let dialogHeight = hrefSetting&&hrefSetting.height?hrefSetting.height: 500
            let dialogWidthUnit = hrefSetting&&hrefSetting.widthUnit?hrefSetting.widthUnit: 'px'
            let dialogHeightUnit = hrefSetting&&hrefSetting.heightUnit?hrefSetting.heightUnit: 'px'
            this.$store.dispatch('customDialog/show', {
              component,
              width: dialogWidth + dialogWidthUnit,
              height: dialogHeight + dialogHeightUnit,
              title: btn.name,
              params
            })
          }
        }else if(btn.url.startsWith('/cust')){
          // todo cust code
          }
      }
      // todo
    },
  }
</script>
<style lang="scss" scoped>
  .el-button--mini {
    padding: 7px 8px !important;
    margin: 0 8px 5px 0 !important
  }

</style>

