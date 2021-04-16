import { createApp } from 'vue'
import App from './App.vue'
import 'cesium/Widgets/widgets.css'
import { router } from './route/index'
import store from './store';
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
require('leaflet/dist/leaflet.css')
createApp(App).use(store).use(router).use(Antd).mount('#app')
