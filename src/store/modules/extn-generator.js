import { getOrganizeTree } from "@/api/extn/permission";
import { getDepartmentSelector } from "@/api/permission/department";
import { getDictionaryType } from "@/api/extn/dictionary";
import { getGroupSelector } from "@/api/permission/group";
import jnpf from '@/utils/extn';
const state = {
  companyTree: [],
  depTree: [],
  departmentList: [],
  groupTree: [],
  groupList: [],
  dicTree: [],
  formItemList: [],
  subTable: [],
  allTable: [],
  dataBase: '',
  hasTable: false,
  relationData: {},
  dynamicModelExtra: {},
  ruleData:[]
};

const mutations = {
  SET_FILTER_DATA:(state, ruleData) => {
    state.ruleData = ruleData
  },
  SET_COMPANY_TREE: (state, companyTree) => {
    state.companyTree = companyTree;
  },
  SET_DEP_TREE: (state, depTree) => {
    state.depTree = depTree;
  },
  SET_DEP_LIST: (state, data) => {
    state.departmentList = data;
  },
  SET_GROUP_TREE: (state, groupTree) => {
    state.groupTree = groupTree;
  },
  SET_GROUP_LIST: (state, data) => {
    state.groupList = data;
  },
  SET_DIC_TREE: (state, dicTree) => {
    state.dicTree = dicTree;
  },
  UPDATE_FORMITEM_LIST(state, list) {
    state.formItemList = list;
  },
  UPDATE_SUB_TABLE(state, subTable) {
    state.subTable = subTable;
  },
  SET_ALL_TABLE(state, allTable) {
    state.allTable = allTable;
  },
  SET_DATABASE(state, dataBase) {
    state.dataBase = dataBase;
  },
  SET_TABLE(state, val) {
    state.hasTable = val;
  },
  UPDATE_RELATION_DATA(state, val) {
    state.relationData = val;
  },
  SET_DYNAMIC_MODEL_EXTRA(state, val) {
    state.dynamicModelExtra = val;
  }
};

const actions = {
  getCompanyTree({ state, commit }) {
    return new Promise((resolve, reject) => {
      if (!state.companyTree.length) {
        getOrganizeTree().then(res => {
          commit("SET_COMPANY_TREE", res.data.list);
          resolve(res.data.list);
        }).catch(error => {
          reject(error);
        });
      } else {
        resolve(state.companyTree);
      }
    });
  },
  getDepTree({ state, commit }) {
    return new Promise((resolve, reject) => {
      if (!state.depTree.length) {
        getDepartmentSelector().then(res => {
          commit("SET_DEP_TREE", res.data.list);
          let data = jnpf.treeToArray(res.data.list)
          commit("SET_DEP_LIST", data);
          resolve(res.data.list);
        }).catch(error => {
          reject(error);
        });
      } else {
        resolve(state.depTree);
      }
    });
  },
  getGroupTree({ state, commit }) {
    return new Promise((resolve, reject) => {
      if (!state.groupTree.length) {
        getGroupSelector().then(res => {
          commit("SET_GROUP_TREE", res.data);
          let data = jnpf.treeToArray(res.data, 'group')
          commit("SET_GROUP_LIST", data);
          resolve(res.data);
        }).catch(error => {
          reject(error);
        });
      } else {
        resolve(state.groupTree);
      }
    });
  },
  getDicTree({ state, commit }) {
    return new Promise((resolve, reject) => {
      if (!state.dicTree.length) {
        getDictionaryType().then(res => {
          commit("SET_DIC_TREE", res.data.list);
          resolve(res.data.list);
        }).catch(error => {
          reject(error);
        });
      } else {
        resolve(state.dicTree);
      }
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
