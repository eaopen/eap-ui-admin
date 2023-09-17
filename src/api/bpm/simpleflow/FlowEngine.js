import request from '@/utils/request'

// 获取流程引擎列表
export function FlowEngineList(data) {
  return request({
    url: `/api/workflow/Engine/flowTemplate`,
    method: 'get',
    data
  })
}
// 获取流程引擎信息
export function FlowEngineInfo(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${id}`,
    method: 'get'
  })
}
// 删除流程引擎
export function Delete(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${id}`,
    method: 'DELETE'
  })
}
// 新建流程引擎
export function Create(data) {
  return request({
    url: `/api/workflow/Engine/flowTemplate`,
    method: 'post',
    data
  })
}
//  更新流程引擎
export function Update(data) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${data.id}`,
    method: 'PUT',
    data
  })
}
// 复制流程
export function Copy(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${id}/Actions/Copy`,
    method: 'post'
  })
}
// 导出流程
export function exportData(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${id}/Actions/ExportData`,
    method: 'GET'
  })
}
// 发布流程引擎
export function Release(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/Release/${id}`,
    method: 'post'
  })
}
// 停止流程引擎
export function Stop(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/Stop/${id}`,
    method: 'post'
  })
}
// 获取引擎id
export function getFlowIdByCode(enCode) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/getFlowIdByCode/${enCode}`,
    method: 'get'
  })
}
// 列表ListAll
export function FlowEngineListAll() {
  return request({
    url: `/api/workflow/Engine/flowTemplate/ListAll`,
    method: 'get'
  })
}
// 列表ListAll
export function FlowEnginePageList(data) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/PageListAll`,
    method: 'get',
    data
  })
}
// 列表流程小idListAll
export function FlowEnginePageChildList(data) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/PageChildListAll`,
    method: 'get',
    data
  })
}
// 流程引擎下拉框
export function FlowEngineSelector(type) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/Selector`,
    method: 'get',
    data: { type }
  })
}
// 获取流程发起节点表单信息
export function getFlowFormInfo(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${id}/FormInfo`,
    method: 'get'
  })
}
// 获取流程评论列表
export function getCommentList(data) {
  return request({
    url: `/api/workflow/Engine/FlowComment`,
    method: 'get',
    data
  })
}
// 新建流程评论
export function createComment(data) {
  return request({
    url: `/api/workflow/Engine/FlowComment`,
    method: 'post',
    data
  })
}
// 删除流程评论
export function delComment(id) {
  return request({
    url: `/api/workflow/Engine/FlowComment/${id}`,
    method: 'delete'
  })
}
//流程版本列表
export function flowJsonList(id, data) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${id}/FlowJsonList`,
    method: 'get',
    data
  })
}

//设置主版本
export function mainVersion(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${id}/MainVersion`,
    method: 'post',
  })
}

//设置主版本
export function delVersion(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${id}/FlowJson`,
    method: 'delete',
  })
}

// 委托可选全部流程
export function FlowEngineAll(data) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/getflowAll`,
    method: 'get',
    data
  })
}

// 委托 通过list<flowId>获取流程引擎列表
export function FlowEngineListByIds(data) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/getflowList`,
    method: 'post',
    data
  })
}

//设置协管
export function assist(data) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/assist`,
    method: 'post',
    data
  })
}

//获取协管接口
export function assistList(id) {
  return request({
    url: `/api/workflow/Engine/flowTemplate/${id}/assistList`,
    method: 'get'
  })
}
// 获取多流程流程列表
export function getFlowList(id, type = '') {
  return request({
    url: `/api/workflow/Engine/flowTemplate/FlowJsonList/${id}`,
    method: 'get',
    data: { type }
  })
}