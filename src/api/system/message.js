import request from '@/utils/request'

// 获取消息中心列表
export function getMessageList(data) {
  return request({
    url: `/api/message`,
    method: 'GET',
    data
  })
}
// 全部已读
export function MessageAllRead(data) {
  return request({
    url: '/api/message/Actions/ReadAll',
    method: 'POST',
    data
  })
}
// 查看消息内容
export function ReadInfo(id) {
  return request({
    url: `/api/message/ReadInfo/${id}`,
    method: 'get'
  })
}
// 删除消息
export function MessageDeleteRecord(data) {
  return request({
    url: `/api/message/Record`,
    method: 'DELETE',
    data
  })
}
// 获取系统公告列表
export function getNoticeList(data) {
  return request({
    url: '/api/message/Notice',
    method: 'post',
    data
  })
}
// 添加公告
export function createNotice(data) {
  return request({
    url: '/api/message',
    method: 'POST',
    data
  })
}
// 修改公告
export function updateNotice(data) {
  return request({
    url: `/api/message/${data.id}`,
    method: 'PUT',
    data
  })
}
// 获取/查看系统公告信息
export function getNoticeInfo(id) {
  return request({
    url: `/api/message/${id}`,
    method: 'GET'
  })
}
// 删除公告
export function delNotice(id) {
  return request({
    url: `/api/message/${id}`,
    method: 'DELETE'
  })
}
// 发布公告
export function releaseNotice(id) {
  return request({
    url: `/api/message/${id}/Actions/Release`,
    method: 'PUT'
  })
}
// 获取IM对话列表
export function getIMReply() {
  return request({
    url: '/api/message/imreply',
    method: 'GET'
  })
}

//删除聊天记录
export function deleteChatRecord(id) {
  return request({
    url: `/api/message/imreply/deleteChatRecord/${id}`,
    method: 'DELETE'
  })
}

//移除
export function relocation(id) {
  return request({
    url: `/api/message/imreply/relocation/${id}`,
    method: 'DELETE'
  })
}
//发送配置回写
export function sendMessageConfig(id) {
  return request({
    url: `api/message/SendMessageConfig/${id}`,
    method: 'get'
  })
}