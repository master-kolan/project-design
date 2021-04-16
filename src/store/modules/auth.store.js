import {login, logout, refreshToken} from '/src/api/user'
import {router} from "../../route";

const state = {
    accessToken: '',
    username: '',
    avatar: '',
    role: '',
    userType: '',
    resource: ''
}
const getters = {
    accessToken: (state) => state.accessToken,
    refreshToken: (state) => state.refreshToken,
    username: (state) => state.username,
    avatar: (state) => state.avatar,
    role: (state) => state.role,
    userType: (state) => state.userType,
    resource: (state) => state.resource
}
const mutations = {
    /**
     * @description 更新UserInfo
     * @param {*} state
     * @param {*} userInfo
     */
    loginSuccess(state, userInfo) {
        state.accessToken = userInfo.accessToken;
        state.refreshToken = userInfo.refreshToken;
        state.username = userInfo.username;
        state.avatar = userInfo.avatar;
        state.role = userInfo.role;
        state.userType = userInfo.userType;
        state.resource = userInfo.resource;
    },
    refreshToken(state, token) {
        state.refreshToken = token;
    }
}

const actions = {
    /**
     * @description 登录
     * @param {*} { commit }
     * @param {*} userInfo
     */
    async login({ commit }, userInfo) {
        const user = await login(userInfo)
        const {accessToken, refreshToken} = user;
        window.localStorage.setItem('accessToken', accessToken);
        window.localStorage.setItem('refreshToken', refreshToken);
        commit('loginSuccess', user);
        await router.push('/file');
    },
    /**
     * @description 退出登录
     * @param {*} { dispatch }
     */
    async refreshToken({ commit }) {
        const { data } = await refreshToken();
        commit('refreshToken', data)
    },
    /**
     * @description 退出登录
     * @param {*} { dispatch }
     */
    async logout({ commit }) {
        await logout()
        commit('resetAll')
    }
}
export default { state, getters, mutations, actions, namespaced: true }
