<template>
    <div class="header">
        <caret-left-outlined style="color: white"/>
        <span class="header-title">桥梁表管理</span>
    </div>
    <div class="content">
        <div class="content-box">
            <div class="search-box">
                <a-input v-model:value="search.bridgeName" placeholder="桥名" class="search-input"> </a-input>
                <a-button type="primary" @click="handleSearch"><SearchOutlined/>搜索</a-button>
                <a-button style="margin-left: 10px;"><ReloadOutlined/>重置</a-button>
            </div>
            <div class="action-box">
                <a-button type="primary" @click="addFormVisible = true" ><PlusOutlined/>添加</a-button>
                <a-button type="primary" @click="exec" style="margin-left: 10px" :disabled="selectedRowKeys.length !== 1"><PlayCircleOutlined/>出图</a-button>
                <a-button type="primary" @click="editFormOpen" style="margin-left: 10px" :disabled="selectedRowKeys.length !== 1"><EditOutlined/>编辑</a-button>
                <a-button type="danger" @click="handleDelete" style="margin-left: 10px" :disabled="selectedRowKeys.length !== 1"><DeleteOutlined/>删除</a-button>
            </div>
            <div class="bridge-table">
                <a-table
                        :columns="columns"
                        :data-source="data"
                        :pagination="pagination"
                        :loading="loading"
                        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                        rowKey="_id"
                        @change="handleTableChange"
                        bordered>
                    <template #struct="{ text }">
                        <a-tag v-for="(struct, index) in text" :key="index">
                            {{struct.struct}}
                        </a-tag>
                    </template>
                </a-table>
            </div>
        </div>
    </div>
    <a-modal
            v-model:visible="addFormVisible"
            width="800px"
            title="添加桥梁"
            @ok="handleAdd">
        <a-form :model="addForm" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-row :gutter="24">
                <a-col :span="8">
                    <a-form-item label="桥梁名称">
                        <a-input v-model:value="addForm.bridgeName">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="路线">
                        <a-input v-model:value="addForm.path">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="幅类">
                        <a-input v-model:value="addForm.class">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="桥幅模板">
                        <a-input v-model:value="addForm.classTemplate">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="桥幅名称">
                        <a-input v-model:value="addForm.className">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="中心桩号">
                        <a-input v-model:value="addForm.centerPileNo">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="跨径布置">
                        <a-input v-model:value="addForm.spanArrangement">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="斜交角度">
                        <a-input v-model:value="addForm.obliqueAngle">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="图号前缀">
                        <a-input v-model:value="addForm.prefix">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="上部结构">
                        <a-row :gutter="8" v-if="addForm.topStruct.length">
                            <a-col :span="6" style="text-align: center">
                                <span>幅名称</span>
                            </a-col>
                            <a-col :span="6" style="text-align: center">
                                <span>联号</span>
                            </a-col>
                            <a-col :span="8" style="text-align: center">
                                <span>工程构件</span>
                            </a-col>
                        </a-row>
                        <div v-for="(struct, index) in addForm.topStruct" :key="index">
                            <a-input-group>
                                <a-row :gutter="8">
                                    <a-col :span="6">
                                        <a-input  v-model:value="struct.className" />
                                    </a-col>
                                    <a-col :span="6">
                                        <a-input  v-model:value="struct.number" />
                                    </a-col>
                                    <a-col :span="8">
                                        <a-input  v-model:value="struct.struct" />
                                    </a-col>
                                    <a-col :span="4">
                                        <a-button type="danger" @click="deleteStruct(addForm.topStruct, index)" style="float: right">
                                            <DeleteOutlined /> 删除
                                        </a-button>
                                    </a-col>
                                </a-row>
                            </a-input-group>
                        </div>
                        <a-button style="float:right;margin-top: 5px;" type="primary" @click="addStruct(addForm.topStruct)"><PlusOutlined/>添加结构</a-button>
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="下部结构">
                        <a-row :gutter="8" v-if="addForm.bottomStruct.length">
                            <a-col :span="6" style="text-align: center">
                                <span>幅名称</span>
                            </a-col>
                            <a-col :span="6" style="text-align: center">
                                <span>墩(台)号</span>
                            </a-col>
                            <a-col :span="8" style="text-align: center">
                                <span>工程构件</span>
                            </a-col>
                        </a-row>
                        <div v-for="(struct, index) in addForm.bottomStruct" :key="index">
                            <a-input-group>
                                <a-row :gutter="8">
                                    <a-col :span="6">
                                        <a-input v-model:value="struct.className" />
                                    </a-col>
                                    <a-col :span="6">
                                        <a-input v-model:value="struct.number" />
                                    </a-col>
                                    <a-col :span="8">
                                        <a-input v-model:value="struct.struct" />
                                    </a-col>
                                    <a-col :span="4">
                                        <a-button type="danger" @click="deleteStruct(addForm.bottomStruct, index)" style="float: right">
                                            <DeleteOutlined /> 删除
                                        </a-button>
                                    </a-col>
                                </a-row>
                            </a-input-group>
                        </div>
                        <a-button style="float:right;margin-top: 5px;" type="primary" @click="addStruct(addForm.bottomStruct)"><PlusOutlined/>添加结构</a-button>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </a-modal>
    <a-modal
            v-model:visible="editFormVisible"
            title="编辑图纸"
            width="800px"
            @ok="handleEdit">
        <a-form :model="editForm" :label-col="labelCol" :wrapper-col="wrapperCol">
            <a-row :gutter="24">
                <a-col :span="8">
                    <a-form-item label="桥梁名称">
                        <a-input v-model:value="editForm.bridgeName">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="路线">
                        <a-input v-model:value="editForm.path">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="幅类">
                        <a-input v-model:value="editForm.class">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="桥幅模板">
                        <a-input v-model:value="editForm.classTemplate">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="桥幅名称">
                        <a-input v-model:value="editForm.className">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="中心桩号">
                        <a-input v-model:value="editForm.centerPileNo">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="跨径布置">
                        <a-input v-model:value="editForm.spanArrangement">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="斜交角度">
                        <a-input v-model:value="editForm.obliqueAngle">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="图号前缀">
                        <a-input v-model:value="editForm.prefix">
                        </a-input>
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="上部结构">
                        <a-row :gutter="8" v-if="editForm.topStruct.length">
                            <a-col :span="6" style="text-align: center">
                                <span>幅名称</span>
                            </a-col>
                            <a-col :span="6" style="text-align: center">
                                <span>联号</span>
                            </a-col>
                            <a-col :span="8" style="text-align: center">
                                <span>工程构件</span>
                            </a-col>
                        </a-row>
                        <div v-for="(struct, index) in editForm.topStruct" :key="index">
                            <a-input-group>
                                <a-row :gutter="8">
                                    <a-col :span="6">
                                        <a-input v-model:value="struct.className" />
                                    </a-col>
                                    <a-col :span="6">
                                        <a-input v-model:value="struct.number" />
                                    </a-col>
                                    <a-col :span="8">
                                        <a-input v-model:value="struct.struct" />
                                    </a-col>
                                    <a-col :span="4">
                                        <a-button type="danger" @click="deleteStruct(editForm.topStruct, index)" style="float: right">
                                            <DeleteOutlined /> 删除
                                        </a-button>
                                    </a-col>
                                </a-row>
                            </a-input-group>
                        </div>
                        <a-button style="float:right;margin-top: 5px;" type="primary" @click="addStruct(editForm.topStruct)"><PlusOutlined/>添加结构</a-button>
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="下部结构">
                        <a-row :gutter="8" v-if="editForm.bottomStruct.length">
                            <a-col :span="6" style="text-align: center">
                                <span>幅名称</span>
                            </a-col>
                            <a-col :span="6" style="text-align: center">
                                <span>墩(台)号</span>
                            </a-col>
                            <a-col :span="8" style="text-align: center">
                                <span>工程构件</span>
                            </a-col>
                        </a-row>
                        <div v-for="(struct, index) in editForm.bottomStruct" :key="index">
                            <a-input-group>
                                <a-row :gutter="8">
                                    <a-col :span="6">
                                        <a-input v-model:value="struct.className" />
                                    </a-col>
                                    <a-col :span="6">
                                        <a-input v-model:value="struct.number" />
                                    </a-col>
                                    <a-col :span="8">
                                        <a-input v-model:value="struct.struct" />
                                    </a-col>
                                    <a-col :span="4">
                                        <a-button type="danger" @click="deleteStruct(editForm.bottomStruct, index)" style="float: right">
                                            <DeleteOutlined /> 删除
                                        </a-button>
                                    </a-col>
                                </a-row>
                            </a-input-group>
                        </div>
                        <a-button style="float:right;margin-top: 5px;" type="primary" @click="addStruct(editForm.bottomStruct)"><PlusOutlined/>添加结构</a-button>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </a-modal>
