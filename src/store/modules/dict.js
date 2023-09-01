import { listSimpleDictDatas } from '@/api/system/dict/data'

const state = {
  /**
   * 数据字典 MAP
   * key：数据字典大类枚举值 dictType
   * dictValue：数据字典小类数值 {dictValue: '', dictLabel: ''} 的数组
   */
  dictDatas: {}
}

const mutations = {
  SET_DICT_DATAS: (state, dictDatas) => {
    state.dictDatas = dictDatas
  }
}

const actions = {
  loadDictDatas({ commit }) {
    listSimpleDictDatas().then(response => {
      // 如果未加载到数据，则直接返回
      if (!response || !response.data) {
        return;
      }
      // 设置数据
      const dictDataMap = {}
      response.data.forEach(dictData => {
        // 获得 dictType 层级
        const enumValueObj = dictDataMap[dictData.dictType]
        if (!enumValueObj) {
          dictDataMap[dictData.dictType] = []
        }
        // 处理 dictValue 层级
        dictDataMap[dictData.dictType].push({
          value: dictData.value,
          label: dictData.label,
          colorType: dictData.colorType,
          cssClass: dictData.cssClass,
        })
      })
      // 存储到 Store 中
      commit('SET_DICT_DATAS', dictDataMap)
    })
  },
  // adapter for extn dictionary
  getDictionaryData({ state, dispatch }, info) {
    return new Promise(async resolve => {
      let json = []
      if (!state.dictDatas.length) {
        await dispatch('loadDictDatas')
      }
      let dictDataMap = state.dictDatas
      if (info.sort) {
        let dictDatas =  dictDataMap[info.sort];
        if(!dictDatas){
          // try query again by dictType
        }
        if (!dictDatas || !dictDatas.length) return resolve([])
        if (!info.id) {
          // id, enCode, fullName
          json = []
          for (const dictData of dictDatas) {
            json.push({
              id: dictData.id,
              encode: dictData.value,
              fullName: dictData.label,
              value: dictData.value,
              label: dictData.label
            })
          }
        } else {
          // id -> value
          let label = ''
          let value = info.id + '' // 强制转换成字符串，因为 DictData 小类数值，是字符串
          for (const dictData of dictDatas) {
            if (dictData.value === value) {
              label = dictData.label
            }
          }
          json = {
            id: info.id,
            encode: value,
            fullName: label,
            value: value,
            label: label
          }
        }
      }
      resolve(json)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
