import {getBridgeList} from '/src/api/bridge'

const state = {
    loading: false,
    bridgeList: [],
    total: 0
}

const getters = {
    loading: (state) => state.loading,
    bridgeList: (state) => state.bridgeList,
    total: (state) => state.total
}

const mutations = {
    /**
     * @description 更新UserInfo
     * @param {*} state
     * @param { 桥梁列表 } listInfo
     */
    setBridgeList(state, listInfo) {
        const { count, list} = listInfo;
        state.loading = false;
        state.total = count;
        state.bridgeList = (list || []).map(item => {
            return {
                ...item,
                topStruct: JSON.parse(item.topStruct),
                bottomStruct: JSON.parse(item.bottomStruct)
            }
        });
    },
    listLoading(state) {
        state.loading = true;
    }
}

const actions = {
    /**
     * @description 获取文件列表
     * @param {*} { commit }
     * @param {*} searchCond
     */
    async getBridgeList({ commit }, searchCond) {
        commit('listLoading');
        const  listInfo = await getBridgeList(searchCond);
        commit('setBridgeList', listInfo);
    },
}
export default { state, getters, mutations, actions, namespaced: true }
