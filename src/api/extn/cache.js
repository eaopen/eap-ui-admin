import request from "@/utils/request";

// 获取门户列表
export function getPortalList(data) {
  return request({
    url: "/api/visualdev/Portal/list",
    method: "get",
    data,
  });
}

// 获取门户信息
export function getPortalInfo(id) {
  return request({
    url: `/api/visualdev/Portal/${id}`,
    method: "get",
  });
}


// 导出门户
export function exportTemplate(id) {
  return request({
    url: `/api/visualdev/Portal/${id}/Actions/ExportData`,
    method: "POST",
  });
}

// 获取外链信息
export function getShortLink(id) {
  return request({
    url: `/api/visualdev/ShortLink/${id}`,
    method: "get",
  });
}
//保存外链信息
export function save(data) {
  return request({
    url: `/api/visualdev/ShortLink`,
    method: "PUT",
    data,
  });
}

// 获取外链信息
export function getConfig(id, encryption) {
  return request({
    url:
      `/api/visualdev/ShortLink/getConfig/${id}` +
      (encryption ? "?encryption=" + encryption : ""),
    method: "get",
  });
}

// 获取外链信息
export function checkPwd(data) {
  return request({
    url: `/api/visualdev/ShortLink/checkPwd`,
    method: "post",
    data,
  });
}
// 获取列表表单配置JSON
export function getConfigData(modelId, encryption) {
  return request({
    url:
      `/api/visualdev/ShortLink/${modelId}/Config` +
      (encryption ? "?encryption=" + encryption : ""),
    method: "get",
  });
}

// 添加数据
export function createModel(modelId, data, encryption) {
  return request({
    url:
      `/api/visualdev/ShortLink/${modelId}` +
      (encryption ? "?encryption=" + encryption : ""),
    method: "POST",
    data,
  });
}

// 获取数据详情
export function getDataChange(modelId, id, encryption) {
  return request({
    url:
      `/api/visualdev/ShortLink/${modelId}/${id}/DataChange` +
      (encryption ? "?encryption=" + encryption : ""),
    method: "GET",
  });
}

// 获取数据列表
export function getModelListLink(modelId, data, encryption) {
  return request({
    url:
      `/api/visualdev/ShortLink/${modelId}/ListLink` +
      (encryption ? "?encryption=" + encryption : ""),
    method: "post",
    data,
  });
}

// 获取功能列表
export function getVisualDevList(data) {
  return request({
    url: '/api/visualdev/Base',
    method: 'get',
    data
  })
}
// 获取功能信息
export function getVisualDevInfo(id) {
  return request({
    url: `/api/visualdev/Base/${id}`,
    method: 'get'
  })
}


// 删除功能
export function Delete(id) {
  return request({
    url: `/api/visualdev/Base/${id}`,
    method: 'DELETE'
  })
}
// 修改功能
export function Update(data) {
  return request({
    url: `/api/visualdev/Base/${data.id}`,
    method: 'PUT',
    data
  })
}
// 新建功能
export function Create(data) {
  return request({
    url: '/api/visualdev/Base',
    method: 'post',
    data
  })
}
// 复制功能
export function Copy(id) {
  return request({
    url: `/api/visualdev/Base/${id}/Actions/Copy`,
    method: 'POST'
  })
}
// 发布菜单
export function Release(id, data) {
  return request({
    url: `/api/visualdev/Base/${id}/Actions/Release`,
    method: 'POST',
    data
  })
}
// 获取模块命名
export function getAreasName() {
  return request({
    url: `/api/visualdev/Generater/AreasName`,
    method: 'get'
  })
}
// 代码下载
export function DownloadCode(id, data) {
  return request({
    url: `/api/visualdev/Generater/${id}/Actions/DownloadCode`,
    method: 'POST',
    data
  })
}
// 代码预览
export function CodePreview(id, data) {
  return request({
    url: `/api/visualdev/Generater/${id}/Actions/CodePreview`,
    method: 'POST',
    data
  })
}

