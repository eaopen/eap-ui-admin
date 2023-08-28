
import request from "@/utils/request";

// 获取任务ID
export function getInstanceId(id){
    return request({
        url:  '/obpm-api/bpm/form/getBpmInstanceId/'+ id,
        method: 'get'
    })
}

// 获取节点审批记录
export function getInstanceData2(row){
    return request({
        url: '/obpm-api/bpm/instance/getInstanceData2',
        method: 'post',
        params:{
            instanceId: row.instId,
            readonly: true,
            nodeId: row.taskKey
        }
    })
}

// 获取任务详情
export function getTaskDetail(taskid){
    return request({
        url: '/obpm-api/bpm/task/getTaskData',
        method: 'post',
        params:{
            taskId: taskid
        }
    })
}

// 获取审批历史
export function getHistory(instId){
    return request({
        url: '/obpm-api/bpm/instance/getOpinionEx',
        method: 'post',
        params:{
            instId: instId
        }
    })
}

// 获取当前节点
export function getInstance(instId){
    return request({
        url: '/obpm-api/bpm/instance/getInstanceAndChildren',
        method: 'post',
        params:{
            id: instId
        }
    })
}

// 获取流程图 instanceId defId taskId
export function getFlowImage(params){
    return request({
        url: '/obpm-api/bpm/instance/getFlowImageInfoEx',
        method: 'post',
        params: params
    })
}
