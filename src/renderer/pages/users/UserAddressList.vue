<template>
    <div class="users">
        <Back :backTitle="this.$t('message.setManagement')"></Back>
        <div class="users-conter">
            <h2>{{$t('message.c93')}}</h2>
            <el-button type="primary" icon="el-icon-plus" @click="toNewAccount()" class="newAccount"></el-button>
            <el-table :data="tableData">
                <el-table-column prop="userAddress" :label="$t('message.c69')" min-width="288" align='center'>
                </el-table-column>
                <!--<el-table-column prop="userAlias" :label="$t('message.tabAlias')" width="100" align='center'>
                </el-table-column>-->
                <el-table-column prop="userHelp" :label="$t('message.remarks')" width="180" align='center'>
                </el-table-column>
                <el-table-column :label="$t('message.operation')" width="120" align='center'>
                    <template slot-scope="scope">
                        <el-button @click="editorRow(scope.row.userAddress,scope.row.userAlias,scope.row.userHelp)"
                                   type="text" size="small">
                            {{$t('message.c94')}}
                        </el-button>
                        <el-button @click="deleteRow(scope.row.userAddress)" type="text" size="small">
                            {{$t('message.c95')}}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination layout="prev, pager, next" :page-size="8" :total=this.totalAll
                           v-show="totalAllOk = this.totalAll>8 ?true:false" class="cb"
                           @current-change="consensusSize"></el-pagination>
        </div>
        <el-dialog :title="$t('message.c96')" :visible.sync="dialogFormVisible" top="24vh" @close="userListClose">
            <el-form ref="userListForm" :model="userListForm" :rules="userListFormRules" label-width="80px">
                <el-form-item :label="$t('message.c69')" prop="userAddress">
                    <el-input v-model="userListForm.userAddress"></el-input>
                </el-form-item>
                <el-form-item :label="$t('message.remarks')">
                    <el-input v-model="userListForm.userHelp"></el-input>
                </el-form-item>
                <!--<div class="userAlias">{{$t('message.tabAlias')}} {{userListForm.userAlias}}</div>-->
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addUserAccount('userListForm')" id="userList">
                    {{$t('message.confirmButtonText')}}
                </el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import Back from '@/components/BackBar.vue';

    export default {
        data() {
            return {
                tableData: [],
                dialogFormVisible: false,
                totalAll: 10,
                userListForm: {
                    userAddress: '',
                    userAlias: '',
                    userHelp: '',
                },
                userListFormRules: {
                    userAddress: [
                        {required: true, message: this.$t('message.c116'), trigger: 'blur'},
                        {min: 10, max: 50, message: this.$t('message.c117'), trigger: 'blur'}
                    ]
                }
            }
        },
        components: {
            Back,
        },
        mounted() {
            let _this = this;
            this.openDB();
            this.getUserList(1, 8);
            let userList = false;
            setInterval(() => {
                userList = this.dialogFormVisible
            }, 500);
            document.onkeydown = function (e) {
                let key = window.event.keyCode;
                if (key === 13) {
                    if (userList) {
                        console.log(18);
                        document.getElementById('userList').click();
                    }
                }
            }
        },
        methods: {
            //创建usersDB
            openDB() {
                let request = indexedDB.open('usersDB', 1);
                request.onupgradeneeded = function (e) {
                    let db = e.target.result;
                    // 如果不存在Users对象仓库则创建
                    if (!db.objectStoreNames.contains('usersDB')) {
                        let store = db.createObjectStore('addressList', {keyPath: 'userAddress', autoIncrement: false});
                    }
                }
            },
            //给userlist添加数据
            addUserAccount(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let request = indexedDB.open('usersDB', 1);
                        let db;
                        let value = {
                            'userAddress': this.userListForm.userAddress,
                            'userAlias': this.userListForm.userAlias,
                            'userHelp': this.userListForm.userHelp
                        };
                        request.onsuccess = function (event) {
                            db = event.target.result;
                            let tx = db.transaction('addressList', 'readwrite');
                            let store = tx.objectStore('addressList');
                            store.put(value);
                        };
                        this.getUserList(1, 8);
                        this.userListForm.userAddress = '';
                        this.userListForm.userHelp = '';
                        this.dialogFormVisible = false
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                })
            },
            //读取userList
            getUserList(pageNumber, pageSize) {
                let request = indexedDB.open('usersDB', 1);
                let dbData = [];
                request.onsuccess = function (event) {
                    let db = event.target.result;
                    let tx = db.transaction('addressList', 'readonly');
                    let store = tx.objectStore('addressList');
                    // 打开游标，遍历customers中所有数据
                    store.openCursor().onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            dbData.push(cursor.value);
                            cursor.continue();
                        }
                    }
                };
                //显示总条数
                setTimeout(() => {
                    this.totalAll = dbData.length;
                    if (pageNumber === 1) {
                        //console.log(pageNumber)
                        this.tableData = dbData.slice(0, pageSize);
                    } else {
                        this.tableData = dbData.slice((pageNumber - 1) * 8, pageNumber * 8);
                    }
                }, 50);
            },
            //交易列表分页
            consensusSize(events) {
                this.getUserList(events, 8);
            },
            //新增通讯录
            toNewAccount() {
                this.dialogFormVisible = true;
                this.userListForm.userAddress = '';
                this.userListForm.userAlias = '';
                this.userListForm.userHelp = '';
            },
            //修改一条通讯录
            editorRow(userAddress, userAlias, userHelps) {
                //this.$refs['userListForm'].resetFields();
                this.dialogFormVisible = true;
                this.userListForm.userAddress = userAddress;
                this.userListForm.userAlias = userAlias;
                this.userListForm.userHelp = userHelps;
            },
            //删除通讯录一条记录
            deleteRow(userAddress) {
                this.$confirm(this.$t('message.c115'), this.$t('message.c86'), {
                    confirmButtonText: this.$t('message.confirmButtonText'),
                    cancelButtonText: this.$t('message.cancelButtonText'),
                }).then(() => {
                    let request = indexedDB.open('usersDB', 1);
                    let db;
                    request.onsuccess = function (event) {
                        db = event.target.result;
                        let tx = db.transaction('addressList', 'readwrite');
                        let store = tx.objectStore('addressList');
                        store.delete(userAddress);
                    };
                    this.getUserList(1, 8);
                    this.$message({
                        type: 'success',
                        message: this.$t('message.passWordSuccess'),
                    });
                }).catch(() => {
                });
            },
            //关闭清理数据
            userListClose() {
                this.$refs['userListForm'].resetFields();
            },
        }
    }
