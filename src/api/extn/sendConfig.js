import request from '@/utils/request'
// 列表
export const getSendConfigList = data => {
  return request({
    url: '/api/message/SendMessageConfig',
    method: 'GET',
    data
  })
}
// 详情
export const getSendConfigDetail = id => {
  return request({
    url: `/api/message/SendMessageConfig/${id}`,
    method: 'GET'
  })
}
// 新增
export const addMsgTemplate = data => {
  return request({
    url: '/api/message/SendMessageConfig',
    method: 'POST',
    data
  })
}
// 编辑
export const editMsgTemplate = data => {
  return request({
    url: `/api/message/SendMessageConfig/${data.id}`,
    method: 'PUT',
    data
  })
}
// 测试发送配置获取配置信息
export const testSendConfigInfo = id => {
  return request({
    url: `/api/message/SendMessageConfig/getTestConfig/${id}`,
    method: 'POST',
    id
  })
}
// 测试发送配置
export const testSendConfig = data => {
  return request({
    url: '/api/message/SendMessageConfig/testSendConfig',
    method: 'POST',
    data
  })
}
// 复制
export const copySendConfig = id => {
  return request({
    url: `/api/message/SendMessageConfig/copy/${id}`,
    method: 'post'
  })
}
// 刪除
export const delMsgTemplate = id => {
  return request({
    url: `/api/message/SendMessageConfig/${id}`,
    method: 'DELETE'
  })
}
// 列表
export const getMsgTemplate = data => {
  return request({
    url: '/api/message/SendMessageConfig/getSendConfigList',
    method: 'GET',
    data
  })
}
