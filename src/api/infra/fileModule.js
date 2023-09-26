import request from '@/utils/request'

// 创建文件模块
export function createFileModule(data) {
  return request({
    url: '/infra/file-module/create',
    method: 'post',
    data: data
  })
}

// 更新文件模块
export function updateFileModule(data) {
  return request({
    url: '/infra/file-module/update',
    method: 'put',
    data: data
  })
}


// 删除文件模块
export function deleteFileModule(id) {
  return request({
    url: '/infra/file-module/delete?id=' + id,
    method: 'delete'
  })
}

// 获得文件模块
export function getFileModule(id) {
  return request({
    url: '/infra/file-module/get?id=' + id,
    method: 'get'
  })
}

// 获得文件模块分页
export function getFileModulePage(query) {
  return request({
    url: '/infra/file-module/page',
    method: 'get',
    params: query
  })
}

