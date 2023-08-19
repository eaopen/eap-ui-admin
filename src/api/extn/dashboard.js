import request from '@/utils/request'

// 获取我的待办
export function getFlowTodoCount(data) {
  return request({
    url: '/api/visualdev/Dashboard/FlowTodoCount',
    method: 'post',
    data
  })
}
// 获取通知公告
export function getNotice(data) {
  return request({
    url: `/api/visualdev/Dashboard/Notice`,
    method: 'post',
    data
  })
}
// 获取未读邮件
export function getEmail() {
  return request({
    url: '/api/visualdev/Dashboard/Email',
    method: 'get'
  })
}
// 获取待办事项
export function getFlowTodo() {
  return request({
    url: '/api/visualdev/Dashboard/FlowTodo',
    method: 'get'
  })
}
// 获取我的待办事项
export function getMyFlowTodo() {
  return request({
    url: '/api/visualdev/Dashboard/MyFlowTodo',
    method: 'get'
  })
}
