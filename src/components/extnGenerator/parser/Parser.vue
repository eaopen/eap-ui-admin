<script>
import { deepClone } from '@/utils'
import { getDateDay, getLaterData, getBeforeData, getBeforeTime, getLaterTime } from '@/components/extnGenerator/utils/index.js'
import render from '@/components/extnGenerator/render/render.js'
import { dyOptionsList } from '@/components/extnGenerator/generator/comConfig'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'
import request from '@/utils/request'
import { mapGetters } from "vuex"

const layouts = {
  colFormItem(h, scheme) {
    const config = scheme.__config__
    const listeners = buildListeners.call(this, scheme)
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    const Item = config.jnpfKey === 'cascader'
      ? <el-cascader v-model={this[this.formConf.formModel][scheme.__vModel__]} placeholder={scheme.placeholder} options={scheme.options}
        props={scheme.props} disabled={scheme.disabled} show-all-levels={scheme['show-all-levels']} separator={scheme.separator}
        style={scheme.style} clearable={scheme.clearable} filterable={scheme.filterable}
        onChange={val => this.onCascaderChange(val, scheme.on)} onBlur={val => this.onCascaderBlur(val, scheme.on)}
        key={scheme.__config__.renderKey}></el-cascader>
      : <render formData={this[this.formConf.formModel]} conf={scheme} {...{ on: listeners }} ref={config.jnpfKey === 'table' ? scheme.__vModel__ : undefined}
        key={scheme.__config__.renderKey} relations={config.jnpfKey === 'table' ? this.relations : undefined} />
    const visibility = !config.visibility || (Array.isArray(config.visibility) && config.visibility.includes('pc'))
    if (visibility && !config.noShow) {
      let toolTip = <el-col span={config.span} class={config.className}>
        <jnpf-form-tip-item label-width={labelWidth} prop={scheme.__vModel__} key={config.renderKey} tip-label={config.label ? config.tipLabel : ""}
          label={config.showLabel ? config.label : ''}>
          {Item}
        </jnpf-form-tip-item>
      </el-col>
      if (config.jnpfKey === 'alert') {
        toolTip = <el-col span={config.span} class={config.className}>
          <jnpf-form-tip-item label-width={labelWidth} prop={scheme.__vModel__} key={config.renderKey} tip-label={config.label ? config.tipLabel : ""}
            label={config.showLabel ? config.label : ''}>
            <div style="word-break: break-all">
              {Item}
            </div>
          </jnpf-form-tip-item>
        </el-col>
      }
      if (config.jnpfKey === 'table') {
        toolTip = <el-col span={config.span} class={config.className}>
          <el-form-item label-width={labelWidth} prop={scheme.__vModel__} key={config.renderKey}
            label={config.showLabel ? config.label : ''}>
            {Item}
          </el-form-item >
        </el-col>
      }
      return (
        toolTip
      )
    }
  },
  rowFormItem(h, scheme) {
    const listeners = buildListeners.call(this, scheme)
    const config = scheme.__config__
    const visibility = !config.visibility || (Array.isArray(config.visibility) && config.visibility.includes('pc'))
    if (!visibility || config.noShow) return
    if (scheme.__config__.jnpfKey === 'tab') {
      return (
        <el-col span={scheme.__config__.span} class="mb-10">
          <el-tabs type={scheme.type} tab-position={scheme['tab-position']} vModel={scheme.__config__.active} {...{ on: listeners }}>
            {
              scheme.__config__.children.map((item, i) => {
                let child = renderChildren.call(this, h, item)
                return (
                  <el-tab-pane key={item.name} label={item.title} >
                    <el-row>
                      {child}
                    </el-row>
                  </el-tab-pane>
                )
              })
            }
          </el-tabs>
        </el-col>
      )
    }
    if (scheme.__config__.jnpfKey === 'collapse') {
      return (
        <el-col span={scheme.__config__.span} class="mb-20">
          <el-collapse vModel={scheme.__config__.active} accordion={scheme.accordion} {...{ on: listeners }}>
            {
              scheme.__config__.children.map((item, i) => {
                let child = renderChildren.call(this, h, item)
                return (
                  <el-collapse-item key={item.name} title={item.title} name={item.name} >
                    <el-row>
                      {child}
                    </el-row>
                  </el-collapse-item>
                )
              })
            }
          </el-collapse>
        </el-col>
      )
    }
    if (scheme.__config__.jnpfKey === 'tableGrid') {
      return (
        <el-col span={scheme.__config__.span} >
          <el-row gutter={scheme.__config__.gutter}>
            <table class="table-grid-box"
              style={{ '--borderType': scheme.__config__.borderType, '--borderColor': scheme.__config__.borderColor, '--borderWidth': scheme.__config__.borderWidth + 'px' }}>
              <tbody>
                {
                  scheme.__config__.children.map((item) => {
                    return (
                      <tr>
                        {
                          item.__config__.children.map((it, colIndex) => {
                            let child = renderChildren.call(this, h, it)
                            return !it.__config__.merged ? (
                              <td colspan={it.__config__.colspan || 1} rowspan={it.__config__.rowspan || 1} >
                                <el-col>
                                  <el-row gutter={scheme.__config__.gutter} >
                                    {child}
                                  </el-row>
                                </el-col>
                              </td>
                            ) : ''
                          })
                        }
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </el-row>
        </el-col>
      )
    }
    let child = renderChildren.apply(this, arguments)
    if (scheme.__config__.jnpfKey === 'table') {
      if (!scheme.__config__.noShow) this.tableRefs[scheme.__vModel__] = scheme
      const param = { ...scheme, config: scheme }
      return layouts.colFormItem.call(this, h, param)
    }
    if (scheme.__config__.jnpfKey === 'card') {
      let toolTip = scheme.header
      if (scheme.__config__.tipLabel) {
        toolTip = <span slot="label">{scheme.header}
          <el-tooltip placement="top" content={scheme.__config__.tipLabel}>
            <a class='el-icon-question tooltip-question' style='margin-left:4px'></a>
          </el-tooltip>
        </span >
      }
      let header = ''
      if (scheme.header) {
        header = <div slot="header" ><span>{toolTip}</span></div>
      }
      return (
        <el-col span={scheme.__config__.span} class="item-card">
          <el-card shadow={scheme.shadow} header={scheme.header} class="mb-20">
            {header}
            {child}
          </el-card>
        </el-col>
      )
    }
    if (scheme.__config__.jnpfKey === 'row') {
      if (scheme.type === 'flex') {
        child = <el-row type={scheme.type} justify={scheme.justify} align={scheme.align}>
          {child}
        </el-row>
      }
      return (
        <el-col span={scheme.__config__.span}>
          <el-row gutter={scheme.gutter}>
            {child}
          </el-row>
        </el-col>
      )
    }
  }
}

function renderFrom(h) {
  const { formConfCopy } = this
  let classStyle = []
  if (formConfCopy.formStyle) classStyle.push(formConfCopy.formStyle)
  if (formConfCopy.className) classStyle = [...classStyle, ...formConfCopy.className]
  return (
    <el-row gutter={formConfCopy.gutter} class={classStyle}>
      <el-form
        size={formConfCopy.size}
        label-position={formConfCopy.labelPosition}
        disabled={formConfCopy.disabled}
        label-width={`${formConfCopy.labelWidth}px`}
        ref={formConfCopy.formRef}
        // model不能直接赋值 https://github.com/vuejs/jsx/issues/49#issuecomment-472013664
        props={{ model: this[formConfCopy.formModel] }}
        rules={this[formConfCopy.formRules]}
        nativeOnSubmit={event => { event.preventDefault() }}
      >
        {renderFormItem.call(this, h, formConfCopy.fields)}
        {
          // {formConfCopy.formBtns && formBtns.call(this, h)}
        }
      </el-form>
    </el-row>
  )
}

function formBtns(h) {
  return <el-col>
    <el-form-item size="large">
      <el-button type="primary" onClick={this.submitForm}>提交</el-button>
      <el-button onClick={this.resetForm}>重置</el-button>
    </el-form-item>
  </el-col>
}

function renderFormItem(h, elementList) {
  return elementList.map(scheme => {
    const config = scheme.__config__
    const layout = layouts[config.layout]

    if (layout) {
      return layout.call(this, h, scheme)
    }
    throw new Error(`没有与${config.layout}匹配的layout`)
  })
}

function renderChildren(h, scheme) {
  const config = scheme.__config__
  if (!Array.isArray(config.children)) return null
  return renderFormItem.call(this, h, config.children)
}

function setValue(event, config, scheme) {
  this.$set(config, 'defaultValue', event)
  this.$set(this[this.formConf.formModel], scheme.__vModel__, event)
}

function buildListeners(scheme) {
  const config = scheme.__config__
  const listeners = {}
  if (scheme.on) {
    // 响应 组件事件
    Object.keys(scheme.on).forEach(key => {
      const str = scheme.on[key];
      const func = this.jnpf.getScriptFunc.call(this, str);
      if (!func) return
      listeners[key] = params => {
        if (key === 'change') {
          let data = ''
          if (['select', 'radio', 'checkbox'].includes(config.jnpfKey)) {
            const options = scheme.options
            if (scheme.multiple || config.jnpfKey === 'checkbox') {
              let _data = []
              outer: for (let i = 0; i < params[0].length; i++) {
                inner: for (let j = 0; j < options.length; j++) {
                  if (params[0][i] === options[j][scheme.props.props.value]) {
                    _data.push(options[j])
                    break inner
                  }
                }
              }
              data = _data
            } else {
              let _data = {}
              for (let i = 0; i < options.length; i++) {
                if (params[0] === options[i][scheme.props.props.value]) {
                  _data = options[i]
                  break
                }
              }
              data = _data
            }
          } else if (config.jnpfKey === 'numInput') {
            data = params[0]
          } else {
            data = params.length > 1 ? params[1] : params[0]
          }
          func.call(this, { data, ...this.parameter })
          this.handleRelation(scheme.__vModel__)
        } else {
          func.call(this, { data: params[0], ...this.parameter })
        }
      }
    })
  }
  // 响应 render.js 中的 vModel $emit('input', val)
  listeners.input = event => setValue.call(this, event, config, scheme)

  return listeners
}

export default {
  components: {
    render
  },
  props: {
    formConf: {
      type: Object,
      required: true
    }
  },
  data() {
    const data = {
      formConfCopy: deepClone(this.formConf),
      [this.formConf.formModel]: {},
      [this.formConf.formRules]: {},
      options: {},
      tableRefs: {},
      relations: {},
      isTableValid: false
    }
    this.initCss(data.formConfCopy)
    this.initFormData(data.formConfCopy.fields, data[this.formConf.formModel])
    this.initRelationForm(data.formConfCopy.fields)
    this.buildRules(data.formConfCopy.fields, data[this.formConf.formRules])
    this.buildOptions(data.formConfCopy.fields, data.options, data[this.formConf.formModel])
    this.buildRelations(data.formConfCopy.fields, data.relations)
    this.$nextTick(() => {
      this.onLoad(data.formConfCopy)
    })
    return data
  },
  provide() {
    return {
      parameter: this.parameter
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    formDataConf() {
      const name = this.formConf.formModel
      return this[name]
    },
    parameter() {
      const oldFormData = this.formConfCopy.formData ? this.formConfCopy.formData : {}
      this[this.formConf.formModel].id = oldFormData.id || ''
      this[this.formConf.formModel].flowId = oldFormData.flowId || ''
      return {
        formData: this[this.formConf.formModel],
        setFormData: this.setFormData,
        setShowOrHide: this.setShowOrHide,
        setRequired: this.setRequired,
        setDisabled: this.setDisabled,
        request: this.request,
        getFieldOptions: this.getFieldOptions,
        setFieldOptions: this.setFieldOptions
      }
    }
  },
  mounted() {
    this.initRelationData()
  },
  methods: {
    initRelationData() {
      const handleRelationFun = (list) => {
        list.forEach(cur => {
          this.handleDefaultRelation(cur.__vModel__)
          if (cur.__config__.children) handleRelationFun(cur.__config__.children)
        })
      }
      handleRelationFun(this.formConfCopy.fields)
    },
    initCss(formCopy) {
      if (document.getElementById('styleId')) {
        document.getElementById('styleId').remove()
      }
      let classJson = formCopy.classJson
      let head = document.getElementsByTagName('head')[0]
      let style = document.createElement('style')
      style.type = 'text/css'
      style.id = 'styleId'
      let html = classJson
      style.innerText = html
      head.appendChild(style)
    },
    initFormData(componentList, formData) {
      this.$store.commit('extnGenerator/UPDATE_RELATION_DATA', {})
      componentList.forEach(cur => {
        const config = cur.__config__
        if (cur.__vModel__) formData[cur.__vModel__] = config.defaultValue
        if (cur.__config__.jnpfKey == 'table') return
        if (config.children) this.initFormData(config.children, formData)
      })
    },
    buildRelations(componentList, relations) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          if (config.dataType === 'dynamic') {
            if (config.templateJson && config.templateJson.length) {
              for (let i = 0; i < config.templateJson.length; i++) {
                const e = config.templateJson[i];
                if (e.relationField) {
                  let item = {
                    ...cur,
                    realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
                    opType: 'setOptions'
                  }
                  if (relations.hasOwnProperty(e.relationField)) {
                    let boo = relations[e.relationField].some(o => o.realVModel === cur.realVModel)
                    if (!boo) {
                      relations[e.relationField].push(item)
                    }
                  } else {
                    relations[e.relationField] = [item]
                  }
                }
              }
            }
          }
        }
        if (config.jnpfKey === 'userSelect' && ['dep', 'pos', 'role', 'group'].includes(cur.selectType)) {
          if (cur.relationField) {
            let item = {
              ...cur,
              realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
              opType: 'setUserOptions'
            }
            if (relations.hasOwnProperty(cur.relationField)) {
              let boo = relations[cur.relationField].some(o => o.realVModel === cur.realVModel)
              if (!boo) {
                relations[cur.relationField].push(item)
              }
            } else {
              relations[cur.relationField] = [item]
            }

          }
        }
        if (config.jnpfKey === 'address' && ['address', 'cities'].includes(cur.selectType)) {
          if (cur.relationField) {
            let item = {
              ...cur,
              realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
              opType: 'setAddressOptions'
            }
            if (relations.hasOwnProperty(cur.relationField)) {
              let boo = relations[cur.relationField].some(o => o.realVModel === cur.realVModel)
              if (!boo) {
                relations[cur.relationField].push(item)
              }
            } else {
              relations[cur.relationField] = [item]
            }

          }
        }
        if (config.jnpfKey === 'popupSelect') {
          if (cur.templateJson && cur.templateJson.length) {
            for (let i = 0; i < cur.templateJson.length; i++) {
              const e = cur.templateJson[i];
              if (e.relationField) {
                let item = {
                  ...cur,
                  realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
                  opType: 'setPopupOptions'
                }
                if (relations.hasOwnProperty(e.relationField)) {
                  let boo = relations[e.relationField].some(o => o.realVModel === cur.realVModel)
                  if (!boo) {
                    relations[e.relationField].push(item)
                  }
                } else {
                  relations[e.relationField] = [item]
                }
              }
            }
          }
        }
        if (config.jnpfKey === 'date') {
          if (config.startTimeRule) {
            if (config.startTimeType == 1) {
              cur.startTime = config.startTimeValue
            } else if (config.startTimeType == 3) {
              cur.startTime = new Date().getTime()
            } else if (config.startTimeType == 4) {
              let previousDate = '';
              if (config.startTimeTarget == 1 || config.startTimeTarget == 2) {
                previousDate = getDateDay(config.startTimeTarget, config.startTimeType, config.startTimeValue)
                cur.startTime = new Date(previousDate).getTime()
              } else if (config.startTimeTarget == 3) {
                previousDate = getBeforeData(config.startTimeValue)
                cur.startTime = new Date(previousDate).getTime()
              } else {
                cur.startTime = getBeforeTime(config.startTimeTarget, config.startTimeValue).getTime()
              }
            } else if (config.startTimeType == 5) {
              let previousDate = '';
              if (config.startTimeTarget == 1 || config.startTimeTarget == 2) {
                previousDate = getDateDay(config.startTimeTarget, config.startTimeType, config.startTimeValue)
                cur.startTime = new Date(previousDate).getTime()
              } else if (config.startTimeTarget == 3) {
                previousDate = getLaterData(config.startTimeValue)
                cur.startTime = new Date(previousDate).getTime()
              } else {
                cur.startTime = getLaterTime(config.startTimeTarget, config.startTimeValue).getTime()
              }
            }
          }
          if (config.endTimeRule) {
            if (config.endTimeType == 1) {
              cur.endTime = config.endTimeValue
            } else if (config.endTimeType == 3) {
              cur.endTime = new Date().getTime()
            } else if (config.endTimeType == 4) {
              let previousDate = '';
              if (config.endTimeTarget == 1 || config.endTimeTarget == 2) {
                previousDate = getDateDay(config.endTimeTarget, config.endTimeType, config.endTimeValue)
                cur.endTime = new Date(previousDate).getTime()
              } else if (config.endTimeTarget == 3) {
                previousDate = getBeforeData(config.endTimeValue)
                cur.endTime = new Date(previousDate).getTime()
              } else {
                cur.endTime = getBeforeTime(config.endTimeTarget, config.endTimeValue).getTime()
              }
            } else if (config.endTimeType == 5) {
              let previousDate = '';
              if (config.endTimeTarget == 1 || config.endTimeTarget == 2) {
                previousDate = getDateDay(config.endTimeTarget, config.endTimeType, config.endTimeValue)
                cur.endTime = new Date(previousDate).getTime()
              } else if (config.endTimeTarget == 3) {
                previousDate = getLaterData(config.endTimeValue)
                cur.endTime = new Date(previousDate).getTime()
              } else {
                cur.endTime = getLaterTime(config.endTimeTarget, config.endTimeValue).getTime()
              }
            }
          }
          if (cur.__config__.startRelationField) {
            let item = {
              ...cur,
              realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
              opType: 'setDate'
            }
            if (relations.hasOwnProperty(cur.__config__.startRelationField)) {
              let boo = relations[cur.__config__.startRelationField].some(o => o.realVModel === cur.realVModel)
              if (!boo) {
                relations[cur.__config__.startRelationField].push(item)
              }
            } else {
              relations[cur.__config__.startRelationField] = [item]
            }
          }
          if (cur.__config__.endRelationField) {
            let item = {
              ...cur,
              realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
              opType: 'setDate'
            }
            if (relations.hasOwnProperty(cur.__config__.endRelationField)) {
              let boo = relations[cur.__config__.endRelationField].some(o => o.realVModel === cur.realVModel)
              if (!boo) {
                relations[cur.__config__.endRelationField].push(item)
              }
            } else {
              relations[cur.__config__.endRelationField] = [item]
            }
          }
        }
        if (config.jnpfKey === 'time') {
          let format = cur.format === 'HH:mm' ? 'HH:mm:00' : cur.format
          if (config.startTimeRule) {
            if (config.startTimeType == 1) {
              cur.startTime = config.startTimeValue || '00:00:00'
              if (cur.startTime.split(':').length == 3) {
                cur.startTime = cur.startTime
              } else {
                cur.startTime = cur.startTime + ':00'
              }
            } else if (config.startTimeType == 3) {
              cur.startTime = this.jnpf.toDate(new Date(), format)
            } else if (config.startTimeType == 4) {
              let previousDate = '';
              previousDate = getBeforeTime(config.startTimeTarget, config.startTimeValue)
              cur.startTime = this.jnpf.toDate(previousDate, format)
            } else if (config.startTimeType == 5) {
              let previousDate = '';
              previousDate = getLaterTime(config.startTimeTarget, config.startTimeValue)
              cur.startTime = this.jnpf.toDate(previousDate, format)
            }
          }
          if (config.endTimeRule) {
            if (config.endTimeType == 1) {
              cur.endTime = config.endTimeValue || '23:59:59'
              if (cur.endTime.split(':').length == 3) {
                cur.endTime = cur.endTime
              } else {
                cur.endTime = cur.endTime + ':00'
              }
            } else if (config.endTimeType == 3) {
              cur.endTime = this.jnpf.toDate(new Date(), format)
            } else if (config.endTimeType == 4) {
              let previousDate = '';
              previousDate = getBeforeTime(config.endTimeTarget, config.endTimeValue)
              cur.endTime = this.jnpf.toDate(previousDate, format)
            } else if (config.endTimeType == 5) {
              let previousDate = '';
              previousDate = getLaterTime(config.endTimeTarget, config.endTimeValue)
              cur.endTime = this.jnpf.toDate(previousDate, format)
            }
          }
          if (cur.__config__.startRelationField) {
            let item = {
              ...cur,
              realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
              opType: 'setTime'
            }
            if (relations.hasOwnProperty(cur.__config__.startRelationField)) {
              let boo = relations[cur.__config__.startRelationField].some(o => o.realVModel === cur.realVModel)
              if (!boo) {
                relations[cur.__config__.startRelationField].push(item)
              }
            } else {
              relations[cur.__config__.startRelationField] = [item]
            }
          }
          if (cur.__config__.endRelationField) {
            let item = {
              ...cur,
              realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
              opType: 'setTime'
            }
            if (relations.hasOwnProperty(cur.__config__.endRelationField)) {
              let boo = relations[cur.__config__.endRelationField].some(o => o.realVModel === cur.realVModel)
              if (!boo) {
                relations[cur.__config__.endRelationField].push(item)
              }
            } else {
              relations[cur.__config__.endRelationField] = [item]
            }
          }
        }
        if (config.children) this.buildRelations(config.children, relations)
      })
    },
    handleRelation(field) {
      if (!field) return
      const currRelations = this.relations
      for (let key in currRelations) {
        if (key === field) {
          for (let i = 0; i < currRelations[key].length; i++) {
            const e = currRelations[key][i];
            let vModel = e.realVModel || e.__vModel__
            const config = e.__config__
            const jnpfKey = config.jnpfKey
            let defaultValue = ''
            if (['checkbox', 'cascader'].includes(jnpfKey) || (['select', 'treeSelect', 'popupSelect', 'popupTableSelect', 'userSelect'].includes(jnpfKey) && e.multiple)) {
              defaultValue = []
            }
            if (vModel.includes('-')) {
              // 子表字段
              const tableVModel = vModel.split('-')[0]
              this.$refs[tableVModel] && this.$refs[tableVModel].$children[0] && this.$refs[tableVModel].$children[0].handleRelationForParent(e, defaultValue)
            } else {
              this.setFormData(e.__vModel__, defaultValue)
              if (e.opType === 'setOptions') {
                let query = {
                  paramList: this.getParamList(config.templateJson, this[this.formConf.formModel])
                }
                getDataInterfaceRes(config.propsUrl, query).then(res => {
                  let realData = res.data
                  this.setFieldOptions(e.__vModel__, realData)
                })
              }
              if (e.opType === 'setUserOptions') {
                let value = this[this.formConf.formModel][e.relationField] || []
                this.comSet('ableRelationIds', e.__vModel__, Array.isArray(value) ? value : [value])
              }
              if (e.opType === 'setAddressOptions') {
                let value = this[this.formConf.formModel][e.relationField] || []
                this.comSet('ableAddressIds', e.__vModel__, Array.isArray(value) ? value : [value])
              }
              if (e.opType === 'setPopupOptions') { }

              if (e.opType === 'setDate') {
                let startTime = ''
                let endTime = ''
                if (e.__config__.startTimeType == 2) {
                  startTime = this[this.formConf.formModel][e.__config__.startRelationField] || 0
                } else {
                  startTime = e.startTime
                }
                if (e.__config__.endTimeType == 2) {
                  endTime = this[this.formConf.formModel][e.__config__.endRelationField] || 0
                } else {
                  endTime = e.endTime
                }
                this.comSet('startTime', e.__vModel__, startTime)
                this.comSet('endTime', e.__vModel__, endTime)
              }
              if (e.opType === 'setTime') {
                let startTime = ''
                let endTime = ''
                if (e.__config__.startTimeType == 2) {
                  startTime = this[this.formConf.formModel][e.__config__.startRelationField] || '00:00:00'
                  if (startTime && (startTime.split(':').length == 3)) {
                    startTime = startTime
                  } else {
                    startTime = startTime + ':00'
                  }
                } else {
                  startTime = e.startTime
                }
                if (e.__config__.endTimeType == 2) {
                  endTime = this[this.formConf.formModel][e.__config__.endRelationField] || '23:59:59'
                  if (endTime && (endTime.split(':').length == 3)) {
                    endTime = endTime
                  } else {
                    endTime = endTime + ':00'
                  }
                } else {
                  endTime = e.endTime
                }
                this.comSet('startTime', e.__vModel__, startTime)
                this.comSet('endTime', e.__vModel__, endTime)
              }
            }
          }
        }
      }
    },
    handleDefaultRelation(field) {
      if (!field) return
      const currRelations = this.relations
      for (let key in currRelations) {
        if (key === field) {
          for (let i = 0; i < currRelations[key].length; i++) {
            const e = currRelations[key][i];
            let vModel = e.realVModel || e.__vModel__
            const config = e.__config__
            if (vModel.includes('-')) {
              const tableVModel = vModel.split('-')[0]
              this.$refs[tableVModel] && this.$refs[tableVModel].$children[0] && this.$refs[tableVModel].$children[0].handleRelationForParent(e, '', true)
            } else {
              if (e.opType === 'setUserOptions') {
                let value = this[this.formConf.formModel][e.relationField] || []
                this.comSet('ableRelationIds', e.__vModel__, Array.isArray(value) ? value : [value])
              }
              if (e.opType === 'setAddressOptions') {
                let value = this[this.formConf.formModel][e.relationField] || []
                this.comSet('ableAddressIds', e.__vModel__, Array.isArray(value) ? value : [value])
              }
              if (e.opType === 'setDate') {
                let startTime = ''
                let endTime = ''
                if (e.__config__.startTimeType == 2) {
                  startTime = this[this.formConf.formModel][e.__config__.startRelationField] || 0
                } else {
                  startTime = e.startTime
                }
                if (e.__config__.endTimeType == 2) {
                  endTime = this[this.formConf.formModel][e.__config__.endRelationField] || 0
                } else {
                  endTime = e.endTime
                }
                this.comSet('startTime', e.__vModel__, startTime)
                this.comSet('endTime', e.__vModel__, endTime)
              }
              if (e.opType === 'setTime') {
                let startTime = ''
                let endTime = ''
                if (e.__config__.startTimeType == 2) {
                  startTime = this[this.formConf.formModel][e.__config__.startRelationField] || '00:00:00'
                } else {
                  startTime = e.startTime
                }
                if (e.__config__.endTimeType == 2) {
                  endTime = this[this.formConf.formModel][e.__config__.endRelationField] || '23:59:59'
                  if (endTime && (endTime.split(':').length == 3)) {
                    endTime = endTime
                  } else {
                    endTime = endTime + ':00'
                  }
                } else {
                  endTime = e.endTime
                }
                if (startTime) {
                  if (startTime.split(':').length == 3) {
                    startTime = startTime
                  } else {
                    startTime = startTime + ':00'
                  }
                }
                if (endTime) {
                  if (endTime.split(':').length == 3) {
                    endTime = endTime
                  } else {
                    endTime = endTime + ':00'
                  }
                }
                this.comSet('startTime', e.__vModel__, startTime)
                this.comSet('endTime', e.__vModel__, endTime)
              }
            }
          }
        }
      }
    },
    getParamList(templateJson, formData) {
      for (let i = 0; i < templateJson.length; i++) {
        if (templateJson[i].relationField) {
          templateJson[i].defaultValue = formData[templateJson[i].relationField] || ''
        }
      }
      return templateJson
    },
    initRelationForm(componentList) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (config.jnpfKey == 'relationFormAttr' || config.jnpfKey == 'popupAttr') {
          const relationKey = cur.relationField.split("_jnpfTable_")[0]
          componentList.forEach(item => {
            const noVisibility = Array.isArray(item.__config__.visibility) && !item.__config__.visibility.includes('pc')
            if ((relationKey == item.__vModel__) && (noVisibility || !!item.__config__.noShow) && !cur.__vModel__) {
              cur.__config__.noShow = true
            }
          })
        }
        if (cur.__config__.children && cur.__config__.children.length) this.initRelationForm(cur.__config__.children)
      })
    },
    buildOptions(componentList, data, formData) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          let isTreeSelect = config.jnpfKey === 'treeSelect' || config.jnpfKey === 'cascader'
          if (config.dataType === 'dictionary') {
            if (!config.dictionaryType) return
            getDictionaryDataSelector(config.dictionaryType).then(res => {
              cur.options = res.data.list
              data[cur.__vModel__ + 'Options'] = cur.options
            })
          } else if (config.dataType === 'dynamic') {
            if (!config.propsUrl) return
            let query = {
              paramList: config.templateJson ? this.getParamList(config.templateJson, formData) : [],
            }
            getDataInterfaceRes(config.propsUrl, query).then(res => {
              let realData = res.data
              if (Array.isArray(realData)) {
                isTreeSelect ? cur.options = realData : cur.options = realData
              } else {
                cur.options = []
              }
              data[cur.__vModel__ + 'Options'] = cur.options
            })
          } else {
            data[cur.__vModel__ + 'Options'] = cur.options
          }
        }
        if (config.children && config.jnpfKey !== 'table') this.buildOptions(config.children, data, formData)
      })
    },
    buildRules(componentList, rules) {
      componentList.forEach(cur => {
        const config = JSON.parse(JSON.stringify(cur.__config__))
        if (!Array.isArray(config.regList)) config.regList = []
        if (config.required) {
          const required = { required: config.required, message: cur.placeholder }
          if (Array.isArray(config.defaultValue)) {
            required.type = 'array'
            required.message = `请至少选择一个${config.label}`
          }
          required.message === undefined && (required.message = `${config.label}不能为空`)
          config.regList.push(required)
        }
        rules[cur.__vModel__] = config.regList.map(item => {
          item.pattern && this.isRegExp(item.pattern) && (item.pattern = eval(item.pattern))
          item.trigger = config.trigger || 'blur'
          return item
        })
        if (config.children && config.jnpfKey !== 'table') this.buildRules(config.children, rules)
      })
    },
    isRegExp(val) {
      try {
        return Object.prototype.toString.call(eval(val)) === '[object RegExp]'
      } catch {
        return false
      }
    },
    onLoad(formConfCopy) {
      if (!formConfCopy || !formConfCopy.funcs || !formConfCopy.funcs.onLoad) return
      const onLoadFunc = this.jnpf.getScriptFunc.call(this, formConfCopy.funcs.onLoad)
      if (!onLoadFunc) return
      onLoadFunc(this.parameter)
    },
    resetForm() {
      this.$store.commit('extnGenerator/UPDATE_RELATION_DATA', {})
      this.formConfCopy = deepClone(this.formConf)
      this.$refs[this.formConf.formRef].resetFields()
      Object.keys(this.tableRefs).forEach(vModel => {
        this.$refs[vModel] && this.$refs[vModel].$children && this.$refs[vModel].$children[0].resetTable()
      })
    },
    checkTableData() {
      let valid = true
      Object.keys(this.tableRefs).forEach(vModel => {
        if (this.$refs[vModel] && this.$refs[vModel].$children) {
          const res = this.$refs[vModel].$children[0].submit()  // 返回false或表单数据
          res ? (this[this.formConf.formModel][vModel] = res) : (valid = false)
        }
      })
      return valid
    },
    request(url, method, data) {
      if (!url) return
      return request({
        url: url,
        method: method || 'GET',
        data: data || {}
      })
    },
    getFieldOptions(prop) {
      if (!prop) return []
      const isChildTable = prop.indexOf('.') > -1
      if (isChildTable) {
        const list = prop.split('.')
        if (this.$refs[list[0]] && this.$refs[list[0]].$children[0]) {
          let res = this.$refs[list[0]].$children[0].getTableFieldOptions(list[1])
          return res
        } else {
          return []
        }
      } else {
        return this.options[prop + 'Options'] || []
      }
    },
    setFormData(prop, value) {
      if (!prop || this[this.formConf.formModel][prop] === value) return;
      const isChildTable = prop.indexOf('.') > -1
      if (isChildTable) {
        const list = prop.split('.')
        if (this.$refs[list[0]] && this.$refs[list[0]].$children[0]) {
          this.$refs[list[0]].$children[0].setTableFormData(list[1], value)
        }
      } else {
        this.comSet('defaultValue', prop, value)
        this[this.formConf.formModel][prop] = value
      }
      this.handleRelation(prop)
    },
    setShowOrHide(prop, value) {
      const newVal = !!value
      const isChildTable = prop.indexOf('.') > -1
      if (!isChildTable) {
        this.comSet('noShow', prop, !newVal)
      } else {
        const list = prop.split('.')
        if (this.$refs[list[0]] && this.$refs[list[0]].$children[0]) {
          this.$refs[list[0]].$children[0].setTableShowOrHide(list[1], !newVal)
        }
      }
    },
    setRequired(prop, value) {
      const newVal = !!value
      const isChildTable = prop.indexOf('.') > -1
      if (!isChildTable) {
        this.comSet('required', prop, newVal)
        this.buildRules(this.formConfCopy.fields, this[this.formConf.formRules])
      }
    },
    setDisabled(prop, value) {
      const newVal = !!value
      const isChildTable = prop.indexOf('.') > -1
      if (!isChildTable) {
        this.comSet('disabled', prop, newVal)
      }
    },
    setFieldOptions(prop, value) {
      const newVal = Array.isArray(value) ? value : []
      const isChildTable = prop.indexOf('.') > -1
      if (!isChildTable) {
        this.comSet('options', prop, newVal)
      }
    },
    comSet(field, prop, value) {
      if (!prop) return
      const loop = list => {
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          if (item.__vModel__ && item.__vModel__ === prop) {
            switch (field) {
              case 'disabled':
                this.$set(item, field, value)
                break;
              case 'ableRelationIds':
                this.$set(item, field, value)
                break;
              case 'ableAddressIds':
                this.$set(item, field, value)
                break;
              case 'startTime':
                this.$set(item, field, value)
                break;
              case 'endTime':
                this.$set(item, field, value)
                break;
              case 'options':
                if (dyOptionsList.indexOf(item.__config__.jnpfKey) > -1) {
                  let isTreeSelect = item.__config__.jnpfKey === 'treeSelect' || item.__config__.jnpfKey === 'cascader'
                  isTreeSelect ? item.options = value : item.options = value
                }
                break;
              default:
                this.$set(item.__config__, field, value)
                break;
            }
            item.__config__.renderKey = +new Date() + item.__vModel__
            break;
          }
          if (item.__config__ && item.__config__.jnpfKey !== 'table' && item.__config__.children && Array.isArray(item.__config__.children)) {
            loop(item.__config__.children)
          }
        }
      }
      loop(this.formConfCopy.fields)
    },
    beforeSubmit() {
      if (!this.formConfCopy || !this.formConfCopy.funcs || !this.formConfCopy.funcs.beforeSubmit) return Promise.resolve()
      const func = this.jnpf.getScriptFunc.call(this, this.formConfCopy.funcs.beforeSubmit)
      if (!func) return Promise.resolve()
      return func(this.parameter)
    },
    afterSubmit() {
      if (!this.formConfCopy || !this.formConfCopy.funcs || !this.formConfCopy.funcs.afterSubmit) return
      const func = this.jnpf.getScriptFunc.call(this, this.formConfCopy.funcs.afterSubmit)
      if (!func) return
      func(this.parameter)
    },
    submitForm(type) {
      this.isTableValid = this.checkTableData()
      try {
        this.beforeSubmit().then(() => {
          this.submit(type)
        })
      } catch (e) {
        this.submit(type)
      }
    },
    submit(type) {
      this.$refs[this.formConf.formRef].validate(valid => {
        if (!valid) return false
        if (!this.isTableValid) return false
        // 触发submit事件
        this.$emit('submit', this[this.formConf.formModel], this.afterSubmit, type)
        return true
      })
    },
    onCascaderChange(data, on) {
      if (!on || !on.change) return
      const func = this.jnpf.getScriptFunc.call(this, on.change)
      if (!func) return
      func.call(this, { data, ...this.parameter })
    },
    onCascaderBlur(data, on) {
      if (!on || !on.blur) return
      const func = this.jnpf.getScriptFunc.call(this, on.blur)
      if (!func) return
      func.call(this, { data, ...this.parameter })
    }
  },
  render(h) {
    return renderFrom.call(this, h)
  }
}
</script>