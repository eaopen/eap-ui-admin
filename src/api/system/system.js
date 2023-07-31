import request from '@/utils/request'

// 获取菜单列表
export const getSystem = (data) => {
  return request({
    url: '/api/system/System',
    method: 'GET',
    data
  })
}


//新建菜单列表
export const create = (data) => {
  return request({
    url: '/api/system/System',
    method: 'post',
    data
  })
}

//修改菜单列表
export const update = (data) => {
  return request({
    url: `/api/system/System/${data.id}`,
    method: 'put',
    data
  })
}

//菜单详情
export const info = (id) => {
  return request({
    url: `/api/system/System/${id}`,
    method: 'get'
  })
}


//删除菜单
export const delSystem = (id) => {
  return request({
    url: `/api/system/System/${id}`,
    method: 'delete'
  })
}

