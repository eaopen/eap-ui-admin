import request from '@/utils/request'
// 列表
export const getMsgMonitorList = data => {
  return request({
    url: '/api/message/MessageMonitor',
    method: 'GET',
    data
  })
}
// 详情
export const getMsgMonitorDetail = id => {
  return request({
    url: `/api/message/MessageMonitor/detail/${id}`,
    method: 'GET'
  })
}
// 批量删除
export const delMsgMonitor = (data) => {
  return request({
    url: '/api/message/MessageMonitor/batchRemove',
    method: 'DELETE',
    data
  })
}
// 一键清空
export const emptyMsgMonitor = () => {
  return request({
    url: '/api/message/MessageMonitor/empty',
    method: 'DELETE'
  })
}
