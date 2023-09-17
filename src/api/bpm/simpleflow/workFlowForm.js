import request from '@/utils/request'

// 新建表单
export function Create(data) {
  return request({
    url: `/api/workflow/Engine/FlowTask`,
    method: 'post',
    data
  })
}
// 修改表单
export function Update(data) {
  return request({
    url: `/api/workflow/Engine/FlowTask/${data.id}`,
    method: 'put',
    data
  })
}