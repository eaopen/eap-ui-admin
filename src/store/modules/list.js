const state = {
    configs: localStorage.getItem('LIST_CONFIGS')?JSON.parse(localStorage.getItem('LIST_CONFIGS')): {}
  };
  
  const mutations = {
      SET_LIST_FILTER(state, data){
        if(!state.configs[data.code]){
          state.configs[data.code] = {}
        }
        state.configs[data.code]['filter'] = data.filter
        state.configs[data.code]['updateTime'] = Date.parse(new Date())
        console.log(state.configs)
      },
      SET_LIST_SORT(state, data){
        if(!state.configs[data.code]){
          state.configs[data.code] = {}
        }
        state.configs[data.code]['sort'] = data.sort
        state.configs[data.code]['updateTime'] = Date.parse(new Date())
      },
      SET_LIST_SELECTS(state, data){
        if(!state.configs[data.code]){
          state.configs[data.code] = {}
        }
        state.configs[data.code]['selects'] = data.selects
        state.configs[data.code]['updateTime'] = Date.parse(new Date())
      },
      SET_LIST_COLUMNS(state, data){
        if(!state.configs[data.code]){
          state.configs[data.code] = {}
        }
        state.configs[data.code]['columns'] = data.columns
        state.configs[data.code]['updateTime'] = Date.parse(new Date())
      },
      SET_LIST_PAGESIZE(state, data){
        if(!state.configs[data.code]){
          state.configs[data.code] = {}
        }
        state.configs[data.code]['pagesize'] = data.pagesize
        state.configs[data.code]['updateTime'] = Date.parse(new Date())
      },
      SET_LIST_PAGE(state, data){
        if(!state.configs[data.code]){
          state.configs[data.code] = {}
        }
        state.configs[data.code]['page'] = data.page
        state.configs[data.code]['updateTime'] = Date.parse(new Date())
      },
      SET_LIST_CHANGEROWS(state, data){
        if(!state.configs[data.code]){
          state.configs[data.code] = {}
        }
        state.configs[data.code]['changeRows'] = data.changeRows
        state.configs[data.code]['updateTime'] = Date.parse(new Date())
      },
      SET_LIST_VERSION(state, data){
        if(!state.configs[data.code]){
          state.configs[data.code] = {}
        }
        state.configs[data.code]['version'] = data.version
        state.configs[data.code]['updateTime'] = Date.parse(new Date())
      },
      REMOVE_LIST_CONFIGS(state, code){
        delete state.configs[code]
        localStorage.setItem('LIST_CONFIGS', JSON.stringify(state.configs))
      }
  };
  
  const actions = {
     setListConfigs({commit}, config){
        console.log('写入配置:', config)
        if(!config.code){
          return
        }
        if(config.filter){
          commit('SET_LIST_FILTER',{code: config.code, filter: config.filter})
        }
        if(config.sort){
          commit('SET_LIST_SORT',{code: config.code, sort: config.sort})
        }
        if(config.selects){
          commit('SET_LIST_SELECTS',{code: config.code, selects: config.selects})
        }
        if(config.columns){
          commit('SET_LIST_COLUMNS',{code: config.code, columns: config.columns})
        }
        if(config.pagesize){
          commit('SET_LIST_PAGESIZE',{code: config.code, pagesize: config.pagesize})
        }
        if(config.page){
          commit('SET_LIST_PAGE',{code: config.code, page: config.page})
        }
        if(config.changeRows){
          commit('SET_LIST_CHANGEROWS',{code: config.code, changeRows: config.changeRows})
        }
        if(config.version){
          commit('SET_LIST_VERSION',{code: config.code, version: config.version})
        }
        localStorage.setItem('LIST_CONFIGS', JSON.stringify(state.configs))
  
     },
     removeListConfigs({commit}, code){
      commit('REMOVE_LIST_CONFIGS', code)
     }
  };
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
  };
  