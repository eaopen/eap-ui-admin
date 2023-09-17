import request from '@/utils/request'

// 获取流程委托列表
export function FlowDelegateList(data) {
  return request({
    url: `/api/workflow/Engine/FlowDelegate`,
    method: 'get',
    data
  })
}
// 获取流程委托信息
export function FlowDelegateInfo(id) {
  return request({
    url: `/api/workflow/Engine/FlowDelegate/${id}`,
    method: 'get'
  })
}
// 删除流程委托
export function DeleteDelagate(id) {
  return request({
    url: `/api/workflow/Engine/FlowDelegate/${id}`,
    method: 'DELETE'
  })
}
// 新建流程委托
export function Create(data) {
  return request({
    url: `/api/workflow/Engine/FlowDelegate`,
    method: 'post',
    data
  })
}
// 更新流程委托
export function Update(data) {
  return request({
    url: `/api/workflow/Engine/FlowDelegate/${data.id}`,
    method: 'PUT',
    data
  })
}

// 获取我的委托发起流程
export function delegateGetflow(data) {
  return request({
    url: `/api/workflow/Engine/FlowDelegate/getflow`,
    method: 'get',
    data
  })
}

// 获取一个流程的所有委托人
export function getUserListByFlowId(data) {
  return request({
    url: `/api/workflow/Engine/FlowDelegate/userList`,
    method: 'get',
    data
  })
}

// 流程委托结束
export function Stop(id) {
  return request({
    url: `/api/workflow/Engine/FlowDelegate/Stop/${id}`,
    method: 'put'
  })
}