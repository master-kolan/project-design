import axios from "axios";
// import { refreshToken } from "./user";
import { notification } from 'ant-design-vue'
import {router} from '../route'

// const tokenPre = 'bare:'
// let isTokenRefreshing = false;

axios.interceptors.request.use(config => {
    let token = window.localStorage.getItem("accessToken");
    if (token) {
        config.headers["authorization"] =  "Bearer " + token;
    }
    return config;
    // let token = window.localStorage.getItem(this.$store.getters.userInfo);
    // if (config.url.includes('/login')) {
    //     return config;
    // }
    // if (token) {
    //     config.headers.common.Authorization = tokenPre + token;
    // }
    // let serverTokenExpire = window.localStorage.getItem(store.state.common.tokenExpire);
    // // 判断token是否过期
    // if (serverTokenExpire && isTokenExpire(serverTokenExpire) && !config.url.includes(Vue.prototype.$URLS.refreshToken)) {
    //     // 判断token是否已经刷新过
    //     if (!isTokenRefreshing) {
    //         isTokenRefreshing = true;
    //         // 请求刷新token
    //         refreshToken().then(({ data: { token, expire } }) => {
    //             isTokenRefreshing = false;
    //             window.sessionStorage.setItem(store.state.common.keyToken, token);
    //             window.sessionStorage.setItem(store.state.common.tokenExpire, expire);
    //         }).catch(err => {
    //             // 请求失败，清空缓存，返回登录页
    //             isTokenRefreshing = false;
    //             window.sessionStorage.clear();
    //             window.localStorage.clear();
    //             router.push('/login');
    //         });
    //     }
    //     return retry;
    // } else {
    //     return config;
    // }
}, (err) => {
    notification.warning({
        message: '服务器连接不上,请重新登陆',
        color: 'negative',
        timeout: 5000,
        position: 'top'
    });
    router.push({path: '/login'}).then(() => {});
    return Promise.reject(err);
});

axios.interceptors.response.use((config) => {
    const {code, data, errorMessage} = config.data;
    if (code === 200) {
        return Promise.resolve(data);
    } else {
        notification.error({
            message: errorMessage,
            color: 'negative',
            timeout: 5000,
            position: 'top'
        });
        return Promise.reject(errorMessage)
    }
}, (err) => {
    console.log(err.state);
    notification.warning({
        message: '用户登录过期,请重新登陆',
        color: 'negative',
        timeout: 5000,
        position: 'top'
    });
    router.push({path: '/login'}).then(() => {});
    return Promise.reject(err);
});


// function isTokenExpire(serverTokenExpire) {
//     return getUTCTime(new Date()) >= getUTCTime(new Date(serverTokenExpire));
// }
// // 获取UTC时间
// function getUTCTime(now) {
//     let year = now.getUTCFullYear();
//     let month = now.getUTCMonth();
//     let date = now.getUTCDate();
//     let hours = now.getUTCHours();
//     let minutes = now.getMinutes();
//     let seconds = now.getUTCSeconds();
//     let ms = now.getUTCMilliseconds();
//     return Date.UTC(year, month, date, hours, minutes, seconds, ms);
// }

export default axios;