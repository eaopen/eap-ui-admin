import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import tagsView from './modules/tagsView'
import permission from './modules/permission'
import settings from './modules/settings'
import dict from './modules/dict'
import customDialog from './modules/customDialog'
import list from './modules/list'
import extnBase from './modules/extnBase'
import extnGenerator from './modules/extnGenerator'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    user,
    tagsView,
    permission,
    settings,
    dict,
    list,
    extnBase,
    extnGenerator,
    customDialog
  },
  getters
})

export default store
