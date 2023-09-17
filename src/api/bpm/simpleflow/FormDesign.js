import request from '@/utils/request'

//表单列表
export function getFormList(data) {
  return request({
    url: `/api/flowForm/Form`,
    method: 'get',
    data
  })
}
//查看
export function getFormInfo(id) {
  return request({
    url: `/api/flowForm/Form/${id}`,
    method: 'get'
  })
}
//新建表单
export function Create(data) {
  return request({
    url: `/api/flowForm/Form`,
    method: 'post',
    data
  })
}

//修改表单
export function Update(data) {
  return request({
    url: `/api/flowForm/Form`,
    method: 'put',
    data
  })
}

//发布/回滚
export function release(id, isRelease) {
  return request({
    url: `/api/flowForm/Form/Release/${id}` + '?isRelease=' + isRelease,
    method: 'post',
  })
}

//复制表单
export function copyForm(id) {
  return request({
    url: `/api/flowForm/Form/${id}/Actions/Copy`,
    method: 'get',
  })
}

//删除表单
export function del(id) {
  return request({
    url: `/api/flowForm/Form/${id}`,
    method: 'delete',
  })
}

//导出
export function exportData(id) {
  return request({
    url: `/api/flowForm/Form/${id}/Actions/ExportData`,
    method: 'get',
  })
}

//根据表单id获取表单字段
export function getFormField(id) {
  return request({
    url: `/api/flowForm/Form/${id}/getField`,
    method: 'get',
  })
}
//根据表单id获取表单字段
export function getFormSelect(data) {
  return request({
    url: `/api/flowForm/Form/select`,
    method: 'get',
    data
  })
}

//通过表单id获取流程id
export function getFormById(id) {
  return request({
    url: `/api/flowForm/Form/getFormById/${id}`,
    method: 'get'
  })
}
