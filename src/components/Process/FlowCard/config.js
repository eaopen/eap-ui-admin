const defaultStartForm = {
  initiator: [],
  initiatePos: [],
  initiateRole: [],
  initiateOrg: [],
  initiateGroup: [],
  title: '流程发起',
  errorRule: 1, // 异常处理规则
  errorRuleUser: [], // 指定人员处理异常
  // 限时设置
  timeLimitConfig: {
    on: 0,  // 开启
    nodeLimit: 0, // 节点限定时长起始值类型
    duringDeal: 24, // 节点处理限定时长(时)
    formField: '',  // 请选择字段
  },
  overTimeConfig: {
    on: 0, // 开启
    firstOver: 0, // 第一次超时时间(时)
    overTimeDuring: 2, // 超时间隔(时)
    overNotice: false, // 超时事务-超时通知
    overAutoApprove: false, // 超时事务-超时自动审批
    overAutoApproveTime: 5, // 自动审批超时次数(次)
    overEvent: false, // 超时事件
    overEventTime: 5, // 超时事件超时次数(次)
  },
  noticeConfig: {
    on: 0, // 开启
    firstOver: 1, // 第一次提醒时间(时)
    overTimeDuring: 2, // 提醒间隔(时)
    overNotice: false, // 提醒事务-提醒通知
    overEvent: false, // 提醒事件
    overEventTime: 5, // 提醒次数(次)
  },
  // 流程事件
  overTimeFuncConfig: {
    on: false,     // 开启
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [] // 模块json
  },
  noticeFuncConfig: {
    on: false,     // 开启
    interfaceId: '', // 接口id
    interfaceName: '', // 接口名称
    templateJson: [] // 模块json
  },
  initFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: []
  },
  endFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: []
  },
  flowRecallFuncConfig: {
    on: false,
    interfaceId: '',
    interfaceName: '',
    templateJson: []
  },
  waitMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  endMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  approveMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  rejectMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  copyMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  overTimeMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  noticeMsgConfig: {
    on: 3,
    msgId: '',
    msgName: '',
    templateJson: []
  },
  hasSubmitBtn: true,
  submitBtnText: '提 交',
  hasSaveBtn: true,
  saveBtnText: '暂 存',
  hasPressBtn: true,
  pressBtnText: '催 办',
  hasRevokeBtn: true,
  revokeBtnText: '撤 回',
  hasPrintBtn: false,
  printBtnText: '打 印',
  printId: '',
  isComment: false,
  isBatchApproval: false,
  isSummary: false,
  summaryType: 0,
  titleType: 0,
  defaultContent: '{发起用户名}的{流程名称}',
  titleContent: '',
  formOperates: [],
  circulateRole: [],
  circulatePosition: [],
  circulateUser: [],
  circulateOrg: [],
  circulateGroup: [],
  isCustomCopy: false,
  extraCopyRule: 1,
  hasSign: false,
  hasOpinion: true,
  formId: "",
  formName: "",
  formFieldList: [],
}
export default {
  defaultStartForm,
  start: {
    type: "start",
    content: "所有人",
    properties: defaultStartForm
  },
  approver: {
    type: "approver",
    content: "请设置审批人",
    properties: {
      title: '审批节点'
    }
  },
  copy: {
    type: 'copy',
    content: '发起人自选',
    properties: {
      title: '抄送人',
      members: [],
      userOptional: true
    }
  },
  timer: {
    type: 'timer',
    content: '请设置时间',
    properties: {
      title: '定时器',
      day: 0,
      hour: 0,
      minute: 0,
      second: 0
    }
  },
  subFlow: {
    type: 'subFlow',
    content: '请设置发起人',
    properties: {
      title: '子流程'
    }
  },
  interflow: {
    type: "approver",
    content: "请设置审批人",
    isInterflow: true,
    properties: {
      title: '审批节点'
    }
  },
  branchFlow: {
    type: "approver",
    content: "请设置审批人",
    isBranchFlow: true,
    properties: {
      title: '审批节点'
    }
  },
  condition: {
    type: "condition",
    content: "请设置条件",
    properties: {
      title: '条件',
      conditions: [],
      initiator: null
    }
  },
  branch: {
    type: "branch",
    content: "",
    properties: {}
  },
  empty: {
    type: "empty",
    content: "",
    properties: {}
  }
}