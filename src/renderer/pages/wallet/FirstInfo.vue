<template>
    <div class="first-info">
        <div class="first-info-top">
            <Back :backTitle="this.$t('message.accountManagement')" v-show="backOk"></Back>
        </div>
        <h2>{{$t("message.firstInfoTitle")}}</h2>
        <ul>
            <li @click="newAccount">
                <span>{{$t("message.createNewAccount")}}</span>
                <label>{{$t("message.createNewAccountInfo")}}</label>
            </li>
            <li @click="importAccount">
                <span>{{$t("message.importAccount")}}</span>
                <label>{{$t("message.importAccountInfo")}}</label>
            </li>
        </ul>
        <div class="backOk" v-show="backOks"></div>
        <Password ref="password" @toSubmit="toSubmit"></Password>
    </div>
</template>

<script>
    import moment from 'moment';
    import Back from '@/components/BackBar.vue';
    import Password from '@/components/PasswordBar.vue';

    export default {
        data: function () {
            return {
                passwordValue: '',
                backOk: localStorage.getItem('toUserInfo') === '1' ? false : true,
                backOks: localStorage.getItem('toUserInfo') === '1' ? false : true,
            }
        },
        components: {
            Back,
            Password,
        },
        created(){
            document.onkeydown=function(e){
                let key=window.event.keyCode;
                console.log(this.passwordVisible);
                /*if(key === 13){
                    console.log(13);
                    document.getElementsByClassName('passwordInfo').click();
                }*/
            }
        },
        methods: {
            /** newAccount
             * @method newAccount
             * @author Wave
             * @date 2018-2-11
             * @version 1.0
             **/
            newAccount() {
                this.$refs.password.showPassword(true);
            },
            //
            toSubmit(password) {
                this.passwordValue = password;
                let params = '{"count":1,"password":"' + password + '"}';
                this.postAccount('/account', params)
            },
            //输入密码提交方法
            postAccount(url,params){
                this.$post(url, params)
                    .then((response) => {
                        if (response.success) {
                            this.$message({
                                type: 'success', message: this.$t('message.passWordSuccess')
                            });
                            localStorage.setItem('newAccountAddress', response.data);
                            localStorage.setItem('userPass', this.passwordValue);
                            this.getAccountList("/account/list");
                            this.$router.push({
                                name: '/newAccount',
                                params: {newOk: true, address: ""},
                            })
                        } else {
                            this.$message({
                                type: 'warning', message: this.$t('message.passWordFailed') + response.msg
                            });
                        }
                    });
            },
            //获取账户地址列表
            getAccountList(url) {
                this.$fetch(url)
                    .then((response) => {
                        //console.log(response);
                        if(response.success){
                            this.$store.commit("setAddressList",response.data.list);
                        }
                    }).catch((reject) => {
                    console.log("User List err"+reject);
                });
            },
            //导入账户跳转
            importAccount() {
                this.$router.push({
                    path: '/firstInto/firstInfo/importAccount'
                })
            },
        }
    }
</script>
<style lang="less">
    .first-info {
        width: 100%;
        height: 100%;
        .first-info-top {
            width: 100%;
            height: 50px;
            .backOk {
                height: 50px;
            }
        }

        h2 {
            width: 270px;
            margin: auto;
            line-height: 70px;
            font-size: 16px;
            text-align: center;
        }
        ul {
            width: 60%;
            height: 50%;
            margin: auto;
            li {
                width: 40%;
                height: 11rem;
                float: left;
                margin-right: 18%;
                border: 1px solid #1e314d;
                background-color: #181f2f;
                text-align: center;
                cursor: pointer;
                span {
                    display: block;
                    font-size: 16px;
                    line-height: 6rem;
                    font-weight: 500;
                }
                label {
                    display: block;
                    font-size: 12px;
                    padding: 0 1rem;
                    color: #C1C5C9;
                    text-align: center;
                }
            }
            li:hover {
                cursor: pointer;
                border-color: #658ec7;
            }
            li:last-child {
                margin-right: 0;
            }
        }
    }
</style>