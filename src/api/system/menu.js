import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query
  })
}

// 查询菜单（精简)列表
export function listSimpleMenus() {
  return request({
    url: '/system/menu/list-all-simple',
    method: 'get'
  })
}
// 获取上级菜单下拉框
export const getMenuSelector = (data, type, systemId) => {
  data.type=1
  return request({
    url: '/api/visualdev/Portal/Selector/All',
    method: 'GET',
    params: data

  })
}
// 查询菜单详细
export function getMenu(id) {
  return request({
    url: '/system/menu/get?id=' + id,
    method: 'get'
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/system/menu/create',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: '/system/menu/update',
    method: 'put',
    data: data
  })
}

// 删除菜单
export function delMenu(id) {
  return request({
    url: '/system/menu/delete?id=' + id,
    method: 'delete'
  })
}

// 检查更新菜单国际化数据
export function checkMenuI18n(){
  return request({
    url:'/system/menu/checkI18n',
    method: 'get'
  })
}
