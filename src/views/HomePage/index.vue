<template>
    <div class="home-page">
        <div class="home-page-slider">
            <div class="menu-title">
                <img alt="product logo" src="../../assets/logo.png" />
                <span> 方案设计师 2021</span>
            </div>
            <div class="menu-content">
                <ul>
                    <li class="menu-item">
                        <UserOutlined/>
                        <router-link :to="{name: 'userManagement'}">
                            <span class="menu-item-name"> 用户管理 </span>
                        </router-link>
                    </li>
                    <li class="menu-item">
                        <icon-font type="icon-bridge" />
                        <router-link :to="{name: 'bridgeTable'}">
                            <span class="menu-item-name"> 桥梁表管理 </span>
                        </router-link>
                    </li>
                    <li class="menu-item">
                        <FileOutlined/>
                        <router-link :to="{name: 'fileManagement'}">
                            <span class="menu-item-name"> 通用图管理 </span>
                        </router-link>
                    </li>
                    <li class="menu-item">
                        <ProjectOutlined/>
                        <router-link :to="{name: 'terrianDownload'}">
                            <span class="menu-item-name"> 地形下载
                            </span>
                        </router-link>
                    </li>
                </ul>
            </div>
            <div class="menu-bottom">
                <div>
                    <PlusOutlined />
                    <span>新建项目</span>
                </div>
            </div>
        </div>
        <div class="home-page-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    import { UserOutlined, FileOutlined, PlusOutlined, ProjectOutlined, createFromIconfontCN } from '@ant-design/icons-vue';
    const IconFont = createFromIconfontCN({
        scriptUrl: '//at.alicdn.com/t/font_2491883_2cc5hw1o0la.js',
    });
    export default {
        name: "index",
        components: {
            UserOutlined,
            PlusOutlined,
            FileOutlined,
            ProjectOutlined,
            IconFont,
        }
    }
</script>

<style scoped>
    .home-page {
        display: flex;
    }
    .home-page-slider {
        background: #132434;
        height: 100vh;
        flex: 0 0 200px;
        border-radius: 15px 0 0 15px;
        color: #dbdfeb;
    }
    .menu-title {
        height: 60px;
        display: flex;
        align-items: center;
    }
    .menu-title img {
        margin: 15px;
        width: 30px;
    }
    .menu-content {
        height: calc(100vh - 160px);
        overflow: auto;
    }
    .menu-content ul {
        list-style: none;
        padding: 0;
        border: 0;
    }
    .menu-content .menu-item {
        margin-left: 40px;
        height: 40px;
        display: flex;
        align-items: center;
    }
    .menu-item-name {
        margin-left: 15px;
    }
    .menu-bottom {
        height: 100px;
        background: #2e3c49;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .home-page-content {
        flex: auto;
        display: flex;
        flex-direction: column;
    }
</style>