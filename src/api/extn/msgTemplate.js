import request from '@/utils/request'
// 列表
export const getMsgTemplateList = data => {
  return request({
    url: '/api/message/MessageTemplateConfig',
    method: 'GET',
    data
  })
}
// 新增
export const addMsgTemplate = data => {
  return request({
    url: '/api/message/MessageTemplateConfig',
    method: 'POST',
    data
  })
}
// 编辑
export const editMsgTemplate = data => {
  return request({
    url: `/api/message/MessageTemplateConfig/${data.id}`,
    method: 'PUT',
    data
  })
}
// 详情
export const getMsgTemplateDetail = id => {
  return request({
    url: `/api/message/MessageTemplateConfig/${id}`,
    method: 'GET'
  })
}
// 测试
export const testMsgTemplate = data => {
  return request({
    url: '/api/message/MessageTemplateConfig/testSendMail',
    method: 'POST',
    data
  })
}
// 复制
export const copyMsgTemplate = id => {
  return request({
    url: `/api/message/MessageTemplateConfig/copy/${id}`,
    method: 'post'
  })
}
// 刪除
export const delMsgTemplate = id => {
  return request({
    url: `/api/message/MessageTemplateConfig/${id}`,
    method: 'DELETE'
  })
}
//数据类型具体对应数据：1：消息类型，2：渠道，3：webhook类型，4：消息来源
export const getMsgTypeList = type => {
  return request({
    url: `/api/message/MessageDataType/getTypeList/${type}`,
    method: 'GET'
  })
}