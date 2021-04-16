<template>
    <div class="login-container">
        <a-row>
            <a-col :xs="0" :md="0" :sm="12" :lg="14" :xl="16"></a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="10" :xl="6">
                <div class="login-container-form">
                    <div class="login-container-title">欢迎来到 {{ title }}</div>
                    <a-form :model="form" @submit="handleSubmit" :label-col="labelCol" :wrapper-col="wrapperCol">
                        <a-form-item>
                            <a-input v-model:value="form.username" placeholder="Username" style="height: 45px">
                                <template v-slot:prefix>
                                    <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
                                </template>
                            </a-input>
                        </a-form-item>
                        <a-form-item>
                            <a-input
                                    v-model:value="form.password"
                                    type="password"
                                    placeholder="Password"
                                    style="height: 45px"
                            >
                                <template v-slot:prefix>
                                    <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
                                </template>
                            </a-input>
                        </a-form-item>
                        <a-form-item>
                            <a-button
                                    class="submit-button"
                                    type="primary"
                                    html-type="submit"
                                    :disabled="form.username === '' || form.password === ''"
                            >
                                登录
                            </a-button>
                        </a-form-item>
                    </a-form>
                </div>
            </a-col>
        </a-row>
    </div>
</template>

<script>
    import {UserOutlined, LockOutlined} from "@ant-design/icons-vue";
    import {mapActions} from "vuex";
    export default {
        name: "index",
        components: {
            UserOutlined,
            LockOutlined
        },
        data() {
            return {
                title: "方案设计师",
                labelCol: {
                    xs: { span: 0 },
                    sm: { span: 0 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 24 },
                },
                form: {
                    username: "",
                    password: ""
                },
                redirect: undefined,
            }
        },
        watch: {
            $route: {
                handler(route) {
                    this.redirect = (route.query && route.query.redirect) || '/'
                },
                immediate: true,
            },
        },
        mounted() {
        },
        methods: {
            ...mapActions({
                login: 'auth/login'
            }),
            async handleSubmit() {
                await this.login(this.form);
            },
        }
    }
</script>

<style lang="less">
    .login-container {
        height: 100vh;
        background: url('~@/assets/login_images/login_background.png');
        background-size: cover;
        &-form {
             height: 320px;
             padding: 4vh;
             margin-top: calc((100vh - 300px) / 2);
             margin-right: 20px;
             margin-left: 20px;
             background: url('~@/assets/login_images/login_form.png');
             background-size: 100% 100%;
             border-radius: 10px;
             box-shadow: 0 2px 8px 0 rgba(7, 17, 27, 0.06);
         }
        &-title {
             margin-bottom: 30px;
             font-size: 20px;
             color: #fff;
         }
        &-tips {
             position: fixed;
             bottom: 10px;
             width: 100%;
             height: 40px;
             color: rgba(255, 255, 255, 0.856);
             text-align: center;
         }
    }
    .submit-button {
        width: 100%;
        height: 45px;
        border-radius: 99px;
    }
</style>