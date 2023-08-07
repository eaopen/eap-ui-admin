// IM通讯获取用户
import request from "@/utils/request";



// 获取消息中心列表
export function getMessageList(data) {
    return request({
      url: `/api/message`,
      method: 'get',
      data
    })
  }
  // 全部已读
  export function MessageAllRead(data) {
    return request({
      url: '/api/message/Actions/ReadAll',
      method: 'post',
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

  // 获取系统公告列表
  export function getNoticeList(data) {
    return request({
      url: '/api/message/Notice',
      method: 'get',
      data
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