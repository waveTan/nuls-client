<template>
    <div class="set-password">
        <h2>{{$t("message.setPassWord")}}</h2>
        <el-form :model="passForm" status-icon :rules="rulesPass" ref="passForm" class="set-pass">
            <el-form-item :label="$t('message.walletPassWord')" prop="pass">
                <el-input type="password" v-model="passForm.pass" :maxlength=20></el-input>
            </el-form-item>
            <el-form-item :label="$t('message.affirmWalletPassWord')" prop="checkPass">
                <el-input type="password" v-model="passForm.checkPass" :maxlength=20></el-input>
            </el-form-item>
            <div class="set-pass-title">{{$t('message.passWordInfo')}}</div>
            <el-form-item>
                <el-button type="primary" @click="submitForm('passForm')" class="set-pass-submit" id="setPass">{{$t('message.passWordAffirm')}}</el-button>
            </el-form-item>
        </el-form>
    </div>

</template>
<script>
    export default {
        data() {
            let validatePass = (rule, value, callback) => {
                let patrn = /(?!^((\d+)|([a-zA-Z]+)|([~!@#\$%\^&\*\(\)]+))$)^[a-zA-Z0-9~!@#\$%\^&\*\(\)]{8,21}$/;
                if (value === '') {
                    callback(new Error(this.$t('message.walletPassWord1')));
                } else if (!patrn.exec(value)) {
                    callback(new Error(this.$t('message.walletPassWord1')));
                } else {
                    if (this.passForm.checkPass !== '') {
                        this.$refs.passForm.validateField('checkPass');
                    }
                    callback();
                }
            };
            let validatePass2 = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error(this.$t('message.affirmWalletPassWordEmpty')));
                } else if (value !== this.passForm.pass) {
                    callback(new Error(this.$t('message.passWordAtypism')));
                } else {
                    callback();
                }
            };
            return {
                passForm: {
                    pass: '',
                    checkPass: '',
                },
                rulesPass: {
                    pass: [
                        {validator: validatePass, trigger: 'blur'}
                    ],
                    checkPass: [
                        {validator: validatePass2, trigger: 'blur'}
                    ]
                }
            };
        },
        created() {
            document.onkeydown=function(e){
                let key=window.event.keyCode;
                if(key === 13){
                    document.getElementById('setPass').click();
                }
            }
        },
        methods: {
            /** Set the password for the user
             * @method submitForm
             * @param {string} user password
             * @author Wave
             * @date 2018-2-11
             * @version 1.0
             **/
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$router.push({
                            path: '/firstInto/firstInfo'
                        })
                    } else {
                        /*this.$message({
                            type: 'success', message:this.$t('message.passWordFailed')
                        });*/
                        return false;
                    }
                });
            },
        }
    }
</script>
<style lang="less">
    @import url("../../assets/css/style");

    .set-password {
        height: 100%;
        margin: auto;
        h2 {
            font-size: 16px;
            text-align: center;
            line-height: 20px;
            margin: 40px 0 20px 0;
        }
        .set-pass {
            width: 385px;
            margin: auto;
            .set-pass-info div {
                font-size: 12px;
                color: #FFFFFF;
                text-align: left;
                line-height: 15px;
                padding-bottom: 30px;
            }
            .set-pass-title{
                font-size: 12px;
            }
            .set-pass-submit {
                width: 230px;
                border-radius: 0.05rem;
                background-color: #24426c;
                border-color: #24426c;
                height: 30px;
                line-height: 30px;
                padding: 0;
            }
            .el-form-item__content {
                text-align: center;
                .set-pass-submit {
                    margin-top: 40px;
                }
                .set-pass-reset {
                    color: #f64b3e;
                    font-size: 12px;
                }
            }
            .el-input__inner {
                border: 1px solid #6290c7;
                padding: 0 2px;
            }
            .el-form-item__label {
                font-size: 12px;
                padding: 15px 0 10px;
                line-height: 0;
                color: #FFFFFF;
            }
            .el-form-item__content {
                line-height: 10px;
            }
            .el-input__suffix {
                margin-top: -2%;
                right: -5px;
            }
            .el-form-item {
                margin-bottom: 1rem;
            }
        }
    }
</style>