<template>
    <div class="wallet">
        <div class="search">
            <div class="account-top">
                <label>{{$t('message.indexAccountAddress')}}</label>
                <AccountAddressBar @chenckAccountAddress="chenckAccountAddress"></AccountAddressBar>
            </div>
            <div class="wallet-i">
                <i class="copy_icon copyBtn cursor-p" :data-clipboard-text="accountAddressValue"
                   @click="accountCopy"></i>
                <i class="qr_icon cursor-p" @click="accountCode" style="display: none"></i>
                <i class="zhanghu_icon fr cursor-p" @click="accountChoice"></i>
            </div>
            <CodeBar v-show="codeShowOk" v-on:codeShowOks="codeShowOks" ref="codeBar"></CodeBar>
        </div>
        <div class="wallet-hide" v-show="walletHide">
            <i :class="`icon ${keyShow ? 'icon-eye' : 'icon-eye-blocked'}`" @click="toKeyShow"
               class="cursor-p"></i>
        </div>
        <div class="wallet-tab cl">
            <el-tabs v-model="activeName" @tab-click="handleClick" @dblclick="tab-clicks">
                <el-tab-pane :label="$t('message.indexAccountHome')" name="first">
                    <el-table :data="accountData">
                        <el-table-column :label="$t('message.indexProperty')" width="60" align='center'>
                            <template slot-scope="scope">
                                <span>{{ scope.row.asset }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('message.indexSum')" width="150" align='center'>
                            <template slot-scope="scope">
                                <input :type="keyShow ? 'text' : 'password'"
                                       :value=scope.row.balance
                                       readonly="readonly">
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('message.indexUsable')" width="150" align='center'>
                            <template slot-scope="scope">
                                <input :type="keyShow ? 'text' : 'password'"
                                       :value=scope.row.usable
                                       readonly="readonly">
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('message.indexLock')" width="150" align='center'>
                            <template slot-scope="scope">
                                <input :type="keyShow ? 'text' : 'password'"
                                       :value=scope.row.locked
                                       readonly="readonly" class="cursor-p text-d"
                                       @click="toLocked(accountAddressValue)">
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('message.operation')" align='center'>
                            <template slot-scope="scope">
                                <span class="cursor-p text-d" @click="toTransfer(accountAddressValue)">{{$t('message.transfer')}}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                    <!--<el-pagination layout="prev, pager, next":total="1000 "></el-pagination>-->
                </el-tab-pane>
                <el-tab-pane :label="$t('message.transactionRecord')" name="second">
                    <el-table :data="dealList" @filter-change="changeType" v-loading="loading">
                        <el-table-column
                                prop="type"
                                :label="$t('message.transactionType')"
                                width="110"
                                align="center"
                                column-key="type"
                                :filters="[
                                    {text: this.$t('message.type1'), value: '1'},
                                    {text: this.$t('message.type2'), value: '2'},
                                    {text: this.$t('message.type3'), value: '3'},
                                    {text: this.$t('message.type4'), value: '4'},
                                    {text: this.$t('message.type5'), value: '5'},
                                    {text: this.$t('message.type11'), value: '11'},
                                    {text: this.$t('message.type90'), value: '90'},
                                    {text: this.$t('message.type91'), value: '91'},
                                    {text: this.$t('message.type92'), value: '92'},
                                    {text: this.$t('message.type93'), value: '93'},
                                    {text: this.$t('message.type94'), value: '94'},
                                    {text: this.$t('message.type95'), value: '95'},
                                ]"
                                :filter-multiple=false>
                            <template slot-scope="scope">
                                {{$t('message.type'+scope.row.type)}}
                            </template>
                        </el-table-column>
                        <el-table-column label="txid" min-width="195" align='center'>
                            <template slot-scope="scope">
								<span @click="toTxid(scope.row.hash)" class="cursor-p text-d overflow">
									{{ scope.row.hashs }}
								</span>
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('message.assetChange')" width="138" align='center'>
                            <template slot-scope="scope">
                                <span>{{ scope.row.values }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('message.state')" width="85" align='center'>
                            <template slot-scope="scope">
                                <span>{{ $t('message.statusS'+scope.row.status) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('message.time')" width="145" align='center'>
                            <template slot-scope="scope">
                                <span>{{scope.row.times}}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination layout="prev, pager, next" :page-size="9" :total=this.totalAll class="cb"
                                   v-show="totalAllOk = this.totalAll>8 ?true:false"
                                   @current-change="txIdConsensusSize"></el-pagination>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
  import CodeBar from '@/components/CodeBar.vue'
  import AccountAddressBar from '@/components/AccountAddressBar.vue'
  import copy from 'copy-to-clipboard'
  import moment from 'moment'
  import { BigNumber } from 'bignumber.js'

  export default {
    data () {
      return {
        loading: true,
        walletHide: true,
        keyShow: false,
        codeShowOk: false,
        locale: localStorage.getItem('language'),
        accountAddress: [],
        accountAddressValue: localStorage.getItem('newAccountAddress'),
        accountData: [],
        dealList: [],
        activeName: sessionStorage.getItem('walletActiveName'),
        tabName: 'first',
        totalAll: 0,
        pages: 1,
        types: '',
        walletSetInterval:null,
      }
    },
    components: {
      CodeBar,
      AccountAddressBar,
    },
    created () {
      /**
       *  判断显示隐藏数字
       *Judgment display hidden numbers
       */
      if (localStorage.getItem('keyShow') === 'true') {
        this.keyShow = true
      } else {
        this.keyShow = false
      }
      this.getAccountAssets('/account/assets/' + this.accountAddressValue)

      /**
       * 切换交易记录tab
       *Switching transaction record tab
       */
      if (this.activeName === 'second') {
        this.getAccountTxList('/tx/list/', {
          'address': this.accountAddressValue,
          'pageSize': 9,
          'pageNumber': 1
        })
      }
      /**
       * 5秒查询交易列表
       * 5second query trade list
       */
      this.walletSetInterval = setInterval(() => {
        if(this.activeName === 'first'){
          this.getAccountAssets('/account/assets/' + this.accountAddressValue)
        }else {
          if (this.types !== '') {
            this.getAccountTxList('/tx/list/', {
              'address': this.accountAddressValue,
              'type': this.types,
              'pageSize': 9,
              'pageNumber': this.pages
            })
          } else {
            this.getAccountTxList('/tx/list/', {
              'address': this.accountAddressValue,
              'pageSize': 9,
              'pageNumber': this.pages
            })
          }
        }
      }, 5000)
    },
    destroyed() {
      clearInterval(this.walletSetInterval)
    },
    methods: {
      /**
       * 根据账户地址获取资产列表
       *Obtaining a list of assets based on the account address
       * @param url
       */
      getAccountAssets (url) {
        this.$fetch(url)
          .then((response) => {
            //console.log(response);
            if (response.success) {
              let leftShift = new BigNumber(0.00000001)
              for (let i = 0; i < response.data.length; i++) {
                response.data[i].balance = parseFloat(leftShift.times(response.data[i].balance).toString())
                response.data[i].locked = parseFloat(leftShift.times(response.data[i].locked).toString())
                response.data[i].usable = parseFloat(leftShift.times(response.data[i].usable).toString())
              }
              this.accountData = response.data
            }
          })
      },

      /**
       * 根据用户地址获取用户交易列表
       *Obtaining a user's trade list based on the user address
       * @param url
       * @param param
       */
      getAccountTxList (url, param) {
        //console.log(param)
        this.$fetch(url, param)
          .then((response) => {
            //console.log(response)
            if (response.data != null) {
              this.totalAll = response.data.total
              let leftShift = new BigNumber(0.00000001)
              if (response.data.list.length > 0) {
                this.dealList = response.data.list
                //this.$store.commit("setAccountTxList",response.data.list);
                for (let i = 0; i < response.data.list.length; i++) {
                  let length = this.dealList[i].hash.length
                  this.dealList[i].hashs = this.dealList[i].hash.substr(0, 10) + '...' + this.dealList[i].hash.substr(length - 10)
                  this.dealList[i].values = parseFloat(leftShift.times(response.data.list[i].value).toString())
                  this.dealList[i].times = moment(response.data.list[i].time).format('YYYY-MM-DD HH:mm:ss')
                }
                this.loading = false
              } else {
                this.loading = false
                this.dealList = []
              }
            } else {
              this.loading = false
              this.dealList = []
            }
          })
      },

      /**
       * 交易列表分页
       * Transaction list paging
       * @param events
       */
      txIdConsensusSize (events) {
        this.pages = events
        this.getAccountTxList('/tx/list/', {
          'address': this.accountAddressValue,
          'pageSize': 9,
          'pageNumber': events
        })
      },

      /**
       * 获取下拉选择地址
       * Get the drop-down selection address
       * @param chenckAddress
       */
      chenckAccountAddress (chenckAddress) {
        //console.log(chenckAddress)
        this.accountAddressValue = chenckAddress
        if (this.activeName === 'first') {
          this.getAccountAssets('/account/assets/' + chenckAddress)
        } else {
          this.getAccountTxList('/tx/list/', {'address': chenckAddress, 'pageSize': 9, 'pageNumber': 1})
        }
      },

      /**
       * 选择交易类型查询
       * Select transaction type query
       * @param typeValue
       */
      changeType (typeValue) {
        this.types = typeValue.type[0]
        this.getAccountTxList('/tx/list/', {
          'address': this.accountAddressValue,
          'type': typeValue.type[0],
          'pageSize': 9,
          'pageNumber': 1
        })
      },

      /**
       * tab切换
       * tab
       * @param tab
       * @param event
       */
      handleClick (tab, event) {
        this.tabName = tab.name
        if (tab.name !== 'first') {
          this.activeName = 'second'
          this.walletHide = false
          let params = {
            'address': this.accountAddressValue,
            'pageSize': 9,
            'pageNumber': 1
          }
          this.getAccountTxList('/tx/list/', params)
        } else {
          sessionStorage.setItem('walletActiveName', tab.name)
          this.walletHide = true
          this.getAccountAssets('/account/assets/' + this.accountAddressValue)
        }
      },

      /**
       * 复制功能
       * copy
       */
      accountCopy () {
        copy(this.accountAddressValue)
        this.$message({
          message: this.$t('message.c129'), type: 'success', duration: '800'
        })
      },

      /**
       * 二维码显示
       * Two-dimensional code display
       */
      accountCode () {
        this.$refs.codeBar.codeMaker(localStorage.getItem('newAccountAddress'))
        this.codeShowOk = !this.codeShowOk
      },
      codeShowOks () {
        this.codeShowOk = false
      },

      /**
       * 账户管理跳转
       *Account management jump
       */
      accountChoice () {
        if (this.$store.getters.getNetWorkInfo.localBestHeight === this.$store.getters.getNetWorkInfo.netBestHeight
          && sessionStorage.getItem('setNodeNumberOk') === 'true') {
          localStorage.setItem('toUserInfo', '1')
          this.$router.push({
            path: '/wallet/users/userInfo'
          })
        } else {
          this.$message({
            message: this.$t('message.c133'), duration: '800'
          })
        }
      },

      /**
       * 金额显示隐藏
       * Amount display concealment
       */
      toKeyShow () {
        if (this.keyShow) {
          localStorage.setItem('keyShow', false)
          this.keyShow = false
        } else {
          localStorage.setItem('keyShow', true)
          this.keyShow = true
        }
      },

      /**
       * toTxid跳转
       * toTxid
       * @param txId
       */
      toTxid (txId) {
        sessionStorage.setItem('walletActiveName', 'second')
        this.$router.push({
          name: '/dealInfo',
          params: {hash: txId},
        })
      },

      /**
       * 跳转冻结列表
       * To locked list
       * @param address
       */
      toLocked (address) {
        this.$router.push({
          name: '/freezeList',
          params: {address: address},
        })
      },

      /**
       * 跳转转账
       * To transfer
       * @param address
       */
      toTransfer (address) {
        if (this.$store.getters.getNetWorkInfo.localBestHeight === this.$store.getters.getNetWorkInfo.netBestHeight && sessionStorage.getItem("setNodeNumberOk") === "true") {
          this.$router.push({
            name: '/transfer',
            params: {address: address},
          })
        } else {
          this.$message({
            message: this.$t('message.c133'), duration: '800'
          })
        }
      },
    },
  }
</script>

<style lang="less">
    @import url("../../assets/css/style.less");

    .wallet {
        width: 86%;
        margin: 2rem auto;
        .account-top {
            margin: 0;
            float: left;
            width: 485px;
            .address-select {
                width: 403px;
                .sub-select-item {
                    width: 403px;
                }
            }
            .el-input__suffix {
                right: -15px;
            }
        }
        .search {
            height: 35px;
            .search-account {
                width: 523px;
                .lable-title {
                    font-size: 14px;
                    margin-left: 17px;
                }
                .el-input__suffix {
                    margin-top: 0;
                }
                .el-input__inner {
                    border: 1px solid #658ec7;
                }
                .el-select .el-input .el-select__caret {
                    font-size: 1rem;
                }
            }
            .wallet-i {
                height: 30px;
                width: 180px;
                float: right;
                i {
                    width: 30px;
                    height: 20px;
                    display: block;
                    float: left;
                    background-size: @bg-size;
                    background: @bg-image
                }
                .copy_icon {
                    background-position: -198px -46px;
                }
                .qr_icon {
                    background-position: -235px -44px;
                }
                .zhanghu_icon {
                    background-position: -265px -46px;
                    float: right;
                }
            }
        }
        .wallet-hide {
            right: 7%;
            top: 120px;
            position: fixed;
            z-index: 800;
            .icon {
                width: 30px;
                height: 20px;
                display: block;
                float: left;
                background-size: @bg-size;
                background: @bg-image
            }
            .icon-eye {
                background-position: -159px -46px;
            }
            .icon-eye-blocked {
                background-position: -226px -77px;
            }
            .el-icon-view {
                font-size: 1rem;
            }
        }
        .cell {
            input {
                border: none;
                width: 100%;
                background-color: #0b1422;
                text-align: center;
            }
            span {
                font-size: 12px;
            }
        }
        .wallet-tab {
            .el-tabs__item {
                color: #FFFFFF;
            }
            .el-tabs__item.is-active {
                color: #FFFFFF;
            }
            .el-tabs__nav-wrap::after {
                background: rgba(87, 107, 139, 0.1);
            }
        }
        .el-select {
            width: 400px;
        }

    }

    .el-table-filter {
        border: 1px solid #17202e;
        background-color: #17202e;
        max-height: 310px;
        overflow-y: auto;
        ul{
            min-width: 80px;
            li{
                font-size: 12px;
            }
        }

        &::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
            background-color: #0c1323;
            border-radius: 10px;
        }

        &::-webkit-scrollbar {
            width: 3px;
            background-color: #0c1323;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background-image: -webkit-gradient(linear, 40% 0%, 75% 84%, from(#FFFFFF), to(#FFFFFF), color-stop(.6, #222d3f))
        }
    }

    .el-select-dropdown__list {
        width: 413px;
    }

    .el-popper[x-placement^=bottom] .popper__arrow {
        display: none;
    }

    .el-table--enable-row-hover .el-table__body tr:hover > td {
        background: rgba(87, 107, 139, 0.2);
        .cell {
            input {
                background: rgba(87, 107, 139, 0);
            }
        }
    }
</style>