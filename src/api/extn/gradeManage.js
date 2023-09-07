import request from '@/utils/request'

// 获取分级管理员列表
export const getGradeManageList = (data) => {
  return request({
    url: `/api/permission/organizeAdminIsTrator`,
    method: 'GET',
    data
  })
}


//获取组织下拉框列表
export const getSelectorOrgList = (userId) => {
  return request({
    url: `/api/permission/organizeAdminIsTrator/Selector/` + '?userId=' + userId,
    method: 'GET'
  })
}

//删除二级管理员 
export const delGradeManage = (id) => {
  return request({
    url: `/api/permission/organizeAdminIsTrator/${id}`,
    method: 'DELETE'
  })
}

//新建二级管理员 
export const saveGradeManage = (data) => {
  return request({
    url: `/api/permission/organizeAdminIsTrator`,
    method: 'POST',
    data
  })

}