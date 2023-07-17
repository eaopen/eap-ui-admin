import request from "@/utils/request";


// 获取列表配置
export function getListConfig(code) {
    return request({
        url: '/form/formCustSql/view/vo2_' + code,
        method: 'post'
    })
}

// 获取列表数据
export function getListData(code, data) {
    return request({
        url: '/form/formCustSql/view/list_' + code,
        method: 'post',
        data:{
            curPage: data.curPage,
            pageSize: data.pageSize,
            params: data.params
        }
    })
}

// 获取form配置
export function getFormConfig(params) {
    return request({
        url: '/form/formDefData/getData',
        method: 'post',
        params
    })
}

// 自定义对话框
export function getCustomObject(key){
    return request({
        url: '/form/formCustDialog/getObject?key='+key,
        method: 'post',
    })
}