import request from '@/utils/request'

// 获取组织/公司树形
export const getOrganizeTree = () => {
    return request({
        url: '/api/permission/Organize/Tree',
        method: 'GET'
    })
}

// 获取组织/公司下拉框列表(带权限)
export const getOrganizeSelectorByAuth = (id) => {
    return request({
        url: '/api/permission/Organize/SelectorByAuth/' + (!!id ? id : 0),
        method: 'GET'
    })
}


// 通过部门id获取部门树形
export const getOrgByOrganizeCondition = (data) => {
    return request({
        url: `/api/permission/Organize/OrganizeCondition`,
        method: 'post',
        data
    })
}

// 获取用户下拉框列表
export const getListByAuthorize = (organizeId, keyword) => {
    return request({
        url: `/api/permission/Users/GetListByAuthorize/${organizeId}`,
        method: 'post',
        data: { keyword }
    })
}


// 获取用户基本信息
export const getUserInfoList = userId => {
    return request({
        url: '/api/permission/Users/getUserList',
        method: 'post',
        data: { userId }
    })
}

// 获取用户下拉框列表
export const getImUserSelector = (organizeId, data = {}) => {
    return request({
        url: `/permission/Users/ImUser/Selector/SimpleUser/${organizeId}`,
        method: 'post',
        data
    })
}

// 获取选中组织、岗位、角色、用户基本信息
export const getSelectedList = userId => {
    return request({
        url: '/api/permission/Users/getSelectedList',
        method: 'post',
        data: { userId }
    })
}
// 通过组织、岗位、角色、用户ids获取选中用户基本信息
export const getSelectedUserList = data => {
    return request({
        url: '/api/permission/Users/getSelectedUserList',
        method: 'post',
        data
    })
}

// 获取我的下属
export const getSubordinates = (keyword) => {
    return request({
        url: '/api/permission/Users/getSubordinates',
        method: 'post',
        data: { keyword }
    })
}
// 获取当前组织用户
export const getOrganization = (data) => {
    return request({
        url: '/api/permission/Users/getOrganization',
        method: 'get',
        data
    })
}

// 通过部门id,岗位id,角色id,分组id,用户id获取用户列表(带分页)
export const getUsersByUserCondition = (data) => {
    return request({
        url: '/api/permission/Users/UserCondition',
        method: 'post',
        data
    })
}




// 获取角色下拉框列表
export const getRoleSelector = () => {
    return request({
        url: '/api/permission/Role/Selector',
        method: 'GET'
    })
}

// 获取角色下拉框列表(带权限)
export const getRoleSelectorByPermission = () => {
    return request({
        url: '/api/permission/Role/SelectorByPermission',
        method: 'GET'
    })
}

// 获取岗位下拉列表（公司+部门+岗位）
export const getPositionSelector = () => {
    return request({
        url: '/api/permission/Position/Selector',
        method: 'GET'
    })
}


// 获取分组下拉框列表
export const getGroupSelector = () => {
    return request({
        url: '/api/permission/Group/Selector',
        method: 'GET'
    })
}

// 获取全部岗位管理信息列表
export const getPositionListAll = () => {
    return request({
      url: '/api/permission/Position/All',
      method: 'GET'
    })
  }

// 获取部门下拉框列表(公司+部门)
export const getDepartmentSelector = (id) => {
    return request({
      url: '/api/permission/Organize/Department/Selector/' + (!!id ? id : 0),
      method: 'GET'
    })
  }