import request from "@/utils/request";


// 获取列表配置
export function getListConfig(code) {
    return request({
        url: '/obpm-api${apiPathMap.listConfig}' + code,
        method: 'post',
        data:{
            code
        }
    })
}
// 获取列表数据
export function getListData(code, data) {
    return request({
        url: '/obpm-api${apiPathMap.listConfig}' + code,
        method: 'post',
        data:{
            curPage: data.curPage,
            pageSize: data.pageSize,
            params: data.params
        }
    })
}
