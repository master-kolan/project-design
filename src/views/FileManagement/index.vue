<template>
    <div class="header">
        <caret-left-outlined style="color: white"/>
        <span class="header-title">通用图管理</span>
    </div>
    <div class="content">
        <div class="content-box">
            <div class="search-box">
                <a-input v-model:value="search.fileName" placeholder="图纸名称" class="search-input"> </a-input>
                <a-button type="primary" @click="handleSearch"><SearchOutlined/>搜索</a-button>
                <a-button style="margin-left: 10px;"><ReloadOutlined/>重置</a-button>
            </div>
            <div class="action-box">
                <a-button type="primary" @click="addFormVisible = true"><PlusOutlined/>添加图纸</a-button>
            </div>
            <div class="file-table">
                <a-table
                    :columns="columns"
                    :data-source="data"
                    :pagination="pagination"
                    :loading="loading"
                    rowKey="_id"
                    @change="handleTableChange"
                    bordered>
                    <template #action="{ record }">
                        <a-button type="primary" size="small" style="margin-right: 5px" @click="handleDownload(record.path, record.fileName)">
                            <DownloadOutlined /> 下载
                        </a-button>
                        <a-button type="primary" size="small" style="margin-right: 5px" @click="editFormOpen(record)">
                            <EditOutlined /> 编辑
                        </a-button>
                        <a-button type="danger" size="small" @click="handleDelete(record)">
                            <DeleteOutlined /> 删除
                        </a-button>
                    </template>
                </a-table>
            </div>
        </div>
    </div>
    <a-modal
        v-model:visible="addFormVisible"
        title="添加图纸"
        @ok="handleAdd">
        <a-form :model="addForm" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-row :gutter="24">
                <a-col :span="12">
                    <a-form-item label="图纸名称">
                        <a-input v-model:value="addForm.fileName">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="构件类型">
                        <a-input v-model:value="addForm.type">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="车道数">
                        <a-input v-model:value="addForm.lanesNum">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="跨径">
                        <a-input v-model:value="addForm.span">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="斜度">
                        <a-input v-model:value="addForm.slope">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="荷载">
                        <a-input v-model:value="addForm.payload">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="设计车速">
                        <a-input v-model:value="addForm.designSpeed">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="桥面宽度">
                        <a-input v-model:value="addForm.bridgeWidth">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="文件上传">
                        <a-upload
                            :multiple="false"
                            :file-list="addForm.fileList"
                            :remove="handleAddFormRemove"
                            :before-upload="beforeAddFormUpload"
                        >
                            <a-button>  <UploadOutlined/> Upload </a-button>
                        </a-upload>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </a-modal>
    <a-modal
            v-model:visible="editFormVisible"
            title="编辑图纸"
            @ok="handleEdit">
        <a-form :model="editForm" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-row :gutter="24">
                <a-col :span="12">
                    <a-form-item label="图纸名称">
                        <a-input v-model:value="editForm.fileName">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="构件类型">
                        <a-input v-model:value="editForm.type">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="车道数">
                        <a-input v-model:value="editForm.lanesNum">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="跨径">
                        <a-input v-model:value="editForm.span">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="斜度">
                        <a-input v-model:value="editForm.slope">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="荷载">
                        <a-input v-model:value="editForm.payload">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="设计车速">
                        <a-input v-model:value="editForm.designSpeed">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="桥面宽度">
                        <a-input v-model:value="editForm.bridgeWidth">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="重新上传">
                        <a-upload
                                :multiple="false"
                                :file-list="editForm.fileList"
                                :remove="handleEditFormRemove"
                                :before-upload="beforeEditFormUpload"
                        >
                            <a-button>  <UploadOutlined/> Upload </a-button>
                        </a-upload>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </a-modal>
