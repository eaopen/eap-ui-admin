import request from '@/utils/request'

// 获取待我审核
export function FlowBeforeList(category, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/List/${category}`,
    method: 'get',
    data
  })
}
// 获取待我审批信息
export function FlowBeforeInfo(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/${id}`,
    method: 'get',
    data
  })
}
// 待我审核审核
export function Audit(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Audit/${id}`,
    method: 'post',
    data
  })
}
// 待我审核保存草稿
export function SaveAudit(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/SaveAudit/${id}`,
    method: 'post',
    data
  })
}
// 待我审核退回
export function Reject(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Reject/${id}`,
    method: 'post',
    data
  })
}
// 撤回审核
export function Recall(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Recall/${id}`,
    method: 'post',
    data
  })
}
// 终止审核
export function Cancel(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Cancel/${id}`,
    method: 'post',
    data
  })
}
// 待我审核转审
export function Transfer(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Transfer/${id}`,
    method: 'post',
    data
  })
}
// 流程监控指派
export function Assign(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Assign/${id}`,
    method: 'post',
    data
  })
}
// 流程复活和变更节点下拉数据
export function ResurgenceList(id) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Selector/${id}`,
    method: 'get',
  })
}
// 流程复活和变更提交
export function Resurgence(data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Change`,
    method: 'post',
    data
  })
}
// 审批汇总
export function getRecordList(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/RecordList/${id}`,
    method: 'get',
    data
  })
}
// 判断是否有候选人
export function Candidates(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Candidates/${id}`,
    method: 'post',
    data
  })
}
// 获取候选人列表（分页）
export function CandidateUser(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/CandidateUser/${id}`,
    method: 'post',
    data
  })
}
// 批量通过、退回、转审  batchType 0-通过 1-退回 2-转审
export function BatchOperation(data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/BatchOperation`,
    method: 'post',
    data
  })
}
// 获取批量审批流程
export function getBatchFlowSelector() {
  return request({
    url: `/api/workflow/Engine/FlowBefore/BatchFlowSelector`,
    method: 'get'
  })
}
// 获取批量审批流程（小id）
export function getBatchFlowJsonList(id) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/BatchFlowJsonList/${id}`,
    method: 'get'
  })
}
// 获取流程节点列表
export function getNodeSelector(id) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/NodeSelector/${id}`,
    method: 'get'
  })
}
// 获取批量审批候选人
export function BatchCandidate(data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/BatchCandidate`,
    method: 'get',
    data
  })
}
// 判断是否有查看权限(消息通知用)
export function checkInfo(taskOperatorId) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/${taskOperatorId}/Info`,
    method: 'get'
  })
}

//获取退回下拉接口
export function RejectList(id) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/RejectList/${id}`,
    method: 'get'
  })
}

// 加签
export function FreeApprover(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/freeApprover/${id}`,
    method: 'post',
    data
  })
}

//挂起类型
export function suspendType(id) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Suspend/${id}`,
    method: 'get',
  })
}

//挂起流程
export function suspend(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Suspend/${id}`,
    method: 'post',
    data
  })
}
//恢复流程
export function restore(id, data) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/Restore/${id}`,
    method: 'post',
    data
  })
}


//查看子流程
export function subFlowInfo(taskNodeId) {
  return request({
    url: `/api/workflow/Engine/FlowBefore/SubFlowInfo/${taskNodeId}`,
    method: 'get',
  })
}