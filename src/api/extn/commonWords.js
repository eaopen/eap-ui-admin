import request from '@/utils/request'

// 获取审批常用语列表
export function getCommonWordList(data) {
  return request({
    url: `/api/system/CommonWords`,
    method: 'get',
    data
  })
}

// 获取审批常用语详情
export function getCommonWordsInfo(id) {
  return request({
    url: `/api/system/CommonWords/${id}`,
    method: 'get'
  })
}
//获取所属应用
export function getSelector() {
  return request({
    url: `/api/system/CommonWords/Selector`,
    method: 'get'
  })
}
// 审批常用语删除
export function deleteCommonWords(id) {
  return request({
    url: `/api/system/CommonWords/${id}`,
    method: 'DELETE'
  })
}
// 审批常用语新建
export function Create(data) {
  return request({
    url: '/api/system/CommonWords',
    method: 'post',
    data
  })
}
// 审批常用语编辑
export function Update(data) {
  return request({
    url: `/api/system/CommonWords/${data.id}`,
    method: 'put',
    data
  })
}
