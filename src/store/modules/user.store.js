import {getUserList} from '/src/api/user'

const state = {
    loading: false,
    userList: [],
    total: 0
}

const getters = {
    loading: (state) => state.loading,
    userList: (state) => state.userList,
    total: (state) => state.total
}

const mutations = {
    /**
     * @description 更新UserInfo
     * @param {*} state
     * @param { 用户列表 } userInfo
     */
    getUSerList(state, userInfo) {
        const { count, list} = userInfo;
        state.loading = false;
        state.total = count;
        state.userList = list;
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
    async getUserList({ commit }, searchCond) {
        commit('listLoading');
        const userInfo = await getUserList(searchCond);
        commit('getUSerList', userInfo);
    },
}
export default { state, getters, mutations, actions, namespaced: true }
