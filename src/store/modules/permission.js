import {constantRoutes} from '@/router'
//import {getRouters} from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView';
import agList from '@/views/obpm/agList.vue'
import {toCamelCase} from "@/utils";
import { extn } from "@/utils/extn"

const unJoinList = ['obpm/listGrid','model/']
const permission = {
  state: {
    routes: [],
    addRoutes: [],
    sidebarRouters: [], // 左侧边菜单的路由，被 Sidebar/index.vue 使用
    topbarRouters: [], // 顶部菜单的路由，被 TopNav/index.vue 使用
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    SET_DEFAULT_ROUTES: (state, routes) => {
      state.defaultRoutes = constantRoutes.concat(routes)
    },
    SET_TOPBAR_ROUTES: (state, routes) => {
      state.topbarRouters = routes
    },
    SET_SIDEBAR_ROUTERS: (state, routes) => {
      state.sidebarRouters = routes
    },
  },
  actions: {
    /**
     * 生成路由
     *
     * @param commit commit 函数
     * @param menus  路由参数
     */
    GenerateRoutes({commit}, menus) {
      return new Promise(resolve => {
        // 将 menus 菜单，转换为 route 路由数组
        // console.log('menus', menus)
        let strMenus = JSON.stringify(menus)
        const sdata = JSON.parse(strMenus) // 【重要】用于菜单中的数据
        const rdata = JSON.parse(strMenus) // 用于最后添加到 Router 中的数据

        const sidebarRoutes = filterAsyncRouter(sdata)
        const rewriteRoutes = filterAsyncRouter(rdata, false, true)
        rewriteRoutes.push({path: '*', redirect: '/404', hidden: true})
        commit('SET_ROUTES', rewriteRoutes)
        commit('SET_SIDEBAR_ROUTERS', constantRoutes.concat(sidebarRoutes))
        commit('SET_DEFAULT_ROUTES', sidebarRoutes)
        commit('SET_TOPBAR_ROUTES', sidebarRoutes)
        resolve(rewriteRoutes)
      })
    }
  }
}

// 遍历后台传来的路由字符串，转换为组件对象,add routes lastRouter=false, type=true
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    // 处理 meta 属性
    route.meta = {
      title: route.name,
      icon: route.icon,
      noCache: !route.keepAlive,
      urlAddr: route.urlAddr || route.path,
    }
    route.hidden = !route.visible
    // 处理 name 属性
    if (route.componentName && route.componentName.length > 0) {
      route.name = route.componentName
    } else {
      // 路由地址转首字母小写驼峰，作为路由名称，适配 keepAlive
      // toCamelCase转换 -_?&=./
      route.name = toCamelCase(route.path, false)
      //console.log("route:"+route.name+",component="+route.component+",path="+route.path+",urlAddr="+route.urlAddr)
      // 如name过长可md5签名后取6位
      // 处理三级及以上菜单路由缓存问题，将 path 名字赋值给 name
      // if (route.path && route.path.indexOf("/") !== -1) {
      //   const pathArr = route.path.split("/");
      //   route.name = toCamelCase(pathArr[pathArr.length - 1], true)
      // }
    }
    // 处理 component 属性
    if (route.children) { // 父节点
      if (route.parentId === 0) {
        route.component = Layout
      } else {
        route.component = ParentView
      }
    } 
    else if(route.component) { // 根节点
      // for obpm
      if(route.path.indexOf('listGrid/')>-1 || route.component.indexOf('obpm/agGrid')>-1){
        route.name = extn.getParams(route.path).code
        route.path = '/' + extn.formatListGridPath(route.path)
        let agListCache = Object.assign({}, agList, {name: route.name})
        route.component = agListCache
      }else if(route.component.indexOf('/easyForm')>-1) {
        route.component = import("@/components/obpm/easyForm/index.vue")
      }else if(route.component.indexOf('obpm/admin')>-1 || route.component.indexOf('obpm/web')>-1){
        if(!!route.path && route.path.indexOf('?')>0){
          let [path1, queryString] = route.path.split('?');
          route.path = path1
        }
        route.component = loadView(route.component)
      }else {
        route.component = loadView(route.component)
      }
    }

    // filterChildren
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
      route.alwaysShow = route.alwaysShow !== undefined ? route.alwaysShow  : true
    } else {
      delete route['children']
      delete route['alwaysShow'] // 如果没有子菜单，就不需要考虑 alwaysShow 字段
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  let children = [];
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (!el.component && !lastRouter) {
        el.children.forEach(c => {
          if(c.path){
            if(!c.urlAddr) c.urlAddr = c.path
            c.path = el.path + '/' + c.path
          }
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter && el.path && !el.path.startsWith('obpm/list')) {
      el.path = lastRouter.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

export const loadView = (view) => { // 路由懒加载
  return (resolve) => require([`@/views/${view}`], resolve)
}

export default permission
