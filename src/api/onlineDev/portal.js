import request from '@/utils/request'

// 获取门户列表
export function getPortalList(data) {
  return request({
    url: '/api/visualdev/Portal',
    method: 'get',
    data
  })
}
// 获取门户信息
export function getPortalInfo(id) {
  return request({
    url: `/api/visualdev/Portal/${id}`,
    method: 'get'
  })
}
// 删除门户
export function Delete(id) {
  return request({
    url: `/api/visualdev/Portal/${id}`,
    method: 'DELETE'
  })
}
// 修改门户
export function Update(data) {
  return request({
    url: `/api/visualdev/Portal/${data.id}`,
    method: 'PUT',
    data
  })
}
// 新建门户
export function Create(data) {
  return request({
    url: '/api/visualdev/Portal',
    method: 'post',
    data
  })
}
// 复制门户
export function Copy(id) {
  return request({
    url: `/api/visualdev/Portal/${id}/Actions/Copy`,
    method: 'POST'
  })
}
// 导出门户
export function exportTemplate(id) {
  return request({
    url: `/api/visualdev/Portal/${id}/Actions/ExportData`,
    method: 'POST'
  })
}
// 获取门户下拉框列表
export function getPortalSelector(type) {
  return request({
    url: '/api/visualdev/Portal/Selector?platform=Web',
    method: 'GET',
    data: { type }
  })
}
// 切换用户门户默认显示
export function SetDefault(id) {
  return request({
    url: `/api/visualdev/Portal/${id}/Actions/SetDefault?platform=Web`,
    method: 'PUT'
  })
}
// 获取门户展示数据(权限)
export function getAuthPortal(id, data) {
  return request({
    url: `/api/visualdev/Portal/${id}/auth`,
    method: 'GET',
    data
  })
}
// 获取全国省市区
export function getAtlas() {
  return request({
    url: `/api/system/atlas`,
    method: 'get',
  })
}
// 获取地图json
export function getMapData(id) {
  return request({
    url: `/api/system/atlas/geojson`,
    method: 'get',
    data: {
      code: id,
    }
  })
}
// 用户拖拽后更新
export function UpdateCustomPortal(id, data) {
  return request({
    url: `/api/visualdev/Portal/Custom/Save/${id}`,
    method: 'PUT',
    data
  })
}