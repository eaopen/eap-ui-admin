import request from '@/utils/request'

// 获取列表
export function getPortalManageList(systemId, data) {
  return request({
    url: `/api/system/PortalManage/list/${systemId}`,
    method: 'GET',
    data
  })
}

// 获取门户名称列表
export function getPortalManageSelector(systemId, data) {
  return request({
    url: `/api/visualdev/Portal/manage/Selector/${systemId}`,
    method: 'GET',
    data
  })
}

// 详情
export function getPortalManageInfo(id) {
  return request({
    url: `/api/system/PortalManage/${id}`,
    method: 'GET',
  })
}
// 新建
export function createPortal(data) {
  return request({
    url: `/api/system/PortalManage`,
    method: 'post',
    data
  })
}

// 编辑
export function updatePortal(data) {
  return request({
    url: `/api/system/PortalManage/${data.id}`,
    method: 'put',
    data
  })
}
// 删除
export function delPortal(id) {
  return request({
    url: `/api/system/PortalManage/${id}`,
    method: 'DELETE',
  })
}

//发布
export function Release(id, data) {
  return request({
    url: `/api/visualdev/Portal/Actions/release/${id}`,
    method: 'put',
    data
  })
}