// 获取列表配置JSON
export function getColumnData(modelId) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/ColumnData`,
    method: 'get'
  })
}
// 获取表单配置JSON
export function getFormData(modelId) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/FormData`,
    method: 'get'
  })
}
// 获取数据列表
export function getModelList(modelId, data) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/List`,
    method: 'post',
    data
  })
}

// 获取树形数据子集
export function getModelSubList(modelId, id, data) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/List/${id}`,
    method: 'post',
    data
  })
}
export function getFields(id, data) {
  return request({
    url: `/api/system/DataInterface/${id}/Actions/GetFields`,
    method: 'POST',
    data
  })
}
// 修改数据
export function updateModel(modelId, data) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/${data.id}`,
    method: 'PUT',
    data
  })
}
// 获取数据信息
export function getModelInfo(modelId, id) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/${id}`,
    method: 'GET'
  })
}
// 获取表单主表属性列表
export function getFormDataFields(modelId) {
  return request({
    url: `/api/visualdev/Base/${modelId}/FormDataFields`,
    method: 'GET'
  })
}
// 获取表单主表属性下拉框
export function getFieldDataSelect(modelId, data) {
  return request({
    url: `/api/visualdev/Base/${modelId}/FieldDataSelect`,
    method: 'GET',
    data
  })
}
// 删除数据
export function deleteModel(modelId, id) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/${id}`,
    method: 'DELETE'
  })
}
// 批量删除数据
export function batchDelete(modelId, ids) {
  return request({
    url: `/api/visualdev/OnlineDev/batchDelete/${modelId}`,
    method: 'post',
    data: { ids }
  })
}
// 导出
export function exportModel(modelId, data) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/Actions/Export`,
    method: 'POST',
    data
  })
}
// 下载模板
export function getTemplate(modelId) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/Template`,
    method: 'GET'
  })
}
// 获取功能下拉框列表
export function getFeatureSelector(data) {
  return request({
    url: '/api/visualdev/Base/Selector',
    method: 'GET',
    data
  })
}
// App预览(后台APP表单设计)
export function Preview(data) {
  return request({
    url: `/api/visualdev/OnlineDev/App/Preview`,
    method: 'post',
    data: { data }
  })
}
// 导出模板
export function exportData(modelId) {
  return request({
    url: `/api/visualdev/OnlineDev/${modelId}/Actions/ExportData`,
    method: 'post'
  })
}

// 获取岗位/角色/用户权限树形结构及数据
export const getAuthorizeValues = (objectId, data) => {
  return request({
    url: `/api/permission/Authority/Data/${objectId}/Values`,
    method: 'POST',
    data
  })
}

// 更新岗位/角色/用户权限
export const updateAuthorizeList = (objectId, data) => {
  return request({
    url: `/api/permission/Authority/Data/${objectId}`,
    method: 'PUT',
    data
  })
}

// 批量设置权限
export const updateBatchAuthorize = (data) => {
  return request({
    url: `/api/permission/Authority/Data/Batch`,
    method: 'POST',
    data
  })
}
// 获取功能权限数据
export const getModelData = (id, ObjectType) => {
  return request({
    url: `/api/permission/Authority/Model/${id}/${ObjectType}`,
    method: 'GET'
  })
}
// 设置/更新功能权限
export const setModelData = (id, data) => {
  return request({
    url: `/api/permission/Authority/Model/${id}`,
    method: 'PUT',
    data
  })
}

// 获取菜单列表（下拉框）
export const getSelectorAll = data => {
  return request({
    url: '/api/visualdev/Portal/Selector/All',
    method: 'GET',
    data
  })
}

// 获取接口列表下拉框
export function getDataInterfaceSelector() {
  return request({
    url: '/api/system/DataInterface/Selector',
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

// 获取接口列表(工作流选择时调用，带分页)
export function getDataInterfaceSelectorList(data) {
  return request({
    url: '/api/system/DataInterface/getList',
    method: 'GET',
    data
  })
}

// 获取接口数据
export function getDataInterfaceRes(id, data) {
  return request({
    url: `/api/system/DataInterface/${id}/Actions/Preview`,
    method: 'POST',
    data: data || {}
  })
}

// 获取通知公告
export function getNotice() {
  return request({
    url: '/api/visualdev/Dashboard/Notice',
    method: 'get'
  })
}
// 获取未读邮件
export function getEmail() {
  return request({
    url: '/api/visualdev/Dashboard/Email',
    method: 'get'
  })
}

// 获取待办事项
export function getFlowTodo() {
  return request({
    url: '/api/visualdev/Dashboard/FlowTodo',
    method: 'get'
  })
}

// 获取我的待办
export function getFlowTodoCount() {
  return request({
    url: '/api/visualdev/Dashboard/FlowTodoCount',
    method: 'get'
  })
}


