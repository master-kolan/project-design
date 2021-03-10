import { createRouter,createWebHashHistory} from "vue-router";

const FileManagement = () => import( '/src/views/FileManagement');
const TerrianDownload = () => import( '/src/views/TerrianDownload');
const Test = () => import('/src/components/CesiumExample/No01-init');
const routes = [
    { path: "/", redirect: "/terrian" },
    { path: '/file', component: FileManagement, name: 'fileManagement'},
    { path: '/terrian', component: TerrianDownload, name: 'terrianDownload'},
    { path: '/test', component: Test, name: 'test'}
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})