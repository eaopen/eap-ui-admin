import request from '@/utils/request'

// 获取系统配置
export function getSystemConfig() {
  return request({
    url: '/api/system/SysConfig',
    method: 'GET'
  })
}

// 更新系统配置
export function updateSystemConfig(data) {
  return request({
    url: '/api/system/SysConfig',
    method: 'PUT',
    data
  })
}

// 邮箱连接测试
export function testEmail(data) {
  return request({
    url: '/api/system/SysConfig/Email/Test',
    method: 'POST',
    data
  })
}
// 测试企业微信配置的连接
export function testQy(data, type) {
  return request({
    url: `/api/system/SysConfig/${type}/testQyWebChatConnect`,
    method: 'POST',
    data
  })
}
// 测试企业微信配置的连接
export function testDing(data) {
  return request({
    url: '/api/system/SysConfig/testDingTalkConnect',
    method: 'POST',
    data
  })
}
// 获取第三方(如：企业微信、钉钉)的组织与用户同步统计信息
// thirdType: 1-企业微信; 2-钉钉
export function getSynThirdTotal(thirdType) {
  return request({
    url: `/api/system/SynThirdInfo/getSynThirdTotal/${thirdType}`,
    method: 'GET'
  })
}
// 本地所有组织信息(包含公司和部门)同步到钉钉
export function synAllOrganizeSysToDing(type) {
  return request({
    url: '/api/system/SynThirdInfo/synAllOrganizeSysToDing?type=' + type,
    method: 'GET'
  })
}
// 本地所有用户信息同步到钉钉
export function synAllUserSysToDing(type) {
  return request({
    url: '/api/system/SynThirdInfo/synAllUserSysToDing?type=' + type,
    method: 'GET'
  })
}
// 本地所有组织信息(包含公司和部门)同步到企业微信
export function synAllOrganizeSysToQy(type) {
  return request({
    url: '/api/system/SynThirdInfo/synAllOrganizeSysToQy?type=' + type,
    method: 'GET'
  })
}
// 本地所有用户信息同步到企业微信
export function synAllUserSysToQy(type) {
  return request({
    url: '/api/system/SynThirdInfo/synAllUserSysToQy?type=' + type,
    method: 'GET'
  })
}
// 获取系统管理员
export function getAdminList() {
  return request({
    url: '/api/system/SysConfig/getAdminList',
    method: 'GET'
  })
}
// 设置系统管理员
export function setAdminList(adminIds) {
  return request({
    url: '/api/system/SysConfig/setAdminList',
    method: 'PUT',
    data: { adminIds }
  })
}
