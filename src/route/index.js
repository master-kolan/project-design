import { createRouter,createWebHashHistory} from 'vue-router';

const LoginComponent = () => import('/src/views/Login' )
const HomePage = () => import('/src/views/HomePage')
const UserManagement = () => import('/src/views/UserManagement');
const BridgeTable = () => import('/src/views/BridgeTable')
const FileManagement = () => import('/src/views/FileManagement');
const TerrianDownload = () => import('/src/views/TerrianDownload');

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginComponent, name: 'login'},
    {
        path: '/home', component: HomePage, name: 'home',
        children: [
            { path: '/', redirect: '/file' },
            {path: '/user', component: UserManagement, name: 'userManagement'},
            {path: '/bridge', component: BridgeTable, name: 'bridgeTable'},
            {path: '/file', component: FileManagement, name: 'fileManagement'},
            {path: '/terrian', component: TerrianDownload, name: 'terrianDownload'},
        ]
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})