</template>
<script>
    import {CaretLeftOutlined, PlusOutlined, SearchOutlined,  ReloadOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined} from "@ant-design/icons-vue";
    import {notification} from "ant-design-vue";
    import {mapGetters} from "vuex";
    import store from '../../store';
    import {execProcess, createBridge, editBridge, deleteBridge} from "../../api/bridge";
    const columns = [
        {
            title: '桥梁名称',
            dataIndex: 'bridgeName',
            key: 'bridgeName',
        },
        {
            title: '路线',
            dataIndex: 'path',
            key: 'path',
        },
        {
            title: '幅类',
            dataIndex: 'class',
            key: 'class',
        },
        {
            title: '中心桩号(m)',
            dataIndex: 'centerPileNo',
            key: 'centerPileNo',
        },
        {
            title: '跨径布置(m)',
            dataIndex: 'spanArrangement',
            key: 'spanArrangement',
        },
        {
            title: '斜交角度(°）',
            dataIndex: 'obliqueAngle',
            key: 'obliqueAngle',
        },
        {
            title: '上部结构 ',
            dataIndex: 'topStruct',
            key: 'topStruct',
            width: '250px',
            slots: { customRender: 'struct' },
        },
        {
            title: '下部结构',
            dataIndex: 'bottomStruct',
            key: 'bottomStruct',
            width: '250px',
            slots: { customRender: 'struct' },
        },
        {
            title: '桥幅模板',
            dataIndex: 'classTemplate',
            key: 'classTemplate'
        },
        {
            title: '桥幅名称',
            dataIndex: 'className',
            key: 'className'
        },
        {
            title: '图号前缀',
            dataIndex: 'prefix',
            key: 'prefix'
        }
    ];
    const structCol = [
        {
            title: '幅名称',
            dataIndex: 'className',
            key: 'className'
        },{
            title: '联号',
            dataIndex: 'className',
            key: 'className'
        },{
            title: '幅名称',
            dataIndex: 'className',
            key: 'className'
        }
    ];
    export default {
        components: {
            CaretLeftOutlined,
            PlusOutlined,
            SearchOutlined,
            ReloadOutlined,
            EditOutlined,
            DeleteOutlined,
            PlayCircleOutlined
        },
        data() {
            return {
                columns,
                selectedRowKeys: [],
                structCol,
                search: {
                    bridgeName: ""
                },
                labelCol: {
                    span: 0,
                },
                wrapperCol: {
                    span: 24
                },
                pagination: {
                    total: 0,
                    current: 1,
                    pageSize: 10,
                    showTotal: total => `共 ${total} 条数据`,
                },
                addForm: {
                    bridgeName: "",
                    path: "",
                    class: "",
                    centerPileNo: "",
                    spanArrangement: "",
                    obliqueAngle: "",
                    topStruct: [],
                    bottomStruct: [],
                    classTemplate: "",
                    className: "",
                    prefix: ""
                },
                editForm: {
                    bridgeName: "",
                    path: "",
                    class: "",
                    centerPileNo: "",
                    spanArrangement: "",
                    obliqueAngle: "",
                    topStruct: [],
                    bottomStruct: [],
                    classTemplate: "",
                    className: "",
                    prefix: ""
                },
                addFormVisible: false,
                editFormVisible: false
            }
        },
        computed: {
            ...mapGetters({
                loading: `bridge/loading`,
                data: `bridge/bridgeList`,
                total: `bridge/total`
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
            onSelectChange(selectedRowKeys) {
                this.selectedRowKeys = selectedRowKeys;
            },
            handleAdd() {
                createBridge( this.addForm).then(() =>  {
                    notification.success({
                        message: '添加桥梁成功',
                        timeout: 2000,
                        position: 'top'
                    });
                    this.addFormVisible = false;
                    this.resetAddForm();
                    this.handleSearch();
                });
            },
            handleSearch() {
                store.dispatch('bridge/getBridgeList', {
                    pagination: this.pagination,
                    params: this.search
                });
            },
            resetAddForm() {
                this.addForm = {
                    bridgeName: "",
                    path: "",
                    class: "",
                    centerPileNo: "",
                    spanArrangement: "",
                    obliqueAngle: "",
                    topStruct: [],
                    bottomStruct: [],
                    classTemplate: "",
                    className: "",
                    prefix: ""
                };
            },
            editFormOpen () {
                this.editForm = Object.assign(this.editForm, this.data.find(v => v._id === this.selectedRowKeys[0]));
                this.editFormVisible = true;
            },
            handleDelete() {
                deleteBridge({
                    _id: this.selectedRowKeys[0]
                }).then(() => {
                    notification.success({
                        message: '删除桥梁成功',
                        timeout: 2000,
                        position: 'top'
                    })
                    this.handleSearch();
                })
            },
            handleEdit() {
                editBridge(this.editForm).then(() =>  {
                    notification.success({
                        message: '修改桥梁信息成功',
                        timeout: 2000,
                        position: 'top'
                    });
                    this.editFormVisible = false;
                    this.handleSearch();
                });
            },
            handleTableChange(pagination) {
                this.pagination.current = pagination.current;
                this.handleSearch();
            },
            addStruct(list) {
                list.push({
                    className: "",
                    number: "",
                    struct: ""
                })
            },
            deleteStruct(list, index) {
                list.splice(index, 1);
            },
            exec() {
                execProcess().then(() => {
                    notification.success({
                        message: '出图成功',
                        timeout: 2000,
                        position: 'top'
                    });
                })
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