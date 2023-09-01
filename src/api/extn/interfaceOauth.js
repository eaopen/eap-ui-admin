import request from '@/utils/request'

// 获取接口认证列表(分页)
export function getInterfaceOauthList(data) {
  return request({
    url: '/api/system/InterfaceOauth',
    method: 'GET',
    data
  })
}

// 创建
export function create(data) {
  return request({
    url: '/api/system/InterfaceOauth',
    method: 'POST',
    data
  })
}
// 获取详情
export function getInfo(id) {
  return request({
    url: `/api/system/InterfaceOauth/${id}`,
    method: 'GET',
  })
}

// 修改接口
export function update(data) {
  return request({
    url: `/api/system/InterfaceOauth/${data.id}`,
    method: 'PUT',
    data
  })
}

// 删除接口认证数据
export function deleteInterfaceIdent(id) {
  return request({
    url: `/api/system/InterfaceOauth/${id}`,
    method: 'DELETE'
  })
}

// 获取秘钥
export function getAppSecret() {
  return request({
    url: `/api/system/InterfaceOauth/getAppSecret`,
    method: 'GET'
  })
}


// 保存认证接口列表
export function saveInterfaceList(data) {
  return request({
    url: `/api/system/InterfaceOauth/saveInterfaceList`,
    method: 'POST',
    data
  })
}
// 获取认证接口列表
export function getInterfaceList(id) {
  return request({
    url: `/api/system/InterfaceOauth/getInterfaceList/${id}`,
    method: 'GET',
  })
}

// 获取接口日志列表
export function dataInterfaceLog(id, data) {
  return request({
    url: `/api/system/InterfaceOauth/dataInterfaceLog/${id}`,
    method: 'GET',
    data
  })
}

