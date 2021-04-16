import {getFileList} from '/src/api/file'

const state = {
    loading: false,
    fileList: [],
    total: 0
}

const getters = {
    loading: (state) => state.loading,
    fileList: (state) => state.fileList,
    total: (state) => state.total
}

const mutations = {
    /**
     * @description 更新UserInfo
     * @param {*} state
     * @param { 文件列表 } listInfo
     */
    getFileList(state, listInfo) {
        const { count, list} = listInfo;
        state.loading = false;
        state.total = count;
        state.fileList = list;
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
    async getFileList({ commit }, searchCond) {
        commit('listLoading');
        const  listInfo = await getFileList(searchCond);
        commit('getFileList', listInfo);
    },
}
export default { state, getters, mutations, actions, namespaced: true }