</script>
<style lang="less">
    @import url("../../assets/css/style.less");

    .users {
        width: 100%;
        margin: auto;
        .users-conter {
            width: 86%;
            margin: auto;
            .newAccount {
                width: 30px;
                line-height: 20px;
                height: 20px;
                background-color: #0b1422;
                float: right;
                border: 1px solid #0b1422;
                margin-bottom: 10px;
            }
            h2 {
                font-size: 16px;
                text-align: center;
                line-height: 20px;
            }
        }

        .el-dialog {
            background-color: #0b1422;
            .userAlias {
                line-height: 20px;
                margin-left: 40px;
                color: #606266;
                margin-bottom: 10px;
            }
            .el-dialog__title {
                color: #C1C5C9;
                font-size: 14px;
            }
            .el-dialog__header {
                padding: 10px 10px 0;
            }
            .el-dialog__body {
                .el-form {
                    .el-form-item {
                        .el-form-item__label{
                            padding: 13px 10px 0 0;
                        }
                        margin-bottom: 10px;
                        .el-input {
                            height: 35px;
                            input{
                                padding: 0 5px;
                            }
                        }
                        .el-form-item__error {
                            top: 20px;
                            padding: 0;
                        }
                    }
                }
            }
            .el-dialog__footer {
                text-align: center;
                .el-button--primary {
                    width: 145px;
                    margin-right: 0;
                }
            }
        }
    }
</style>