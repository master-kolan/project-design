<template>
    <div class="content">
        <div class="login-input">
            <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="login">
                <a-form-item label="Note">
                    <a-input
                        v-decorator="[
                          'password',
                          { rules: [{ required: true, message: '用户名不能为空' }] },
                        ]"
                        placeholder="请输入用户名"
                    >
                </a-form-item>
                <a-form-item label="Gender">
                    <a-input
                        v-decorator="[
                          'password',
                          { rules: [{ required: true, message: '密码不能为空' }] },
                        ]"
                        placeholder="请输入密码"
                    >
                    </a-input>
                </a-form-item>
                <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
                    <a-button type="primary" html-type="submit">
                        开始
                    </a-button>
                </a-form-item>
            </a-form>
            <div class="tips">
                <span>还没有帐号，立即注册</span>
            </div>
        </div>
        <div class="login-side">

        </div>
    </div>
</template>

<script>
    export default {
        name: "index"
    }
</script>

<style scoped>

</style>