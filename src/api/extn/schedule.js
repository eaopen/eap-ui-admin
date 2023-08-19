import request from '@/utils/request'

// 获取日程安排列表
export function List(data) {
  return request({
    url: '/api/system/Schedule',
    method: 'get',
    data
  })
}
// 新建日程安排
export function ScheduleCreate(data) {
  return request({
    url: '/api/system/Schedule',
    method: 'post',
    data
  })
}
// 删除日程安排
export function ScheduleDelete(id, type) {
  return request({
    url: `/api/system/Schedule/${id}/${type}`,
    method: 'DELETE',
  })
}
// 获取日程安排信息
export function ScheduleInfo(id) {
  return request({
    url: `/api/system/Schedule/${id}`,
    method: 'get'
  })
}
// 更新日程安排
export function ScheduleUpdate(data, type) {
  return request({
    url: `/api/system/Schedule/${data.id}/${type}`,
    method: 'PUT',
    data
  })
}
//查看日程详情
export function ScheduleDetail(groupId, id) {
  return request({
    url: `/api/system/Schedule/detail/?groupId=${groupId}&id=${id}`,
    method: 'get',
  })
}
