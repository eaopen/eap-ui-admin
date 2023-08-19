// 动态options
const dyOptionsList = ['radio', 'checkbox', 'select', 'cascader', 'treeSelect']
// 不添加vModel
const noVModelList = ['divider', 'JNPFText', 'link', 'alert', 'groupTitle', 'relationFormAttr', 'popupAttr', 'button', 'barcode', 'qrcode', 'calculate']
// 不可以添加到子表组件
const noTableAllowList = ['divider', 'JNPFText', 'link', 'alert', 'groupTitle', 'button', 'barcode', 'qrcode', 'editor', 'radio', 'checkbox', 'createUser', 'createTime', 'modifyUser', 'modifyTime', 'currOrganize', 'currDept', 'currPosition', 'rate', 'slider', 'PsdInput', 'colorPicker']
// 不可以添加到列表展示
const noColumnShowList = ['PsdInput', 'colorPicker', 'rate', 'slider', 'divider', 'uploadImg', 'uploadFz', 'editor', 'JNPFText', 'relationFormAttr', 'popupAttr', 'groupTitle']
// 不可以添加到搜索
const noSearchList = [...noColumnShowList, 'switch', 'timeRange', 'dateRange', 'relationForm', 'popupSelect', 'popupTableSelect']
// 搜索时控件为input
const useInputList = ['comInput', 'textarea', 'JNPFText', 'link', 'billRule']
// 搜索时控件为日期选择器
const useDateList = ['createTime', 'modifyTime']
// 搜索时控件为下拉选择器
const useSelectList = ['radio', 'checkbox', 'select']
// 系统控件
const systemComponentsList = ['createUser', 'createTime', 'modifyUser', 'modifyTime', 'currOrganize', 'currPosition', 'billRule']
// 不允许关联到联动里面的控件
const noAllowRelationList = ['table', 'uploadImg', 'uploadFz', 'modifyUser', 'modifyTime']
const calculateItem = {
  __config__: {
    jnpfKey: 'calculate',
    label: '计算公式',
    tipLabel: "",
    labelWidth: undefined,
    showLabel: true,
    required: false,
    tag: 'calculate',
    tagIcon: 'icon-ym icon-ym-generator-count',
    defaultValue: null,
    layout: 'colFormItem',
    span: 24,
    dragDisabled: false,
    visibility: ["pc", "app"],
    tableName: '',
    noShow: false,
    isStorage: 1,
    regList: []
  },
  style: { width: "100%" },
  expression: [],
  thousands: false,
  isAmountChinese: false,
  precision: 2,
}
// 在线开发-功能设计/流程设计/移动设计独有组件
const onlinePeculiarList = [{
  __config__: {
    jnpfKey: 'qrcode',
    label: '二维码',
    tipLabel: "",
    labelWidth: undefined,
    showLabel: true,
    tag: 'jnpf-qrcode',
    tagIcon: 'icon-ym icon-ym-generator-qrcode',
    defaultValue: '',
    layout: 'colFormItem',
    span: 24,
    dragDisabled: false,
    visibility: ["pc", "app"],
    tableName: '',
    regList: [],
  },
  colorDark: '#000',
  colorLight: '#fff',
  size: 100,
  dataType: 'static',
  staticText: '二维码',
  relationField: '',
},
{
  __config__: {
    jnpfKey: 'barcode',
    label: '条形码',
    tipLabel: "",
    labelWidth: undefined,
    showLabel: true,
    tag: 'jnpf-barcode',
    tagIcon: 'icon-ym icon-ym-generator-barcode',
    defaultValue: '',
    layout: 'colFormItem',
    span: 24,
    dragDisabled: false,
    visibility: ["pc", "app"],
    tableName: '',
    regList: [],
  },
  format: 'code128',
  lineColor: '#000',
  background: '#fff',
  width: 4,
  height: 40,
  dataType: 'static',
  staticText: '20220810',
  relationField: '',
},
]
export { dyOptionsList, noVModelList, noTableAllowList, noColumnShowList, noSearchList, calculateItem, onlinePeculiarList, useInputList, useDateList, useSelectList, systemComponentsList, noAllowRelationList }