</template>
<script>
    import {CaretLeftOutlined, PlusOutlined, SearchOutlined,  ReloadOutlined, UploadOutlined, DownloadOutlined, EditOutlined, DeleteOutlined} from "@ant-design/icons-vue";
    import {createFile, uploadFile, editFile, deleteFile} from "../../api/file";
    import {notification} from "ant-design-vue";
    import {mapGetters} from "vuex";
    import store from '../../store'
    const columns = [
        {
            title: '图纸名称',
            dataIndex: 'fileName',
            key: 'fileName',
        },
        {
            title: '构件类型',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: '车道数',
            dataIndex: 'lanesNum',
            key: 'lanesNum',
        },
        {
            title: '跨径',
            dataIndex: 'span',
            key: 'span',
        },
        {
            title: '斜度',
            dataIndex: 'slope',
            key: 'slope',
        },
        {
            title: '荷载',
            dataIndex: 'payload',
            key: 'payload',
        },
        {
            title: '设计车速 ',
            dataIndex: 'designSpeed',
            key: 'designSpeed',
        },
        {
            title: '桥面宽度',
            dataIndex: 'bridgeWidth',
            key: 'bridgeWidth',
        },
        {
            title: '操作',
            key: 'action',
            width: 300,
            slots: { customRender: 'action' },
        },
    ];
    export default {
        components: {
            CaretLeftOutlined,
            PlusOutlined,
            SearchOutlined,
            ReloadOutlined,
            UploadOutlined,
            DownloadOutlined,
            EditOutlined,
            DeleteOutlined
        },
        data() {
            return {
                columns,
                search: {
                    fileName: ""
                },
                labelCol: {
                    span: 8,
                },
                wrapperCol: {
                    span: 16
                },
                pagination: {
                    total: 0,
                    current: 1,
                    pageSize: 10,
                    showTotal: total => `共 ${total} 条数据`,
                },
                addForm: {
                    fileName: "",
                    type: "",
                    lanesNum: "",
                    span: "",
                    slope: "",
                    payload: "",
                    designSpeed: "",
                    bridgeWidth: "",
                    fileList: []
                },
                editForm: {
                    fileName: "",
                    type: "",
                    lanesNum: "",
                    span: "",
                    slope: "",
                    payload: "",
                    designSpeed: "",
                    bridgeWidth: "",
                    fileList: []
                },
                addFormVisible: false,
                editFormVisible: false
            }
        },
        computed: {
          ...mapGetters({
              loading: `file/loading`,
              data: `file/fileList`,
              total: `file/total`
          })
        },
        watch: {
            total (val) {
                this.pagination.total = val;
            }
        },
        mounted() {
            this.handleSearch();
        },
        methods: {
            handleAdd() {
                let {fileList, ...fileInfo}  = this.addForm;
                uploadFile(fileList[0]).then(data => {
                    const { path } = data;
                    createFile({...fileInfo, path}).then(() =>  {
                        notification.success({
                            message: '添加图纸成功',
                            timeout: 2000,
                            position: 'top'
                        });
                        this.addFormVisible = false;
                        this.resetAddForm();
                        this.handleSearch();
                    });
                })
            },
            handleAddFormRemove() {
                this.addForm.fileList = [];
            },
            handleEditFormRemove() {
                this.editForm.fileList = [];
            },
            beforeAddFormUpload(file) {
                this.addForm.fileList = [file];
                return false;
            },
            beforeEditFormUpload(file) {
                this.editForm.fileList = [file];
                return false;
            },
            handleSearch() {
                store.dispatch('file/getFileList', {
                    pagination: this.pagination,
                    params: this.search
                });
            },
            resetAddForm() {
                this.addForm = {
                    fileName: "",
                    type: "",
                    lanesNum: "",
                    span: "",
                    slope: "",
                    payload: "",
                    designSpeed: "",
                    bridgeWidth: "",
                    fileList: []
                };
            },
            editFormOpen (record) {
                this.editForm = Object.assign(this.editForm,record);
                this.editFormVisible = true;
            },
            handleDelete(record) {
                deleteFile({
                    _id: record._id
                }).then(() => {
                    notification.success({
                        message: '删除图纸成功',
                        timeout: 2000,
                        position: 'top'
                    })
                    this.handleSearch();
                })
            },
            handleDownload(path, name) {
                let a = document.createElement('a');
                let e = document.createEvent('MouseEvents');
                e.initEvent('click', false, false);
                a.href = path;
                a.download = name + '.' + path.split('.').pop();
                a.dispatchEvent(e);
            },
            handleEdit() {
                if (this.editForm.fileList.length) {
                    let {fileList, ...fileInfo}  = this.editForm;
                    console.log(fileList, this.editForm.fileList)
                    uploadFile(fileList[0]).then(data => {
                        const { path } = data;
                        editFile({...fileInfo, path}).then(() =>  {
                            notification.success({
                                message: '修改图纸信息成功',
                                timeout: 2000,
                                position: 'top'
                            });
                            this.editFormVisible = false;
                            this.handleSearch();
                        });
                    })
                } else {
                    editFile(this.editForm).then(() =>  {
                        notification.success({
                            message: '修改图纸信息成功',
                            timeout: 2000,
                            position: 'top'
                        });
                        this.editFormVisible = false;
                        this.handleSearch();
                    });
                }
            },
            handleTableChange(pagination) {
                this.pagination.current = pagination.current;
                this.handleSearch();
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
        background: url('~@/assets/login_images/login_background.png');
        color: white;
    }
    .header-title {
        margin-left: 15px;
        text-align: center;
    }
    .content {
        padding: 10px;
        background: #f0f4f7;
        height: 100%;
    }
    .content-box {
        padding: 10px 20px;
        background: #fff;
        height: 100%;
    }
    .search-box {
        display: flex;
        margin: 10px 0;
    }
    .search-input {
        width: 200px;
        margin-right: 10px;
    }
    .action-box {
        display: flex;
        margin: 10px 0;
    }
</style>