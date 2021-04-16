import { createStore } from 'vuex'
import userStore from './modules/user.store';
import fileStore from './modules/file.store';
import authStore from './modules/auth.store';
import bridgeStore from './modules/bridge.store';

export default createStore({
    modules: {
        user: userStore,
        file: fileStore,
        auth: authStore,
        bridge: bridgeStore
    }
})