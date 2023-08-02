// IM通讯获取用户
import request from "@/utils/request";

export function getImUser(data){
    return request({
        url: '/api/permission/Users/ImUser',
        method: 'get',
        data
    })
}

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