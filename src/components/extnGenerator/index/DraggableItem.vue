<script>
import draggable from 'vuedraggable'
import render from '@/components/extnGenerator/render/render'
import { dyOptionsList } from '@/components/extnGenerator/generator/comConfig'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'
import handleClipboard from '@/utils/clipboard'

let activeData = {}
const components = {
  itemBtns(h, element, index, parent) {
    const gutter = element.__config__.layout === 'colFormItem' && this.formConf.gutter ? this.formConf.gutter : 15
    const rightDistance = gutter / 2
    const { copyItem, deleteItem } = this.$listeners
    return [
      <span class="drawing-item-copy" style={{ '--rightDistance': rightDistance + 50 + 'px' }} title="复制" onClick={event => {
        copyItem(element, parent); event.stopPropagation()
      }}>
        <i class="el-icon-copy-document" />
      </span>,
      <el-popconfirm title="确定删除该组件？" class="drawing-item-delete" style={{ '--rightDistance': rightDistance + 18 + 'px' }} onConfirm={event => {
        deleteItem(index, parent)
      }}>
        <span title="删除" slot="reference" style="width:100%;height:100%;display:inline-block" >
          <i class="el-icon-delete" />
        </span>
      </el-popconfirm>
    ]
  },
  tableSetting(h, element) {
    const { addRow, addCol } = this.$listeners
    return [
      <span class="drawing-item-add-row" title="插入行" onClick={event => {
        addRow(element); event.stopPropagation()
      }}>
        <i class="icon-ym icon-ym-generator-insertRow" />
      </span>,
      <span class="drawing-item-add-col" title="插入列" onClick={event => {
        addCol(element); event.stopPropagation()
      }}>
        <i class="icon-ym icon-ym-generator-insertCol" />
      </span>
    ]
  },
  cellSetting(h, element, rowIndex, colIndex) {
    const { handleTableSetting, handleShowMenu } = this.$listeners
    const {
      mergeLeftColDisabled,
      mergeRightColDisabled,
      mergeWholeRowDisabled,
      mergeAboveRowDisabled,
      mergeBelowRowDisabled,
      mergeWholeColDisabled,
      undoMergeRowDisabled,
      undoMergeColDisabled,
      deleteWholeColDisabled,
      deleteWholeRowDisabled
    } = this.$attrs
    return [
      <span class="drawing-item-cell" >
        <el-dropdown trigger="click" onCommand={event => { handleTableSetting(event, element) }}
          on-visible-change={event => { if (event) handleShowMenu(element, rowIndex, colIndex) }} >
          <i class="icon-ym icon-ym-generator-TableSettings" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="1">插入左侧列</el-dropdown-item>
            <el-dropdown-item command="2">插入右侧列</el-dropdown-item>
            <el-dropdown-item command="3">插入上方行</el-dropdown-item>
            <el-dropdown-item command="4">插入下方行</el-dropdown-item>
            <el-dropdown-item command="5" disabled={mergeLeftColDisabled} divided>向左合并</el-dropdown-item>
            <el-dropdown-item command="6" disabled={mergeRightColDisabled}>向右合并</el-dropdown-item>
            <el-dropdown-item command="7" disabled={mergeWholeRowDisabled}>合并整行</el-dropdown-item>
            <el-dropdown-item command="8" disabled={mergeAboveRowDisabled} divided>向上合并</el-dropdown-item>
            <el-dropdown-item command="9" disabled={mergeBelowRowDisabled}>向下合并</el-dropdown-item>
            <el-dropdown-item command="10" disabled={mergeWholeColDisabled}>合并整列</el-dropdown-item>
            <el-dropdown-item command="11" disabled={undoMergeRowDisabled} divided>撤销行合并</el-dropdown-item>
            <el-dropdown-item command="12" disabled={undoMergeColDisabled}>撤销列合并</el-dropdown-item>
            <el-dropdown-item command="13" disabled={deleteWholeColDisabled} divided>删除整列</el-dropdown-item>
            <el-dropdown-item command="14" disabled={deleteWholeRowDisabled}>删除整行</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </span >
    ]
  }
}

