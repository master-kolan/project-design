import { createApp } from 'vue'
import App from './App.vue'
import 'cesium/Widgets/widgets.css'
import { router } from './route/index'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
// import config from '/vue.config'
require('leaflet/dist/leaflet.css')
createApp(App).use(router).use(Antd).mount('#app')
