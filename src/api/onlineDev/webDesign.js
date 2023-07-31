import request from '@/utils/request'
// 获取外链信息
export function getShortLink(id) {
  return request({
    url: `/api/visualdev/ShortLink/${id}`,
    method: 'get'
  })
}
//保存外链信息
export function save(data) {
  return request({
    url: `/api/visualdev/ShortLink`,
    method: 'PUT',
    data
  })
}

// 获取外链信息
export function getConfig(id, encryption) {
  return request({
    url: `/api/visualdev/ShortLink/getConfig/${id}` + (encryption ? '?encryption=' + encryption : ''),
    method: 'get'
  })
}

// 获取外链信息
export function checkPwd(data) {
  return request({
    url: `/api/visualdev/ShortLink/checkPwd`,
    method: 'post',
    data
  })
}
// 获取列表表单配置JSON
export function getConfigData(modelId, encryption) {
  return request({
    url: `/api/visualdev/ShortLink/${modelId}/Config` + (encryption ? '?encryption=' + encryption : ''),
    method: 'get',
  })
}
// 添加数据
export function createModel(modelId, data, encryption) {
  return request({
    url: `/api/visualdev/ShortLink/${modelId}` + (encryption ? '?encryption=' + encryption : ''),
    method: 'POST',
    data
  })
}


// 获取数据详情
export function getDataChange(modelId, id, encryption) {
  return request({
    url: `/api/visualdev/ShortLink/${modelId}/${id}/DataChange` + (encryption ? '?encryption=' + encryption : ''),
    method: 'GET'
  })
}


// 获取数据列表
export function getModelListLink(modelId, data, encryption) {
  return request({
    url: `/api/visualdev/ShortLink/${modelId}/ListLink` + (encryption ? '?encryption=' + encryption : ''),
    method: 'post',
    data
  })
}