<template>
    <div class="header">
        <caret-left-outlined style="color: white"/>
        <span class="header-title">用户管理</span>
    </div>
    <div class="content">
        <div class="content-box">
            <div class="search-box">
                <a-input v-model:value="search.username" placeholder="用户名称" class="search-input"> </a-input>
                <a-button type="primary" @click="handleSearch"><SearchOutlined/>搜索</a-button>
                <a-button style="margin-left: 10px;"><ReloadOutlined/>重置</a-button>
            </div>
            <div class="action-box">
                <a-button type="primary" @click="addFormVisible = true"><PlusOutlined/>添加用户</a-button>
            </div>
            <div class="user-table">
                <a-table
                        :columns="columns"
                        :data-source="data"
                        :pagination="pagination"
                        :loading="loading"
                        rowKey="_id"
                        @change="handleTableChange"
                        bordered>
                    <template #action="{ record }">
                        <a-button type="primary" size="small" style="margin-right: 5px" @click="edit(record)">
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
            title="添加用户"
            @ok="handleAdd">
        <a-form :model="addForm" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-form-item label="用户名称">
                <a-input v-model:value="addForm.username">
                </a-input>
            </a-form-item>
            <a-form-item label="邮箱">
                <a-input v-model:value="addForm.email">
                </a-input>
            </a-form-item>
            <a-form-item label="用户类型">
                <a-select v-model:value="addForm.userType">
                    <a-select-option v-for="option in options" :key="option.value">
                        {{ option.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="密码">
                <a-input type="password" v-model:value="addForm.password">
                </a-input>
            </a-form-item>
        </a-form>
    </a-modal>
    <a-modal
            v-model:visible="editFormVisible"
            title="编辑用户"
            @ok="handleEdit">
        <a-form :model="editForm" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-form-item label="用户名称">
                <a-input v-model:value="editForm.username">
                </a-input>
            </a-form-item>
            <a-form-item label="邮箱">
                <a-input v-model:value="editForm.email">
                </a-input>
            </a-form-item>
            <a-form-item label="用户类型">
                <a-select v-model:value="editForm.userType">
                    <a-select-option v-for="option in options" :key="option.value">
                        {{ option.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>
        </a-form>
    </a-modal>
</template>
<script>
    import {CaretLeftOutlined, PlusOutlined, SearchOutlined,  ReloadOutlined, EditOutlined, DeleteOutlined} from "@ant-design/icons-vue";
    import {createUser, editUser, deleteUser} from "../../api/user";
    import {notification} from "ant-design-vue";
    import {mapGetters} from "vuex";
    import store from '../../store'
    const columns = [
        {
            title: '用户名称',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: '用户类型',
            dataIndex: 'userType',
            key: 'userType',
            customRender: ({text}) => {
                let option = options.find(option => option.value === text);
                return option ? option.name : "";
            }
        },
        {
            title: '操作',
            key: 'action',
            slots: { customRender: 'action' },
            width: 300,
        },
    ];
    const options = [
        {
            value: '01',
            name: '系统管理员'
        }, {
            value: '02',
            name: '权限管理员'
        }, {
            value: '03',
            name: '个人用户'
        }
    ]
    export default {
        components: {
            CaretLeftOutlined,
            PlusOutlined,
            SearchOutlined,
            ReloadOutlined,
            EditOutlined,
            DeleteOutlined
        },
        data() {
            return {
                columns,
                options,
                search: {
                    username: ""
                },
                labelCol: {
                    span: 6,
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
                    username: "",
                    email: "",
                    userType: "",
                    password: ""
                },
                editForm: {
                    username: "",
                    email: "",
                    userType: ""
                },
                addFormVisible: false,
                editFormVisible: false
            }
        },
        computed: {
            ...mapGetters({
                loading: `user/loading`,
                data: `user/userList`,
                total: `user/total`
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
                createUser(this.addForm).then(() =>  {
                    notification.success({
                        message: '添加用户成功',
                        timeout: 2000,
                        position: 'top'
                    });
                    this.addFormVisible = false;
                    this.resetAddForm();
                    this.handleSearch();
                });
            },
            handleSearch() {
                store.dispatch('user/getUserList', {
                    pagination: this.pagination,
                    params: this.search
                });
            },
            resetAddForm() {
                this.addForm = {
                    username: "",
                    email: "",
                    userType: ""
                };
            },
            edit (record) {
                this.editForm = record;
                this.editFormVisible = true;
            },
            handleDelete(record) {
                deleteUser({
                    _id: record._id
                }).then(() => {
                    notification.success({
                        message: '删除用户成功',
                        timeout: 2000,
                        position: 'top'
                    })
                    this.handleSearch();
                })
            },
            handleEdit() {
                editUser(this.editForm).then(() =>  {
                    notification.success({
                        message: '修改用户信息成功',
                        timeout: 2000,
                        position: 'top'
                    });
                    this.editFormVisible = false;
                    this.resetAddForm();
                    this.handleSearch();
                });
            },
            handleTableChange(pagination) {
                this.pagination.current = pagination.current;
                this.handleSearch();
            }
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