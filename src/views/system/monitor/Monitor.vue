<template>
    <div class="monitor-container">
    <div style="float: left;width: 100%;height: 180px;margin-top: 0px;">
        <div id="main1" style="width: 55%;height:94%; float: left"></div>
        <div id="main2" style="width: 40%;height:94%;float: left"></div>
    </div>
        <div style="float: left;height: 400px; width: 100%;">
            <!--  操作按钮、输入框、    -->
            <div class="handle-box">
                <el-button
                  icon="el-icon-refresh-right"
                  class="handle-del mr10"
                  size="small"
                  :loading="isLoading"
                  @click="reloadList"
                >刷新
                </el-button>
                <!--      时间选择器         -->
                <span>时间从:</span>
                <el-date-picker
                  size="small"
                  value-format="yyyy-MM-dd"
                  v-model="queryParam.startTime"
                  :picker-options="pickerOptions"
                  @change="checkTime"
                  type="date"
                  placeholder="选择日期">
                </el-date-picker>
                <span>到:</span>
                <el-date-picker
                  size="small"
                  value-format="yyyy-MM-dd"
                  @change="checkTime"
                  :picker-options="pickerOptions"
                  v-model="queryParam.endTime"
                  type="date"
                  placeholder="选择日期">
                </el-date-picker>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <!--  查找输入框 -->
                <el-input
                  size="small"
                  v-model="logInputValue"
                  placeholder="输入账号或者昵称匹配"
                  class="handle-input mr10"></el-input>
                <el-button
                  size="small"
                  icon="el-icon-search"
                  :disabled="buttonStatus.searchButtonDisabled"
                  @click="handleSearch">搜索
                </el-button>
            </div>

            <div style="background: #fff;">
                <!-- ============   表格table begin  =================-->
                <el-table
                  :data="loginLogList"
                  class="table"
                  size="mini"
                  height="330px"
                  :header-row-style="{height:'5px'}"
                  :header-cell-style="{padding:'3px 1px'}"
                  :row-style="{height:'4px'}"
                  :cell-style="{padding:'3px 1px'}"
                  ref="multipleTable"
                  header-cell-class-name="table-header"
                  :default-sort="{prop: 'date', order: 'descending'}"
                  @selection-change="handleSelectionChange"
                >
                    <el-table-column prop="account" label="操作账号"/>
                    <el-table-column prop="logName" label="日志名称"/>
                    <el-table-column prop="succeed" label="是否成功"/>
                    <el-table-column prop="message" label="具体信息"/>
                    <el-table-column prop="ip" label="操作ip"/>
                    <el-table-column prop="createTime" label="时间"/>
                </el-table>

                <!-- =========表格table  end============ -->

                <!-- 分页组件 -->
                <div class="monitor-pagination">
                    <el-pagination
                      background
                      layout="total, prev, pager, next"
                      :current-page="queryParam.pageIndex"
                      :page-size="queryParam.pageSize"
                      :page-count="pageCount"
                      @current-change="handlePageChange"
                    ></el-pagination>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Monitor',
        data() {
            return {
                /* 分页查询条件 */
                queryParam: {
                    pageIndex: 1,
                    pageSize: 10,
                    startTime: '',
                    endTime: '',
                    matchStr:''
                },
                //分页查询结果
                loginLogList: [],
                pageCount: 1,
                //多选，选择的元素
                multipleSelection: [],
                //刷新 转动
                isLoading: false,
                /*搜索框，选择框*/
                logInputValue: '',
                /* 控制按钮状态 */
                buttonStatus: {
                    offlineMultipleButtonDisabled: false,
                    searchButtonDisabled: false,
                },
                pickerOptions: {
                    // 限制预约时间
                    disabledDate(time) {
                        return time.getTime() > Date.now();
                    }
                },
                activeName: 'first',

            };
        },
        methods:{
            myEcharts(){
                // 1、折线图
                // 基于准备好的dom，初始化echarts实例
                let myChart1 = this.$echarts.init(document.getElementById('main1'));
                // 指定图表的配置项和数据
               let option1 = {
                   color: ['#3398DB'],
                   grid: {
                       top: '3%',
                       left: '2%',
                       bottom: 0,
                       containLabel: true
                   },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        data: [820, 932, 901, 934, 1290, 1330, 1320],
                        type: 'line',
                        areaStyle: {}
                    }]
                };
                // 使用刚指定的配置项和数据显示图表。
                myChart1.setOption(option1);

                // 2、柱状图
                let myChart2 = this.$echarts.init(document.getElementById('main2'));
                // 指定图表的配置项和数据
                let option2 = {
                    color: ['#3398DB'],
                    grid: {
                        top: '3%',
                        left: '2%',
                        bottom: 0,
                        containLabel: true
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            axisTick: {
                                alignWithLabel: true
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '直接访问',
                            type: 'bar',
                            barWidth: '60%',
                            data: [10, 52, 200, 334, 390, 330, 220]
                        }
                    ]
                };
                // 使用刚指定的配置项和数据显示图表。
                myChart2.setOption(option2);
            },

            // ================================其他方法=========================================
            handleClick(tab, event) {
                console.log(tab, event);
            },

            /**
             * 检验时间是否合法
             */
            checkTime(){
                let startTime = this.queryParam.startTime;
                let endTime = this.queryParam.endTime;

                startTime = startTime.replace(/-/g,'/');
                endTime = endTime.replace(/-/g,'/');
                // 获取开始和结束时间戳
                let startTimestamp = new Date(startTime).getTime();
                let endTimestamp = new Date(endTime).getTime();

                console.log("startTimestamp=" + startTimestamp);
                console.log("endTimestamp=" + endTimestamp);

                console.log(startTimestamp > endTimestamp);
                if(startTimestamp > endTimestamp){
                    this.$message.warning("开始时间不能大于结束时间");
                    return false;
                }
                return true;
            },
            setDefaultTime() {
                let nowDate = new Date();
                let char = "-";
                if(nowDate == null){
                    nowDate = new Date();
                }
                let day = nowDate.getDate();
                let month = nowDate.getMonth() + 1;//注意月份需要+1
                let year = nowDate.getFullYear();
                let beforeMonth = month - 1;
                //开始时间为一个月前，结束时间为当前时间
                let startTime = year + char + this.completeDate(beforeMonth) + char +this.completeDate(day);
                let endTime = year + char + this.completeDate(month) + char +this.completeDate(day);
                this.queryParam.startTime = startTime;
                this.queryParam.endTime = endTime;
            },
            completeDate(value){
                return value < 10 ? "0" + value : value;
            },
            //初始化查询条件
            resetQueryParam() {
                this.queryParam = {};
                this.setDefaultTime();
                this.queryParam.pageIndex = 1;
                this.queryParam.pageSize = 10;
            },
            /**
             * 刷新
             * 说明：点击刷新按钮触发
             * 1、图标转动isLoading = true
             * 2、loginLogList置空
             * 3、初始化查询条件
             * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
             */
            reloadList() {
                let _this = this;
                _this.isLoading = true;
                _this.loginLogList = [];
                _this.inputVale = "";
                _this.resetQueryParam();
                // 延迟一秒执行
                setTimeout(function () {
                    _this.list();
                    _this.isLoading = false;
                }, 1000)

            },
            /**
             * 分页获取数据
             * 1、根据目前的查询条件queryParam查询
             * 2、ajax请求分页接口获取数据
             */
            list() {
                this.$axios.get(this.$requestBaseUrl.core + '/admin/loginLogs/list', {
                    params: this.queryParam
                }).then(res => {
                    let result = res.data;
                    if (result.success) {
                        this.loginLogList = result.data.content;
                        this.pageCount = result.data.pageCount;
                    }
                }).catch(err => {
                    this.$message.error('加载在线用户发生异常');
                    console.error("error = " + err)
                });
            },

            /**
             * 说明：点击查询按钮触发，输入框的查询
             * 1、防刷控制
             * 2、输入框参数校验
             * 3、初始化查询条件
             * 4、设置查询条件
             * 5、调用查询方法
             */
            handleSearch() {
                // 1、防刷，控制按钮一秒内只能点击一次
                this.buttonStatus.searchButtonDisabled = true;
                setTimeout(() => this.buttonStatus.searchButtonDisabled = false, 1000);

                if(!this.checkTime()){
                    return;
                }

                this.queryParam.matchStr = this.logInputValue;
                this.$set(this.queryParam, 'matchStr', this.logInputValue);
                console.log("matchStr=" + this.queryParam.matchStr);
                this.list();
            },

            /**
             *  点击下线按钮触发该方法
             */
            handleDelete(index, account) {
                let name = this.loginLogList[index].name;
                // 弹框，二次确认下线
                this.$confirm(`确定要下线用户 <span style="color: red">${name}</span> 吗`, '提示', {
                    type: 'warning',
                    dangerouslyUseHTMLString: true
                }).then(() => { // 点击确认下线用户
                    this.offlineUserByAccount(account);
                }).catch(() => {// 点击取消
                    console.log("已取消");
                });
            },

            /**
             * 根据账号下线用户
             */
            offlineUserByAccount(account) {
                this.$axios.post(this.$requestBaseUrl.authorize + '/onlineUser/offline/' + account)
                  .then(res => {
                      res.data.success ? this.$message.success('成功下线用户') : this.$message.error('下线用户失败，请刷新后重新试试');
                      this.list();
                  }).catch(err => {
                    this.$message.error('下线操作发生异常');
                    console.error("error = " + err)
                })
            },

            /**
             *  多选时触发
             */
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },

            /**
             * 说明：点击批量下线按钮时触发
             *  批量下线,下线已经选择的
             * 1、获取到要下线的account数组
             * 2、弹出框，提示信息，二次确认
             * 3、发ajax，批量下线
             */
            deleteSelected() {
                // 防刷
                this.buttonStatus.offlineMultipleButtonDisabled = true;
                setTimeout(() => this.buttonStatus.offlineMultipleButtonDisabled = false, 1000);
                //参数检测
                if (this.multipleSelection.length == 0) {
                    this.$message.warning("你还没有选择任何人");
                    return;
                }

                // 1、获取到要下线的account数组
                const accountList = [];
                // 名字 list
                let delUserNames = [];
                this.multipleSelection.forEach((user, index) => {
                    // 拿到要下线的account
                    accountList.push(user.account);
                    // 取前五个名字
                    if (index <= 5) {
                        delUserNames.push(user.name);
                    }
                });
                let delCount = accountList.length;
                // 批量下线的名字拼接 String
                let delMsgStr = delCount <= 5 ? delUserNames.toString() : delUserNames.toString() + '...';

                //2、弹出框，提示信息,二次确认
                this.$confirm(`确定要批量下线 [<span style="color: red">${delMsgStr}</span>] 一共
         <span style="color: red">${accountList.length}</span> 列吗?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    dangerouslyUseHTMLString: true
                }).then(() => {//当点击确认

                    //3、发送批量下线请求
                    this.$axios.post(this.$requestBaseUrl.authorize + "/onlineUser/offline/list", accountList)
                      .then(res => {
                          res.data.success ? this.$message.success(`下线了 ${delMsgStr}`) : this.$message.error('批量下线用户失败，请刷新后重新试试');
                          //延迟一秒执行
                          setTimeout(() => this.list(), 1000);
                      })
                      .catch(err => {
                          this.$message.error('批量下线用户发生异常');
                          console.error("error = " + err)
                      })

                }).catch(() => {//当点击取消
                    console.log('批量下线用户已取消');
                });

                this.multipleSelection = [];
            },
            // 分页导航
            handlePageChange(val) {
                console.log("val = " + val)
                this.$set(this.queryParam, 'pageIndex', val);
                this.list();
            }

        },
        mounted() {
            this.myEcharts();
        }
    }
</script>

<style>
    .handle-box {
        margin-bottom: 10px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 200px;
        margin-right: 10px;
        display: inline-block;
    }

    .table {
        width: 100%;
        font-size: 14px;
    }

    .red {
        color: #ff0000;
    }

    .mr10 {
        margin-right: 10px;
    }

    .table-td-thumb {
        display: block;
        margin: auto;
        width: 40px;
        height: 40px;
    }

    .monitor-pagination {
        margin: 0px 0 20px 0;
        text-align: right;
    }
    .monitor-container {
        padding: 10px;
        background: #E4E7ED;
        border: 1px solid #ddd;
        border-radius: 5px;
        height: 600px;
        border:1px solid #000;
    }
</style>