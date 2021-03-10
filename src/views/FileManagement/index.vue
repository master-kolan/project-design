<template>
    <div class="header">
        <caret-left-outlined/>
        <span class="header-title"> 附件管理</span>
    </div>
    <div class="content">
        <div class="file-upload">
            <a-upload
                    list-type="picture"
                    action="//jsonplaceholder.typicode.com/posts/"
                    :preview-file="previewFile"
            >
                <a-button>  <UploadOutlined/> Upload </a-button>
            </a-upload>
        </div>
    </div>
</template>
<script>
    import {CaretLeftOutlined, UploadOutlined} from "@ant-design/icons-vue";
    export default {
        components: {
            CaretLeftOutlined,
            UploadOutlined
        },
        methods: {
            previewFile(file) {
                console.log(file);
            },
        },
    };
</script>

<style scoped>
    .header {
        height: 60px;
        padding: 15px;
        font-size: 20px;
        font-weight: 400;
        display: flex;
        align-items: center;
    }
    .header-title {
        margin-left: 15px;
        text-align: center;
    }
    .content {
        flex: auto;
        padding: 10px;
        background: #f0f4f7;
    }
    .file-upload {
        background: #fff;
        height: 100%;
        padding: 20px;
    }
</style>