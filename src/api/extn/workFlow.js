import request from '@/utils/request'

//查看
export function getFormInfo(id) {
    return request({
        url: `/api/flowForm/Form/${id}`,
        method: 'get'
    })
}

// 获取流程发起节点表单信息
export function getFlowFormInfo(id) {
    return request({
        url: `/api/workflow/Engine/flowTemplate/${id}/FormInfo`,
        method: 'get'
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

// 判断是否有候选人
export function Candidates(id, data) {
    return request({
        url: `/api/workflow/Engine/FlowBefore/Candidates/${id}`,
        method: 'post',
        data
    })
}
// 获取候选人列表（分页）
export function CandidateUser(id, data) {
    return request({
        url: `/api/workflow/Engine/FlowBefore/CandidateUser/${id}`,
        method: 'post',
        data
    })
}


// 列表流程小idListAll
export function FlowEnginePageChildList(data) {
    return request({
        url: `/api/workflow/Engine/flowTemplate/PageChildListAll`,
        method: 'get',
        data
    })
}


// 新建流程表单
export function Create(data) {
    return request({
        url: `/api/workflow/Engine/FlowEngineForm`,
        method: 'post',
        data
    })
}
// 修改流程表单
export function Update(data) {
    return request({
        url: `/api/workflow/Engine/FlowEngineForm/${data.id}`,
        method: 'PUT',
        data,
    })
}

// 委托 通过list<flowId>获取流程引擎列表
export function FlowEngineListByIds(data) {
    return request({
        url: `/api/workflow/Engine/flowTemplate/getflowList`,
        method: 'post',
        data
    })
}