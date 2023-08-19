import request from '@/utils/request'

// 获取接口列表(分页)
export function getDataInterfaceList(data) {
  return request({
    url: '/api/system/DataInterface',
    method: 'GET',
    data
  })
}

// 获取接口列表下拉框
export function getDataInterfaceSelector() {
  return request({
    url: '/api/system/DataInterface/Selector',
    method: 'GET'
  })
}

// 添加接口
export function createDataInterface(data) {
  return request({
    url: '/api/system/DataInterface',
    method: 'POST',
    data
  })
}

// 修改接口
export function updateDataInterface(data) {
  return request({
    url: `/api/system/DataInterface/${data.id}`,
    method: 'PUT',
    data
  })
}

// 获取接口数据
export function getDataInterfaceInfo(id) {
  return request({
    url: `/api/system/DataInterface/${id}`,
    method: 'GET'
  })
}

// 删除接口数据
export function delDataInterface(id) {
  return request({
    url: `/api/system/DataInterface/${id}`,
    method: 'DELETE'
  })
}

// 更新接口状态
export function updateDataInterfaceState(id) {
  return request({
    url: `/api/system/DataInterface/${id}/Actions/State`,
    method: 'PUT'
  })
}

// 复制接口数据
export function copy(id) {
  return request({
    url: `/api/system/DataInterface/${id}/Actions/Copy`,
    method: 'post'
  })
}

// 获取接口数据
export function getDataInterfaceRes(id, data) {
  return request({
    url: `/api/system/DataInterface/${id}/Actions/Preview`,
    method: 'POST',
    data: data || {}
  })
}

// 获取数据接口参数
export function getDataInterfaceParam(id) {
  return request({
    url: `/api/system/DataInterface/GetParam/${id}`,
    method: 'GET'
  })
}

// 导出数据接口数据
export function exportData(id) {
  return request({
    url: `/api/system/DataInterface/${id}/Action/Export`,
    method: 'GET'
  })
}

// 获取数据接口调用日志列表
export function getDataInterfaceLog(id, data) {
  return request({
    url: `/api/system/DataInterfaceLog/${id}`,
    method: 'GET',
    data
  })
}

// 获取接口列表数据
export function getDataInterfaceDataSelect(id, data) {
  return request({
    url: `/api/system/DataInterface/${id}/Action/List`,
    method: 'post',
    data
  })
}
// 获取多条接口数据
export function getDataInterfaceDataInfoByIds(id, data) {
  return request({
    url: `/api/system/DataInterface/${id}/Action/InfoByIds`,
    method: 'POST',
    data
  })
}
// 获取接口列表(工作流选择时调用，带分页)
export function getDataInterfaceSelectorList(data) {
  return request({
    url: '/api/system/DataInterface/getList',
    method: 'GET',
    data
  })
}