const layouts = {
  colFormItem(h, element, index, parent) {
    const { activeItem } = this.$listeners
    const config = element.__config__
    let className = this.activeId === config.formId ? 'drawing-item active-from-item' : 'drawing-item'
    if (this.formConf.unFocusedComponentBorder) className += ' unfocus-bordered'
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    const Item = config.jnpfKey === 'cascader'
      ? <el-cascader v-model={config.defaultValue} placeholder={element.placeholder} options={element.options}
        props={element.props} disabled={element.disabled} show-all-levels={element['show-all-levels']} separator={element.separator}
        style={element.style} clearable={element.clearable} filterable={element.filterable} key={config.renderKey}></el-cascader>
      : <render key={config.renderKey} conf={element} onInput={event => { this.$set(config, 'defaultValue', event) }} />
    return (
      <el-col span={config.span} class={className}
        nativeOnClick={event => { activeItem(element); event.stopPropagation() }}>
        <jnpf-form-tip-item label-width={labelWidth} tip-label={config.label ? config.tipLabel : ''}
          label={config.showLabel ? config.label : ''} required={config.required}>
          {Item}
        </jnpf-form-tip-item>
        {components.itemBtns.apply(this, arguments)}
      </el-col>
    )
  },
  rowFormItem(h, element, index, parent) {
    const { activeItem } = this.$listeners
    const { put, end } = this.$attrs
    const className = this.activeId === element.__config__.formId
      ? 'drawing-row-item active-from-item'
      : 'drawing-row-item'
    if (element.__config__.jnpfKey === 'tab') {
      return (
        <el-col span={element.__config__.span}>
          <el-row gutter={element.__config__.gutter} class={className}
            nativeOnClick={event => { activeItem(element); event.stopPropagation() }}>
            <el-tabs type={element.type} tab-position={element['tab-position']} vModel={element.__config__.active}>
              {
                element.__config__.children.map((item, i) => {
                  let child = renderChildren.apply(this, [h, item, i, element])
                  let childgroup = { name: 'componentsGroup', put: (...arg) => put(...arg, item) }
                  const onChildEnd = (...arg) => end(...arg, activeData, item)
                  let tip = ''
                  if (!item.__config__.children.length) {
                    tip = <div class="table-tip tab-tip">请将组件拖到此区域(可拖多个组件)</div>
                  }
                  return (
                    <el-tab-pane key={item.name} label={item.title} >
                      <el-col >
                        {tip}
                        <el-row gutter={element.__config__.gutter} style="padding-top:15px">
                          <draggable list={item.__config__.children} animation={340} group={childgroup} onEnd={onChildEnd} class="drag-wrapper">
                            {child}
                          </draggable>
                        </el-row>
                      </el-col>
                    </el-tab-pane>
                  )
                })
              }
            </el-tabs>
            {components.itemBtns.apply(this, arguments)}
          </el-row>
        </el-col>
      )
    }
    if (element.__config__.jnpfKey === 'collapse') {
      return (
        <el-col span={element.__config__.span}>
          <el-row gutter={element.__config__.gutter} class={className}
            nativeOnClick={event => { activeItem(element); event.stopPropagation() }}>
            <el-collapse vModel={element.__config__.active} accordion={element.accordion}>
              {
                element.__config__.children.map((item, i) => {
                  let child = renderChildren.apply(this, [h, item, i, element])
                  let childgroup = { name: 'componentsGroup', put: (...arg) => put(...arg, item) }
                  const onChildEnd = (...arg) => end(...arg, activeData, item)
                  let tip = ''
                  if (!item.__config__.children.length) {
                    tip = <div class="table-tip card-tip">请将组件拖到此区域(可拖多个组件)</div>
                  }
                  return (
                    <el-collapse-item key={item.name} title={item.title} name={item.name} >
                      <el-col style="position:relative">
                        {tip}
                        <el-row gutter={element.__config__.gutter} >
                          <draggable list={item.__config__.children} animation={340} group={childgroup} onEnd={onChildEnd} class="drag-wrapper">
                            {child}
                          </draggable>
                        </el-row>
                      </el-col>
                    </el-collapse-item>
                  )
                })
              }
            </el-collapse>
            {components.itemBtns.apply(this, arguments)}
          </el-row>
        </el-col>
      )
    }
    if (element.__config__.jnpfKey === 'tableGrid') {
      return (
        <el-col span={element.__config__.span}>
          <el-row gutter={element.__config__.gutter} class={className}
            nativeOnClick={event => { activeItem(element); event.stopPropagation() }}>
            <table class="table-grid">
              <tbody>
                {
                  element.__config__.children.map((item, rowIndex) => {
                    return (
                      <tr>
                        {
                          item.__config__.children.map((it, colIndex) => {
                            let child = renderChildren.apply(this, [h, it, colIndex, item])
                            let childGroup = { name: 'componentsGroup', put: (...arg) => put(...arg, it) }
                            const onChildEnd = (...arg) => end(...arg, activeData, it)
                            const childClassName = this.activeId === it.__config__.formId ? 'drawing-row-item active-from-item' : 'drawing-row-item'
                            return !it.__config__.merged ? (
                              <td class={childClassName} colspan={it.__config__.colspan || 1} rowspan={it.__config__.rowspan || 1} onClick={event => { activeItem(it); event.stopPropagation() }}>
                                <el-col>
                                  <el-row gutter={element.__config__.gutter} >
                                    <draggable list={it.__config__.children} animation={340} group={childGroup} onEnd={onChildEnd} class='table-cell'>
                                      {child}
                                    </draggable>
                                  </el-row>
                                </el-col>
                                {components.cellSetting.apply(this, [h, element, rowIndex, colIndex])}
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
            {components.tableSetting.apply(this, arguments)}
            {components.itemBtns.apply(this, arguments)}
          </el-row>
        </el-col>
      )
    }
    let child = renderChildren.apply(this, arguments)
    const group = { name: 'componentsGroup', put: (...arg) => put(...arg, element) }
    const onEnd = (...arg) => end(...arg, activeData, element)
    if (element.__config__.jnpfKey === 'row') {
      if (element.type === 'flex') {
        child = <el-row type={element.type} justify={element.justify} align={element.align}>
          {child}
        </el-row>
      }
      let tip = ''
      if (!element.__config__.children.length) {
        tip = <div class="table-tip">请将组件拖到此区域(可拖多个组件)</div>
      }
      return (
        <el-col span={element.__config__.span}>
          <el-row gutter={element.__config__.gutter} class={className}
            nativeOnClick={event => { activeItem(element); event.stopPropagation() }}>
            <span class="component-name" >{element.__config__.componentName} </span>
            {tip}
            <draggable list={element.__config__.children} animation={340} group={group} onEnd={onEnd} class="drag-wrapper" style="margin-top:20px">
              {child}
            </draggable>
            {components.itemBtns.apply(this, arguments)}
          </el-row>
        </el-col>
      )
    }
    if (element.__config__.jnpfKey === 'table') {
      let tip = ''
      if (!element.__config__.children.length) {
        tip = <div class="table-tip">请将组件拖到此区域(可拖多个组件)</div>
      }
      let toolTip = element.__config__.label
      if (element.__config__.tipLabel && element.__config__.label) {
        toolTip = <span slot="label">{element.__config__.label}
          <el-tooltip placement="top" content={element.__config__.tipLabel}>
            <a class='el-icon-question tooltip-question content-name'></a>
          </el-tooltip>
        </span >
      }
      return (
        <el-col span={element.__config__.span}>
          <el-row gutter={element.__config__.gutter} class={className + ' drawing-row-item-table'}
            nativeOnClick={event => { activeItem(element); event.stopPropagation() }}>
            <span class="component-name" >{toolTip} </span>
            {tip}
            <el-form label-position="top">
              <draggable list={element.__config__.children} animation={340} group={group} class="drag-wrapper table-wrapper table-wrapper-web" onEnd={onEnd} clone={cloneComponent}>
                {child}
              </draggable>
            </el-form>
            {components.itemBtns.apply(this, arguments)}
          </el-row>
        </el-col>
      )
    }
    if (element.__config__.jnpfKey === 'card') {
      let tip = ''
      if (!element.__config__.children.length) {
        tip = <div class="table-tip card-tip">请将组件拖到此区域(可拖多个组件)</div>
      }
      let toolTip = element.header
      if (element.__config__.tipLabel && element.__config__.label) {
        toolTip = <span slot="label">{element.header}
          <el-tooltip placement="top" content={element.__config__.tipLabel}>
            <a class='el-icon-question tooltip-question content-name'></a>
          </el-tooltip>
        </span >
      }
      let header = ''
      if (element.header) {
        header = <div slot="header" ><span>{toolTip}</span></div>
      }
      return (
        <el-col span={element.__config__.span}>
          <el-row gutter={element.__config__.gutter} class={className}
            nativeOnClick={event => { activeItem(element); event.stopPropagation() }}>
            <el-card shadow={element.shadow} header={element.header}>
              {header}
              <el-col>
                <el-row gutter={element.__config__.gutter}
                  nativeOnClick={event => { activeItem(element); event.stopPropagation() }}>
                  {tip}
                  <draggable list={element.__config__.children} animation={340} group={group} onEnd={onEnd} class="drag-wrapper">
                    {child}
                  </draggable>
                </el-row>
              </el-col>
            </el-card>
            {components.itemBtns.apply(this, arguments)}
          </el-row>
        </el-col>
      )
    }
  }
}
function cloneComponent(origin) {
  activeData = origin
}

function renderChildren(h, element, index, parent) {
  const config = element.__config__
  if (!Array.isArray(config.children)) return null
  return config.children.map((el, i) => {
    const layout = layouts[el.__config__.layout]
    if (layout) {
      return layout.call(this, h, el, i, config.children)
    }
    return layoutIsNotFound.call(this)
  })
}

function layoutIsNotFound() {
  throw new Error(`没有与${this.element.__config__.layout}匹配的layout`)
}

function buildOptions(element) {
  const config = element.__config__
  if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
    if (config.dataType === 'dictionary') {
      if (!config.dictionaryType) return
      getDictionaryDataSelector(config.dictionaryType).then(res => {
        element.options = res.data.list
      })
    }
    if (config.dataType === 'dynamic') {
      if (!config.propsUrl) return
      getDataInterfaceRes(config.propsUrl).then(res => {
        let data = res.data
        if (Array.isArray(data)) {
          element.options = data
        } else {
          element.options = []
        }
      })
    }
  }
  if (config.children && Array.isArray(config.children)) {
    for (let i = 0; i < config.children.length; i++) {
      buildOptions(config.children[i])
    }
  }
}

export default {
  components: {
    render,
    draggable
  },
  props: [
    'element',
    'index',
    'drawingList',
    'activeId',
    'formConf'
  ],
  render(h) {
    // buildOptions(this.element)
    const layout = layouts[this.element.__config__.layout]
    if (layout) {
      return layout.call(this, h, this.element, this.index, this.drawingList)
    }
    return layoutIsNotFound.call(this)
  }
}
</script>